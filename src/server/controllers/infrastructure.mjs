import express from 'express';
import md5 from 'md5';
import {GetObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

import {isAuthenticated} from '../middleware/authentication.mjs';

const {AWS_S3_CUSTOMER_BUCKET, AWS_S3_CUSTOMER_BUCKET_REGION = 'us-east-2', AWS_S3_CUSTOMER_UPLOAD_EXPIRATION_SECONDS = 300, ENVIRONMENT} = process.env;
const s3 = new S3Client({region: AWS_S3_CUSTOMER_BUCKET_REGION});

const InfrastructureRouter = express.Router();

InfrastructureRouter.all('*', isAuthenticated);

InfrastructureRouter.get('/sign-s3-url-pair', async (req, res, next) => {
    try {
        const key = `${ENVIRONMENT}/${req.user.requestOrganizationId}/${md5(Math.random().toString())}.ndjson`;
        const [put, get] = await Promise.all([
            getSignedUrl(s3, new PutObjectCommand({
                Bucket: AWS_S3_CUSTOMER_BUCKET,
                Key: key
            }), {
                expiresIn: AWS_S3_CUSTOMER_UPLOAD_EXPIRATION_SECONDS
            }),
            getSignedUrl(s3, new GetObjectCommand({
                Bucket: AWS_S3_CUSTOMER_BUCKET,
                Key: key
            }), {
                expiresIn: AWS_S3_CUSTOMER_UPLOAD_EXPIRATION_SECONDS
            })
        ]);

        res.json({put, get});
    } catch (e) {
        next(e);
    }
});

export default InfrastructureRouter;
