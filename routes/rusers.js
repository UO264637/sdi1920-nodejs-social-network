module.exports = function(app, swig, dbManager) {

	/*****************************************************************************\
 										GET
	\*****************************************************************************/

	/**
	 * Loads the register page
	 */
	app.get("/signup", function(req, res) {
		// We save and clear the errors and user stored inputs
		let errors = req.session.errors;
		req.session.errors = null;
		let inputs = req.session.inputs;
		req.session.inputs;
		// We render the register page with errors and user inputs
		res.send(swig.renderFile("views/register.html", {
			errors: errors,
			inputs: inputs
		}));
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
	app.post("/signup", function(req, res) {
		if (checkRegister(req, res)){
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
					res.redirect("/signup");
				else
					//TODO autologin
					res.redirect("/users");
			})
		}
	});

	/*****************************************************************************\
	 								INPUT CHECKS
	\*****************************************************************************/

	let checkRegister = (req, res) => {
		let errors = [];
		// Name check
		if (!req.body.name || req.body.name.length < 3)
			errors.push({type: "warning", msg: "The name can't be less than three characters long"});
		// Surname check
		if (!req.body.surname || req.body.surname.length < 3)
			errors.push({type: "warning", msg: "The surname can't be less than three characters long"});
		// Email check
		if (!req.body.email|| req.body.email.length < 3)
			errors.push({type: "warning", msg: "The entered email is not valid"});
		//TODO check the email is not repeated <--- cuando se implemente el getUser

		// Password check
		if (!req.body.password || !req.body.password_repeated || req.body.password !== req.body.password_repeated)
			errors.push({type: "warning", msg: "The passwords does not match"});
		if (req.body.password.length < 3)
			errors.push({type: "danger", msg: "This password is not secure enough"});
		// In case any error was committed, it displays back the register page with the errors
			// It does keep the entered name, surname and email
		if (errors.length > 0) {
			req.session.errors = errors;
			req.session.inputs = {
				name: req.body.name,
				surname: req.body.surname,
				email: req.body.email
			};
			res.redirect("/signup");
			return false;
		}
		return true;
	}

};