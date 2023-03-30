import { Context } from 'src/types';
import { User, Notification, Comment, Artwork } from '@prisma/client';

const Notification = {
    artwork: async ({ artworkId }: Notification, _args: any, { prisma }: Context): Promise<Artwork | null> => {
        const notifiedOnArtwork = await prisma.artwork.findUnique({
            where: {
                id: artworkId ?? -1,
            },
        });
        return notifiedOnArtwork;
    },
    comment: async ({ commentId }: Notification, _args: any, { prisma }: Context): Promise<Comment | null> => {
        const notifiedOnArtwork = await prisma.comment.findUnique({
            where: {
                id: commentId ?? -1,
            },
        });
        return notifiedOnArtwork;
    },
    notifier: async ({ notifierId }: Notification, _args: any, { prisma }: Context): Promise<User> => {
        const notifier = await prisma.user.findUnique({
            where: {
                id: notifierId,
            },
        });

        return notifier!;
    },
    notifierArtwork: async ({ notifierArtworkId }: Notification, _args: any, { prisma }: Context): Promise<Artwork | null> => {
        const notifierArtwork = await prisma.artwork.findUnique({
            where: {
                id: notifierArtworkId ?? -1,
            },
        });

        return notifierArtwork;
    },
    notifierComment: async ({ notifierCommentId }: Notification, _args: any, { prisma }: Context): Promise<Comment | null> => {
        const notifierComment = await prisma.comment.findUnique({
            where: {
                id: notifierCommentId ?? -1,
            },
        });

        return notifierComment;
    },
};

export default Notification;
