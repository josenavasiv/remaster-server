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
