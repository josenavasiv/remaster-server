import { Context } from 'src/types';
import { User, Comment } from '@prisma/client';

const Comment = {
    commenter: async ({ commenterId }: Comment, _args: any, { prisma }: Context): Promise<User> => {
        const uploader = await prisma.user.findUnique({
            where: {
                id: commenterId,
            },
        });

        return uploader!;
    },
    isLikedByLoggedInUser: async (
        { id, commenterId }: Comment,
        _args: any,
        { req, prisma }: Context
    ): Promise<Boolean | null> => {
        // If user is logged-in, return null -> Indicaates a non-logged-in user cannot like
        if (!req.session.userID || req.session.userID === commenterId) {
            return null;
        }

        const isLiked = await prisma.like.findFirst({
            where: {
                userId: req.session.userID,
                commentId: id,
            },
        });

        if (!isLiked) {
            return false;
        }

        return true;
    },
    replies: async ({ id }: Comment, _args: any, { prisma }: Context): Promise<Comment[]> => {
        // Eventually will be paginated
        const comment = await prisma.comment.findUnique({
            where: {
                id,
            },
            select: {
                replies: {
                    orderBy: [{ createdAt: 'desc' }],
                },
            },
        });

        if (!comment?.replies) {
            return [];
        }

        return comment.replies;
    },
};

export default Comment;
