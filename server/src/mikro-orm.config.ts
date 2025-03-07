import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Options } from "@mikro-orm/postgresql";
import { Post } from "./entities/Post";
import path from "path";
import { Migrator } from "@mikro-orm/migrations";
import { User } from "./entities/User";
import { __prod__ } from "./constants";

const config: Options = {
  migrations: {
    path: path.join(__dirname, "./migrations"), //path function will create absolute path
  },
  entities: [Post, User], //Database tables
  dbName: "lireddit",
  password: "durga23$",
  driver: PostgreSqlDriver,
  extensions: [Migrator],
  allowGlobalContext: true,
  //debug : !__prod__,
};

export default config;
