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
                highestBidUser: rowsTwo ? rowsTwo.user_id : null,
                highestBidAmount: rowsTwo ? rowsTwo.amount : null
            });
        });
    });
}
const bidOnItem = (q, done) => {
    if (q.originalCreatorID === q.user_id) return done(403);
    if (q.highestBidAmount >= q.amount) return done({status: 400, "error_message": "Your bid is not higher than the current bid."});
    const sql = `INSERT INTO bids (item_id, user_id, amount, timestamp) VALUES (?,?,?,?)`;
    db.run(sql, [
        q.item_id,
        q.user_id,
        q.amount,
        Date.now()
    ], (err) => {
        if (err) return done(err);
        return done(null, this.lastID);
    });
}


module.exports = {
    searchItems,
    createItem,
    getSpecificItems,
    getCurrentBid,
    bidOnItem
}