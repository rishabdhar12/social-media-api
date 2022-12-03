import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { MyContext } from "./types";
import { UserResolver } from "./resolvers/User";
import { DataSource } from "typeorm";
import { User } from "./entities/User";

import connectRedis from "connect-redis";
import session from "express-session";
import Redis from "ioredis";
import { __prod__ } from "./constants";

const main = async () => {
  const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "password",
    database: "social-media",
    synchronize: true,
    logging: true,
    entities: [User],
  });

  AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization", err);
    });

  const app = express();

  // redis
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redis,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "none", // csrf
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "lsDjf&&*)dsOgh85_(&",
      resave: false,
    })
  );

  // type graphql schema
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
    }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: [
        "http://localhost:5000/graphql",
        "https://studio.apollographql.com",
      ],
      credentials: true,
    },
    path: "/graphql",
  });

  app.listen(5000, () => {
    console.log("Server is running on port 5000");
  });
};

main();
