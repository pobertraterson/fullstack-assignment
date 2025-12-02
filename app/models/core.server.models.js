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
    console.log("DEBUG /item STARTED");
    const sql = `INSERT INTO items (item_name, item_description, starting_bid, start_date, end_date, creator_id) VALUES (?,?,?,?,?,?)`;
    const params = [item.item_name, item.item_description, item.starting_bid, new Date(), item.end_date, item.creator_id];
    db.run(sql, params, function(err) {
        if (err) return done(err);
        return done(null, this.lastID);
    });
};

module.exports = {
    searchItems,
    createItem
}