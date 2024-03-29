import validator from 'validator';

const validateArtworkInput = (
	title: string,
	description: string,
	imageUrls: string[]
): { validInput: boolean; messages: string[] } => {
	const validTitle = validator.default.isLength(title, { min: 2, max: 30 });
	const validDescription = validator.default.isLength(description, { min: 2, max: 300 });
	const validImageUrls = imageUrls.length > 0 && imageUrls.length <= 10;

	let validInput = true;
	let messages: string[] = [];

	if (!validTitle) {
		validInput = false;
		messages.push('Title must be between 2 to 30 characters');
	}

	if (!validDescription) {
		validInput = false;
		messages.push('Description must be 300 characters or less');
	}

	if (!validImageUrls) {
		validInput = false;
		messages.push('Please upload at least one image');
	}

	return {
		validInput,
		messages,
	};
};

export default validateArtworkInput;
