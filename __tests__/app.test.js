const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data/index.js");
const app = require("../app.js");
const endPoints = require("../endpoints");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(testData);
});

describe("/api", () => {
  test("Get: 200 sends an object of all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(response.body.apiEndPoints).toEqual(endPoints);
      });
  });
});

describe("/api/topics", () => {
  test("Get: 200 sends an array of topics to the client", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        expect(response.body.topics.length).toBe(3);
        response.body.topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("/api/articles", () => {
  test("Get: 200 sends an array of articles to the client excluding a body property in the object", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(13);
        response.body.articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("string");
          expect(typeof article.body).toBe("undefined");
        });
      });
  });

  test("Get: 200 sends an array of articles to the client and the object matches the shape", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const article = {
          article_id: 3,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          author: "icellusedkars",
          comment_count: "2",
          created_at: "2020-11-03T09:12:00.000Z",
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          votes: 0,
        };
        expect(response.body.articles[0]).toMatchObject(article);
      });
  });

  test("Get: 200 sends an array of articles sorted by date created in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("Get: 200 sends an article object with the correct properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });

  test("Get: 200 sends an article object with the correct properties", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          article_id: 3,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "icellusedkars",
          created_at: "2020-11-03T09:12:00.000Z",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });

  test("Get: 404 sends an appropriate status and error message when given a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/888")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("article does not exist");
      });
  });

  test("Get: 400 sends an appropriate status and error message when given an invalid id", () => {
    return request(app)
      .get("/api/articles/not-an-article")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 200 has comment_count in the object property", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body.article.comment_count).toBe("11");
      });
  });

  test("Get: 200 has comment_count of '0', if there is no comments for the article", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then((response) => {
        expect(response.body.article.comment_count).toBe("0");
      });
  });

  test("Get: 200 the request was successful and it sends back the updated article with an increased vote of 1", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 101,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });

  test("Get: 200 the request was successful and it sends back the updated article with a decreased vote of 110", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -110 })
      .expect(200)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: -10,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });

  test("Get: 400 sends an appropriate status and error message when given an invalid body", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "incorrect" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status and error message when given an invalid id and valid body", () => {
    return request(app)
      .patch("/api/articles/not-an-article")
      .send({ inc_votes: 1 })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 404 sends an appropriate status and error message when given a valid id and body, but the id does not exist", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("article does not exist");
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("Get: 200 sends an array of comments belonging to a single article to the client", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const commentObj = {
          comment_id: 9,
          body: "Superficially charming",
          article_id: 1,
          author: "icellusedkars",
          votes: 0,
          created_at: "2020-01-01T03:08:00.000Z",
        };
        expect(
          response.body.comments[response.body.comments.length - 1]
        ).toMatchObject(commentObj);
        expect(response.body.comments.length).toBe(11);
        response.body.comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(comment.article_id).toBe(1);
        });
      });
  });

  test("Get: 200 sends an array of comments with recents comments first", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(2);
        expect(response.body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });

  test("Get: 404 sends an appropriate status error message when given a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/399/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("not found");
      });
  });

  test("Get: 200 sends back an empty array to the client, when article id exist, but there is no comments for the id", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toEqual([]);
      });
  });

  test("Get: 400 sends an appropriate status error message when given an invalid id", () => {
    return request(app)
      .get("/api/articles/not-an-id/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Post: 201 inserts a new comment to the comments table and returns the created comment to the client", () => {
    const newComment = {
      username: "rogersop",
      body: "always happy",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then((response) => {
        expect(response.body.newComment).toMatchObject({
          comment_id: 19,
          body: "always happy",
          article_id: 1,
          author: "rogersop",
          votes: 0,
          created_at: expect.any(String),
        });
      });
  });

  test("Post: 400 sends an appropriate status and error message when field is missing", () => {
    const newComment = {
      username: "rogersop",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          "body and username are required fields."
        );
      });
  });

  test("Post: 201 inserts a new comment to the comments table and returns the created comment to the client, when extra field is provided", () => {
    const newComment = {
      username: "rogersop",
      body: "always happy",
      user: "me",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then((response) => {
        expect(response.body.newComment).toMatchObject({
          comment_id: 19,
          body: "always happy",
          article_id: 1,
          author: "rogersop",
          votes: 0,
          created_at: expect.any(String),
        });
      });
  });

  test("Post: 404 adds a new comment to the db where the foreign key doesnt exist", () => {
    const newComment = {
      username: "doesnt exist",
      body: "always happy",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("not found");
      });
  });

  test("Post: 404 sends an appropriate status error message when given a valid post but non-existent id", () => {
    const newComment = {
      username: "rogersop",
      body: "always happy",
    };
    return request(app)
      .post("/api/articles/399/comments")
      .send(newComment)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("not found");
      });
  });

  test("Post: 400 sends an appropriate status error message when given an invalid id", () => {
    const newComment = {
      username: "rogersop",
      body: "always happy",
    };
    return request(app)
      .post("/api/articles/not-an-id/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});

describe("/api/comments/:comment_id", () => {
  test("DELETE: 204 deletes the specified comment and sends no body back", () => {
    return request(app).delete("/api/comments/10").expect(204);
  });

  test("DELETE:404 responds with an appropriate status and error message when given a non-existent id", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("comment does not exist");
      });
  });

  test("DELETE:400 responds with an appropriate status and error message when given an invalid id", () => {
    return request(app)
      .delete("/api/comments/no-an-id")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});

describe("/api/users", () => {
  test("Get: 200 sends an array of users to the client", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        expect(response.body.users.length).toBe(4);
        response.body.users.forEach((user) => {
          expect(typeof user.username).toBe("string");
          expect(typeof user.name).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });
});
