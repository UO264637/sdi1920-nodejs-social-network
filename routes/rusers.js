module.exports = function(app, swig) {
	app.get("/users", function(req, res) {

		const fs = require("fs");
		let defaultdb = JSON.parse(fs.readFileSync("config/defaultdb.json"));

		let answer = swig.renderFile("views/users.html", {
			users: defaultdb.users
		});

		res.send(answer);
	});
};