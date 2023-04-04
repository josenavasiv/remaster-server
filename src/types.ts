import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { PrismaClient, Prisma } from '@prisma/client';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import UsersDataSource from './lib/datasources/UsersDataSource';
import CommentsDataSource from './lib/datasources/CommentsDataSource';

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
    pubsub: RedisPubSub;
    dataSources: {
        users: UsersDataSource;
        comments: CommentsDataSource;
    };
}

export interface Error {
    message: string;
}
