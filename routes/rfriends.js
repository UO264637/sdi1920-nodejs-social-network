module.exports = function(app, dbManager) {

	/*****************************************************************************\
 										GET
	\*****************************************************************************/

	app.get("/friend/add/:id", (req, res) => {
		checkValidFriendRequest(req.session.user, req.params.id).then(results => {
			let {alerts, user, userToAdd} = results;
			console.log(alerts);
			// In case of errors, redirects to the register page
			if (alerts.length > 0) {
				req.session.alerts = alerts;
				res.redirect("/users");
				return;
			}
			res.send("Esto por aquí de momento tira");
		}).catch((err) => console.error(err));
	});

	/*****************************************************************************\
	 								INPUT CHECKS
	\*****************************************************************************/

	/**
	 * Checks the friend request
	 * @param userId			id of the current user
	 * @param userToAddId		id of the user to send the friend request
	 * @returns {boolean}	Assert if there where any errors so the register thread doesn't save the user
	 */
	let checkValidFriendRequest = async (userId, userToAddId) => {
		let alerts = [];
		// Starts the load of both users and their pending friend requests
		let pUser = dbManager.get("users", {email: userId});
		let pUserToAdd = dbManager.get("users", {email: userToAddId});
		// Check the user to add is not the same as the current
		if (userId === userToAddId)
			alerts.push({type: "warning", msg: "You can't add yourself as friend"});
		return Promise.all([pUser, pUserToAdd]).then((results) => {
			let user, userToAdd = {};
			// Check the other user exists
			if (results[1].length < 1) {
				alerts.push({type: "warning", msg: "The specified user doesn't exist"}); }
			else {
				user = results[0];
				userToAdd = results[1][0];
				// Check they are not admins
				if (user.role === "ADMIN" || userToAdd.role === "ADMIN")
					alerts.push({type: "warning", msg: "An administrator user can't have friends"});
				// Check they are not friends already
				// Check they don't have already a pending friend request
			}
			return {alerts, user, userToAdd};
		});
	};

};
