const db = require("../db/connection");

exports.selectArticles = (
  topic,
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  p = 1
) => {
  const queryValues = [limit, (p - 1) * limit];

  let queryString = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comments.comment_id) AS INT) AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id `;

  const sortByWhiteList = [
    "title",
    "article_id",
    "author",
    "created_at",
    "votes",
    "article_img_url",
    "topic",
  ];

  order = order.toLowerCase();

  const orderWhiteList = ["asc", "desc"];

  if (sort_by && !sortByWhiteList.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  if (order && !orderWhiteList.includes(order)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  if (topic) {
    queryValues.push(topic);
    queryString += `WHERE topic = $3 `;
  }

  queryString += `GROUP BY articles.article_id ORDER BY articles.${sort_by} ${order} LIMIT $1 OFFSET $2`;

  return db.query(queryString, queryValues).then((result) => {
    return result.rows;
  });
};

exports.selectArticlesById = (article_id) => {
  let queryString = `SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comments.comment_id) AS INT) AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id ORDER BY articles.created_at DESC;`;

  return db.query(queryString, [article_id]).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article does not exist" });
    }
    return result.rows[0];
  });
};

exports.selectCommentsByArticleId = (article_id, limit = 10, p = 1) => {
  return db
    .query(
      `SELECT * FROM comments WHERE comments.article_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;`,
      [article_id, limit, (p - 1) * limit]
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
        return Promise.reject({ status: 404, msg: "Article does not exist" });
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

exports.insertArticle = (newArticle) => {
  const { title, topic, author, body } = newArticle;
  let article_img_url =
    "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700";
  if (newArticle.article_img_url) article_img_url = newArticle.article_img_url;

  return db
    .query(
      `INSERT INTO articles (title, topic, author, body, article_img_url)
  VALUES
  ($1, $2, $3, $4, $5) RETURNING *;`,
      [title, topic, author, body, article_img_url]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.removeArticleById = (article_id) => {
  return db
    .query("DELETE FROM comments WHERE article_id = $1;", [article_id])
    .then(() => {
      return db
        .query("DELETE FROM articles WHERE article_id = $1;", [article_id])
        .then((result) => {
          if (result.rowCount === 0) {
            return Promise.reject({
              status: 404,
              msg: "Article does not exist",
            });
          }
        });
    });
};
