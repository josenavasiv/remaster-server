import { startServer } from './server.js';

const main = async () => {
	await startServer();
};

main()
	.then(() => {
		console.log('Server started successfully');
	})
	.catch((error) => {
		console.log(`An error has occurred during startup: ${error}`);
	});
