import { Context, Error } from 'src/types.js';
import { User } from '@prisma/client';
import { COOKIE_NAME, TEMPORARY_AVATAR_URL } from '../../../lib/constants.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';

interface UserPayloadType {
	user: User | null;
	errors: {
		message: string;
	}[];
}

interface UserLoginArgs {
	username: string;
	password: string;
}

interface UserRegisterArgs extends UserLoginArgs {
	email: string;
}

const validateUserInput = (
	username: string,
	email: string,
	password: string
): { validInput: boolean; messages: string[] } => {
	const validUsername = validator.default.isLength(username, { min: 3, max: 20 });
	const validEmail = validator.default.isEmail(email);
	const validPassword = validator.default.isLength(password, { min: 5, max: 20 });

	let validInput = true;
	let messages: string[] = [];

	if (!validUsername) {
		validInput = false;
		messages.push('Invalid username');
	}

	if (!validEmail) {
		validInput = false;
		messages.push('Invalid email');
	}

	if (!validPassword) {
		validInput = false;
		messages.push('Invalid password');
	}

	return {
		validInput,
		messages,
	};
};

export const user = {
	userRegister: async (
		_parent: any,
		{ username, email, password }: UserRegisterArgs,
		{ req, prisma }: Context
	): Promise<UserPayloadType> => {
		let errors: Error[] = [];
		const { validInput, messages } = validateUserInput(username, email, password);

		if (!validInput) {
			console.log('INVALID USER INPUT');
			for (const message in messages) {
				errors.push({ message });
			}
			return {
				user: null,
				errors,
			};
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		try {
			const user = await prisma.user.create({
				data: {
					username,
					password: hashedPassword,
					email,
					avatarUrl: TEMPORARY_AVATAR_URL,
				},
			});

			// Store session in request object
			req.session.userID = user.id;

			return {
				user,
				errors: [],
			};
		} catch (error: any) {
			if (error.meta.target.includes('username')) {
				return {
					errors: [{ message: 'Username unavailable' }],
					user: null,
				};
			} else if (error.meta.target.includes('email')) {
				return {
					errors: [{ message: 'Email unavailable' }],
					user: null,
				};
			}

			console.log(error);

			return {
				errors: [{ message: 'Server error' }],
				user: null,
			};
		}
	},
	userLogin: async (
		_parent: any,
		{ username, password }: UserRegisterArgs,
		{ req, prisma }: Context
	): Promise<UserPayloadType> => {
		const user = await prisma.user.findUnique({
			where: {
				username,
			},
		});

		if (!user) {
			return {
				user: null,
				errors: [{ message: 'Invalid username and/or password' }],
			};
		}

		const isCorrectPassword = await bcrypt.compare(password, user.password);

		if (!isCorrectPassword) {
			return {
				user: null,
				errors: [{ message: 'Invalid username and/or password' }],
			};
		}

		// Set session data
		req.session.userID = user.id;

		return {
			user,
			errors: [],
		};
	},
	userLogout: async (_parent: any, _args: any, { res, req }: Context): Promise<Boolean> => {
		// Destroy session by removing the session object and clearing the session cookie from the response object
		return new Promise((resolve) => {
			req.session.destroy((error) => {
				res.clearCookie(COOKIE_NAME);
				if (error) {
					console.log(error);
					resolve(true);
					return;
				}
				resolve(false);
			});
		});
	},
};
