import { startServer, stopServer } from '../../../server.js';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { TEST_URL } from '../../../lib/constants.js';

beforeAll(async () => {
	await startServer();
});

afterAll(async () => {
	await stopServer();
});

describe('Query Resolvers', () => {
	it('Hello query suceeeds', async () => {
		const helloQuery = {
			query: `query Query {
				hello
			  }`,
		};

		const response = await request(TEST_URL).post('/').send(helloQuery);
		expect(response.body.data.hello).toBe('Hello World');
	});
});
