const db = require("./db/connection");
const format = require("pg-format");

exports.checkExists = async (table, column, value) => {
  const queryString = format(`SELECT * FROM %I WHERE %I = $1;`, table, column);
  return db.query(queryString, [value]).then((result) => {
    console.log(result.rows);
    if (!result.rows.length) {
      return Promise.reject({ status: 404, msg: "not found" });
    }
    return Promise.resolve();
  });
};
