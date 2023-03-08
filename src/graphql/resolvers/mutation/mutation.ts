import { user } from './user.js';
import { artwork } from './artwork.js';

const Mutation = {
	...user,
	...artwork,
};

export default Mutation;
