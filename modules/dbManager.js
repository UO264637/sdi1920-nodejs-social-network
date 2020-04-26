module.exports = {

	mongo : null,
	app : null,

	/**
	 * Initializes the database manager object
	 * @param app		The app object, it does contain the token to connect to the database
	 * @param mongo		MongoDB object, to make the database operations
	 */
	init : function(app, mongo) {
		this.mongo = mongo;
		this.app = app;
	},

	/**
	 * Extraction of the connection to the database, connects to the database and performs the operation
	 * @param callback					Callback function extended
	 * @param operation					Operation to do in the database when connected
	 */
	connect: function (callback, operation) {
		this.mongo.MongoClient.connect(this.app.get("db"), function (err, db) {
			if (err) {
				console.log("Unable to connect to the database");
				callback(null);
			} else {
				operation(db);
			}
		});
	},

	/*****************************************************************************\
	 									CREATE
	\*****************************************************************************/

	/**
	 * Inserts the input into the specified collection
	 * @param collection					Collection to look
	 * @param input							Object(s) to insert in the collection
	 * @param callback						Callback function (optional)
	 * @returns {Promise<Promise | void>}	returns Promise if no callback passed
	 */
	insert: async function (collection, input, callback) {
		if (callback) {				// Specifying a callback calls the operation with it
			this.connect(callback, function(db) {
				db.collection(collection).insert(input, function(err, result) {
					(err) ? callback(null) : callback(result.ops[0]._id);
					db.close();
				})
			});}
		else { 						// Without callback the function returns a promise
			return this.mongo.MongoClient.connect(this.app.get("db"), null).then((db) => {
				return db.collection(collection).insert(input);
			}).catch((err) => console.log(err));
		}
	},

	/*****************************************************************************\
	 									READ
	\*****************************************************************************/

	/**
	 * Retrieves the results of a query over a specified collection, returns a promise or executes a callback function
	 * @param collection		Collection to look
	 * @param query				Query of the object to retrieve
	 * @param callback			Callback function (optional)
	 * @return {Promise} 		returns Promise if no callback passed
	 */
	get: async function (collection, query, callback) {
		if (callback) {				// Specifying a callback calls the operation with it
			this.connect(callback, (db) => {
				db.collection(collection).find(query).toArray((err, result) => {
					(err) ? callback(null) : callback(result);
					db.close();
				});
			}); }
		else { 						// Without callback the function returns a promise
			return this.mongo.MongoClient.connect(this.app.get("db"), null).then((db) => {
				return db.collection(collection).find(query).toArray();
			}).catch((err) => console.log(err));
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
	 								DATABASE RESET
	\*****************************************************************************/

	/**
	 * Clears the specified collection and calls to the next step
	 * @param collection				Name of the collection to clear
	 * @param callback					Callback function
	 */
	clear: function(collection, callback) {
		this.connect(callback, function (db) {
			db.collection(collection).remove();				// Clears the specified collection
			callback(db);
		});
	},

	/**
	 * Clears the database and inserts the default data
	 */
	reset: function(defaultb) {
		// Loads the data from the config files
		let {users, requests} = defaultb;

		// Deletion of users, when done inserts them again and their related data
		this.clear("users", (db) => {
			// Encryption of the password
			users.forEach((user) => user.password = this.app.encrypt(user.password));
			// Insertion of the users
			this.insert("users", users).then(() => {
				// Deletion of requests
				this.clear("requests", (db) => {
					// Loads the user ids into each request
					Promise.all(requests.map(async (request) => {
						let pFrom = this.get("users", {email: request.from});
						let pTo = this.get("users", {email: request.to});
						return Promise.all([pFrom, pTo]).then((results) => {
							return {
								from: this.mongo.ObjectID(results[0][0]._id),
								to: this.mongo.ObjectID(results[1][0]._id)
							};
						}).catch((err) => console.log(err));
						// Insertion of the requests
					})).then((requests) => this.insert("requests", requests))
						.catch((err) => console.log(err));
					db.close();
				});
			});
			db.close();
		});
	},

};