import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { PrismaClient, Prisma } from '@prisma/client';

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
