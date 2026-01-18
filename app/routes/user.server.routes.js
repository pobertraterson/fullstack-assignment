const users = require("../controllers/user.server.controllers");
const auth = require("../lib/authentication");

module.exports = function(app) {
    app.route("/users")
        .post(users.create_account);

    app.route("/login")
        .post(users.login);

    app.route("/logout")
        .post(auth.isAuth, users.logout);

    app.route("/users/:user_id")
        .get(users.getUserHistory);

    app.route("/usertoken")
        .get(users.getIdFromToken)
}