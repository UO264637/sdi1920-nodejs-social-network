module.exports = function(app, dbManager) {

    app.get("/api/users/", function (req, res) {
                res.status(200);
                res.json({
                    patatas: true,
                    tomate: true
                });
    });

    app.post("/api/login/", function (req, res) {
        console.log(req.body.email);
        console.log(req.body.password);
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
                var token = app.get('jwt').sign(
                    {usuario: query.email, tiempo: Date.now() / 1000}, "secret123");
                res.status(200);
                res.json({
                    authenticated: true,
                    token: token
                });
            }
        });
    });
};