import { startServer } from './server.js';

const main = async () => {
	await startServer();
};

main().catch((error) => {
	console.log(`An error has occurred during startup: ${error}`);
});
