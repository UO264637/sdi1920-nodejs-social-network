module.exports = function(app, dbManager) {

	/*****************************************************************************\
 										GET
	\*****************************************************************************/

	/**
	 * List the incoming friend requests of the user
	 */
	app.get("/requests", (req, res) => {
		let {alerts} = app.cleanSession(req);
		// Load the user
		dbManager.get("users", {email: req.session.user}, (result) => {
			if (result == null) {
				// Error management
				app.get("logger").error("Unable to retrieve the current user");
				req.session.alerts = [{type: "danger", msg: "Sorry, an unexpected error has occurred"}];
				res.redirect("/users");
			} else {
				// Loads the incoming requests
				dbManager.get("requests", {to: result[0]._id}, (result) => {
					// Loads the senders of those requests
					let pg = req.query.pg ? parseInt(req.query.pg) : 1;
					let query = {_id: {$in: result.map((request) => request.from)}};
					dbManager.getPg("users", query, pg, (result, count) => {
						// Prepares the pagination
						let pages = [];
						for (let i = pg-2; i<=pg+2; i++) pages.push(i);
						// Sends the page
						res.send(app.generateView("views/requests.html", req.session, {
							friends: result,
							pages: pages.filter((i) => {return (i > 0 && i <= Math.ceil(count/5))}),
							current: pg,
							alerts: alerts
						}));
					});
				});
			}});
	});

	/**
	 * List the user friends
	 */
	app.get("/friends", (req, res) => {
		let {alerts} = app.cleanSession(req);
		// Load the user
		dbManager.get("users", {email: req.session.user}, (result) => {
			if (result == null) {
				// Error management
				app.get("logger").error("Unable to retrieve the current user");
				req.session.alerts = [{type: "danger", msg: "Sorry, an unexpected error has occurred"}];
				res.redirect("/users");
			} else {
				// Loads the friends
				let query = {_id: {$in: result[0].friends}};
				let pg = req.query.pg ? parseInt(req.query.pg) : 1;
				dbManager.getPg("users", query, pg, (results, count) => {
					// Prepares the pagination
					let pages = [];
					for (let i = pg-2; i<=pg+2; i++) pages.push(i);
					// Sends the page
					res.send(app.generateView("views/friends.html", req.session, {
						friends: results,
						pages: pages.filter((i) => {return (i > 0 && i <= Math.ceil(count/5))}),
						current: pg,
						alerts: alerts
					}));
				});
			}
		});
	});

	/**
	 * Sends as friend request to the specified user
	 */
	app.get("/requests/send/:id", (req, res) => {
		// Check the users are candidates to send the request
		checkValidUsers(req.session.user, req.params.id).then((results) => {
			let {alerts, user, userToAdd} = results;
			// In case of errors, redirects to the users page
			if (alerts.length > 0) {
				req.session.alerts = alerts;
				res.redirect("/users");
				return;
			}
			// Check there's no already existing friend request between the users
			checkValidFriendRequest(user._id, userToAdd._id).then((alerts) => {
				// In case of errors, redirects to the users page
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
				dbManager.insert("requests", request, (results) => {
					if (results == null)
						throw "Error inserting the request";
					else {
						req.session.alerts = [{type: "success", msg: "The friend request was successfully sent"}];
						res.redirect("/users");
					}
				});
			}).catch((err) => {throw err});
		}).catch((err) => {
			// Error management
			app.get("logger").error(err);
			req.session.alerts = [{type: "danger", msg: "Sorry, an unexpected error has occurred"}];
			res.redirect("/users");
		});
	});

	/**
	 * Accepts the friendship request
	 */
	app.get("/friends/accept/:id", (req, res) => {
		// Check the users are candidates to establish the friendship
		checkValidUsers(req.session.user, req.params.id).then((results) => {
			let {alerts, user, userToAdd} = results;
			// In case of errors, redirects to the friends page
			if (alerts.length > 0) {
				req.session.alerts = alerts;
				res.redirect("/requests");
				return;
			}
			// Check there's a valid friend request to accept
			checkPendingFriendRequest(user._id, userToAdd._id).then((alerts) => {
				// In case of errors, redirects to the friends page
				if (alerts.length > 0) {
					req.session.alerts = alerts;
					res.redirect("/requests");
					return;
				}
				// Creation of the friendship
				user.friends.push(userToAdd._id);
				userToAdd.friends.push(user._id);
				// Update and deletion of the entities
				let uUser = dbManager.update("users", {_id: user._id}, user);
				let uUserToAdd = dbManager.update("users", {_id: userToAdd._id}, userToAdd);
				let dRequest = dbManager.delete("requests", {from: userToAdd._id, to: user._id});
				// Redirection to the requests page with success message
				Promise.all([uUser, uUserToAdd, dRequest]).then(() => {
					req.session.alerts = [{type: "success", msg: "You accepted the friendship successfully"}];
					res.redirect("/requests");
				}).catch((err) => {throw err});
			}).catch((err) => {throw err});
		}).catch((err) => {
			// Error management
			app.get("logger").error(err);
			req.session.alerts = [{type: "danger", msg: "Sorry, an unexpected error has occurred"}];
			res.redirect("/requests");
		});
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
		let gUser = dbManager.get("users", {email: userId});
		let gUserToAdd = dbManager.get("users", {email: userToAddId});
		// Check the user to add is not the same as the current
		if (userId === userToAddId)
			alerts.push({type: "warning", msg: "You can't add yourself as friend"});
		// When both queries are loaded checks the remaining assertions
		return Promise.all([gUser, gUserToAdd]).then((results) => {
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
				from: userId,
				to: userToAddId
			}, {
				from: userToAddId,
				to: userId
			}]
		}).then((results) => {
			// If any friend requests exists, a new one can't be sent
			return (results.length > 0) ?
				[{type: "warning", msg: "There's already a pending friend request with this user"}]
				: [];
		}).catch((err) => {throw err});
	};

	/**
	 * Checks there is a pending friend request between the users
	 * @param userId						ID of the current user
	 * @param userToAddId					ID of the user to add
	 * @returns alerts						Alert that there's not pending friend request
	 */
	let checkPendingFriendRequest = async (userId, userToAddId) => {
		// Starts the load of the pending requests
		return dbManager.get("requests", {
			from: userToAddId,
			to: userId
		}).then((results) => {
			// If the user didn't receive a friend request from the user, they can't accept the friendship
			return (results.length !== 1) ?
				[{type: "warning", msg: "You don't have any pending friend request from that user"}]
				: [];
		}).catch((err) => {throw err});
	};

};
