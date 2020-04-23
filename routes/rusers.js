module.exports = function(app, swig, dbManager) {

	/*****************************************************************************\
 										GET
	\*****************************************************************************/

	/**
	 * Loads the register page
	 */
	app.get("/register", function(req, res) {
		res.send(swig.renderFile("views/register.html", {}));
	});

	/**
	 * List all the users of the application
	 */
	app.get("/users", function(req, res) {
		//dbManager.reset(); // WARNING, this is only to initial test and db load, this does NOT go in here
		let answer = swig.renderFile("views/users.html", {
			users: []
		});
		res.send(answer);
	});

	/*****************************************************************************\
 										POST
	\*****************************************************************************/

	/**
	 *	Registers the user in the app
	 */
	app.post('/register', function(req, res) {
		// TODO input checks
		// User object creation
		let user = {
			name: req.body.name,
			surname: req.body.surname,
			email : req.body.email,
			password : app.get("encrypt")(req.body.password),
			role: "USER",
			friends: []
		};
		// User insertion
		dbManager.insertUser(user, function(id) {
			if (id == null)
				res.send("There was an error inserting the user");
			else
				res.send("Inserted user: " + id);
		})
	})

};