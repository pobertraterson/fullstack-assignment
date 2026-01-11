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

    let sql = `
        SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name
        FROM items i
                 INNER JOIN users u ON i.creator_id = u.user_id
                 LEFT JOIN bids b ON b.item_id = i.item_id
        WHERE (i.name LIKE ? OR i.description LIKE ?)
    `;

    const params = [`%${q.query}%`, `%${q.query}%`];

    if (q.user_id) {
        sql += ` AND i.creator_id = ?`;
        params.push(q.user_id);
    } else {
        q.status = null;
        console.log("You can't search for items you are auctioning or have bid on if you aren't signed in.");
    }

    if (q.user_id) {
        switch (q.status) {
            case "Open":
                sql += ` AND i.creator_id = ? AND i.end_date > ?`;
                params.push(q.user_id, Date.now());
                break;
            case "Bid":
                sql += ` AND b.user_id = ?`;
                params.push(q.user_id);
                break;
            case "Archive":
                sql += ` AND i.end_date < ?`;
                params.push(Date.now());
                break;
        }
    }

    sql += ` ORDER BY i.item_id ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(q.limit, 10) || 50, parseInt(q.offset, 10) || 0);

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            return done(err);
        }
        return done(null, rows);
    });
};

const createItem = (item, done) => {
    console.log("***DATA FROM item IN createItem***");
    console.log(item);
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
    // I'd like to thank GitHub Copilot for this sql query because I did not have any clue on what I was doing.
    const sql = `SELECT i.item_id, i.name AS name, i.description AS description, i.starting_bid AS starting_bid, i.start_date AS start_date, i.end_date AS end_date, i.creator_id, COALESCE(b.amount, i.starting_bid) AS current_bid, creator.first_name AS first_name, creator.last_name AS last_name, b.user_id AS current_bid_user_id, current_bid_user.first_name AS current_bid_first_name, current_bid_user.last_name AS current_bid_last_name FROM items i LEFT JOIN users creator ON creator.user_id = i.creator_id LEFT JOIN bids b ON b.item_id = i.item_id AND b.amount = (SELECT amount FROM bids WHERE item_id = i.item_id ORDER BY amount DESC LIMIT 1) LEFT JOIN users current_bid_user ON current_bid_user.user_id = b.user_id WHERE i.item_id = ?`;
    db.get(sql, q, (err, rows) => {
        if (!rows) return done(404);
        if (err) {
            console.log("***ERROR FROM db.get getItemInfo***")
            console.log(err);
            return done(err);
        }
       console.log("***getItemInfo ROWS DATA***");
       console.log(rows);
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
           current_bid_holder: rows.current_bid_user_id
           ? {
               user_id: rows.current_bid_user_id,
               first_name: rows.current_bid_first_name,
               last_name: rows.current_bid_last_name
           }
           : null
       });
    });
}

const bidHistory = (q, done) => {
    const sqlOne = `SELECT item_id FROM items WHERE item_id = ?`;
    db.get(sqlOne, q, (err, rows) => {
        if (!rows) return done(404);
        if (err) return done(err);
        console.log("***bidHistory: ROWS FROM SQLONE***");
        console.log(rows);
        const sqlTwo = `SELECT bids.item_id, bids.amount, bids.timestamp, bids.user_id, users.first_name, users.last_name FROM bids JOIN users ON bids.user_id = users.user_id WHERE bids.item_id = ? ORDER BY bids.timestamp DESC`;
        db.all(sqlTwo, q, (err, rowsTwo) => {
            console.log("***bidHistory: ROWS FROM SQLTWO PRE-POP***");
            console.log(rowsTwo);
            if (rowsTwo.length > 1) rowsTwo.pop(); // It's showing the starting bid as the very first bid which I don't think is the right thing so I am using pop(). If I am wrong, I am stupid.
            console.log("***bidHistory: ROWS FROM SQLTWO***");
            console.log(rowsTwo);
            if (err) return done(err);
            return done(null, rowsTwo || []);
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