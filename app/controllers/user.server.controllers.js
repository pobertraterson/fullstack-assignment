const joi = require('joi');
const db = require('/database');

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
    firstname: joi.string().min(1).max(30)
        .pattern(/(?=(?:.*[A-Z]){2,16}).+/, 'uppercase')
        .pattern(/(?=(?:.*[a-z]){2,16}).+/, 'lowercase')
        .required(),
    surname: joi.string().min(1).max(30)
        .pattern(/(?=(?:.*[A-Z]){2,16}).+/, 'uppercase')
        .pattern(/(?=(?:.*[a-z]){2,16}).+/, 'lowercase')
        .required()
})

validationSchema.validate({email: "admin@robertpaterson.net", password: "DontUs3_Th!sAsAPw0rd", firstname: "Robert", surname: "Paterson"})

const create_account = (req, res) => {
    const validationRes = validationSchema.validate({email: req.body.email, password: req.body.password, firstname: req.body.firstname, surname: req.body.surname});
    if (!validationRes.valid) {
        return res.status(400).send({error: "Invalid data. Make sure your email, firstname, and surname are correct and that your password is between 8-20 characters & has 2 lowercase & uppercase letters along with 2 numbers and 2 special characters."})
    }

    const sql = 'INSERT INTO users (user_id, email, password, first_name, last_name, salt, session_token) VALUES (?,?,?,?,?,?,?)'

    db.run(sql, function (err) {
        if(err) return res.sendStatus(500).send({error: 'Server Error 500'});

        return res.status(201).send({
            user_id: this.lastID,
            email: req.body.email,
            password: req.body.password,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            salt: this.salt,
            session_token: this.session_token
        })
    })
}

const login = (req, res) => {

}

const logout = (req, res) => {
    return res.sendStatus(500);
}

module.exports = {
    create_account: create_account,
    login: login,
    logout: logout
}