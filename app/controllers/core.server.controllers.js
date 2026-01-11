const core = require("../models/core.server.models");
const users = require("../models/user.server.models");
const joi = require('joi');

const search = (req, res) => {
    // return res.sendStatus(500);
    const query = req.query.q || "";
    const status = req.query.status || null;
    const limit = req.query.limit || "";
    const offset = req.query.offset || "";
    const statusTypes = ["Open", "Bid", "Archive"];
    if (status && !statusTypes.includes(status)) return res.status(400).send({"error_message": "Invalid request."});
    const userToken = req.get('X-Authorization');
    let user_id;
    users.getIdFromToken(userToken, (err, user) => {
        if (err) return res.status(500).send({"error_message": "500 Server Error."});
        if(!user) {
            user_id = null;
            // if (status) return res.status(400).send({"error_message": "You cannot search for auctions that you have auctioned or bid on."});
        } else {
            user_id = user.user_id;
        }
        const params = {
            query: query,
            status: status,
            limit: limit,
            offset: offset,
            user_id: user_id,
        }
        console.log("***PARAMS FROM SEARCH***");
        console.log(params);
        core.searchItems(params, (err, items) => {
            if (err) return res.status(500).send({"error_message": err});
            return res.status(200).send(items);
        })
    })

}

const item = (req, res) => {
    const schema = joi.object({
        name: joi.string().min(1).max(100).required(),
        description: joi.string().max(1000).required(),
        starting_bid: joi.number().min(0).required(),
        start_date: joi.date().default(Date.now),
        end_date: joi.date().greater(joi.ref('start_date')).required()
    });


    const { error} = schema.validate(req.body);
    if(error) {
        console.error("Item: " + req.body.name + ". Reason of failure: " + error.message);
        return res.status(400).send({"error_message": error.message});
    }

    if (!req.user_id) {
        return res.status(401).send({"error_message": "Please login before adding an item for auction."});
    }

    console.log("***DATA FROM req.body IN CONTROLLER***");
    console.log(req.body);
    const params = {...req.body, creator_id: req.user_id};
    console.log("***DATA FROM params IN CONTROLLER***");
    console.log(params);

    core.createItem(params, (err, item_id) => {
        if (err) return res.status(500).send({"error_message": err});
        return res.status(201).send({"item_id": item_id});
    });
}

const itemSpecific = (req, res) => {
    core.getSpecificItems({item_id: req.body.item_id}, (err, data) => {
        if (err === 404) return res.status(404).send({"error_message": "Not Found"});
        if (err) {
            return res.status(500).send({"error_message": err});
        }
        return res.status(200).send({data});
    })
}

const postItemSpecificBid = (req, res) => {
    const schema = joi.object({
        amount: joi.number().min(0).required()
    });
    console.log("Bidding Schema Set Complete");

    if (req.body > 1) {
        return res.status(400).send({"error_message": "Invalid"});
    }
    const {error, data} = schema.validate(req.body);
    if (error) {
        return res.status(400).send({"error_message": error.message});
    }

    if (!req.user_id) {
        console.log("No User ID Found.")
        return res.status(401).send({"error_message": "Please login before bidding on an item."});
    }
    console.log("Checked for user_id in middleware");

    const params = {amount: req.body.amount, creator_id: req.user_id, item_id: req.params.item_id};

    core.getSpecificItems(parseInt(params.item_id), (err, preData) => {
        if (err === 404) {
            console.log("404 error: " + err.message);
            return res.status(404).send({"error_message": "Item not found"});
        }
        if (err) {
            console.log("500 error: " + err.message);
            return res.status(500).send({"error_message": "Server Error"});
        }
        const postData = {...preData, amount: params.amount}
        console.log("***POST DATA**");
        console.log(postData);
        core.getCurrentBid(postData, (err, dataTwo) => {
            if (err) return res.status(500).send({"error_message": err.message});
            console.log("***DATA TWO***");
            console.log(dataTwo);
            const dataThree = {...dataTwo, amount: params.amount, user_id: req.user_id, item_id: req.params.item_id};
            console.log("***DATA THREE***");
            console.log(dataThree);
            core.bidOnItem(dataThree, (err) => {
                if (err === 403) return res.status(403).send({"error_message": "You cannot bid on your own item."});
                if (err === 400) return res.status(400).send({"error_message": "Your bid either wasn't valid or was not higher than the current highest bid."});
                if (err) {
                    console.log("Bid on items error: " + err.message);
                    return res.status(500).send({"error_message": err});
                }
                return res.status(201).send("Successfully bid on item.");
            });
        });
    });
}

const getItem = (req, res) => {
    core.getItemInfo(req.params.item_id, (err, data) => {
        if (!data) return res.status(404).send({"error_message": "Not Found"});
        if (err) return res.status(500).send({"error_message": "Server Error"});
        return res.status(200).send(data);
    })
}

// BID HISTORY
const getItemSpecificBid = (req, res) => {
    core.bidHistory(req.params.item_id, (err, data) => {
        if (err === 404) return res.status(404).send({"error_message": "No item found"});
        if (err) return res.status(500).send({"error_message": err.message});
        return res.status(200).send(data);
    });
}

module.exports = {
    search,
    item,
    itemSpecific,
    postItemSpecificBid,
    getItemSpecificBid,
    getItem
}