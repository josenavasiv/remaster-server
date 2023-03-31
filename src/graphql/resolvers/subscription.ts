import { withFilter } from 'graphql-subscriptions';
import { pubsub } from '../../server.js';

const Subscription = {
    newNotification: {
        subscribe: withFilter(
            (_, _variables, _context) => {
                return pubsub.asyncIterator('NEW_NOTIFICATION');
            },
            (payload, _variables, ctx) => {
                if (payload.newNotification.notifierId == ctx.userID || ctx.userID == null) return false;
                return true;
            }
        ),
    },
};

// {
// PAYLOAD -> req.session.userID === userId (TRUE -> MEANS LOGGED-IN USER RECIEVES NOTIFICATION)
// 	newNotification: {
// 	  id: 26,
// 	  notificationType: 'LIKED',
// 	  createdAt: 2023-03-30T23:55:40.118Z,
// 	  isRead: false,
// 	  userId: 1,
// 	  artworkId: 26,
// 	  commentId: null,
// 	  notifierId: 11,
// 	  notifierArtworkId: null,
// 	  notifierCommentId: null
// 	}
//   }
// VARIABLES
//   { userID: '1' }
// }
export default Subscription;
