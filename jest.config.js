/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	rootDir: './src',
	verbose: true,
	forceExit: true,
	moduleFileExtensions: ['ts', 'js', 'json'],
	moduleDirectories: ['node_modules', 'src'],
	moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
	maxWorkers: 1, // runs each test 1-by-1
	// globalSetup: './config/globalSetup.ts', Fails when import modules
};
