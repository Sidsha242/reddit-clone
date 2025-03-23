import { Request, Response } from "express";
import { SessionData } from "express-session";
import { Redis } from "ioredis";

export type MyContext = {
  req: Request & { session: Partial<SessionData> & { userId?: number } };
  redis: Redis;
  res: Response;
};
