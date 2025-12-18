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

const getSpecificItems = (q, done) => {
    const sql = `SELECT * FROM items WHERE item_id = ?`;
    db.get(sql, q.item_id, (err, rows) => {
        if (err) {
            console.log("Get Specific Items Error: " + err.message);
            return done(err);
        }
        console.log("Rows: " + rows);
        if (!rows) return done(404);
        return done(null, rows);
    })
};


const getCurrentBid = (q, done) => {
    const sql = `SELECT amount FROM bids WHERE item_id = ?`;
    db.run(sql, [q], (err, rows) => {
        if (err) return done(err);
        if (rows.creator_id === q.user_id) return done(403);
        if (rows.amount >= q.amount) return done(400);
        return done({
            amount: rows[0].creator_id
        });
    });
}
const bidOnItem = (item, done) => {
    const sql = `UPDATE items SET starting_bid=? WHERE item_id = ?`;
    db.run(sql, [item.amount, item.item_id], (err, bid) => {
        if (err) return done(err);
        return done(null, bid);
    });
}


module.exports = {
    searchItems,
    createItem,
    getSpecificItems,
    getCurrentBid,
    bidOnItem
}