const db = require("../db/connection.js");

exports.selectUsers = () => {
  return db.query("SELECT * FROM users").then((result) => {
    return result.rows;
  });
};

exports.selectUserByUsername = (username) => {
  console.log(username);
  return db
    .query(`SELECT * FROM users WHERE username = $1;`, [username])
    .then((result) => {
      if (!result.rows.length) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
      return result.rows[0];
    });
};
