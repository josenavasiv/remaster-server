import { Context } from '../../../types.js';
import { Like, NotificationType } from '@prisma/client';
import { pubsub } from '../../../server.js';

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

            const updatedArtwork = await prisma.artwork.update({
                where: {
                    id: Number(artworkID),
                },
                data: {
                    likesCount: {
                        increment: 1,
                    },
                },
            });

            if (updatedArtwork.uploaderID !== req.session.userID) {
                // HERE CREATE A NEW NOTIFICATION FOR THE UPLOADER OF THE ARTWORK
                const newNotification = await prisma.notification.create({
                    data: {
                        userId: updatedArtwork.uploaderID,
                        notificationType: NotificationType.LIKED,
                        notifierId: req.session.userID,
                        artworkId: updatedArtwork.id,
                    },
                });
                pubsub.publish('NEW_NOTIFICATION', { newNotification });
            }

            // HERE WOULD PUBLISH THE NOTIFICATION AND SEND THE CREATED NOTIFICATION

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

            const likedComment = await prisma.comment.update({
                where: {
                    id: Number(commentID),
                },
                data: {
                    likesCount: {
                        increment: 1,
                    },
                },
            });

            if (likedComment.commenterId !== req.session.userID) {
                // HERE CREATE A NEW NOTIFICATION FOR THE UPLOADER OF THE COMMENT
                const newNotification = await prisma.notification.create({
                    data: {
                        userId: likedComment.commenterId,
                        notificationType: NotificationType.LIKED,
                        notifierId: req.session.userID,
                        commentId: likedComment.id,
                    },
                });
                pubsub.publish('NEW_NOTIFICATION', { newNotification });
            }

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
