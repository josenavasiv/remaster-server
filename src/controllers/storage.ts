import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import s3Client from '../lib/s3Client.js';
import { nanoid } from 'nanoid';

const storageRouter = express.Router();

storageRouter.post('/', async (request, response) => {
    // if (!request.session?.userID) {
    //     return response.status(401).json({ error: 'User login required' });
    // }

    const form = formidable({ multiples: true });
    form.parse(request, async (_error, _fields, files) => {
        if (!files) {
            return response.status(406).json({ error: 'No images provided to store' });
        }

        const filesToStore: { extension: string; filepath: string }[] = [];

        Object.entries(files).forEach((file) => {
            filesToStore.push({
                //@ts-expect-error
                extension: FileExtension(file[1][0].originalFilename),
                //@ts-expect-error
                filepath: file[1][0].filepath as string,
            });
        });

        // Upload to Digital Ocean Space
        // NEED TO REWORK
        const urls = await Promise.all(
            filesToStore.map(({ extension, filepath }) => {
                return new Promise(async (resolve) => {
                    const generatedID = nanoid();
                    const params = {
                        Bucket: process.env.DO_SPACES_BUCKET as string,
                        Key: `${generatedID}${extension}`,
                        Body: fs.createReadStream(filepath),
                        ACL: 'public-read',
                    };
                    await s3Client.putObject(params);
                    resolve(
                        `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_ENDPOINT}/${generatedID}${extension}`
                    );
                });
            })
        );

        return response.status(200).send({
            urls,
        });
    });

    return;
});

export default storageRouter;

// FileExtension
// Proper promise
function FileExtension(str: string): string {
    const arr = str.split('.');
    return '.' + arr[arr.length - 1];
}
