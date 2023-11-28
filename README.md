# **Sakhee News API**

The link to the [Deployed project](https://sakhee-news.onrender.com/)

## Summary

This API project was developed using node.js and postgres. It has a similar functuality of a read world backend service (such as Reddit) that provides information to the front end architecture.

## Installation & Setup

To clone the repo use git clone [GitHub Link](https://github.com/Sakhee89/sakhee-server) to clone the project.

Next, install the dependencies and devDependencies by using the command npm install

Setup the database by running the command npm run seed

To run test, use npm run test

## Environment variables

To begin, create three environment variable files at the root level, and replace the default with your own database.

First environment variable: .env.test, in this file add the line PGDATABASE=<your_database_test>

Second environment variable: .env.development, in this file add the line PGDATABASE=<your_database>

Third environment variable: .env.production, in this file add the line DATABASE_URL=<Your_hosted_URL_database>

## Versions

This API is supported with Node v20.5.0 and Postgres v8.7.3
