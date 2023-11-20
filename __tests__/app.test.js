const request = require("supertest");
const db = require("../db/connection.js")
const seed = require("../db/seeds/seed.js")
const testData = require("../db/data/test-data/index.js")
const app = require("../app.js")

afterAll(() => {
    return db.end();
})

beforeEach(() => {
    return seed(testData)
})

describe("/api", () => {
    test("Get: 200 sends an object of all available endpoints", () => {
        return request(app)
        .get("/api")
        .expect(200)
        .then((response) => {
            expect(response.body["GET /api"]).toEqual({"description": "serves up a json representation of all the available endpoints of the api"})
            expect(response.body["GET /api/topics"]).toEqual({
                "description": "serves an array of all topics",
                "queries": [],
                "exampleResponse": {
                  "topics": [{ "slug": "football", "description": "Footie!" }]
                }
              })
        })
    })
})

describe("/api/topics", () => {
    test("Get: 200 sends an array of topics to the client", () => {
        return request(app)
        .get("/api/topics")
        .expect(200)
        .then((response) => {
            expect(response.body.topics.length).toBe(3);
            response.body.topics.forEach((topic) => {
                expect(typeof topic.slug).toBe('string')
                expect(typeof topic.description).toBe('string')
            })
        })
    })
})

describe("/api/articles/:article_id", () => {
    test("Get: 200 sends an object with the correct properties", () => {
        return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then((response) => {
            expect(response.body.article).toMatchObject({
                article_id: 1,
                title: "Living in the shadow of a great man",
                topic: "mitch",
                author: "butter_bridge",
                body: "I find this existence challenging",
                created_at: "2020-07-09T20:11:00.000Z",
                votes: 100,
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              })
        })
    })

    test("Get: 200 sends an object with the correct properties", () => {
        return request(app)
        .get("/api/articles/3")
        .expect(200)
        .then((response) => {
            expect(response.body.article).toMatchObject({
                article_id: 3,
                title: "Eight pug gifs that remind me of mitch",
                topic: "mitch",
                author: "icellusedkars",
                body: "some gifs",
                created_at: "2020-11-03T09:12:00.000Z",
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              })
        })
    })

    test("Get: 404 sends an appropriate status and error message when given a valid but non-existent id", () => {
        return request(app)
        .get("/api/articles/888")
        .expect(404)
        .then((response) => {
            expect(response.body.msg).toBe("article does not exist")
        })
    })

    test("Get: 400 sends an appropriate status and error message when given an invalid id", () => {
        return request(app)
        .get("/api/articles/not-an-article")
        .expect(400)
        .then((response) => {
            expect(response.body.msg).toBe("Bad request")
        })
    })
})