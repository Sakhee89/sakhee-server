# **Sakhee News API**

The link to the hosted project: https://sakhee-news.onrender.com/

## Summary

This is a news site was developed using node.js nad postgres. It has a variety of articles that can accept comments from users as well as give votes to articles, and the articles can also be filtered by topic.

## Setup

To clone the repo use git clone https://github.com/Sakhee89/sakhee-server
Next install the below dependencies and devDependencies by using the command npm install

Next seed the database by npm run seed
To run the test, use npm run test

## Environment variables

In order to connect to the database you need two files on the root level, one called called .env.test, and the other .env.development.
In each file add PGDATABASE=<your_database_test> to .env.test and PGDATABASE=<your_database> to .env.development

## Versions

This API is supported with Node version 9.8.0 and Postgres version 8.7.3
