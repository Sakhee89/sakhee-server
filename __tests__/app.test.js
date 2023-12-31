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

describe("/api/not-a-path", () => {
  test("Get: 404 sends an appropriate status and error message when given a path that does not exist", () => {
    return request(app)
      .get("/api/not-a-path")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
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

  test("Post: 201 inserts a new topic to the topics table and returns the created topic to the client", () => {
    const newTopic = {
      slug: "dogs",
      description: "big and cute",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then((response) => {
        expect(response.body.topic).toMatchObject(newTopic);
      });
  });

  test("Post: 400 sends an appropriate status and error message when sending an invalid body", () => {
    const newTopic = {
      description: "big and cute",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});

describe("/api/articles", () => {
  test("Get: 200 sends an array of articles to the client excluding a body property in the object with a default limit of 10", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(10);
        response.body.articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
          expect(typeof article.body).toBe("undefined");
        });
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

  test("Get: 200 sends an array of articles queried by the specified topic", () => {
    const returnedArticles = [
      {
        author: "rogersop",
        title: "UNCOVERED: catspiracy to bring down democracy",
        article_id: 5,
        topic: "cats",
        created_at: "2020-08-03T13:14:00.000Z",
        votes: 0,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        comment_count: 2,
      },
    ];
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toMatchObject(returnedArticles);
      });
  });

  test("Get: 200 sends an array of articles queried by the specified topics with a default limit of 10", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(10);
        response.body.articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
          expect(typeof article.body).toBe("undefined");
        });
      });
  });

  test("Get: 200 sends an empty array when a topic that exist is passed but the article does not exist", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toEqual([]);
      });
  });

  test("Get: 404 sends an appropriate status and error message when trying to SQL inject", () => {
    return request(app)
      .get("/api/articles?topic=mitch; SELECT * FROM Article RETURNING *;")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
      });
  });

  test("Get: 404 sends an appropriate status and error message when given a topic that does not exist", () => {
    return request(app)
      .get("/api/articles?topic=no-such-topic")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
      });
  });

  test("Get: 200 sends an array of articles sorted by author and default in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("author", {
          descending: true,
        });
      });
  });

  test("Get: 200 sends an array of articles sorted by the article_id and default in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("article_id", {
          descending: true,
        });
      });
  });

  test("Get: 200 sends an array of articles sorted by the title and default in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("title", {
          descending: true,
        });
      });
  });

  test("Get: 200 sends an array of articles sorted by created_at as default in ascending order", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("created_at");
      });
  });

  test("Get: 200 sends an array of articles sorted by title and in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("title");
      });
  });

  test("Get: 400 sends an appropriate status and error message when given a order query that does not exist", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=no-such-option")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status and error message when given a sort by query that does not exist", () => {
    return request(app)
      .get("/api/articles?sort_by=no_such_option&order=asc")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status and error message when trying to SQL inject with sort_by", () => {
    return request(app)
      .get("/api/articles?sort_by=title; SELECT * FROM articles RETURNING *;")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status and error message when trying to SQL inject with sort_by", () => {
    return request(app)
      .get("/api/articles?order=asc; SELECT * FROM articles RETURNING *;")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 200 sends an array back when given valid sort by, order by and filter", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=article_id&order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("article_id");
      });
  });

  test("Get: 200 sends an array with only 5 results when using limit of 5", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(5);
        response.body.articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
          expect(typeof article.body).toBe("undefined");
        });
      });
  });

  test("Get: 200 sends an array with only 5 results when using limit of 5 and returns the correct keys", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(5);
        response.body.articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
          expect(typeof article.body).toBe("undefined");
        });
      });
  });

  test("Get: 200 sends an array with all the results when given a limit greater than the total results", () => {
    return request(app)
      .get("/api/articles?limit=20")
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
          expect(typeof article.comment_count).toBe("number");
          expect(typeof article.body).toBe("undefined");
        });
      });
  });

  test("Get: 200 sends an array with all the results when given a topic query and limit", () => {
    return request(app)
      .get("/api/articles?topic=mitch&limit=3")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(3);
        response.body.articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
          expect(typeof article.body).toBe("undefined");
        });
      });
  });

  test("Get: 200 sends an array with all the results when given a sort by query and limit", () => {
    return request(app)
      .get("/api/articles?sort_by=title&limit=3")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(3);
        expect(response.body.articles).toBeSortedBy("title", {
          descending: true,
        });
      });
  });

  test("Get: 200 sends an array with all the results when given a sort by query, filter query and limit", () => {
    return request(app)
      .get("/api/articles?filter=mitch&sort_by=article_id&order=asc&limit=3")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(3);
        expect(response.body.articles).toBeSortedBy("article_id");
      });
  });

  test("Get: 200 sends an array with all the results when given a page query (p) with a default limit of 10", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc&p=2")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(3);
        expect(response.body.articles[0].article_id).toBe(11);
        expect(response.body.articles[1].article_id).toBe(12);
        expect(response.body.articles[2].article_id).toBe(13);
      });
  });

  test("Get: 200 sends an array with all the results showing the default limit of 10 and page query (p) of 1", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(10);
        expect(response.body.articles[0].article_id).toBe(1);
        expect(response.body.articles[1].article_id).toBe(2);
        expect(response.body.articles[9].article_id).toBe(10);
      });
  });

  test("Get: 200 sends an array with all the results, when topic, sort_by, order, limit and page query used", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=article_id&order=asc&limit=3&p=2")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(3);
        expect(response.body.articles[0].article_id).toBe(4);
        expect(response.body.articles[1].article_id).toBe(6);
        expect(response.body.articles[2].article_id).toBe(7);
      });
  });

  test("Get: 200 sends an empty array when the page query has too high", () => {
    return request(app)
      .get("/api/articles?p=1000")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toEqual([]);
      });
  });

  test("Get: 400 sends an appropriate status and error message when given a negative limit", () => {
    return request(app)
      .get("/api/articles?limit=-20")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status and error message when given a invalid limit", () => {
    return request(app)
      .get("/api/articles?limit=not_valid")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status and error message when trying to sql inject by limit", () => {
    return request(app)
      .get("/api/articles?limit=2; SELECT * FROM articles RETURNING *;")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status and error message when given a invalid page query (p)", () => {
    return request(app)
      .get("/api/articles?p=invalid")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status and error message when given a negative number for page query (p)", () => {
    return request(app)
      .get("/api/articles?p=-4")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status and error message when given a negative number for page query (p)", () => {
    return request(app)
      .get("/api/articles?p=1; SELECT * FROM articles RETURNING *;")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("POST: 201 inserts a new article to the articles table and returns the created article to the client", () => {
    const newArticle = {
      title: "UNCOVERED: Unidentified Object spotted",
      topic: "mitch",
      author: "rogersop",
      body: "Fallen hard from the heavens!",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    const returnedArticle = {
      article_id: 14,
      title: "UNCOVERED: Unidentified Object spotted",
      topic: "mitch",
      author: "rogersop",
      body: "Fallen hard from the heavens!",
      created_at: expect.any(String),
      votes: 0,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      comment_count: 0,
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then((response) => {
        expect(response.body.article).toMatchObject(returnedArticle);
      });
  });

  test("POST: 201 inserts a new article to the articles table and returns the created article to the client when article_img_url is missing", () => {
    const newArticle = {
      title: "UNCOVERED: Unidentified Object spotted",
      topic: "mitch",
      author: "rogersop",
      body: "Fallen hard from the heavens!",
    };
    const returnedArticle = {
      article_id: 14,
      title: "UNCOVERED: Unidentified Object spotted",
      topic: "mitch",
      author: "rogersop",
      body: "Fallen hard from the heavens!",
      created_at: expect.any(String),
      votes: 0,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      comment_count: 0,
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then((response) => {
        expect(response.body.article).toMatchObject(returnedArticle);
      });
  });

  test("POST: 400 sends an appropriate status and error message when given a invalid body", () => {
    const newArticle = {
      topic: "mitch",
      author: "rogersop",
      body: "Fallen hard from the heavens!",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("POST: 404 sends an appropriate status and error message when given a topic that does not exist", () => {
    const newArticle = {
      title: "UNCOVERED: Unidentified Object spotted",
      topic: "does not exist",
      author: "rogersop",
      body: "Fallen hard from the heavens!",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
      });
  });

  test("POST: 404 sends an appropriate status and error message when given a author that does not exist", () => {
    const newArticle = {
      title: "UNCOVERED: Unidentified Object spotted",
      topic: "mitch",
      author: "does not exist",
      body: "Fallen hard from the heavens!",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
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
          body: "I find this existence challenging",
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
          body: "some gifs",
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
        expect(response.body.msg).toBe("Article does not exist");
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
        expect(response.body.article.comment_count).toBe(11);
      });
  });

  test("Get: 200 has comment_count of 0, if there is no comments for the article", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then((response) => {
        expect(response.body.article.comment_count).toBe(0);
      });
  });

  test("Patch: 200 the request was successful and it sends back the updated article with an increased vote of 1", () => {
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
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 101,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });

  test("Patch: 200 the request was successful and it sends back the updated article with a decreased vote of 110", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -110 })
      .expect(200)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          body: "I find this existence challenging",
          author: "butter_bridge",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: -10,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });

  test("Patch: 400 sends an appropriate status and error message when given an invalid body", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "incorrect" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Patch: 400 sends an appropriate status and error message when given an invalid id and valid body", () => {
    return request(app)
      .patch("/api/articles/not-an-article")
      .send({ inc_votes: 1 })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Patch: 404 sends an appropriate status and error message when given a valid id and body, but the id does not exist", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article does not exist");
      });
  });

  test("Delete: 204 deletes the specified article and sends no body back", () => {
    return request(app).delete("/api/articles/1").expect(204);
  });

  test("Delete: 400 sends an appropriate status and error message when given a invalid id", () => {
    return request(app)
      .delete("/api/articles/invalid")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Delete: 404 sends an appropriate status and error message when given an id that does not exist", () => {
    return request(app)
      .delete("/api/articles/127")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article does not exist");
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("Get: 200 sends an array of comments belonging to a single article to the client", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=11")
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

  test("Get: 200 sends an array of comments of 5 when using limit query of 5 and default page of 1", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(5);
        expect(response.body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
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

  test("Get: 200 sends an array of all the comments when using limit query that is above the total results", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=500")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(11);
        expect(response.body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
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

  test("Get: 200 sends an array of comments of when given a page query (p) and default limit query is 10", () => {
    const firstCommentObj = {
      comment_id: 5,
      body: "I hate streaming noses",
      article_id: 1,
      author: "icellusedkars",
      votes: 0,
      created_at: "2020-11-03T21:00:00.000Z",
    };
    const secondCommentObj = {
      comment_id: 2,
      body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
      article_id: 1,
      author: "butter_bridge",
      votes: 14,
      created_at: "2020-10-31T03:03:00.000Z",
    };
    return request(app)
      .get("/api/articles/1/comments?p=1")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(10);
        expect(response.body.comments[0]).toMatchObject(firstCommentObj);
        expect(response.body.comments[1]).toMatchObject(secondCommentObj);
      });
  });

  test("Get: 200 sends an array of comments of when given a page query (p) and default limit query is 10", () => {
    const commentObj = {
      comment_id: 9,
      body: "Superficially charming",
      article_id: 1,
      author: "icellusedkars",
      votes: 0,
      created_at: "2020-01-01T03:08:00.000Z",
    };
    return request(app)
      .get("/api/articles/1/comments?p=2")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(1);
        expect(response.body.comments[0]).toMatchObject(commentObj);
      });
  });

  test("Get: 200 sends an array of comments of when given a page query (p) and limit query", () => {
    const firstCommentObj = {
      comment_id: 8,
      body: "Delicious crackerbreads",
      article_id: 1,
      author: "icellusedkars",
      votes: 0,
      created_at: "2020-04-14T20:19:00.000Z",
    };
    const secondCommentObj = {
      comment_id: 6,
      body: "I hate streaming eyes even more",
      article_id: 1,
      author: "icellusedkars",
      votes: 0,
      created_at: "2020-04-11T21:02:00.000Z",
    };
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=2")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(5);
        expect(response.body.comments[0]).toMatchObject(firstCommentObj);
        expect(response.body.comments[1]).toMatchObject(secondCommentObj);
      });
  });

  test("Get: 200 sends an empty array when given a page query that has no comments", () => {
    return request(app)
      .get("/api/articles/1/comments?p=200")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toEqual([]);
      });
  });

  test("Get: 400 sends an appropriate status error message when given a negative limit query", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=-2")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status error message when given a invalid limit query", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=not-valid")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status error message when given a invalid page (p) query", () => {
    return request(app)
      .get("/api/articles/1/comments?p=not-valid")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status error message when given a page (p) query that is a negative number", () => {
    return request(app)
      .get("/api/articles/1/comments?p=-10")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status error message when doing a sql injection through p query", () => {
    return request(app)
      .get("/api/articles/1/comments?p=2 ; SELECT * FROM articles RETURNING *")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 400 sends an appropriate status error message when doing a sql injection through limit query", () => {
    return request(app)
      .get(
        "/api/articles/1/comments?limit=2 ; SELECT * FROM articles RETURNING *"
      )
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("Get: 404 sends an appropriate status error message when given a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/399/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
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
          "Body and username are required fields."
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
        expect(response.body.msg).toBe("Not found");
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
        expect(response.body.msg).toBe("Not found");
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

  test("DELETE: 404 responds with an appropriate status and error message when given a non-existent id", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Comment does not exist");
      });
  });

  test("DELETE: 400 responds with an appropriate status and error message when given an invalid id", () => {
    return request(app)
      .delete("/api/comments/no-an-id")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("PATCH: 200 the request was successful and it sends back the updated comment with an increased votes of 1", () => {
    const changeVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/1")
      .send(changeVotes)
      .expect(200)
      .then((response) => {
        expect(response.body.comment).toMatchObject({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 17,
          author: "butter_bridge",
          article_id: 9,
          created_at: "2020-04-06T12:17:00.000Z",
        });
      });
  });

  test("PATCH: 200 the request was successful and it sends back the updated comment with a decreased votes of 20", () => {
    const changeVotes = { inc_votes: -20 };
    return request(app)
      .patch("/api/comments/1")
      .send(changeVotes)
      .expect(200)
      .then((response) => {
        expect(response.body.comment).toMatchObject({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: -4,
          author: "butter_bridge",
          article_id: 9,
          created_at: "2020-04-06T12:17:00.000Z",
        });
      });
  });

  test("PATCH: 404 responds with an appropriate status and error message when given an id that does not exist and valid comment format", () => {
    const changeVotes = { inc_votes: 20 };
    return request(app)
      .patch("/api/comments/199")
      .send(changeVotes)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Comment does not exist");
      });
  });

  test("PATCH: 400 responds with an appropriate status and error message when given an id that exist and invalid comment format", () => {
    const changeVotes = { inc_votes: "12+" };
    return request(app)
      .patch("/api/comments/1")
      .send(changeVotes)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });

  test("PATCH: 400 responds with an appropriate status and error message when given an invalid id and valid comment format", () => {
    const changeVotes = { inc_votes: 12 };
    return request(app)
      .patch("/api/comments/not-valid")
      .send(changeVotes)
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

describe("/api/users:username", () => {
  test("Get: 200 sends an array of users to the client", () => {
    const user = {
      username: "butter_bridge",
      name: "jonny",
      avatar_url:
        "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
    };
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then((response) => {
        expect(response.body.user).toMatchObject(user);
      });
  });

  test("Get: 404 responds with an appropriate status and error message when given a username that does not exist", () => {
    return request(app)
      .get("/api/users/butter_man")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("User not found");
      });
  });
});
