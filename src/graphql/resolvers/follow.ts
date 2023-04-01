import { Context } from 'src/types';
import { User, Follow } from '@prisma/client';

const Follow = {
    // When the query requests an Artwork's uploader, their artworks will be populated by this resolver
    follower: async ({ followerId }: Follow, _args: any, { prisma }: Context): Promise<User> => {
        const follower = await prisma.user.findUnique({
            where: {
                id: followerId,
            },
        });

        return follower!;
    },
    following: async ({ followingId }: Follow, _args: any, { prisma }: Context): Promise<User> => {
        const following = await prisma.user.findUnique({
            where: {
                id: followingId,
            },
        });

        return following!;
    },
};

export default Follow;
