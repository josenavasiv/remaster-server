import { S3 } from '@aws-sdk/client-s3';

const s3Client = new S3({
    endpoint: ('https://' + process.env.DO_SPACES_ENDPOINT) as string,
    region: process.env.DO_SPACES_REGION as string,
    credentials: {
        accessKeyId: process.env.DO_SPACES_ID as string,
        secretAccessKey: process.env.DO_SPACES_SECRET as string,
    },
});

export default s3Client;
