const joi = require('joi');
const db = require('../../database');
const users = require('../models/user.server.models');

const validationSchema = joi.object({
    email: joi.string().email().max(64).required(),
    password: joi.string().pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,30}$")).required(),
    // stole this from stackoverflow
    // https://stackoverflow.com/questions/77880219/how-do-i-validate-a-password-using-joi-to-ensure-that-it-contains-2-numbers-2-s
    first_name: joi.string().min(1).max(30).required(),
    last_name: joi.string().min(1).max(30).required()
});

const create_account = (req, res) => {
    const params = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password
    };

    const { error } = validationSchema.validate(params);

    if(error) return res.status(400).send({"error_message": error});
    users.addNewUser(params, (err, userId) => {
        if (err === 400) return res.status(400).send({"error_message": "Account already exists with that email."});
        if (err) {
            return res.status(500).send({"error_message": err})
        }
        console.log(params);
        return res.status(201).send({user_id: userId});
    });
}

const login = (req, res) => {
    const joiSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const {error,value} = joiSchema.validate(req.body);
    if (error) {
        return res.status(400).send({error: error.details[0].message});
    }
    users.authenticateUser(req.body.email, req.body.password, (err, id) => {
        if (err === 404) return res.status(400).send("Incorrect email or password");
        if (err) return res.sendStatus(500);

        users.getToken(id, (err, token) => {
            if (err) return res.sendStatus(500);
            if (token){
                return res.status(200).send({user_id: id, session_token: token});
            } else {
                users.setToken(id, (err, token) => {
                    if (err) return res.sendStatus(500);
                    return res.status(200).send({user_id: id, session_token: token});
                })
            }
        })
    })
};

const logout = (req, res) => {
    return res.sendStatus(500);
}

module.exports = {
    create_account: create_account,
    login: login,
    logout: logout
}