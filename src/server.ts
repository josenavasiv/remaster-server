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

// Apollo Server Schema
import typeDefs from './graphql/schema.js';
import resolvers from './graphql/resolvers/index.js';

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

	// Redis Connection

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
		expressMiddleware(apolloServer, {
			// Providing the /graphql endpoint to express
			context: async ({ req, res }) => ({
				req,
				res,
			}),
		})
	);

	connection = httpServer.listen({ port: 4000 }, () => {
		console.log(`🚀 Server ready at http://localhost:4000/graphql`);
	});

	return {
		connection,
		httpServer,
		apolloServer,
	};
};

export const stopServer = async () => {
	connection.close();
	await prisma.$disconnect();
};
