import "reflect-metadata";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import { RedisStore } from "connect-redis";
import session from "express-session";
import Redis from "ioredis";
import cors from "cors";

import { DataSource } from "typeorm";

export const conn = new DataSource({
  type: "postgres",
  host: "localhost",
  username: "postgres",
  password: "durga23$",
  database: "lireddit2", //new db
  entities: [Post, User],
  synchronize: true, //no need for migrations
  logging: true,
});

const main = async () => {
  conn.initialize();
  console.log("Database connection established!");

  const app: Application = express(); // Create Express app

  // Initialize Redis client using ioredis
  const redis = new Redis();

  // Initialize store.
  const redisStore = new RedisStore({
    client: redis,
    disableTouch: true,
  });

  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:4000/graphql",
        "https://studio.apollographql.com",
      ],
      credentials: true,
    })
  );

  // Initialize session storage using Redis
  app.use(
    session({
      name: "qid",
      store: redisStore,
      secret: "fantasy",
      resave: false, // Do not force session save if unmodified
      saveUninitialized: false, // Only save session when data exists
      cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1-day expiration
    })
  );

  // Initialize Apollo Server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }), // Pass req and res to context
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  // Start the Express server
  app.listen(4000, () => {
    console.log("🚀 Server started on http://localhost:4000/graphql");
  });
};

// Run the main function
main().catch((err) => {
  console.error("Error starting the server:", err);
});
