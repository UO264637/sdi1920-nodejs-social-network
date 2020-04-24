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
	 * List and renders the list of all the users of the application
	 */
	app.get("/users", function(req, res) {
		//dbManager.reset(); // WARNING, this is only to initial test and db load, this does NOT go in here
		let answer = swig.renderFile("views/users.html", {
			users: []
		});
		res.send(answer);
	});

	/**
	 * Loads the login page
	 */
	app.get("/login", function(req, res) {
		let mostrarError = req.session.error;
		let respuesta = swig.renderFile('views/login.html', {error: mostrarError});
		req.session.error = null;
		res.send(respuesta);
	});

	/*****************************************************************************\
 										POST
	\*****************************************************************************/

	/**
	 *	Registers the user in the app
	 */
	app.post("/signup", function(req, res) {
		if (checkValidRegister(req, res)){
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
				if (id == null) {
					req.session.user = null;
					res.redirect("/signup");
				} else {
					//TODO login from the database
					user.id = id;
					req.session.user = user;
					res.redirect("/users");
				}
			})
		}
	});

	/**
	 * Logs in the user in the app
	 */
	app.post("/login", function(req, res) {
		let seguro = app.get("encrypt")(req.body.password);
		let criterio = {
			email : req.body.email,
			password : seguro
		}
		dbManager.getUsers(criterio, function(usuarios) {
			if (usuarios == null || usuarios.length == 0) {
				let error = {
					mensaje: "Email o password incorrecto",
					tipoMensaje: "alert-danger"
				};
				req.session.error = error;
				req.session.usuario = null;
				res.redirect("/login");

			} else {
				req.session.usuario = usuarios[0].email;
				res.redirect("/users");
			}
		});
	});

	/*****************************************************************************\
	 								INPUT CHECKS
	\*****************************************************************************/

	/**
	 * Checks all the inputs of the register form and redirects to the page in case something is wrong
	 * @param req			Contains the inputs and session
	 * @param res			To redirect in case something is wrong
	 * @returns {boolean}	Assert if there where any errors so the register thread doesn't save the user
	 */
	let checkValidRegister = (req, res) => {
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
		if (errors.length > 0) {
			req.session.errors = errors;
			// Stores the name, surname and email the user entered to keep the form filled
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