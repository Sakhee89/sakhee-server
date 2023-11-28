const db = require("../db/connection.js");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics").then((result) => {
    return result.rows;
  });
};

exports.insertTopic = (field) => {
  return db
    .query(
      `INSERT INTO topics 
  (slug, description)
  VALUES
  ($1, $2) RETURNING *;`,
      [field.slug, field.description]
    )
    .then((result) => {
      return result.rows[0];
    });
};
