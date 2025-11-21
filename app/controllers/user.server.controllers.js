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

const create_account = async (req, res) => {
    const validationRes = validationSchema.validate({
        email: req.body.email,
        password: req.body.password,
        firstname: req.body.first_name,
        surname: req.body.last_name
    });
    if (validationRes.error) {
        return res.status(400).send({
            error: "Invalid data. Make sure your email, firstname, and surname are correct and that your password is between 8-20 characters & has 2 lowercase & uppercase letters along with 2 numbers and 2 special characters."
        });
    }

    try {
        let saltRound = Math.floor((Math.random() * (20 - 5 + 1)) + 5);
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const sql = 'INSERT INTO users (email, password, first_name, last_name, salt) VALUES (?,?,?,?,?)';
        const params = [
            req.body.email,
            hashedPassword,
            req.body.first_name,
            req.body.last_name,
            saltRound
        ];
        db.run(sql, params, function(err) {
            if (err) {
                return res.status(500).send({error: 'Server Error 500. Don\'t worry! This is our fault, not yours!'});
            }
            return res.status(201).send({
                "user_id": this.lastID,
                "email": req.body.email,
                "password": hashedPassword,
                "first_name": req.body.first_name,
                "last_name": req.body.last_name,
                "salt": saltRound
            });
        });
    } catch (err) {
        return res.status(500).send({error: "Error while hashing password: " + err});
    }
};

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