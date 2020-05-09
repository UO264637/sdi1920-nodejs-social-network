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
				console.error("Unable to connect to the database");
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
					(err) ? callback(null) : callback(result.ops);
					db.close();
				})
			});}
		else { 						// Without callback the function returns a promise
			return this.mongo.MongoClient.connect(this.app.get("db"), null).then((db) => {
				let promise = db.collection(collection).insert(input);
				db.close;
				return promise;
			}).catch((err) => console.error(err));
		}
	},

	/*****************************************************************************\
	 									READ
	\*****************************************************************************/

	/**
	 * Retrieves the results of a query over a specified collection, returns a promise or executes a callback function
	 * @param collection		Collection to look
	 * @param query				Query of the object(s) to retrieve
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
				let promise = db.collection(collection).find(query).toArray();
				db.close;
				return promise;
			}).catch((err) => console.error(err));
		}
	},

	/**
	 * Retrieves the results of a query over a specified collection, based on a page
	 * @param collection		Collection to look
	 * @param query				Query of the object(s) to retrieve
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
	 									UPDATE
	\*****************************************************************************/

	/**
	 * Updates the collection based on the query and input
	 * @param collection					Collection to update
	 * @param query							Query of the object(s) to update
	 * @param input							Update to apply
	 * @param callback						Callback function
	 * @returns {Promise<Promise | void>}	returns Promise if no callback passed
	 */
	update: async function (collection, query, input, callback) {
		if (callback) {				// Specifying a callback calls the operation with it
			this.connect(callback, function(db) {
				db.collection(collection).update(query, {$set: input}, function(err, result) {
					(err) ? callback(null) : callback(result);
					db.close();
				})
			});}
		else { 						// Without callback the function returns a promise
			return this.mongo.MongoClient.connect(this.app.get("db"), null).then((db) => {
				let promise = db.collection(collection).update(query, {$set: input});
				db.close;
				return promise;
			}).catch((err) => console.error(err));
		}
	},

	/*****************************************************************************\
	 									DELETE
	\*****************************************************************************/

	/**
	 * Deletes the queried into the specified collection
	 * @param collection					Collection to look
	 * @param query							Query of the object(s) to update
	 * @param callback						Callback function (optional)
	 * @returns {Promise<Promise | void>}	returns Promise if no callback passed
	 */
	delete: async function (collection, query, callback) {
		if (callback) {				// Specifying a callback calls the operation with it
			this.connect(callback, function(db) {
				db.collection(collection).remove(query, function(err, result) {
					(err) ? callback(null) : callback(result.ops[0]._id);
					db.close();
				})
			});}
		else { 						// Without callback the function returns a promise
			return this.mongo.MongoClient.connect(this.app.get("db"), null).then((db) => {
				let promise = db.collection(collection).remove(query);
				db.close;
				return promise;
			}).catch((err) => console.error(err));
		}
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
		let {users, requests, messages} = defaultb;
		let logger = this.app.get("logger");
		// Deletion of users, when done inserts them again and their related data
		this.clear("users", (db) => {
			// Encryption of the password
			users.forEach((user) => user.password = this.app.encrypt(user.password));
			// Insertion of the users
			this.insert("users", users, (users) => {
				if (users == null)
					logger.error("An error has occurred inserting the users");
				else {
					users.forEach((u) => logger.info(`Inserted user: ${u.email} (${u._id})`));
					// Deletion of requests, when done inserts them again with ids instead of emails
					this.clear("requests", (db) => {
						// Change of the requests to hold the ids of the users
						requests = requests.map((request) => {
							return {
								from: users.filter((u) => u.email === request.from).pop()._id,
								to: users.filter((u) => u.email === request.to).pop()._id
						}});
						// Insertion of the requests
						this.insert("requests", requests, (results) => {
							if (results == null)
								logger.error("An error has occurred inserting the requests");
							else {
								results.forEach((r) =>
									logger.info(`Inserted request: {from: ${r.from}, to: ${r.to}} (${r._id})`));
							}
						});
						db.close();
					});
					// Update of the users to hold the ids in the list of friends instead of the emails
					users.forEach((user) => {
						// Change the email for their ids
						user.friends = user.friends.map((friend) => {
							return users.filter((u) => u.email === friend).pop()._id
						});
						// Updates the users
						this.update("users", { email: user.email }, user, (result) => {
							if (result == null)
								logger.error("An error has occurred updating the users");
							else
								logger.info(`Updated the user ${user.email} (${user._id})`);
						});
					});
					// Deletion of messages, when done inserts them again with ids instead of emails
					this.clear("messages", (db) => {
						// Change of the requests to hold the ids of the users
						messages.forEach((request) => {
							request.from = users.filter((u) => u.email === request.from).pop()._id;
							request.to = users.filter((u) => u.email === request.to).pop()._id;
							request.date = Date.now();
						});
						// Insertion of the requests
						this.insert("messages", messages, (results) => {
							if (results == null)
								logger.error("An error has occurred inserting the messages");
							else {
								results.forEach((r) =>
									logger.info(`Inserted message: {from: ${r.from}, to: ${r.to}} (${r._id})`));
							}
						});
						db.close();
					});
				}
			});
			db.close();
		});
	},

};