import { Context } from 'src/types';
import { User, Artwork, Like } from '@prisma/client';

const User = {
    // Eventually this will be paginated
    // When the query requests a User's artworks, their artworks will be populated by this
    artworks: async ({ id }: User, _args: any, { prisma }: Context): Promise<Artwork[]> => {
        const artworks = await prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                artworks: {
                    orderBy: [{ createdAt: 'desc' }],
                },
            },
        });

        if (!artworks?.artworks) {
            return [];
        }

        return artworks.artworks;
    },
    isFollowedByLoggedInUser: async ({ id }: User, _args: any, { req, prisma }: Context): Promise<Boolean | null> => {
        // If user is logged-in, return null -> Indicaates a non-logged-in user cannot like
        if (!req.session.userID || req.session.userID === id) {
            return null;
        }

        const isFollowed = await prisma.follow.findFirst({
            where: {
                followerId: req.session.userID,
                followingId: id,
            },
        });

        if (!isFollowed) {
            return false;
        }

        return true;
    },
    likes: async ({ id }: User, _args: any, { prisma }: Context): Promise<Like[]> => {
        const likes = await prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                likes: {
                    orderBy: [{ createdAt: 'desc' }],
                },
            },
        });

        if (!likes?.likes) {
            return [];
        }

        return likes.likes;
    },
    // Fetch the artworks that the user likes
    likedArtworks: async ({ id }: User, _args: any, { prisma }: Context): Promise<Artwork[]> => {
        const likedArtworks = await prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                likes: {
                    include: {
                        artwork: true,
                    },
                    where: {
                        likeableType: 'ARTWORK',
                    },
                    orderBy: [{ createdAt: 'desc' }],
                },
            },
        });

        if (!likedArtworks?.likes) {
            return [];
        }

        const extractedArtworks: Artwork[] = [];
        for (const obj of likedArtworks.likes) {
            extractedArtworks.push(obj.artwork!);
        }

        return extractedArtworks;
    },
};

export default User;
