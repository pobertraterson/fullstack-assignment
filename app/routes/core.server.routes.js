const core = require("../controllers/core.server.controllers");
const auth = require("../lib/authentication");

module.exports = function(app) {
    app.route("/search")
        .get(core.search);

    app.route("/item")
        .post(auth.isAuth, core.item);

    app.route("/item/:item_id")
        .get(core.getItem);

    app.route("/item/:item_id/bid")
        .post(auth.isAuth, core.postItemSpecificBid)
        .get(core.getItemSpecificBid);
}