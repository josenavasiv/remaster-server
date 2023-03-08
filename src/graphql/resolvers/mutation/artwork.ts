import { Context, Error } from '../../../types.js';
import { Artwork } from '@prisma/client';
import validateArtworkInput from '../../../utilities/validateArtworkInput.js';

interface ArtworkCreateArgs {
	title: string;
	description: string;
	imageUrls: string[];
}

interface ArtworkPayloadType {
	artwork: Artwork | null;
	errors: {
		message: string;
	}[];
}

export const artwork = {
	artworkCreate: async (
		_parent: any,
		{ title, description, imageUrls }: ArtworkCreateArgs,
		{ req, prisma }: Context
	): Promise<ArtworkPayloadType> => {
		// User is required to be logged-in
		if (!req.session.userID) {
			throw new Error('Not Authenticated');
		}

		// Artwork input validation
		let errors: Error[] = [];
		const { validInput, messages } = validateArtworkInput(title, description, imageUrls);

		if (!validInput) {
			for (const message of messages) {
				errors.push({ message });
			}
			return {
				artwork: null,
				errors,
			};
		}

		try {
			const artwork = await prisma.artwork.create({
				data: {
					uploaderID: req.session.userID,
					title,
					description,
					imageUrls,
					likesCount: 0,
				},
			});

			return {
				artwork,
				errors: [],
			};
		} catch (error: any) {
			console.log(error);

			return {
				artwork: null,
				errors: [{ message: 'Server Error' }],
			};
		}
	},
};
