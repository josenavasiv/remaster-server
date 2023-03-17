import { Context } from 'src/types.js';
import { Artwork } from '@prisma/client';
import { ArtworkPayloadType } from './mutation/artwork';
import { UserPayloadType } from './mutation/user';

interface UserArgs {
    username: string;
}

interface UserFeedArgs {
    limit?: number;
    cursor?: number;
}

interface PaginatedArtworksPayloadType {
    artworks: Artwork[];
    hasMore: boolean;
    errors: {
        message: string;
    }[];
}

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
    user: async (_parent: any, { username }: UserArgs, { prisma }: Context): Promise<UserPayloadType> => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    username: username,
                },
            });

            if (!user) {
                return {
                    user: null,
                    errors: [{ message: 'User no longer exists' }],
                };
            }

            return {
                user,
                errors: [],
            };
        } catch (error) {
            return {
                user: null,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    userFeed: async (
        _parent: any,
        { limit, cursor }: UserFeedArgs,
        { req, prisma }: Context
    ): Promise<PaginatedArtworksPayloadType> => {
        if (!req.session.userID) {
            // return 10 latest posts
        }

        try {
            const artworks = await prisma.artwork.findMany({
                take: limit ?? 10,
                ...(cursor && {
                    cursor: {
                        id: cursor,
                    },
                    skip: 1,
                }),
                orderBy: [{ createdAt: 'desc' }],
            });

            return {
                artworks,
                hasMore: artworks.length === (limit ?? 10),
                errors: [],
            };
        } catch (error) {
            return {
                artworks: [],
                hasMore: false,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    userLoggedIn: async (_parent: any, _args: any, { req, prisma }: Context): Promise<UserPayloadType> => {
        if (!req.session.userID) {
            return {
                user: null,
                errors: [],
            };
        }

        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: req.session.userID,
                },
            });

            if (!user) {
                return {
                    user: null,
                    errors: [{ message: 'User no longer exists' }],
                };
            }

            return {
                user,
                errors: [],
            };
        } catch (error) {
            return {
                user: null,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
};

export default Query;
