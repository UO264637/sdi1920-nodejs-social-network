/*****************************************************************************\
									MODULES
\*****************************************************************************/

// Express
let express = require("express");
let app = express();
let expressSession = require("express-session");
app.use(expressSession({ 						// Sets the session
	secret: "abcdefg",
	resave: true,
	saveUninitialized: true
}));

// middleware to make 'user' available to all templates
app.use(function(req, res, next) {
	res.locals.user = req.session.user;
	next();
});

// Swig
let swig = require("swig");

// File System
let fs = require("fs");

// Log4JS
let log4js = require("log4js");
let logger = log4js.getLogger();
logger.level = "debug";
logger.debug("Some debug messages");

// MongoDB
let mongo = require("mongodb");
let dbManager = require("./modules/dbManager.js");
dbManager.init(app, mongo, fs, logger);

// Body Parser
let bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Crypto
let crypto = require("crypto");

/*****************************************************************************\
 								MIDDLEWARE
\*****************************************************************************/

let logAccess = (req, res, next) => {
	app.get("logger").info("%s attempted: %s %s",
		req.session.user ? req.session.user : "Anonymous user", req.method,  req.originalUrl);
	next();
};

let sessionChecker = (req, res, next) => {
	req.session.user ? next() : res.redirect("/login");
};

let anonChecker = (req, res, next) => {
	req.session.user ? res.redirect("/users") : next();
};

// Checks the user is logged in
let authRouter = express.Router();
authRouter.use(logAccess, sessionChecker);

// Checks the user is not logged in
let anonRouter = express.Router();
anonRouter.use(logAccess, anonChecker);

app.use("/login", anonRouter);				// Sets the access to the login (only anonymous)
app.use("/signup", anonRouter);				// Sets the access to the register (only anonymous)
app.use("/users", authRouter);				// Sets the access to the rest of the app (only auth)
app.use("/friend/*", authRouter);
app.use(express.static("public"));				// Sets the static folder


/*****************************************************************************\
 									APP STORING
\*****************************************************************************/

app.set("port", 8081);
app.set("db", "mongodb://admin:viade_es4c@mysocialnetwork-shard-00-00-mtis7.mongodb.net:27017,mysocialnetwork-shard-00-01-mtis7.mongodb.net:27017,mysocialnetwork-shard-00-02-mtis7.mongodb.net:27017/test?ssl=true&replicaSet=MySocialNetwork-shard-0&authSource=admin&retryWrites=true&w=majority");
app.set("logger", logger);
app.set("key", "Patron");

/**
 * Retrieves the info stored on the session and clears it afterwards
 * @param req			Object containing the session
 * @returns {{
 * 		inputs: *, 		User inputs to refill
 * 		errors: *		Errors to print alerts
 * 	}}
 */
app.cleanSession = (req) => {
	let alerts = req.session.alerts;
	req.session.alerts = null;
	let inputs = req.session.inputs;
	req.session.inputs = null;
	return {alerts, inputs};
};

/**
 * Makes the call to Swig combining session and params
 * @param file		File to render
 * @param session	Session to extract user
 * @param params	Object with extra params
 */
app.generateView = (file, session, params) => {
	params = params ? params : {};
	params.user = session.user;
	return swig.renderFile(file, params);
};

/**
 * Encrypts the specified string
 * @param string	String to encrypt
 * @returns 		Encrypted string
 */
app.encrypt = (string) => {
	return crypto.createHmac("sha256", app.get("key")).update(string).digest("hex");
};

/*****************************************************************************\
 									CONTROLLERS
\*****************************************************************************/

require("./routes/rusers")(app, dbManager);									// Users controller
require("./routes/rfriends")(app, dbManager);								// Friends controller

/*****************************************************************************\
 										GET
\*****************************************************************************/

/**
 * Redirects the user to the login when accessing the route
 * If it's already logged, the anonRoute will redirect it to the users
 */
app.get("/", logAccess, (req, res) => {
	res.redirect("login");
});

/**
 * Resets the database and notifies it back
 * ONLY FOR TESTING PURPOSES, DELETE BEFORE DEPLOYMENT
 */
app.get("/reset", (req, res) => {
	dbManager.reset();
	res.send("Database reset invoked");
});

/*****************************************************************************\
 								SERVER DEPLOYMENT
\*****************************************************************************/

app.listen(app.get("port"), function() {
	console.log("Server deployed at http://localhost:" + app.get("port") + "/");
});