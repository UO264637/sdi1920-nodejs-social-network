module.exports = function(app, swig, dbManager) {
	app.get("/users", function(req, res) {
		dbManager.reset();

		let answer = swig.renderFile("views/users.html", {
			users: []
		});

		res.send(answer);
	});
};