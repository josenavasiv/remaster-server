import Query from './query.js';
import Mutation from './mutation/mutation.js';
import User from './user.js';
import Artwork from './artwork.js';
import Comment from './comment.js';
import Notification from './notification.js';
import Subscription from './subscription.js';

const resolvers = {
    Query,
    Mutation,
    Subscription,
    User,
    Artwork,
    Comment,
    Notification,
};

export default resolvers;
