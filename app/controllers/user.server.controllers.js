const joi = require('joi');
const db = require('../../database');
const users = require('../models/user.server.models');
const { addNewUser } = require('../models/user.server.models');

const create_account = (req, res) => {
    const params = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password
    };

    addNewUser(params, (err) => {
        if (err) {
            return res.status(500).send({error: err, "message": "Something went wrong. Please try again."})
        }
        return res.status(201).send({params})
    });
}

const login = (req, res) => {
    const sql = "SELECT * FROM users WHERE email = \"" + req.body.email + "\"";
    const schema = joi.object({
        email:joi.string().email().max(64).required(),
        password:joi.string().required()
    });
    const validationRes = schema.validate({email: req.body.email, password: req.body.password});
    if (validationRes.error) {
        return res.status(400).send({500: "Something went wrong. Please make sure you entered your email and password correctly.", error: validationRes.error});
    }
    console.log(req.body.email);

    db.get(sql,function (err, row) {
        if (err) return res.status(500).send({error: "Server Error 500. Don't worry! This is our fault, not yours.", err});
        if (!row) {
            return res.status(404).send({error: "No user found with that email."});
        } else {
            bcrypt.compare(req.body.password,row.password,function(err,result) {
                if (err) return res.status(500).send({error: "Something went wrong. Error: " + err});
                if (result) return res.status(200).send("Successful login");
                if (!result) return res.status(401).send("Unauthorised");
            });
        }
    });
}

const logout = (req, res) => {
    return res.sendStatus(500);
}

module.exports = {
    create_account: create_account,
    login: login,
    logout: logout
}