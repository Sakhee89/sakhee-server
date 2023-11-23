# **Sakhee News API**

The link to the hosted project: https://sakhee-news.onrender.com/

## Summary

This is a news site that has a variety of articles. It can accept comments from users as well as giving votes for articles and the articles can also be filtered by topic.

## Setup

To clone the repo use git clone https://github.com/Sakhee89/sakhee-server
Next install the below dependencies and devDependencies:

"devDependencies": {
"husky": "^8.0.2",
"jest": "^27.5.1",
"jest-extended": "^2.0.0",
"jest-sorted": "^1.0.14",
"supertest": "^6.3.3"
},
"dependencies": {
"dotenv": "^16.0.0",
"express": "^4.18.2",
"pg": "^8.7.3",
"pg-format": "^1.0.4"
},
Next seed the database by npm run seed
To run test, use npm run test

## Environment variables

In order to connect to the database you need two files on the root level, one called called .env.test, and the other .env.development.
In each file add PGDATABASE=sakhee_own_database_test for test and PGDATABASE=sakhee_own_database for development

## Versions

This API is supported with Node 9.8.0
