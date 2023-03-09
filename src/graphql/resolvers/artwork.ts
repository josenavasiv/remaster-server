import { Context } from 'src/types';
import { User, Artwork, Comment } from '@prisma/client';

const Artwork = {
	// Eventually this will be paginated
	comments: async ({ id }: Artwork, _args: any, { prisma }: Context): Promise<Comment[]> => {
		const artwork = await prisma.artwork.findUnique({
			where: {
				id,
			},
			select: {
				comments: true,
			},
		});

		if (!artwork?.comments) {
			return [];
		}

		return artwork.comments;
	},
	isLikedByLoggedInUser: async ({ id }: Artwork, _args: any, { req, prisma }: Context): Promise<Boolean | null> => {
		// If user is logged-in, return null -> Indicaates a non-logged-in user cannot like
		if (!req.session.userID) {
			return null;
		}

		const isLiked = await prisma.like.findFirst({
			where: {
				userId: req.session.userID,
				artworkId: id,
			},
		});

		if (!isLiked) {
			return false;
		}

		return true;
	},
	// When the query requests an Artwork's uploader, their artworks will be populated by this resolver
	uploader: async ({ uploaderID }: Artwork, _args: any, { prisma }: Context): Promise<User> => {
		const uploader = await prisma.user.findUnique({
			where: {
				id: uploaderID,
			},
		});

		return uploader!;
	},
};

export default Artwork;