const db = require("../db/connection");

exports.selectArticles = (query) => {
  const queryValues = [];
  let queryString =
    "SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id ";

  if (query.topic) {
    queryValues.push(query.topic);
    queryString += "WHERE topic = $1 ";
  }

  queryString +=
    "GROUP BY articles.article_id ORDER BY articles.created_at DESC;";

  return db.query(queryString, queryValues).then((result) => {
    return result.rows;
  });
};

exports.selectArticlesById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article does not exist" });
      }
      return result.rows[0];
    });
};

exports.selectCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE comments.article_id = $1 ORDER BY created_at DESC;`,
      [article_id]
    )
    .then((result) => {
      return result.rows;
    });
};

exports.updateArticleById = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2
        RETURNING *;`,
      [inc_votes, article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article does not exist" });
      }
      return result.rows[0];
    });
};

exports.insertNewCommentByArticleId = (field, article_id) => {
  return db
    .query(
      `INSERT INTO comments (body, votes, author, article_id, created_at)
        VALUES
        ($1, DEFAULT, $2, $3, DEFAULT) RETURNING *;`,
      [field.body, field.username, article_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};
