const mysql = require("mysql2");

const connection = mysql.createPool({
  connectionLimit: 100,
  host: "127.0.0.1",
  user: "root",
  port:"3306",
  password: "Key45031*",
  database: "Blog",
});
module.exports = connection;
