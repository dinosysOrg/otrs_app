var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'otrs_db'
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;