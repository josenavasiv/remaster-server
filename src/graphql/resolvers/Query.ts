import { Context } from 'src/types.js';
import { ArtworkPayloadType } from './mutation/artwork';
import { UserPayloadType } from './mutation/user';

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
