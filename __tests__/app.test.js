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