import { Context } from 'src/types.js';

const Query = {
	hello: (_parent: any, _args: any, _context: Context) => {
		return 'Hello World';
	},
};

export default Query;
