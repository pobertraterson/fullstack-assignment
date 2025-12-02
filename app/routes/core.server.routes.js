const core = require("../controllers/core.server.controllers");
const isAuth = require("../lib/authentication");

module.exports = function(app) {
    app.route("/search")
        .get(core.search());

    app.route("/item")
        .post(isAuth, core.item);

    app.route("/item/:itemId")
        .get(core.itemSpecific());

    app.route("/item/:itemId/bid")
        .post(core.postItemSpecificBid());

    app.route("/item/:itemId/bid")
        .get(core.getItemSpecificBid());
}