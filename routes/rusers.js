module.exports = function(app, dbManager) {

	/*****************************************************************************\
 										GET
	\*****************************************************************************/

	//------------------------------- SESSION --------------------------------------

	/**
	 * Loads the register page
	 */
	app.get("/signup", function(req, res) {
		const {alerts, inputs} = app.cleanSession(req);
		// We render the register page with the retrieved error and user inputs
		res.send(app.generateView("views/register.html", req.session, {
			alerts: alerts,
			inputs: inputs
		}));
	});

	/**
	 * Loads the login page
	 */
	app.get("/login", function(req, res) {
		const {alerts} = app.cleanSession(req);
		res.send(app.generateView("views/login.html", req.session, {alerts: alerts}));
	});

	/**
	 * Disconnects the user
	 */
	app.get('/logout', function (req, res) {
		app.cleanSession(req);
		req.session.user = null;
		res.redirect("/login");
	});

	//------------------------------- USER --------------------------------------

	/**
	 * List and renders the list of all the users of the application
	 */
	app.get("/users", (req, res) => {
		const {alerts} = app.cleanSession(req);
		let query ={};
		// We want all the users except the current user and the admins, it should be paginated
		if( req.query.search != null ){				// In case there's a search
			query = {
				$and: [ {
						$or: [
							{"name" : {$regex : ".*"+req.query.search+".*"}},
							{"surname" : {$regex : ".*"+req.query.search+".*"}},
							{"email" : {$regex : ".*"+req.query.search+".*"}} ]
					}, {
						email: {$ne: req.session.user},
						role: {$ne: "ADMIN"}
					}]
			};
		} else {									// If there's no search
			query = {
				email: {$ne: req.session.user},
				role: {$ne: "ADMIN"}
			};
		}
		// Query consult and pagination set up
		let pg = req.query.pg ? parseInt(req.query.pg) : 1;
		dbManager.getPg("users", query, pg, (result, count) => {
			let pages = [];
			for (let i = pg-2; i<=pg+2; i++) pages.push(i);
			let answer = app.generateView("views/user/list.html", req.session,{
				userList: result,
				pages: pages.filter((i) => {return (i > 0 && i <= Math.ceil(count/5))}),
				current: pg,
				search: req.query.search,
				alerts: alerts
			});
			res.send(answer);
		});
	});

	/*****************************************************************************\
 										POST
	\*****************************************************************************/

	/**
	 *	Registers the user in the app
	 */
	app.post("/signup", function(req, res) {
		checkValidRegister(req).then((errors) =>{
			// In case of errors, redirects to the register page
			if (errors.length > 0) {
				req.session.alerts = errors;
				// Stores some inputs to improve usability
				req.session.inputs = {
					name: req.body.name,
					surname: req.body.surname,
					email: req.body.email
				};
				res.redirect("/signup");
				return;
			}
			// User object creation
			let user = {
				name: req.body.name,
				surname: req.body.surname,
				email : req.body.email,
				password : app.encrypt(req.body.password),
				friends: []
			};
			// User insertion
			dbManager.insert("user", user, function(id) {
				if (id == null) {
					req.session.user = null;
					res.redirect("/signup");
				} else {
					req.session.user = user.email;
					app.get("logger").info("The user " + user.email + " has registered and logged in");
					res.redirect("/users");
				}
			});
		}).catch((err) => console.error(err));
	});

	/**
	 * Logs in the user in the app
	 */
	app.post("/login", function(req, res) {
		let query = {
			email : req.body.email,
			password : app.encrypt(req.body.password),
		};
		dbManager.get("users", query, function(users) {
			if (users == null || users.length === 0) {
				req.session.alerts = [{type: "warning", msg: "Incorrect email or password"}];
				req.session.user = null;
				res.redirect("/login");
			} else {
				req.session.user = users[0].email;
				app.get("logger").info("The user" + req.session.user + " has logged in");
				res.redirect("/users");
			}
		});
	});

	/*****************************************************************************\
	 								INPUT CHECKS
	\*****************************************************************************/

	/**
	 * Checks all the inputs of the register form and returns all the errors
	 * @param req							Contains the inputs and session
	 * @returns {Promise<alerts|void>}		Alerts with the errors found
	 */
	let checkValidRegister = async (req) => {
		let errors = [];
		// Email unique check, asynchronous
		const result = dbManager.get("users", {email: req.body.email});
		// Name check
		if (!req.body.name || req.body.name.length < 3)
			errors.push({type: "warning", msg: "The name can't be less than three characters long"});
		// Surname check
		if (!req.body.surname || req.body.surname.length < 3)
			errors.push({type: "warning", msg: "The surname can't be less than three characters long"});
		// Email check
		if (!req.body.email || req.body.email.length < 3)
			errors.push({type: "warning", msg: "The entered email is not valid"});
		// Password check
		if (!req.body.password || !req.body.password_repeated || req.body.password !== req.body.password_repeated)
			errors.push({type: "warning", msg: "The passwords does not match"});
		if (req.body.password.length < 3)
			errors.push({type: "danger", msg: "This password is not secure enough"});
		return await result.then((result) => {
			if (result.length > 0)
				errors.push({type: "warning", msg: "The entered email is already in use"});
			// Returns the errors collected
			return errors;
		}).catch((err) => console.error(err));
	};

};