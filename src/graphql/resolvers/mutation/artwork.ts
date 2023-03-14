import { Context, Error } from '../../../types.js';
import { Artwork } from '@prisma/client';
import validateArtworkInput from '../../../utilities/validateArtworkInput.js';
import { extractHashtags } from '../../../utilities/extractHashtags.js';

interface ArtworkCreateArgs {
    title: string;
    description: string;
    imageUrls: string[];
}

interface ArtworkUpdateArgs extends ArtworkCreateArgs {
    artworkID: string;
}

export interface ArtworkPayloadType {
    artwork: Artwork | null;
    errors: {
        message: string;
    }[];
}

export const artwork = {
    artworkCreate: async (
        _parent: any,
        { title, description, imageUrls }: ArtworkCreateArgs,
        { req, prisma }: Context
    ): Promise<ArtworkPayloadType> => {
        // User is required to be logged-in
        if (!req.session.userID) {
            throw new Error('Not Authenticated');
        }

        // Artwork input validation
        let errors: Error[] = [];
        const { validInput, messages } = validateArtworkInput(title, description, imageUrls);

        if (!validInput) {
            for (const message of messages) {
                errors.push({ message });
            }
            return {
                artwork: null,
                errors,
            };
        }

        try {
            const hashtags = extractHashtags(description);

            if (!hashtags) {
                const artwork = await prisma.artwork.create({
                    data: {
                        uploaderID: req.session.userID,
                        title,
                        description,
                        imageUrls,
                        likesCount: 0,
                    },
                });

                return {
                    artwork,
                    errors: [],
                };
            }

            const artwork = await prisma.artwork.create({
                data: {
                    uploaderID: req.session.userID,
                    title,
                    description,
                    imageUrls,
                    likesCount: 0,
                    tags: {
                        connectOrCreate: hashtags.map((tag) => {
                            return {
                                where: { tagname: tag },
                                create: { tagname: tag },
                            };
                        }),
                    },
                },
            });

            return {
                artwork,
                errors: [],
            };
        } catch (error: any) {
            console.log(error);

            return {
                artwork: null,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    artworkUpdate: async (
        _parent: any,
        { artworkID, title, description, imageUrls }: ArtworkUpdateArgs,
        { req, prisma }: Context
    ): Promise<ArtworkPayloadType> => {
        // User is required to be logged-in
        if (!req.session.userID) {
            throw new Error('Not Authenticated');
        }

        // Artwork input validation
        let errors: Error[] = [];
        const { validInput, messages } = validateArtworkInput(title, description, imageUrls);

        try {
            const artwork = await prisma.artwork.findUnique({
                where: {
                    id: Number(artworkID),
                },
            });

            if (!artwork) {
                return {
                    artwork: null,
                    errors: [{ message: 'Artwork does not exist' }],
                };
            }

            if (req.session.userID !== artwork.uploaderID) {
                throw new Error('Unauthorized');
            }

            if (!validInput) {
                for (const message of messages) {
                    errors.push({ message });
                }
                return {
                    artwork: null,
                    errors,
                };
            }

            const updatedArtwork = await prisma.artwork.update({
                where: {
                    id: Number(artworkID),
                },
                data: {
                    ...(title && { title }),
                    ...(description && { description }),
                    ...(imageUrls && { imageUrls }),
                },
            });

            return {
                artwork: updatedArtwork,
                errors: [],
            };
        } catch (error) {
            throw new Error('Server error');
        }
    },
    artworkDelete: async (
        _parent: any,
        { artworkID }: { artworkID: string },
        { req, prisma }: Context
    ): Promise<ArtworkPayloadType> => {
        // User is required to be logged-in
        if (!req.session.userID) {
            throw new Error('Not Authenticated');
        }

        try {
            const artwork = await prisma.artwork.findUnique({
                where: {
                    id: Number(artworkID),
                },
            });

            if (!artwork) {
                return {
                    artwork: null,
                    errors: [{ message: 'Artwork does not exist' }],
                };
            }

            if (req.session.userID !== artwork.uploaderID) {
                throw new Error('Unauthorized');
            }

            const deletedArtwork = await prisma.artwork.delete({
                where: {
                    id: Number(artworkID),
                },
            });

            return {
                artwork: deletedArtwork,
                errors: [],
            };
        } catch (error) {
            throw new Error('Server error');
        }
    },
};
