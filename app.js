/*****************************************************************************\
									MODULOS
\*****************************************************************************/

// Express
let express = require("express");
let app = express();
app.use(express.static("public"));						// Sets the static folder

// Swig
let swig = require("swig");

// Body Parser
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Variables
app.set("port", 8081);

/*****************************************************************************\
 								CONTROLADORES
\*****************************************************************************/

require("./routes/rusers")(app, swig);						// Users controller

/*****************************************************************************\
 						LANZAMIENTO DEL SERVIDOR
\*****************************************************************************/
app.listen(app.get("port"), function() {
	console.log("Server deployed at http://localhost:" + app.get("port") + "/home");
});