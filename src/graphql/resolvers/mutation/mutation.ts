import { user } from './user.js';
import { artwork } from './artwork.js';
import { comment } from './comment.js';
import { like } from './like.js';
import { notification } from './notification.js';

const Mutation = {
    ...user,
    ...artwork,
    ...comment,
    ...like,
    ...notification,
};

export default Mutation;
