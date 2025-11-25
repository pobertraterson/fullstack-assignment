const crypto = require("crypto");
const db = require('../../database');
const joi = require("joi");
const user = require("../models/user.server.models");

const validationSchema = joi.object({
    email: joi.string().email().max(64).required(),
    password: joi.string().min(8).max(20).pattern(/(?=(?:.*[a-z]){2,16}).+/, 'lowercase').pattern(/(?=(?:.*[A-Z]){2,16}).+/, 'uppercase').pattern(/(?=(?:.*[0-9]){2,16}).+/, 'number').pattern(/(?=(?:.*[!"#$%&'()*+,-./:<=>?@[\]^_`{|}~]){1,16}).+/, 'special').required(),
    // stole this from stackoverflow
    // https://stackoverflow.com/questions/77880219/how-do-i-validate-a-password-using-joi-to-ensure-that-it-contains-2-numbers-2-s
    firstname: joi.string().min(1).max(30).required(),
    surname: joi.string().min(1).max(30).required(),
    salt: joi.string().required(),
    session_token: joi.string(),
});
const getHash = (password,salt) => {
    return crypto.pbkdf2Sync(password,salt,100000,64,'sha512').toString('hex');
};
const addNewUser = (user,done) => {
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password, salt);

    const sql = 'INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?,?,?,?,?)';
    const params = [user.first_name,user.last_name,user.email,hash,salt.toString('hex')];

    db.run(sql, params, function(err) {
        if (err) return done(err);
        console.log(params);
        return done(null);
    });
}

const authenticateUser = (email,password,done) => {
    const sql = 'SELECT user_id, password, salt FROM users WHERE email=?';

    db.get(sql, [email], (err, row) => {
        if (err) return done(err);
        if(!row) return done(404);
        if(row.salt===null) row.salt = '';
        let salt = Buffer.from(row.salt, 'hex');
        if(row.password===getHash(password,salt)){
            return done(false,row.user_id)
        } else {
            return done(404)
        }
    })
}

module.exports = {
    addNewUser
}