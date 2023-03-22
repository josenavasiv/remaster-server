import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import s3Client from '../lib/s3Client.js';

const storageRouter = express.Router();

storageRouter.post('/', async (request, response) => {
    if (!request.session?.userID) {
        return response.status(401).json({ error: 'User login required' });
    }

    const form = formidable({ multiples: true });
    form.parse(request, async (_error, _fields, files) => {
        if (!files) {
            return response.status(406).json({ error: 'No images provided to store' });
        }

        const filesToStore: { newFilename: string; filepath: string }[] = [];

        Object.entries(files).forEach((file) => {
            filesToStore.push({
                //@ts-expect-error
                newFilename: `${file[1][0].newFilename}${FileExtension(file[1][0].originalFilename)}`,
                //@ts-expect-error
                filepath: file[1][0].filepath as string,
            });
        });

        const urls = await Promise.all(
            filesToStore.map(({ newFilename, filepath }) => {
                return new Promise((resolve) => {
                    const params = {
                        Bucket: process.env.DO_SPACES_BUCKET as string,
                        Key: `${request.session.userID}${newFilename}`,
                        Body: fs.createReadStream(filepath),
                        ACL: 'public-read',
                    };
                    s3Client.putObject(params);
                    resolve(
                        `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_ENDPOINT}/${request.session.userID}${newFilename}`
                    );
                });
            })
        );
        // Upload to Digital Ocean Space

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
