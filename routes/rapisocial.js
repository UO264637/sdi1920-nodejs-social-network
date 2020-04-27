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
            date: new Date()
        };
        dbManager.get("users", {email: res.user}, function(users) {
            if (users == null || users.length === 0) {
                res.status(500); // Unauthorized
                res.json({
                    error: "An error has ocurred"
                })
            } else {
                message.from = users[0]._id;
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
            }
        });
    });
};