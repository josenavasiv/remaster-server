// Express and Apollo Server
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { Context } from './types.js';

// Prisma Client Instance -> Connects to PostreSQL Server
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

// Redis Client Instantiation -> Connects to Redis Server
import session from 'express-session';
import { Redis } from 'ioredis';
import RedisStore from 'connect-redis';
const redis = new Redis(parseInt(process.env.REDIS_PORT as string));

// Apollo Server Schema
import typeDefs from './graphql/schema.js';
import resolvers from './graphql/resolvers/index.js';
import { COOKIE_NAME, __prod__ } from './lib/constants.js';

// Web Socket
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { RedisPubSub } from 'graphql-redis-subscriptions';
export const pubsub = new RedisPubSub({
    publisher: new Redis(parseInt(process.env.REDIS_PORT as string)),
    subscriber: new Redis(parseInt(process.env.REDIS_PORT as string)),
});
import cookie from 'cookie';

// Server Object
let connection: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

// Storage Route
import storageRouter from './controllers/storage.js';

export const startServer = async () => {
    const app = express();
    const httpServer = http.createServer(app);
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });
    const serverCleanup = useServer(
        {
            schema,
            context: async (_ctx, _msg, _args) => {
                if (_ctx.extra.request.headers.cookie?.includes('qid')) {
                    const cookies = cookie.parse(_ctx.extra.request.headers.cookie);
                    const session = await redis.get(`sess:${cookies.qid.slice(2, 34)}`);
                    const sessionjson = await JSON.parse(session!);
                    return { userID: sessionjson.userID };
                }
                return { userID: null };
            },
        },
        wsServer
    );
    const apolloServer = new ApolloServer<Context>({
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
    });

    await apolloServer.start();

    // if (redis.status !== 'connecting') {
    // 	// Redis Connection
    // 	await redis.connect().catch((error) => console.log(error));
    // }

    app.set('trust proxy', true);

    const sessionCookieMiddlware = session({
        name: COOKIE_NAME,
        store: new RedisStore({ client: redis, disableTouch: true }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // Max Age of the Cookie in ms
            httpOnly: true, // Prevents accessing cooking via the browser
            secure: __prod__, // cookie only work in https (false in development|testing mode)
            sameSite: 'lax', // csrf
        },
        saveUninitialized: false, // Creates a session by default
        secret: process.env.REDIS_SECRET as string,
        resave: false,
    });

    const corsMiddlware = cors<cors.CorsRequest>({
        origin: 'http://localhost:3000',
        credentials: true,
    });

    // Middleware
    app.use(
        '/graphql',
        bodyParser.json(),
        bodyParser.urlencoded({ extended: false }),
        corsMiddlware,
        sessionCookieMiddlware,
        expressMiddleware(apolloServer, {
            // Providing the /graphql endpoint to express
            context: async ({ req, res }) => ({
                req,
                res,
                prisma,
                redis,
                pubsub,
            }),
        })
    );

    // Storage Route
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(corsMiddlware);
    app.use(sessionCookieMiddlware);
    app.use('/storage', storageRouter);

    connection = httpServer.listen({ port: process.env.PORT }, () => {
        console.log(`🚀 Server ready at http://localhost:4000/graphql`);
    });

    return {
        connection,
        httpServer,
        apolloServer,
        redis,
    };
};

export const stopServer = async () => {
    connection.close();
    await prisma.$disconnect();
    redis.disconnect();
};
