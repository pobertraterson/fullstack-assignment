const core = require("../models/core.server.models");
const joi = require('joi');

const search = (req, res) => {
    // return res.sendStatus(500);
    core.searchItems(q, (err, items) => {
        if(err) return res.status(500).send({"error_message": err});
        return res.status(200).send(items);
    });
}

const item = (req, res) => {
    const schema = joi.object({
        item_name: joi.string().min(1).max(100).required(),
        item_description: joi.string().min(1).max(1000).required(),
        starting_bid: joi.number().required(),
        ending_date: joi.date().greater('now').required()
    });
    const params = {
        "item_name": req.body.item_name,
        "item_description": req.body.item_description,
        "starting_bid": req.body.starting_bid,
        "end_date": req.body.end_date
    };
    const { error } = schema.validate(params);
    if(error) return res.status(400).send({"error_message": error.message});
    core.createItem(params, (err, item) => {

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
    search: search,
    item: item,
    itemSpecific: itemSpecific,
    postItemSpecificBid: postItemSpecificBid,
    getItemSpecificBid: getItemSpecificBid
}