/*****************************************************************************\
									MODULOS
\*****************************************************************************/

// Express
let express = require("express");
let app = express();
app.use(express.static("public"));						// Sets the static folder

// Swig
let swig = require("swig");

// File System
let fs = require("fs");

// Log4JS
let log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = 'debug';
logger.debug("Some debug messages");

// MongoDB
let mongo = require('mongodb');
let dbManager = require("./modules/dbManager.js");
dbManager.init(app, mongo, fs, logger);

// Body Parser
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


/*****************************************************************************\
 									VARIABLES
\*****************************************************************************/

app.set("port", 8081);
app.set("db", "mongodb://admin:viade_es4c@mysocialnetwork-shard-00-00-mtis7.mongodb.net:27017,mysocialnetwork-shard-00-01-mtis7.mongodb.net:27017,mysocialnetwork-shard-00-02-mtis7.mongodb.net:27017/test?ssl=true&replicaSet=MySocialNetwork-shard-0&authSource=admin&retryWrites=true&w=majority");

/*****************************************************************************\
 								CONTROLADORES
\*****************************************************************************/

require("./routes/rusers")(app, swig, dbManager);									// Users controller

/*****************************************************************************\
 						LANZAMIENTO DEL SERVIDOR
\*****************************************************************************/
app.listen(app.get("port"), function() {
	console.log("Server deployed at http://localhost:" + app.get("port") + "/home");
});