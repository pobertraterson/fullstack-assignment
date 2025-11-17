const core = require("../controllers/core.server.controllers");

module.exports = function(app) {
    app.route("/search")
        .get(core.search());

    app.route("/item")
        .post(core.item);

    app.route("/item/:itemId")
        .get(core.itemSpecific());

    app.route("/item/:itemId/bid")
        .post(core.postItemSpecificBid());

    app.route("/item/:itemId/bid")
        .get(core.getItemSpecificBid());
}