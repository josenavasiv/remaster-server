import { Context } from '../../../types.js';
import { Like } from '@prisma/client';

interface LikeArtworkCreateArgs {
    artworkID: string;
}

interface LikeArtworkDeleteArgs extends LikeArtworkCreateArgs {
    likeID: string;
}

interface LikeCommentCreateArgs {
    commentID: string;
}

interface LikeCommentDeleteArgs extends LikeCommentCreateArgs {
    likeID: string;
}

enum LikeableType {
    ARTWORK = 'ARTWORK',
    COMMENT = 'COMMENT',
}

export interface LikePayloadType {
    like: Like | null;
    errors: {
        message: string;
    }[];
}

export const like = {
    likeArtworkCreate: async (
        _parent: any,
        { artworkID }: LikeArtworkCreateArgs,
        { req, prisma }: Context
    ): Promise<LikePayloadType> => {
        // User is required to be logged-in
        if (!req.session.userID) {
            throw new Error('Not Authenticated');
        }

        try {
            const liked = await prisma.like.findFirst({
                where: {
                    artworkId: Number(artworkID),
                    userId: req.session.userID,
                },
            });

            if (liked) {
                return {
                    like: null,
                    errors: [{ message: 'Already liked' }],
                };
            }

            const newLike = await prisma.like.create({
                data: {
                    artworkId: Number(artworkID),
                    userId: req.session.userID,
                    likeableType: LikeableType.ARTWORK,
                },
            });

            await prisma.artwork.update({
                where: {
                    id: Number(artworkID),
                },
                data: {
                    likesCount: {
                        increment: 1,
                    },
                },
            });

            return {
                like: newLike,
                errors: [],
            };
        } catch (error: any) {
            console.log(error);

            return {
                like: null,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    likeArtworkDelete: async (
        _parent: any,
        { likeID, artworkID }: LikeArtworkDeleteArgs,
        { req, prisma }: Context
    ): Promise<LikePayloadType> => {
        // User is required to be logged-in
        if (!req.session.userID) {
            throw new Error('Not Authenticated');
        }

        try {
            const removedLike = await prisma.like.delete({
                where: {
                    id: Number(likeID),
                },
            });

            await prisma.artwork.update({
                where: {
                    id: Number(artworkID),
                },
                data: {
                    likesCount: {
                        decrement: 1,
                    },
                },
            });

            return {
                like: removedLike,
                errors: [],
            };
        } catch (error: any) {
            console.log(error);

            return {
                like: null,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    likeCommentCreate: async (
        _parent: any,
        { commentID }: LikeCommentCreateArgs,
        { req, prisma }: Context
    ): Promise<LikePayloadType> => {
        // User is required to be logged-in
        if (!req.session.userID) {
            throw new Error('Not Authenticated');
        }

        try {
            const liked = await prisma.like.findFirst({
                where: {
                    commentId: Number(commentID),
                    userId: req.session.userID,
                },
            });

            if (liked) {
                return {
                    like: null,
                    errors: [{ message: 'Already liked' }],
                };
            }

            const newLike = await prisma.like.create({
                data: {
                    commentId: Number(commentID),
                    userId: req.session.userID,
                    likeableType: LikeableType.COMMENT,
                },
            });

            await prisma.comment.update({
                where: {
                    id: Number(commentID),
                },
                data: {
                    likesCount: {
                        increment: 1,
                    },
                },
            });

            return {
                like: newLike,
                errors: [],
            };
        } catch (error: any) {
            console.log(error);

            return {
                like: null,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    likeCommentDelete: async (
        _parent: any,
        { likeID, commentID }: LikeCommentDeleteArgs,
        { req, prisma }: Context
    ): Promise<LikePayloadType> => {
        // User is required to be logged-in
        if (!req.session.userID) {
            throw new Error('Not Authenticated');
        }

        try {
            const removedLike = await prisma.like.delete({
                where: {
                    id: Number(likeID),
                },
            });

            await prisma.comment.update({
                where: {
                    id: Number(commentID),
                },
                data: {
                    likesCount: {
                        decrement: 1,
                    },
                },
            });

            return {
                like: removedLike,
                errors: [],
            };
        } catch (error: any) {
            console.log(error);

            return {
                like: null,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
};