import { Context } from '../../../types.js';
import { Follow, NotificationType } from '@prisma/client';
import { pubsub } from '../../../server.js';

interface FollowCreateDeleteArgs {
    userID: string;
}

export interface FollowPayloadType {
    follow: Follow | null;
    errors: {
        message: string;
    }[];
}

export const follow = {
    followUserCreate: async (
        _parent: any,
        { userID }: FollowCreateDeleteArgs,
        { req, prisma }: Context
    ): Promise<FollowPayloadType> => {
        // User is required to be logged-in
        if (!req.session.userID) {
            throw new Error('Not Authenticated');
        }

        try {
            const followed = await prisma.follow.findFirst({
                where: {
                    followingId: Number(userID),
                    followerId: req.session.userID,
                },
            });

            if (followed) {
                return {
                    follow: null,
                    errors: [{ message: 'Already following user' }],
                };
            }

            const newFollow = await prisma.follow.create({
                data: {
                    followingId: Number(userID),
                    followerId: req.session.userID,
                },
            });

            // HERE CREATE A NEW NOTIFICATION FOR THE UPLOADER OF THE ARTWORK
            const newNotification = await prisma.notification.create({
                data: {
                    userId: Number(userID),
                    notificationType: NotificationType.FOLLOWED,
                    notifierId: req.session.userID,
                },
            });
            pubsub.publish('NEW_NOTIFICATION', { newNotification });

            return {
                follow: newFollow,
                errors: [],
            };
        } catch (error: any) {
            console.log(error);

            return {
                follow: null,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    followUserDelete: async (
        _parent: any,
        { userID }: FollowCreateDeleteArgs,
        { req, prisma }: Context
    ): Promise<FollowPayloadType> => {
        // User is required to be logged-in
        if (!req.session.userID) {
            throw new Error('Not Authenticated');
        }

        try {
            const followed = await prisma.follow.findFirst({
                where: {
                    followingId: Number(userID),
                    followerId: req.session.userID,
                },
            });

            if (!followed) {
                return {
                    follow: null,
                    errors: [{ message: 'Not following user' }],
                };
            }

            const unFollow = await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followingId: Number(userID),
                        followerId: req.session.userID,
                    },
                },
            });

			// WOULD NEED TO CREATE AN UNFOLLOWING
            // HERE CREATE A NEW NOTIFICATION FOR THE UPLOADER OF THE ARTWORK
            // const newNotification = await prisma.notification.create({
            //     data: {
            //         userId: Number(userID),
            //         notificationType: NotificationType.FOLLOWED,
            //         notifierId: req.session.userID,
            //     },
            // });
            // pubsub.publish('NEW_NOTIFICATION', { newNotification });

            return {
                follow: unFollow,
                errors: [],
            };
        } catch (error: any) {
            console.log(error);

            return {
                follow: null,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
};
