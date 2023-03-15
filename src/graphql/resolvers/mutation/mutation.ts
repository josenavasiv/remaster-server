import { user } from './user.js';
import { artwork } from './artwork.js';
import { comment } from './comment.js';
import { like } from './like.js';

const Mutation = {
    ...user,
    ...artwork,
    ...comment,
    ...like,
};

export default Mutation;
