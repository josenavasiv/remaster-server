import { Context } from '../../types.js';
import { User, Follow } from '@prisma/client';

const Follow = {
    // When the query requests an Artwork's uploader, their artworks will be populated by this resolver
    follower: async ({ followerId }: Follow, _args: any, { dataSources }: Context): Promise<User> => {
        try {
            return dataSources.users.getUser(followerId);
        } catch (error) {
            console.log(error);
            throw new Error('User does not exist');
        }
        // const follower = await prisma.user.findUnique({
        //     where: {
        //         id: followerId,
        //     },
        // });

        // return follower!;
    },
    following: async ({ followingId }: Follow, _args: any, { dataSources }: Context): Promise<User> => {
        try {
            return dataSources.users.getUser(followingId);
        } catch (error) {
            console.log(error);
            throw new Error('User does not exist');
        }
        // const following = await prisma.user.findUnique({
        //     where: {
        //         id: followingId,
        //     },
        // });

        // return following!;
    },
};

export default Follow;
