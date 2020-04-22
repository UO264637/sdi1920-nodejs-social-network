// Módulos
let express = require("express");
let app = express();

// Variables
app.set("port", 8081);

// GET /home
app.get("/home", function(req, res) {
	res.send("home");
});

// Lanzamiento del servidor
app.listen(app.get("port"), function() {
	console.log("Server deployed at http://localhost:" + app.get("port") + "/home");
});