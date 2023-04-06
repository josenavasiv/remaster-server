import { Context } from '../../types.js';
import { User, Artwork, Follow } from '@prisma/client';

const User = {
    // Eventually this will be paginated
    // When the query requests a User's artworks, their artworks will be populated by this
    artworks: async ({ id }: User, _args: any, { prisma }: Context): Promise<Artwork[]> => {
        const artworks = await prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                artworks: {
                    orderBy: [{ createdAt: 'desc' }],
                },
            },
        });

        if (!artworks?.artworks) {
            return [];
        }

        return artworks.artworks;
    },
    isFollowedByLoggedInUser: async ({ id }: User, _args: any, { req, prisma }: Context): Promise<Follow | null> => {
        // If user is logged-in, return null -> Indicaates a non-logged-in user cannot like
        if (!req.session.userID || req.session.userID === id) {
            return null;
        }

        const follow = await prisma.follow.findFirst({
            where: {
                followerId: req.session.userID,
                followingId: id,
            },
        });

        return follow;
    },
    // Returns the artworks that the user likes
    // likes: async ({ id }: User, _args: any, { prisma }: Context): Promise<Like[]> => {
    //     const likes = await prisma.user.findUnique({
    //         where: {
    //             id,
    //         },
    //         select: {
    //             likes: {
    //                 orderBy: [{ createdAt: 'desc' }],
    //             },
    //         },
    //     });

    //     if (!likes?.likes) {
    //         return [];
    //     }

    //     return likes.likes;
    // },
};

export default User;
