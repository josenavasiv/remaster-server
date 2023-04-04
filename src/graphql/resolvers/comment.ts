import { Context } from 'src/types';
import { User, Comment, Like } from '@prisma/client';

const Comment = {
    commenter: async ({ commenterId }: Comment, _args: any, { dataSources }: Context): Promise<User> => {
        try {
            return dataSources.users.getUser(commenterId);
        } catch (error) {
            console.log(error);
            throw new Error('User does not exist');
        }
        // const uploader = await prisma.user.findUnique({
        //     where: {
        //         id: commenterId,
        //     },
        // });

        // return uploader!;
    },
    isLikedByLoggedInUser: async (
        { id, commenterId }: Comment,
        _args: any,
        { req, prisma }: Context
    ): Promise<Like | null> => {
        // If user is logged-in, return null -> Indicaates a non-logged-in user cannot like
        if (!req.session.userID || req.session.userID === commenterId) {
            return null;
        }

        const like = await prisma.like.findFirst({
            where: {
                userId: req.session.userID,
                commentId: id,
            },
        });

        return like;
    },
    parentComment: async ({ parentCommentId }: Comment, _args: any, { prisma }: Context): Promise<Comment> => {
        const parentComment = await prisma.comment.findUnique({
            where: {
                id: parentCommentId!,
            },
        });

        return parentComment!;
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
