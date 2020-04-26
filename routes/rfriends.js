module.exports = function(app, dbManager) {

	/*****************************************************************************\
 										GET
	\*****************************************************************************/

	app.get("/friend/add/:id", (req, res) => {
		checkValidUsers(req.session.user, req.params.id).then(results => {
			let {alerts, user, userToAdd} = results;
			// In case of errors, redirects to the register page
			if (alerts.length > 0) {
				req.session.alerts = alerts;
				res.redirect("/users");
				return;
			}
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
				dbManager.insert("requests", request, () => {
					req.session.alerts = [{type: "info", msg: "The friend request was successfully sent"}];
					res.redirect("/users");
				});
			});
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
			}
			return {alerts, user, userToAdd};
		});
	};


	let checkValidFriendRequest = async (user, userToAdd) => {
		let alerts = [];
		// Starts the load of the pending requests
		let pPending = dbManager.get("requests", {
			$or: [ {
				from: dbManager.mongo.ObjectId(user),
				to: dbManager.mongo.ObjectId(userToAdd)
			}, {
				from: dbManager.mongo.ObjectId(userToAdd),
				to: dbManager.mongo.ObjectId(user)
			}]
		});
		// Starts the load of the pending requests

		// Whe both loaded asserts there is no request or friendship between both
		return Promise.all([pPending]).then((results) => {
			let pending = results[0];
			if (pending.length > 0)
				alerts.push({type: "warning", msg: "There's already a pending friend request with this user"});
			return alerts;
		}).catch((err) => console.log(err));
	}

};
