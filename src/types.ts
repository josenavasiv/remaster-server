import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { PrismaClient, Prisma } from '@prisma/client';

// req.session type
declare module 'express-session' {
	interface SessionData {
		userID: number;
	}
}

export interface Context {
	req: Request;
	res: Response;
	prisma: PrismaClient<
		Prisma.PrismaClientOptions,
		never,
		Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
	>;
	redis: Redis;
}

export interface Error {
	message: string;
}
