<h1 align="center">
  PICADEX
</h1>

This is the backend for my full stack web app! This is a prototype for a social media platform. Currently hosted on a virtual machine on digital ocean. For database hosting, used docker to spin up PostgreSQL and Redis containers hosted within the same server.

## Currently Features

-   Authentication via a GraphQL API and Express Sessions
-   React components typed with TypeScript
-   Users can create, delete and update artworks (images and gifs)
-   Users can create, delete and update comments and reply to other comments
-   Users can follow each other
-   Users can view other user profiles
-   Responsive design

## TODO

-   Need to add image compression when images are stored
-   More tests

## Built With

-   [Express.js](https://expressjs.com/)
-   [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
-   [TypeScript](https://www.typescriptlang.org)
-   [Express Session](https://www.npmjs.com/package/express-session)
-   [Prisma](https://www.prisma.io/)
-   [PostgreSQL](https://www.postgresql.org/)
-   [Redis](https://redis.io/)
-   [Docker](https://www.docker.com/)
-   [ioredis](https://www.npmjs.com/package/ioredis)

## Live

[PICADEX](https://remaster-client.vercel.app/) is currently live here!
