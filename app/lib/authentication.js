const users = require('../models/user.server.models');

const isAuth = function(req,res,next){
    console.log("TEST");
    let token = req.get('X-Authorization');
    if (!token) return res.status(401).send({"error_message": "Something went wrong. You may not be logged in."});
    users.getIdFromToken(token, (err, id) => {
        if (err || !id) return res.status(401).send({"error_message": err});
        //if (!token) return res.status(401).send({"error_message": "Something went wrong. You may not be logged in."});
        req.user_id=id;
        next();
    });
}

module.exports = {
    isAuth: isAuth
};