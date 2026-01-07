const db = require('../../database');

const searchItems = (q, done) => {
    // const sql = 'SELECT TOP ? * FROM items WHERE name LIKE = ? OR WHERE description LIKE = ?';
    //
    // db.get(sql, params, (err, items) => {
    //     if (err) return done(err);
    //     return done(null, items);
    // });
    /*
        Also from Week 10 webinar because again I am terrible

        let sql = "SELECT i.item_id FROM items WHERE creator_id = ?";
        let values = [user_id];

        if (params.q) {
            sql += "AND (i.name LIKE '%" + params.q + " %' )"
            sql += "AND (i.description LIKE '%" + params.q + " %')) ";
        }
     */
};

const createItem = (item, done) => {
    const sql = `INSERT INTO items (name, description, starting_bid, start_date, end_date, creator_id) VALUES (?,?,?,?,?,?)`;
    db.run(sql, [
        item.name,
        item.description,
        item.starting_bid,
        Date.now(),
        item.end_date,
        item.creator_id
    ], function(err) {
        if (err) {
            console.log(err);
            return done(err);
        }
        return done(null, this.lastID);
    });
};

const getSpecificItems = (item_id, done) => {
    const sql = `SELECT * FROM items WHERE item_id = ?`;
    db.get(sql, item_id, (err, rows) => {
        if (err) {
            console.log("Get Specific Items Error: " + err.message);
            return done(err);
        }
        console.log("Rows: " + rows);
        if (!rows) return done(404);
        return done(null, {
            item_id: rows.item_id,
            creator_id: rows.creator_id
        });
    })
};


const getCurrentBid = (q, done) => {
    // OLD CODE
    // const item_id = q.item_id;
    // const sql = `SELECT amount FROM bids WHERE item_id = ?`;
    // db.run(sql, item_id, (err, rows) => {
    //     if (err) {
    //         console.log("getCurrentBid error message: " + err.message);
    //         return done(err);
    //     }
    //     if (rows.user_id === q.creator_id) return done(403);
    //     if (rows.amount >= q.amount) return done(400);
    //     return done({
    //         amount: rows[0].creator_id
    //     });
    // });

    const sqlOne = `SELECT creator_id, starting_bid FROM items WHERE item_id = ?`;
    db.get(sqlOne, q.item_id, (err, rows) => {
        if (err) return done(err);
        if (!rows) return done(404);

        const sqlTwo = `SELECT * FROM bids WHERE item_id = ? ORDER BY amount DESC LIMIT 1`;
        db.get(sqlTwo, q.item_id, (err, rowsTwo) => {
            if (err) return done(err);
            if (!rows) return done(404);
            return done(null, {
                originalCreatorID: rows.creator_id,
                currentBid: rowsTwo ? rowsTwo.amount : rows.starting_bid
            });
        });
    });
}
const bidOnItem = (q, done) => {
    const sql = `INSERT INTO bids (item_id, user_id, amount, timestamp) VALUES (?,?,?,?)`;
    if (q.originalCreatorID === q.user_id) return done(403);
    db.run(sql, [
        q.item_id,
        q.user_id,
        q.amount,
        Date.now()
    ], (err) => {
        if (!q.currentBid) return done(400);
        if (q.amount <= q.currentBid) return done(400);
        if (err) {
            console.log(err);
            return done(err);
        }
        return done(null, this.lastID);
    });
}

const getItemInfo = (q, done) => {
    const sql = `SELECT items.item_id, items.name, items.description, items.starting_bid, items.start_date, items.end_date, items.creator_id, COALESCE(bids.amount, items.starting_bid) AS current_bid, usersone.first_name AS first_name, usersone.last_name AS last_name, bids.user_id AS highest_bid_user_id, userstwo.first_name AS highest_bid_first_name, userstwo.last_name AS highest_bid_last_name FROM items JOIN users usersone ON usersone.user_id = items.creator_id LEFT JOIN bids ON bids.item_id = items.item_id AND bids.amount = ( SELECT amount FROM bids WHERE item_id = items.item_id ORDER BY amount DESC LIMIT 1 ) LEFT JOIN users userstwo ON userstwo.user_id = bids.user_id WHERE items.item_id = ?`;
    db.get(sql, q, (err, rows) => {
       if (err) return done(err);
       if (!rows) return done(404);
       return done(null, {
           item_id: rows.item_id,
           name: rows.name,
           description: rows.description,
           starting_bid: rows.starting_bid,
           start_date: rows.start_date,
           end_date: rows.end_date,
           creator_id: rows.creator_id,
           current_bid: rows.current_bid,
           first_name: rows.first_name,
           last_name: rows.last_name,
           user_id: rows.highest_bid_user_id
           ? {
               user_id: rows.highest_bid_user_id,
               first_name: rows.highest_bid_first_name,
               last_name: rows.highest_bid_last_name
           }
           : null
       });
    });
}

const bidHistory = (q, done) => {
    const sqlOne = `SELECT item_id FROM items WHERE item_id = ?`;
    db.get(sqlOne, q, (err, rows) => {
        if (err) return done(err);
        console.log("***bidHistory: ROWS FROM SQLONE***")
        console.log(rows)
        if (!rows) return done(404);
        const sqlTwo = `SELECT bids.item_id, bids.user_id, users.first_name, users.last_name, bids.amount, bids.timestamp FROM bids JOIN users ON bids.user_id = users.user_id WHERE bids.item_id = ? ORDER BY bids.timestamp DESC`;
        db.all(sqlTwo, q, (err, rowsTwo) => {
            console.log("***bidHistory: ROWS FROM SQLTWO***");
            console.log(rowsTwo);
            if (err) return done(err);
            return done(null, rowsTwo || null);
        });
    });
}


module.exports = {
    searchItems,
    createItem,
    getSpecificItems,
    getCurrentBid,
    bidOnItem,
    getItemInfo,
    bidHistory
}