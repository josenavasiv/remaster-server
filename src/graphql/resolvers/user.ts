import { Context } from 'src/types';
import { User, Artwork } from '@prisma/client';

const User = {
	// Eventually this will be paginated
	// When the query requests a User's artworks, their artworks will be populated by this
	artworks: async ({ id }: User, _args: any, { prisma }: Context): Promise<Artwork[]> => {
		const artworks = await prisma.user.findUnique({
			where: {
				id,
			},
			select: {
				artworks: true,
			},
		});

		if (!artworks?.artworks) {
			return [];
		}

		return artworks.artworks;
	},
};

export default User;
