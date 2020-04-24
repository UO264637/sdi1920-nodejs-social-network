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
	 * @param callback					Callback function extended
	 * @param operation					Operation to do in the database when connected
	 */
	connect: function (callback, operation) {
		let logger = this.logger;
		this.mongo.MongoClient.connect(this.app.get("db"), function (err, db) {
			if (err) {
				logger.error("Unable to connect to the database");
				callback(null);
			} else {
				operation(db, logger);
			}
		});
	},

	/**
	 * Clears the database and inserts the default data
	 */
	reset: function() {
		this.logger.info("Reset of the database invoked");
		// Loads the data from the config files
		let defaultdb = JSON.parse(this.fs.readFileSync("config/defaultdb.json"));

		// Clears the users collection and fills it again
		this.clear("users", (db) => {
			defaultdb.users.forEach((user) => {
				user.password = this.app.get("encrypt")(user.password);			// Password encryption
				this.insertUser(user, () => {});						// User insertion
				db.close();
			});
		});
	},

	/**
	 * Clears the specified collection and calls to the next step
	 * @param collection				Name of the collection to clear
	 * @param callback					Callback function
	 */
	clear: function(collection, callback) {
		this.connect(callback, function (db, logger) {
			db.collection(collection).remove();				// Clears the specified collection
			callback(db);
			logger.info("The database has been cleared. The database is now empty.");
		});
	},

	/**
	 * Retrieves the results of a query over a specified collection, returns a promise or executes a callback function
	 * @param collection		Collection to look
	 * @param query				Query of the object to retrieve
	 * @param callback			Callback function (optional)
	 * @return {Promise} 		returns Promise if no callback passed
	 */
	get: async function (collection, query, callback) {
		let logger = this.logger;
		if (callback) {				// Specifying a callback calls the operation with it
			this.connect(callback, (db) => {
				db.collection(collection).find(query).toArray((err, result) => {
					(err) ? callback(null) : callback(result);
					db.close();
				});
			});
		}
		else { 						// Without callback the function returns a promise
			return this.mongo.MongoClient.connect(this.app.get("db"), null).then((db) => {
				return db.collection(collection).find(query).toArray();
			}).catch((err) => logger.error(err));
		}
	},

	/**
	 * Retrieves the results of a query over a specified collection, based on a page
	 * @param collection		Collection to look
	 * @param query				Query of the object to retrieve
	 * @param pg				Page to get
	 * @param callback			Callback function
	 */
	getPg : function(collection, query, pg, callback){
		this.connect(callback, function(db) {
			let col = db.collection(collection);
			col.count(query, function(err, count) {
				col.find(query).skip((pg-1)*5).limit(5).toArray(
					function(err, users) {
						(err) ? callback(null) : callback(users, count);
						db.close();
					});
			});
		});
	},

	/*****************************************************************************\
 										USERS
	\*****************************************************************************/

	/**
	 * Inserts the user into the collection of users
	 * @param user			User to insert in the database
	 * @param callback		Callback function
	 */
	insertUser : function (user, callback) {
		this.connect(callback, function(db, logger) {
			db.collection("users").insert(user, function(err, result) {
				if (err) {
					logger.error("Unable to insert " + user);
					callback(null);
				} else {
					logger.info("New user inserted in the database: " + user.email + " (" + result.ops[0]._id + ")");
					callback(result.ops[0]._id);
				}
				db.close();
			})
		});
	},

};