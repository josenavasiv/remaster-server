import { Context } from 'src/types';
import { User, Artwork, Comment, Like } from '@prisma/client';

const Artwork = {
    // Eventually this will be paginated
    comments: async ({ id }: Artwork, _args: any, { prisma }: Context): Promise<Comment[]> => {
        const artwork = await prisma.artwork.findUnique({
            where: {
                id,
            },
            select: {
                comments: {
                    where: {
                        parentComment: {
                            is: null,
                        },
                    },
                    orderBy: [{ createdAt: 'desc' }],
                },
            },
        });

        if (!artwork?.comments) {
            return [];
        }

        return artwork.comments;
    },
    isLikedByLoggedInUser: async (
        { id, uploaderID }: Artwork,
        _args: any,
        { req, prisma }: Context
    ): Promise<Like | null> => {
        // If user is logged-in, return null -> Indicaates a non-logged-in user cannot like
        if (!req.session.userID || req.session.userID === uploaderID) {
            return null;
        }
        const like = await prisma.like.findFirst({
            where: {
                userId: req.session.userID,
                artworkId: id,
            },
        });

        return like;
    },
    recentComments: async ({ id }: Artwork, _args: any, { prisma }: Context): Promise<Comment[]> => {
        const artwork = await prisma.artwork.findUnique({
            where: {
                id,
            },
            select: {
                comments: {
                    where: {
                        parentComment: {
                            is: null,
                        },
                    },
                    take: 2,
                    orderBy: [{ createdAt: 'desc' }],
                },
            },
        });

        if (!artwork?.comments) {
            return [];
        }

        return artwork.comments;
    },
    // When the query requests an Artwork's uploader, their artworks will be populated by this resolver
    uploader: async ({ uploaderID }: Artwork, _args: any, { dataSources }: Context): Promise<User> => {
        try {
            return dataSources.users.getUser(uploaderID);
        } catch (error) {
            console.log(error);
            throw new Error('User does not exist');
        }
        // const uploader = await prisma.user.findUnique({
        //     where: {
        //         id: uploaderID,
        //     },
        // });

        // return uploader!;
    },
};

export default Artwork;
