var mysql = require('mysql');
var config=require('config');
var pool = mysql.createPool(config.Customer.dbConfig);
module.exports = pool;