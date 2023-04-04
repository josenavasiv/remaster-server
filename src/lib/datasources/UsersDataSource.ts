import { PrismaClient, User } from '@prisma/client';
import DataLoader from 'dataloader';

export default class UsersDataSource {
    private prisma;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    private userLoader = () =>
        new DataLoader<number, User>(async (ids) => {
            const users = await this.prisma.user.findMany({
                where: {
                    id: {
                        in: ids as number[],
                    },
                },
            });

            const userMap: Record<number, User> = {};

            users.forEach((user) => {
                userMap[user.id] = user;
            });

            return ids.map((id) => userMap[id]);
        });

    async getUser(id: number) {
        return this.userLoader().load(id);
    }
}

// In your server file

// Set up our database, instantiate our connection,
// and return that database connection
// const dbConnection = initializeDBConnection();

// const { url } = await startStandaloneServer(server, {
//     context: async () => {
//         return {
//             dataSources: {
//                 // Create a new instance of our data source for every request!
//                 // (We pass in the database connection because we don't need
//                 // a new connection for every request.)
//                 productsDb: new ProductsDataSource(dbConnection),
//             },
//         };
//     },
// });
