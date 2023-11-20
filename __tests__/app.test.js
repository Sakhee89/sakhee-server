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