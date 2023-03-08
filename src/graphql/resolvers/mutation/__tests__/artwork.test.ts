import { startServer, stopServer } from '../../../../server.js';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { TEST_URL } from '../../../../lib/constants.js';

beforeAll(async () => {
	await startServer();
});

afterAll(async () => {
	await stopServer();
});

describe('Artwork Mutation Resolvers', () => {
	it('artworkCreate mutation resolver succeeds', async () => {
		const artworkCreateMutation = {
			query: `mutation ArtworkCreate($title: String!, $description: String!, $imageUrls: [String!]!) {
				artworkCreate(title: $title, description: $description, imageUrls: $imageUrls) {
				  artwork {
					title
					description
					imageUrls
				  }
				  errors {
					message
				  }
				}
			  }`,
			variables: {
				title: 'Test Title',
				description: 'Test Description',
				imageUrls: ['IMAGE_URL_1', 'IMAGE_URL_2'],
			},
		};

		const response = await request(TEST_URL).post('/').send(artworkCreateMutation);
		expect(response.body.errors.length).toBeGreaterThan(0);
	});
});
