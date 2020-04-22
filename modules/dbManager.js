module.exports = {

	mongo : null,
	app : null,
	fs: null,

	init : function(app, mongo, fs) {
		this.mongo = mongo;
		this.app = app;
		this.fs = fs;
	},

	reset: function() {
		this.clear();

		let defaultdb = JSON.parse(this.fs.readFileSync("config/defaultdb.json"));
		defaultdb.users.map((user) => this.insertUser(user));
	},

	clear: function() {
		this.mongo.MongoClient.connect(this.app.get("db"), function (error, db) {
			if (error) {
				console.log("Unable to clear the database");
			} else {
				let collection = db.collection("users");
				collection.remove();
				db.close();
			}
		})
	},

	/*****************************************************************************\
 										USERS
	\*****************************************************************************/

	insertUser : function(user, callback) {
		this.mongo.MongoClient.connect(this.app.get("db"), function(err, db) {
			if (err) {
				callback(null);
			} else {
				let collection = db.collection("users");
				collection.insert(user, function(err, result) {
					if (err) {
						callback(null);
					} else {
						callback(result.ops[0]._id);
					}
					db.close();
				});
			}
		});
	}
};