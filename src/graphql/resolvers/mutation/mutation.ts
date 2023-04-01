import { user } from './user.js';
import { artwork } from './artwork.js';
import { comment } from './comment.js';
import { like } from './like.js';
import { notification } from './notification.js';
import { follow } from './follow.js';

const Mutation = {
    ...user,
    ...artwork,
    ...comment,
    ...like,
    ...notification,
    ...follow,
};

export default Mutation;
