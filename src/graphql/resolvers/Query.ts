import { Context } from 'src/types.js';
import { ArtworkPayloadType } from './mutation/artwork';

const Query = {
	hello: (_parent: any, _args: any, _context: Context) => {
		return 'Hello World';
	},
	artwork: async (
		_parent: any,
		{ artworkID }: { artworkID: string },
		{ prisma }: Context
	): Promise<ArtworkPayloadType> => {
		try {
			const artwork = await prisma.artwork.findUnique({
				where: {
					id: Number(artworkID),
				},
			});

			if (!artwork) {
				return {
					artwork: null,
					errors: [{ message: 'Artwork no longer exists' }],
				};
			}

			return {
				artwork,
				errors: [],
			};
		} catch (error) {
			return {
				artwork: null,
				errors: [{ message: 'Server Error' }],
			};
		}
	},
};

export default Query;
