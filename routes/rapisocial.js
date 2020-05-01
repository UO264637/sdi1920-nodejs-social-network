module.exports = function(app, dbManager) {

    /*****************************************************************************\
                                            GET
     \*****************************************************************************/

    app.get("/api/friends/", function (req, res) {
        var query = { "email" : res.user};

        dbManager.get("users", query,function(users){
            if ( users == null ){
                res.status(500);
                res.json({
                    error : "An error has ocurred"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(users[0].friends));
            }
        });
    });

    app.get("/api/user/:id", function (req, res) {
        var query = { $or: [
                {"_id" : dbManager.mongo.ObjectID(req.params.id)},
                {"email" : res.user}
            ]};

        dbManager.get("users", query,function(users){
            if ( users == null ){
                res.status(500);
                res.json({
                    error : "An error has ocurred"
                })
            } else {
                 var query2 = { $or:[
                        {"to" : dbManager.mongo.ObjectID(users[1]._id),
                            "from" : dbManager.mongo.ObjectID(users[0]._id)},
                        {"to" : dbManager.mongo.ObjectID(users[0]._id),
                            "from" : dbManager.mongo.ObjectID(users[1]._id)}
                    ]};
                dbManager.get("messages", query2,function(messages){
                    if ( messages == null ){
                        res.status(500);
                        res.json({
                            error : "An error has ocurred"
                        })
                    } else {
                        res.status(200);
                        let user;
                        if (users[0].email == res.user) {
                            user = users[1];
                        }
                        else {
                            user = users[0];
                        }

                        let unread = 0;
                        for (let i = 0; i < messages.length; i++) {
                            if (!messages[i].read) {
                                unread++;
                            }
                        }

                        user.lastMessage = messages[messages.length-1] == undefined ? 0: messages[messages.length-1].date;
                        user.unread = unread;
                        res.send(JSON.stringify(user));
                    }
                });
            }
        });
    });

    app.get("/api/chat/:id", function (req, res) {
        dbManager.get("users", { "email" : res.user},function(users){
            if ( users == null ){
                res.status(500);
                res.json({
                    error : "An error has ocurred"
                })
             } else {
                var query = { $or:[
                        {"to" : dbManager.mongo.ObjectID(req.params.id),
                         "from" : dbManager.mongo.ObjectID(users[0]._id)},
                        {"to" : dbManager.mongo.ObjectID(users[0]._id),
                         "from" : dbManager.mongo.ObjectID(req.params.id)}
                    ]};
                dbManager.get("messages", query,function(messages){
                    if ( messages == null ){
                        res.status(500);
                        res.json({
                            error : "An error has ocurred"
                        })
                    } else {
                        res.status(200);
                        res.send( JSON.stringify(messages));
                    }
                });
            }
        });
    });

    /*****************************************************************************\
                                            POST
     \*****************************************************************************/

    app.post("/api/login/", function (req, res) {
        let password = app.encrypt(req.body.password);
        let query = {
            email : req.body.email,
            password : password,
        };
        dbManager.get("users", query, function(users) {
            if (users == null || users.length === 0) {
                res.status(401); // Unauthorized
                res.json({
                    authenticated: false,
                    message: "Wrong user or password"
                })
            } else {
                let token = app.get('jwt').sign(
                    {user: query.email, time: Date.now() / 1000}, "stormfather");
                res.status(200);
                res.json({
                    authenticated: true,
                    token: token
                });
            }
        });
    });

    app.post("/api/message/", function (req, res) {
        let message = {
            from : "",
            to : dbManager.mongo.ObjectID(req.body.to),
            text: req.body.text,
            read: false,
            date: Date.now()
        };
        dbManager.get("users", {email: res.user}, function(users) {
            if (users == null || users.length === 0) {
                res.status(500); // Unauthorized
                res.json({
                    error: "An error has ocurred"
                })
            } else {
                message.from = users[0]._id;
                if (users[0].friends.map((friend) => friend.toString()).includes(req.body.to.toString())) {
                    dbManager.insert("messages", message, function (id) {
                        if (id == null) {
                            res.status(500);
                            res.json({
                                error: "An error has ocurred"
                            })
                        } else {
                            res.status(201);
                            res.json({
                                message: "Inserted message",
                                _id: id
                            })
                        }
                    });
                } else {
                    res.status(403);
                    res.json({
                        message: "You must be friends",
                    })
                }
            }
        });
    });

    /*****************************************************************************\
                                            PUT
     \*****************************************************************************/

    app.put("/api/read/:id", function(req, res) {
        dbManager.get("users", {email: res.user}, function(users) {
            if (users == null) {
                res.status(500);
                res.json({
                    error: "An error has ocurred"
                })
            } else {
                let query = {
                    "_id": dbManager.mongo.ObjectID(req.params.id),
                    "to": dbManager.mongo.ObjectID(users[0]._id)
                };

                let message = {};
                message.read = true;

                dbManager.update("messages", query, message, function (result) {
                    if (result == null) {
                        res.status(500);
                        res.json({
                            error: "An error has ocurred"
                        })
                    } else {
                        if (result.result.nModified == 0) {
                            res.status(403);
                            res.json({
                                mensaje: "Message not modified",
                                _id: req.params.id
                            })
                        }
                        else {
                            res.status(200);
                            res.json({
                                mensaje: "Message modified",
                                _id: req.params.id
                            })
                        }
                    }
                });
            }
        });
    });
};