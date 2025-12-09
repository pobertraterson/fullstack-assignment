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
    db.get(sql, q, (err, rows) => {
        if (err) {
            console.log(err.message);
            return done(err);
        }
        return done(null, rows);
    })
};

const bidOnItem = (item, done) => {
    getSpecificItems(item.item_id, (err, rows) => {
        if (err) {
            console.log("SERVER ERROR " + err.message)
            return done(err);
        }
        if (!rows) return done(404);
        if (item.creator_id === rows.creator_id) return done(403);
        if (item.starting_bid <= rows.starting_bid) return done(400);
        const sql = `UPDATE items SET starting_bid=? WHERE item_id = ?`;
        db.run(sql, item, (err) => {
            if (err) return done(err);
            return done(null, item);
        });
    });
}

module.exports = {
    searchItems,
    createItem,
    getSpecificItems,
    bidOnItem
}