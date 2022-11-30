// import { MikroORM } from "@mikro-orm/core";
// import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
// import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { MyContext } from "./types";
import { UserResolver } from "./resolvers/User";
import { DataSource } from "typeorm";
import { User } from "./entities/User";

// TODO: work with redis tomorrow alreay installed.
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

  // const orm = await MikroORM.init<PostgreSqlDriver>(mikroOrmConfig);

  // await orm.getMigrator().up();

  //   const user = orm.em.fork().create(User, { name: "rishab" });
  //   await orm.em.fork().persistAndFlush(user);

  const app = express();

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
