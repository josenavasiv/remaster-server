import express from 'express';
import formidable from 'formidable';

const storageRouter = express.Router();

storageRouter.post('/', async (request, response) => {
    if (!request.session?.userID) {
        return response.status(401).json({ error: 'User login required' });
    }

    const form = formidable({ multiples: true });
    form.parse(request, async (_error, _fields, files) => {
        console.log(files);

        if (!files) {
            return response.status(406).json({ error: 'No images provided to store' });
        }

        // Upload to Digital Ocean Space

        return response.status(200).send({
            urls: [
                'https://images.unsplash.com/photo-1593472807861-5bb884af28f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1911&q=80',
                'https://images.unsplash.com/photo-1593472807861-5bb884af28f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1911&q=80',
                'https://images.unsplash.com/photo-1593472807861-5bb884af28f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1911&q=80',
            ],
        });
    });

    return;
});

export default storageRouter;
