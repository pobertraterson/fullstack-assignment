const joi = require('joi');
const bcrypt = require("bcrypt");
const db = require('../../database');

const validationSchema = joi.object({
    email: joi.string().email().max(64).required(),
    password: joi.string()
        .min(8)
        .max(20)
        .pattern(/(?=(?:.*[a-z]){2,16}).+/, 'lowercase')
        .pattern(/(?=(?:.*[A-Z]){2,16}).+/, 'uppercase')
        .pattern(/(?=(?:.*[0-9]){2,16}).+/, 'number')
        .pattern(/(?=(?:.*[!"#$%&'()*+,-./:<=>?@[\]^_`{|}~]){1,16}).+/, 'special')
        .required(),
    // stole this from stackoverflow
    // https://stackoverflow.com/questions/77880219/how-do-i-validate-a-password-using-joi-to-ensure-that-it-contains-2-numbers-2-s
    firstname: joi.string().min(1).max(30).required(),
    surname: joi.string().min(1).max(30).required()
})

validationSchema.validate({email: "admin@robertpaterson.net", password: "DontUs3_Th!sAsAPw0rd", firstname: "Robert", surname: "Paterson"})

const create_account = (req, res) => {
    const validationRes = validationSchema.validate({email: req.body.email, password: req.body.password, firstname: req.body.first_name, surname: req.body.last_name});
    console.log(validationRes);
    if (validationRes.error) {
        return res.status(400).send({error: "Invalid data. Make sure your email, firstname, and surname are correct and that your password is between 8-20 characters & has 2 lowercase & uppercase letters along with 2 numbers and 2 special characters."})
    } else {
        const sql = 'INSERT INTO users (user_id, email, password, first_name, last_name, salt, session_token) VALUES (?,?,?,?,?,?,?)'

        db.run(sql, async function (err) {
            if (err) return res.sendStatus(500).send({error: 'Server Error 500. Don\'t worry! This is our fault, not yours!'});
            async function hashPassword(password) {
                try {
                    const hashed = await bcrypt.hash(password, 10);
                    console.log(hashed);
                    return hashed;
                } catch (err) {
                    return res.status(500).send({error: "Error while hashing password: " + err});
                }
            }

            return res.status(201).send({
                "user_id": this.lastID,
                "email": req.body.email,
                "password": await hashPassword(req.body.password),
                "first_name": req.body.first_name,
                "last_name": req.body.last_name,
                "salt": 10,
                // session_token: this.session_token
            });
        });
    }
}

const login = (req, res) => {

    const sql = 'SELECT * FROM users WHERE email = ?';
    const schema = joi.object({
        email:joi.string().email().max(64).required(),
        password:joi.string().required()
    })
    schema.validate({email: req.body.email, password: req.body.password});

    db.get(sql, [req.body.email], function (err, row) {
        if (err) return res.status(500).send({error: "Server Error 500. Don't worry! This is our fault, not yours."});
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