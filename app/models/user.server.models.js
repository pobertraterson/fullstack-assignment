const crypto = require("crypto");
const db = require('../../database');

// account creation
const getHash = (password,salt) => {
    // I changed it to sha512 because apparently that's better. If I messed this up that would be very bad.
    return crypto.pbkdf2Sync(password,salt,100000,256,'sha512').toString('hex');
};
const addNewUser = (user,done) => {
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password, salt);

    const sql = 'INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?,?,?,?,?)';
    const sqlCheck = 'SELECT * FROM users WHERE email = ?';
    const params = [user.first_name,user.last_name,user.email,hash,salt.toString('hex')];

    db.get(sqlCheck, user.email, (err, row) => {
        if (row) return done(400);

        db.run(sql, params, function(err) {
            if (err) return done(err);
            return done(null, this.lastID);
        });
    });


};

// logging a user in
const authenticateUser = (email,password,done) => {
    const sql = 'SELECT user_id, password, salt FROM users WHERE email=?';

    db.get(sql, [email], (err, row) => {
        if(err) return done(err);
        if(!row) return done(null,null);
        if(row.salt===null) row.salt = '';
        let salt = Buffer.from(row.salt, 'hex');
        if(row.password===getHash(password,salt)){
            return done(false,row.user_id)
        } else {
            return done(404)
        }
    });
};

const setToken = (id, done) => {
    let token = crypto.randomBytes(16).toString('hex');
    const sql = 'UPDATE users SET session_token=? WHERE user_id=?';

    db.run(sql, [token,id], (err) => {
        return done(err,token);
    });
};

const getToken = (id, done) => {
    const sql = 'SELECT session_token FROM users WHERE user_id=?';
    db.get(sql,[id],(err,row) => {
        if (err) return done(err);
        if(!row) return done(null,null);
        return done(null, row.session_token);
    });
};

// logging out
const removeToken = (token, done) => {
    const sql = 'UPDATE users SET session_token=null WHERE session_token=?';

    db.run(sql, [token], (err) => {
        return done(err);
    });
};

const getIdFromToken = (token, done) => {
    const sql = 'SELECT user_id FROM users WHERE session_token=?';
    db.get(sql, [token], (err, row) => {
        console.log("user model gIDFT: " +row);
        if (err) return done(err);
        if (!row) return done(null,null);
        return done(null, row.user_id);
    });
};

const userHistory = (q, done) => {
    const sqlUser = `SELECT * FROM users WHERE user_id=?`;
    db.get(sqlUser, q, (err, rows) => {
        if (err) return done(err);
        if (!rows) return done(null,null);
        const sqlItems = 'SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.user_id, u.first_name, u.last_name FROM items i INNER JOIN users u ON i.creator_id=u.user_id WHERE creator_id=?';
        const sqlBids = `SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name FROM bids b JOIN items i ON b.item_id = i.item_id JOIN users u ON i.creator_id = u.user_id WHERE b.user_id = ? GROUP BY i.item_id`;
        db.all(sqlItems, q, (err, rowsItems) => {
            if (err) return done(err);
            console.log("***USERHISTORY ITEMS ROWS***");
            console.log(rowsItems);
            db.all(sqlBids, q, (err, rowsBids) => {
                if (err) return done(err);
                console.log("***USERHISTORY BIDS ROWS***");
                console.log(rowsBids);

                rows.selling = rowsItems || [];
                rows.bidding_on = rowsBids || [];
                rows.auctions_ended = [];
                return done(null, rows);
            })
        });
    });
}

module.exports = {
    addNewUser,
    authenticateUser,
    setToken,
    getToken,
    removeToken,
    getIdFromToken,
    userHistory
}