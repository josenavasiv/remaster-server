import { Context } from '../../types.js';
import { User, Notification, Comment, Artwork } from '@prisma/client';
import { prisma } from '../../server.js';

// For now we provide the prisma object via an import

const Notification = {
    artwork: async ({ artworkId }: Notification, _args: any, _context: any): Promise<Artwork | null> => {
        try {
			if (!artworkId) return null;
            const notifiedOnArtwork = await prisma.artwork.findUnique({
                where: {
                    id: artworkId,
                },
            });
            return notifiedOnArtwork;
        } catch (error) {
            console.log(error);
            return null;
        }
    },
    comment: async ({ commentId }: Notification, _args: any, _context: any): Promise<Comment | null> => {
        try {
			if (!commentId) return null;
            const notifiedOnComment = await prisma.comment.findUnique({
                where: {
                    id: commentId,
                },
            });
            return notifiedOnComment;
        } catch (error) {
            console.log(error);
            return null;
        }
    },
    notifier: async ({ notifierId }: Notification, _args: any, _context: any): Promise<User> => {
        const notifier = await prisma.user.findUnique({
            where: {
                id: notifierId,
            },
        });

        return notifier!;
    },
    notifierArtwork: async (
        { notifierArtworkId }: Notification,
        _args: any,
        { prisma }: Context
    ): Promise<Artwork | null> => {
        try {
			if (!notifierArtworkId) return null;
            const notifierArtwork = await prisma.artwork.findUnique({
                where: {
                    id: notifierArtworkId,
                },
            });
            return notifierArtwork;
        } catch (error) {
            return null;
        }
    },
    notifierComment: async (
        { notifierCommentId }: Notification,
        _args: any,
        _context: any
    ): Promise<Comment | null> => {
        try {
			if (!notifierCommentId) return null;
            const notifierComment = await prisma.comment.findUnique({
                where: {
                    id: notifierCommentId,
                },
            });
            return notifierComment;
        } catch (error) {
            return null;
        }
    },
};

export default Notification;
