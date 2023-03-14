import { Context } from '../../../types.js';
import { Comment } from '@prisma/client';
import validator from 'validator';

interface CommentCreateArgs {
	artworkID: string;
	comment: string;
}

interface CommentReplyArgs extends CommentCreateArgs {
	parentCommentID: string;
}

export interface CommentPayloadType {
	comment: Comment | null;
	errors: {
		message: string;
	}[];
}

export const comment = {
	commentCreate: async (
		_parent: any,
		{ artworkID, comment }: CommentCreateArgs,
		{ req, prisma }: Context
	): Promise<CommentPayloadType> => {
		// User is required to be logged-in
		if (!req.session.userID) {
			throw new Error('Not Authenticated');
		}

		const validComment = validator.isLength(comment, { min: 1, max: 100 });

		if (!validComment) {
			return {
				comment: null,
				errors: [{ message: 'Comment must be between 1 and 100 characters' }],
			};
		}

		try {
			const createdComment = await prisma.comment.create({
				data: {
					commenterId: req.session.userID,
					comment,
					artworkId: Number(artworkID),
					likesCount: 0,
				},
			});

			return {
				comment: createdComment,
				errors: [],
			};
		} catch (error: any) {
			console.log(error);

			return {
				comment: null,
				errors: [{ message: 'Server Error' }],
			};
		}
	},
	commentUpdate: async (
		_parent: any,
		{ commentID, comment }: { commentID: string; comment: string },
		{ req, prisma }: Context
	): Promise<CommentPayloadType> => {
		// User is required to be logged-in
		if (!req.session.userID) {
			throw new Error('Not Authenticated');
		}

		try {
			const commentExists = await prisma.comment.findUnique({
				where: {
					id: Number(commentID),
				},
			});

			if (!commentExists) {
				return {
					comment: null,
					errors: [{ message: 'Comment does not exist' }],
				};
			}

			if (req.session.userID !== commentExists.commenterId) {
				throw new Error('Unauthorized');
			}

			const validComment = validator.isLength(comment, { min: 1, max: 100 });

			if (!validComment) {
				return {
					comment: null,
					errors: [{ message: 'Comment must be between 1 and 100 characters' }],
				};
			}

			const updatedComment = await prisma.comment.update({
				where: {
					id: Number(commentID),
				},
				data: {
					comment,
				},
			});

			return {
				comment: updatedComment,
				errors: [],
			};
		} catch (error) {
			throw new Error('Server error');
		}
	},
	commentDelete: async (
		_parent: any,
		{ commentID }: { commentID: string },
		{ req, prisma }: Context
	): Promise<CommentPayloadType> => {
		// User is required to be logged-in
		if (!req.session.userID) {
			throw new Error('Not Authenticated');
		}

		try {
			const commentExists = await prisma.comment.findUnique({
				where: {
					id: Number(commentID),
				},
			});

			if (!commentExists) {
				return {
					comment: null,
					errors: [{ message: 'Comment does not exist' }],
				};
			}

			if (req.session.userID !== commentExists.commenterId) {
				throw new Error('Unauthorized');
			}

			const deletedComment = await prisma.comment.delete({
				where: {
					id: Number(commentID),
				},
			});

			return {
				comment: deletedComment,
				errors: [],
			};
		} catch (error) {
			throw new Error('Server error');
		}
	},
	commentReply: async (
		_parent: any,
		{ artworkID, comment, parentCommentID }: CommentReplyArgs,
		{ req, prisma }: Context
	): Promise<CommentPayloadType> => {
		// User is required to be logged-in
		if (!req.session.userID) {
			throw new Error('Not Authenticated');
		}

		const validReply = validator.isLength(comment, { min: 1, max: 100 });

		if (!validReply) {
			return {
				comment: null,
				errors: [{ message: 'Comment must be between 1 and 100 characters' }],
			};
		}

		try {
			const createdReply = await prisma.comment.create({
				data: {
					commenterId: req.session.userID,
					comment,
					artworkId: Number(artworkID),
					parentCommentId: Number(parentCommentID),
					likesCount: 0,
				},
			});

			return {
				comment: createdReply,
				errors: [],
			};
		} catch (error: any) {
			console.log(error);
			return {
				comment: null,
				errors: [{ message: 'Server Error' }],
			};
		}
	},
};
