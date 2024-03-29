/*****************************************************************************\
									MODULES
\*****************************************************************************/

// Express
let express = require("express");
let app = express();
let expressSession = require("express-session");
app.use(expressSession({ 						// Sets the session
	secret: "sylphrena",
	resave: true,
	saveUninitialized: true
}));

// Swig
let swig = require("swig");

// File System
let fs = require("fs");

// Log4JS
let logger = require("log4js").getLogger();
logger.level = "debug";

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

// JsonWebToken
let jwt = require('jsonwebtoken');

/*****************************************************************************\
 								MIDDLEWARE
\*****************************************************************************/

/**
 * Sets the headers
 */
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Credentials", "true");
	res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
	next();
});

/**
 * Registers the access of the user in the log
 */
let logAccess = (req, res, next) => {
	app.get("logger").info("%s attempted: %s %s",
		req.session.user ? req.session.user : "Anonymous user", req.method,  req.originalUrl);
	next();
};

/**
 * Registers the api accesses of the user in the log
 */
let logApiAccess = (req, res, next) => {
	app.get("logger").info(`${res.user} solicited: ${req.method} ${req.originalUrl}`);
	next();
};

/**
 * Checks the authentication of the user to protect private routes
 */
let sessionChecker = (req, res, next) => {
	req.session.user ? next() : res.redirect("/login");
};

/**
 * Checks the no authentication of the user to protect anonymous routes
 */
let anonChecker = (req, res, next) => {
	req.session.user ? res.redirect("/users") : next();
};

/**
 * Checks the petition has a token
 */
let hasToken = (req, res, next) => {
	let token = req.headers["token"] || req.body.token || req.query.token;
	if (token != null) {
		next();
	} else {
		res.status(403); // Forbidden
		res.json({
			access : false,
			message: "No Token"
		});
	}
};

/**
 * Verifies the token
 */
let tokenChecker = (req, res, next) => {
	let token = req.headers["token"] || req.body.token || req.query.token;
	// Verify token
	jwt.verify(token, "stormfather", function(err, infoToken) {
		if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
			res.status(403); // Forbidden
			res.json({
				access : false,
				error: "Invalid or timed out token"
			});
		} else {
			res.user = infoToken.user;
			next();
		}
	});
};

// Checks the user is logged in
let authRouter = express.Router();
authRouter.use(logAccess, sessionChecker);

// Checks the user is not logged in
let anonRouter = express.Router();
anonRouter.use(logAccess, anonChecker);

// Checks the user token is valid
let userTokenRouter = express.Router();
userTokenRouter.use(hasToken, tokenChecker, logApiAccess);

app.use("/login", anonRouter);				// Sets the access to the login (only anonymous)
app.use("/signup", anonRouter);				// Sets the access to the register (only anonymous)
app.use("/api/friends", userTokenRouter);	// Sets the api access
app.use("/api/message", userTokenRouter);
app.use("/api/chat*", userTokenRouter);
app.use("/api/read*", userTokenRouter);
app.use("/api/user*", userTokenRouter);
app.use("/users*", authRouter);				// Sets the access to the rest of the app (only auth)
app.use("/requests*", authRouter);
app.use("/friends*", authRouter);
app.use(express.static("public"));				// Sets the static folder


/*****************************************************************************\
 									APP STORING
\*****************************************************************************/

app.set("port", 8081);
app.set("db", TOKEN);
app.set("logger", logger);
app.set("key", "Patron");
app.set('jwt', jwt);

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
require("./routes/rapisocial")(app, dbManager);								// API controller

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
 * Displays the error page when trying any unavailable resource
 */
app.use(function (err, req, res, next) {
	let error = {
		status: 400,
		message: "Not available resource"
	};
	res.send(swig.renderFile("views/error.html", {error}));
});

/**
 * Resets the database and notifies it back
 * ONLY FOR TESTING PURPOSES, DELETE BEFORE DEPLOYMENT
 */
app.get("/reset", (req, res) => {
	// Calls the reset operation with the parsed file of default data
	dbManager.reset(JSON.parse(fs.readFileSync("config/defaultdb.json")));
	res.send("Database reset invoked");
});

/**
 * 404 page
 */
app.get("*", function(req, res){
	res.send(swig.renderFile('views/404.html', {}));
});

/*****************************************************************************\
 								SERVER DEPLOYMENT
\*****************************************************************************/

app.listen(app.get("port"), function() {
	console.log("Server deployed at http://localhost:" + app.get("port") + "/");
});
