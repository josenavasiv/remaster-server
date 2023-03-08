import validator from 'validator';

const validateArtworkInput = (
	title: string,
	description: string,
	imageUrls: string[]
): { validInput: boolean; messages: string[] } => {
	const validTitle = validator.isLength(title, { min: 2, max: 20 });
	const validDescription = validator.isLength(description, { max: 300 });
	const validImageUrls = imageUrls.length > 0 && imageUrls.length <= 10;

	let validInput = true;
	let messages: string[] = [];

	if (!validTitle) {
		validInput = false;
		messages.push('Title must be between 2 to 20 characters');
	}

	if (!validDescription) {
		validInput = false;
		messages.push('Description must be  300 characters or less');
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
