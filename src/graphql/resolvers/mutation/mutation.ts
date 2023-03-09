import { user } from './user.js';
import { artwork } from './artwork.js';
import { comment } from './comment.js';

const Mutation = {
	...user,
	...artwork,
	...comment,
};

export default Mutation;
