import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { __prod__ } from "./constants";
import { User } from "./entities/User";
export default {
  migrations: {
    path: `${__dirname}/migrations`,
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [User],
  dbName: "social-media",
  password: "password",
  user: "postgres",
  type: "postgresql",
  debug: !__prod__,
} as Options<PostgreSqlDriver>;
