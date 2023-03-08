// Express and Apollo Server
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { Context } from 'src/types.js';

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

// Server Object
let connection: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

export const startServer = async () => {
	const app = express();
	const httpServer = http.createServer(app);
	const apolloServer = new ApolloServer<Context>({
		typeDefs,
		resolvers,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});
	await apolloServer.start();

	// if (redis.status !== 'connecting') {
	// 	// Redis Connection
	// 	await redis.connect().catch((error) => console.log(error));
	// }

	app.set('trust proxy', true);

	// Middleware
	app.use(
		'/graphql',
		bodyParser.json(),
		bodyParser.urlencoded({ extended: false }),
		cors<cors.CorsRequest>({
			origin: 'http://localhost:3000',
			credentials: true,
		}),
		session({
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
		}),
		expressMiddleware(apolloServer, {
			// Providing the /graphql endpoint to express
			context: async ({ req, res }) => ({
				req,
				res,
				prisma,
				redis,
			}),
		})
	);

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
