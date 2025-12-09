const core = require("../models/core.server.models");
const joi = require('joi');

const search = (req, res) => {
    return res.sendStatus(500);
    // core.searchItems(q, (err, items) => {
    //     if(err) return res.status(500).send({"error_message": err});
    //     return res.status(200).send(items);
    // });

    /*
        From week 10 Webinar going through questions and shit that I will still get wrong :(
        (this is a mess)

        let param_valid = true;
        if (req.query.q){
            if (typeof(req.query.d) != "string") {
                param_valid = false;
            }
        }
        if (!params_valid) {
            return res.sendStatus(500);
        }

        if(!user_id && req.query.status) {
            return res.sendStatus(400);
        }
     */
}

const item = (req, res) => {
    const schema = joi.object({
        name: joi.string().min(1).max(100).required(),
        description: joi.string().max(1000).required(),
        starting_bid: joi.number().min(0).required(),
        start_date: joi.date().default(Date.now),
        end_date: joi.date().greater(joi.ref('start_date')).required()
    });


    const { error, data} = schema.validate(req.body);
    if(error) {
        console.log("Item: " + req.body.name + ". Reason of failure: " + error.message);
        return res.status(400).send({"error_message": error.message});
    }

    if (!req.user_id) {
        return res.status(401).send({"error_message": "Please login before adding an item for auction."});
    }

    const params = {...data, creator_id: req.user_id};

    core.createItem(params, (err, item_id) => {
        if (err) return res.status(500).send({"error_message": err});
        return res.status(201).send({"item_id": item_id});
    });
}

const itemSpecific = (req, res) => {
    const schema = joi.object({
        amount: joi.number().required()
    });

    const { error }= schema.validate(req.body);
    if(error) {
        console.log("Item: " + req.body.name + ". Reason of failure: " + error.message);
        return res.status(400).send({"error_message": error.message});
    }

    if (!req.user_id) {
        return res.status(401).send({"error_message": "Please login before bidding on an item."});
    }

    core.getSpecificItems(req.item_id, (err, data) => {
        if (err) return res.status(500).send({"error_message": err});
        if (!data) return res.status(404).send({"error_message": "Item not found."});
        if (data.creator_id === req.user_id) return res.status(403).send({"error_message": "You are not allowed to bid on your own item."});


    })
}

const postItemSpecificBid = (req, res) => {
    return res.sendStatus(500);
}

const getItemSpecificBid = (req, res) => {
    return res.sendStatus(500);
}

module.exports = {
    search,
    item,
    itemSpecific,
    postItemSpecificBid,
    getItemSpecificBid
}