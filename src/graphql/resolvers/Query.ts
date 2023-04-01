import { Context } from 'src/types.js';
import { Artwork, Tag, Notification, User } from '@prisma/client';
import { ArtworkPayloadType } from './mutation/artwork';
import { UserPayloadType } from './mutation/user';

interface UserArgs {
    username: string;
}

interface UserFeedArgs {
    limit?: number;
    cursor?: number;
}

interface UserLikesArgs extends UserArgs {
    skip?: number;
    take?: number;
}

interface UsersPaginatedPayload {
    users: User[];
    hasMore: boolean;
    errors: {
        message: string;
    }[];
}

interface PaginatedArtworksPayloadType {
    artworks: Artwork[];
    hasMore: boolean;
    errors: {
        message: string;
    }[];
}

interface TagArtworksArgs {
    // tagID: string;
    take?: number;
    skip?: number;
    tagname: string;
}

interface TagsPayload {
    tags: Tag[];
    errors: {
        message: string;
    }[];
}

interface NotificationsArgs {
    skip?: number;
    take?: number;
}

interface NotificationsPaginatedPayloadType {
    notifications: Notification[];
    hasMore: boolean;
    errors: {
        message: string;
    }[];
}

const Query = {
    hello: (_parent: any, _args: any, _context: Context) => {
        return 'Hello World';
    },
    artwork: async (
        _parent: any,
        { artworkID }: { artworkID: string },
        { prisma }: Context
    ): Promise<ArtworkPayloadType> => {
        try {
            const artwork = await prisma.artwork.findUnique({
                where: {
                    id: Number(artworkID),
                },
            });

            if (!artwork) {
                return {
                    artwork: null,
                    errors: [{ message: 'Artwork no longer exists' }],
                };
            }

            return {
                artwork,
                errors: [],
            };
        } catch (error) {
            return {
                artwork: null,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    notifications: async (
        _parent: any,
        { skip, take }: NotificationsArgs,
        { req, prisma }: Context
    ): Promise<NotificationsPaginatedPayloadType> => {
        if (!req.session.userID) {
            return {
                notifications: [],
                hasMore: false,
                errors: [],
            };
        }

        try {
            const notifications = await prisma.notification.findMany({
                where: {
                    userId: Number(req.session.userID),
                },
                skip: skip ?? 0,
                take: take ?? 10,
                orderBy: [{ createdAt: 'desc' }],
            });

            return {
                notifications: notifications ?? [],
                hasMore: notifications?.length === (take ?? 10),
                errors: [],
            };
        } catch (error) {
            return {
                notifications: [],
                hasMore: false,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    tagArtworks: async (
        _parent: any,
        { tagname, skip, take }: TagArtworksArgs,
        { req, prisma }: Context
    ): Promise<PaginatedArtworksPayloadType> => {
        if (!req.session.userID) {
        }

        try {
            const tagArtworks = await prisma.tag.findUnique({
                where: {
                    tagname: tagname,
                },
                select: {
                    artworks: {
                        skip: skip ?? 0,
                        take: take ?? 10,
                        orderBy: [{ createdAt: 'desc' }],
                    },
                },
            });

            return {
                artworks: tagArtworks?.artworks ?? [],
                hasMore: tagArtworks?.artworks.length === (take ?? 10),
                errors: [],
            };
        } catch (error) {
            return {
                artworks: [],
                hasMore: false,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    user: async (_parent: any, { username }: UserArgs, { prisma }: Context): Promise<UserPayloadType> => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    username: username,
                },
            });

            if (!user) {
                return {
                    user: null,
                    errors: [{ message: 'User no longer exists' }],
                };
            }

            return {
                user,
                errors: [],
            };
        } catch (error) {
            return {
                user: null,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    userExplore: async (
        _parent: any,
        { limit, cursor }: UserFeedArgs,
        { req, prisma }: Context
    ): Promise<PaginatedArtworksPayloadType> => {
        if (!req.session.userID) {
        }

        // This will return artworks based on the amount of likes an artwork has, user activity etc...
        // For now it is the same as a user's feed

        try {
            const artworks = await prisma.artwork.findMany({
                take: limit ?? 10,
                ...(cursor && {
                    cursor: {
                        id: cursor,
                    },
                    skip: 1,
                }),
                orderBy: [{ createdAt: 'desc' }],
            });

            return {
                artworks,
                hasMore: artworks.length === (limit ?? 10),
                errors: [],
            };
        } catch (error) {
            return {
                artworks: [],
                hasMore: false,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    userFeed: async (
        _parent: any,
        { limit, cursor }: UserFeedArgs,
        { req, prisma }: Context
    ): Promise<PaginatedArtworksPayloadType> => {
        if (!req.session.userID) {
            // return 10 latest posts
        }

        try {
            const artworks = await prisma.artwork.findMany({
                take: limit ?? 10,
                ...(cursor && {
                    cursor: {
                        id: cursor,
                    },
                    skip: 1,
                }),
                orderBy: [{ createdAt: 'desc' }],
            });

            return {
                artworks,
                hasMore: artworks.length === (limit ?? 10),
                errors: [],
            };
        } catch (error) {
            return {
                artworks: [],
                hasMore: false,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    userExploreTags: async (_parent: any, _args: any, { req, prisma }: Context): Promise<TagsPayload> => {
        if (!req.session.userID) {
        }

        try {
            const tags = await prisma.tag.findMany({
                take: 10,
                orderBy: [{ id: 'desc' }],
            });

            return {
                tags,
                errors: [],
            };
        } catch (error) {
            return {
                tags: [],
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    userFollowers: async (
        _parent: any,
        { username, take, skip }: UserLikesArgs,
        { prisma }: Context
    ): Promise<UsersPaginatedPayload> => {
        try {
            const userFollowers = await prisma.user.findUnique({
                where: {
                    username: username,
                },
                select: {
                    followers: {
                        select: {
                            follower: true,
                        },
                        skip: skip ?? 0,
                        take: take ?? 10,
                        orderBy: [{ createdAt: 'desc' }],
                    },
                },
            });

            // Extract each artwork object
            let followers: User[] = [];
            userFollowers?.followers.forEach((f) => {
                followers.push(f.follower!);
            });

            if (!userFollowers?.followers) {
                return {
                    users: [],
                    hasMore: false,
                    errors: [],
                };
            }

            return {
                users: followers ?? [],
                hasMore: userFollowers.followers.length === (take ?? 10),
                errors: [],
            };
        } catch (error) {
            return {
                users: [],
                hasMore: false,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    userFollowings: async (
        _parent: any,
        { username, take, skip }: UserLikesArgs,
        { prisma }: Context
    ): Promise<UsersPaginatedPayload> => {
        try {
            const userFollowers = await prisma.user.findUnique({
                where: {
                    username: username,
                },
                select: {
                    following: {
                        select: {
                            following: true,
                        },
                        skip: skip ?? 0,
                        take: take ?? 10,
                        orderBy: [{ createdAt: 'desc' }],
                    },
                },
            });

            // Extract each artwork object
            let followers: User[] = [];
            userFollowers?.following.forEach((f) => {
                followers.push(f.following!);
            });

            if (!userFollowers?.following) {
                return {
                    users: [],
                    hasMore: false,
                    errors: [],
                };
            }

            return {
                users: followers ?? [],
                hasMore: userFollowers.following.length === (take ?? 10),
                errors: [],
            };
        } catch (error) {
            return {
                users: [],
                hasMore: false,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    userLikes: async (
        _parent: any,
        { username, take, skip }: UserLikesArgs,
        { prisma }: Context
    ): Promise<PaginatedArtworksPayloadType> => {
        try {
            const likedArtworks = await prisma.user.findUnique({
                where: {
                    username: username,
                },
                select: {
                    likes: {
                        where: {
                            artworkId: {
                                not: null,
                            },
                        },
                        select: {
                            artwork: true,
                        },
                        skip: skip ?? 0,
                        take: take ?? 10,
                        orderBy: [{ createdAt: 'desc' }],
                    },
                },
            });

            // Extract each artwork object
            let artworks: Artwork[] = [];
            likedArtworks?.likes.forEach((like) => {
                artworks.push(like.artwork!);
            });

            if (!likedArtworks) {
                return {
                    artworks: [],
                    hasMore: false,
                    errors: [],
                };
            }

            return {
                artworks,
                hasMore: likedArtworks.likes.length === (take ?? 10),
                errors: [],
            };
        } catch (error) {
            return {
                artworks: [],
                hasMore: false,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
    userLoggedIn: async (_parent: any, _args: any, { req, prisma }: Context): Promise<UserPayloadType> => {
        if (!req.session.userID) {
            return {
                user: null,
                errors: [],
            };
        }

        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: req.session.userID,
                },
            });

            if (!user) {
                return {
                    user: null,
                    errors: [{ message: 'User no longer exists' }],
                };
            }

            return {
                user,
                errors: [],
            };
        } catch (error) {
            return {
                user: null,
                errors: [{ message: 'Server Error' }],
            };
        }
    },
};

export default Query;
