module.exports = function(app, dbManager) {

	/*****************************************************************************\
 										GET
	\*****************************************************************************/

	/**
	 * List the user friends
	 */
	app.get("/friends", (req, res) => {
		// Load the user
		dbManager.get("users", {email: req.session.user}, (result) => {
			if (result == null)
				console.error("Unable to retrieve the current user");
			else {
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
					}));
				});
			}
		});
	});


};
