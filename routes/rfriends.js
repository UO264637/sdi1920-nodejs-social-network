module.exports = function(app, dbManager) {

	/*****************************************************************************\
 										GET
	\*****************************************************************************/

	app.get("/friend/add/:id", (req, res) => {
		// Check the users are candidates to send the request
		checkValidUsers(req.session.user, req.params.id).then(results => {
			let {alerts, user, userToAdd} = results;
			// In case of errors, redirects to the register page, they are not valid
			if (alerts.length > 0) {
				req.session.alerts = alerts;
				res.redirect("/users");
				return;
			}
			// Check there's no already existing friend request between the users
			checkValidFriendRequest(user._id, userToAdd._id).then((alerts) => {
				// In case of errors, redirects to the register page
				if (alerts.length > 0) {
					req.session.alerts = alerts;
					res.redirect("/users");
					return;
				}
				// Creation of the request
				let request = {
					from: dbManager.mongo.ObjectId(user._id),
					to: dbManager.mongo.ObjectId(userToAdd._id)
				};
				// Insertion of the request and notification to the user
				dbManager.insert("requests", request, () => {
					req.session.alerts = [{type: "info", msg: "The friend request was successfully sent"}];
					res.redirect("/users");
				});
			}).catch((err) => console.error(err));
		}).catch((err) => console.error(err));
	});

	/*****************************************************************************\
	 								INPUT CHECKS
	\*****************************************************************************/

	/**
	 * Checks the users involved on the operation
	 * @param userId						id of the current user
	 * @param userToAddId					id of the user to send the friend request
	 * @returns {alerts, user, userToAdd}	generated alerts and loaded users
	 */
	let checkValidUsers = async (userId, userToAddId) => {
		let alerts = [];
		// Starts the load of both users
		let pUser = dbManager.get("users", {email: userId});
		let pUserToAdd = dbManager.get("users", {email: userToAddId});
		// Check the user to add is not the same as the current
		if (userId === userToAddId)
			alerts.push({type: "warning", msg: "You can't add yourself as friend"});
		// When both queries are loaded checks the remaining assertions
		return Promise.all([pUser, pUserToAdd]).then((results) => {
			let user, userToAdd = {};
			// Check the other user exists
			if (results[1].length < 1) {
				alerts.push({type: "warning", msg: "The specified user doesn't exist"}); }
			else {
				user = results[0][0];
				userToAdd = results[1][0];
				// Check they are not admins
				if (user.role === "ADMIN" || userToAdd.role === "ADMIN")
					alerts.push({type: "warning", msg: "An administrator user can't have friends"});
				// Checks they are not friends already
				if (user.friends.map((friend) => friend.toString()).includes(userToAdd._id.toString())) {
					alerts.push({type: "warning", msg: "You are already friend of this user"});
				}
			}
			return {alerts, user, userToAdd};
		});
	};

	/**
	 * Checks the friend request is not already sent of the users are friends
	 * @param userId						ID of the current user
	 * @param userToAddId					ID of the user to add
	 * @returns alerts						Alert that the friend request is already up
	 */
	let checkValidFriendRequest = async (userId, userToAddId) => {
		// Starts the load of the pending requests
		return dbManager.get("requests", {
			$or: [ {
				from: dbManager.mongo.ObjectId(userId),
				to: dbManager.mongo.ObjectId(userToAddId)
			}, {
				from: dbManager.mongo.ObjectId(userToAddId),
				to: dbManager.mongo.ObjectId(userId)
			}]
		}).then((results) => {
			return (results.length > 0) ?
				[{type: "warning", msg: "There's already a pending friend request with this user"}]
				: [];
		}).catch((err) => console.log(err));
	}

};
