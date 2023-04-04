import { PrismaClient, Comment } from '@prisma/client';
import DataLoader from 'dataloader';

export default class CommentsDataSource {
    private prisma;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    private commentLoader = () =>
        new DataLoader<number, Comment>(async (ids) => {
            const comments = await this.prisma.comment.findMany({
                where: {
                    id: {
                        in: ids as number[],
                    },
                },
            });

            const commentsMap: Record<number, Comment> = {};

            comments.forEach((user) => {
                commentsMap[user.id] = user;
            });

            return ids.map((id) => commentsMap[id]);
        });

    async getComment(id: number) {
        return this.commentLoader().load(id);
    }
}