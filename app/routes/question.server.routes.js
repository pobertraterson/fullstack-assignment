const question = require("../controllers/question.server.controllers");

module.exports = function(app) {
    app.route("/item/:itemId/question")
        .get(question.getItemSpecificQuestion());

    app.route("/item/:itemId/question")
        .post(question.postItemSpecificQuestion());

    app.route("/item/:itemId")
        .get(question.postQuestion());
}