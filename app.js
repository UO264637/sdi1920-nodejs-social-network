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
 									ROUTERS
\*****************************************************************************/

// Checks the user is logged in
let loggedInRouter = express.Router();
loggedInRouter.use(function(req, res, next) {
	if ( req.session.user ) {
		next();
	} else {
		app.get("logger").warn("An anonymous user tried to access " + req.session.destiny);
		res.redirect("/login");
	}
});

// Checks the user is not logged in
let notLoggedInRouter = express.Router();
notLoggedInRouter.use(function(req, res, next) {
	if ( !req.session.user ) {
		next();
	} else {
		app.get("logger").warn("The user " + req.session.user + " tried to access " + req.session.destiny);
		res.redirect("/");
	}
});

app.use("/users*", loggedInRouter);				// Sets the access to the users options (only logged in)
app.use("/login", notLoggedInRouter);			// Sets the access to the login (only anonymous)
app.use("/signup", notLoggedInRouter);			// Sets the access to the register (only anonymous)
app.use(express.static("public"));					// Sets the static folder


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
	let errors = req.session.errors;
	req.session.errors = null;
	let inputs = req.session.inputs;
	req.session.inputs = null;
	return {errors, inputs};
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

require("./routes/rusers")(app, swig, dbManager);									// Users controller

/*****************************************************************************\
 										GET
\*****************************************************************************/

/**
 * Shows the homepage
 */
app.get("/", function (req, res) {
	res.send(swig.renderFile("views/home.html", {}));
});

/**
 * Resets the database and notifies it back
 * ONLY FOR TESTING PURPOSES, DELETE BEFORE DEPLOYMENT
 */
app.get("/reset", function (req, res) {
	dbManager.reset();
	res.send("Database reset invoked");
});

/*****************************************************************************\
 								SERVER DEPLOYMENT
\*****************************************************************************/

app.listen(app.get("port"), function() {
	console.log("Server deployed at http://localhost:" + app.get("port") + "/");
});