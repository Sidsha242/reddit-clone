import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { SqlEntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";

import { Request, Response } from "express";
import { SessionData } from "express-session";
import { Redis } from "ioredis";

export type MyContext = {
  req: Request & { session: Partial<SessionData> & { userId?: number } };
  redis: Redis;
  res: Response;
};
