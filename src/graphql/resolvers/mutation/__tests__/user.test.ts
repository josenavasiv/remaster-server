import { startServer, stopServer } from '../../../../server.js';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { TEST_URL } from '../../../../lib/constants.js';

const testUser = 'tester';
const testPassword = 'tester';
const testEmail = 'tester@test.com';

beforeAll(async () => {
	await startServer();
});

afterAll(async () => {
	await stopServer();
});

describe('User Mutation Resolvers', () => {
	it('userRegister mutation resolver succeeds', async () => {
		const userRegisterMutation = {
			query: `mutation Mutation($username: String!, $email: String!, $password: String!) {
					userRegister(username: $username, email: $email, password: $password) {
					  user {
						username
						email
					  }
					  errors {
						message
					  }
					}
				  }
				  `,
			variables: { username: testUser, password: testPassword, email: testEmail },
		};
		const response = await request(TEST_URL).post('/').send(userRegisterMutation);
		console.log(response.headers['set-cookie']);
		expect(response.body.data.userRegister.errors.length).toBe(0);
	});
	it('userLogin mutation resolver succeeds', async () => {
		const userLoginMutation = {
			query: `mutation UserLogin($username: String!, $password: String!) {
				userLogin(username: $username, password: $password) {
				  user {
					username
					email
				  }
				  errors {
					message
				  }
				}
			  }`,
			variables: { username: testUser, password: testPassword },
		};
		const response = await request(TEST_URL).post('/').send(userLoginMutation);
		expect(response.body.data.userLogin.errors.length).toBe(0);
	});
	it('userLogout mutation resolver succeeds', async () => {
		const userLoginMutation = {
			query: `mutation UserLogin($username: String!, $password: String!) {
				userLogin(username: $username, password: $password) {
				  user {
					username
					email
				  }
				  errors {
					message
				  }
				}
			  }`,
			variables: { username: testUser, password: testPassword },
		};
		const userLogoutMutation = {
			query: `mutation UserLogin {
				userLogout
			  }`,
		};

		const response = await request(TEST_URL).post('/').send(userLoginMutation);
		const res = await request(TEST_URL)
			.post('/')
			.send(userLogoutMutation)
			.set('Cookie', response.headers['set-cookie']);
		expect(res.body.data.userLogout).toBe(true);
	});
});
