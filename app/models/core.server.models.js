const db = require('../../database');

const searchItems = (q, done) => {
    // const sql = 'SELECT TOP ? * FROM items WHERE name LIKE = ? OR WHERE description LIKE = ?';
    //
    // db.get(sql, params, (err, items) => {
    //     if (err) return done(err);
    //     return done(null, items);
    // });
};

const createItem = (item, done) => {
    const sql = 'INSERT INTO items (item_name, item_description, starting_bid, end_date) VALUES (?,?,?,?)'
    const params = [item.item_name, item.item_description, item.starting_bid, item.end_date];
    db.run(sql, params, function(err) {
        if (err) return done(err);
        return done(null, item);
    });
};

module.exports = {
    searchItems: searchItems,
    createItem: createItem
}