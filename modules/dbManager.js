module.exports = {

	mongo : null,
	app : null,
	fs: null,
	logger: null,

	/**
	 * Initializes the database manager object
	 * @param app		The app object, it does contain the token to connect to the database
	 * @param mongo		MongoDB object, to make the database operations
	 * @param fs		Fyle System object, to load the default configs
	 * @param logger	Log4JS object, to log the operations
	 */
	init : function(app, mongo, fs, logger) {
		this.mongo = mongo;
		this.app = app;
		this.fs = fs;
		this.logger = logger;
	},

	/**
	 * Extraction of the connection to the database, connects to the database and performs the operation
	 * @param callback		Callback function extended
	 * @param operation		Operation to do in the database when connected
	 */
	connect: function(callback, operation) {
		let logger = this.logger;
		this.mongo.MongoClient.connect(this.app.get("db"), function(err, db) {
			if (err) {
				logger.error("Unable to connect to the database");
				callback(null);
			} else {
				operation(db, logger);
				db.close();
			}
		});
	},

	/**
	 * Clears the database and insert the default data
	 */
	reset: function() {
		this.logger.info("Reset of the database invoked");
		this.clear();
		// Load the data from the config files
		let defaultdb = JSON.parse(this.fs.readFileSync("config/defaultdb.json"));
		defaultdb.users.map((user) => this.insertUser(user, function(){}));
	},

	/**
	 * Clears the whole database
	 */
	clear: function() {
		this.connect(function(){}, function (db, logger) {
			db.collection("users").remove();				// Clears the users collection
			logger.info("The database has been cleared. The database is now empty.");
		})
	},

	/*****************************************************************************\
 										USERS
	\*****************************************************************************/

	/**
	 * Inserts the user into the collection of users
	 * @param user			User to insert in the database
	 * @param callback		Callback function
	 */
	insertUser : function(user, callback) {
		this.connect(callback, function(db, logger) {
			db.collection("users").insert(user, function(err, result) {
				if (err) {
					logger.error("Unable to insert " + user);
					callback(null);
				} else {
					logger.info("New user inserted in the database: " + user.email + " (" + result.ops[0]._id + ")");
					callback(result.ops[0]._id);
				}})
		});
	},

};