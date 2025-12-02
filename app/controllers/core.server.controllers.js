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
    console.log("DEBUG /item STARTED");
    const schema = joi.object({
        item_name: joi.string().min(1).max(100).required(),
        item_description: joi.string().min(1).max(1000).required(),
        starting_bid: joi.number().required(),
        ending_date: joi.date().greater('now').required()
    });
    const params = {
        "creator_id": req.body.user_id,
        "item_name": req.body.item_name,
        "item_description": req.body.item_description,
        "starting_bid": req.body.starting_bid,
        "end_date": req.body.end_date
    };
    const { error } = schema.validate(params);
    if(error) return res.status(400).send({"error_message": error.message});

    if (!req.body.user_id) {
        return res.status(401).send({"error_message": "Please login before adding an item for auction."});
    }
    core.createItem(params, (err, item_id) => {
        if (err) return res.status(500).send({"error_message": err});
        return res.status(201).send({"item_id": item_id});
    });
}

const itemSpecific = (req, res) => {
    return res.sendStatus(500);
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