import validator from 'validator';

const validateUserInput = (
    username: string,
    email: string,
    password: string
): { validInput: boolean; messages: string[] } => {
    const validUsername = validator.default.isLength(username, { min: 3, max: 20 });
    const validEmail = validator.default.isEmail(email);
    const validPassword = validator.default.isLength(password, { min: 5, max: 20 });

    let validInput = true;
    let messages: string[] = [];

    if (!validUsername) {
        validInput = false;
        messages.push('Invalid username');
    }

    if (!validEmail) {
        validInput = false;
        messages.push('Invalid email');
    }

    if (!validPassword) {
        validInput = false;
        messages.push('Invalid password');
    }

    return {
        validInput,
        messages,
    };
};

export default validateUserInput;
