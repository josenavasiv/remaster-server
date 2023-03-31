import { Context } from '../../../types.js';
import { Notification } from '@prisma/client';

interface NotificationMarkAsReadArgs {
    notificationID: string;
}

export interface NotificationPayloadType {
    notification: Notification | null;
    errors: {
        message: string;
    }[];
}

export const notification = {
    notificationMarkAsRead: async (
        _parent: any,
        { notificationID }: NotificationMarkAsReadArgs,
        { req, prisma }: Context
    ): Promise<NotificationPayloadType> => {
        // User is required to be logged-in
        if (!req.session.userID) {
            throw new Error('Not Authenticated');
        }

        try {
            const notification = await prisma.notification.findUnique({
                where: {
                    id: Number(notificationID),
                },
            });

            if (!notification) {
                return {
                    notification: null,
                    errors: [{ message: 'Notification does not exist' }],
                };
            }

			if (notification.userId !== req.session.userID) {
				return {
                    notification: null,
                    errors: [{ message: 'Unauthorized' }],
                };
			}

            await prisma.notification.update({
                where: {
                    id: Number(notificationID),
                },
                data: {
                    isRead: true,
                },
            });

            return {
                notification,
                errors: [],
            };
        } catch (error: any) {
            console.log(error);

            return {
                notification: null,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
};
