import {PassThrough} from 'stream';
import express from 'express';
import mongoose from 'mongoose';
import formidable from 'formidable';
import AWS from 'aws-sdk';

import {isAuthenticated} from '../middleware/authentication.mjs';

const s3Client = new AWS.S3();

const DatasetRouter = express.Router();

DatasetRouter.all('*', isAuthenticated);

DatasetRouter.get('/:_id', async (req, res, next) => {

    try {
        const Dataset = mongoose.model('Dataset');

        res.json(await Dataset.find({
            _id: req.params._id,
            organization: req.user.activeOrganizationMembership.organization._id
        }));
    } catch (e) {
        next(e);
    }
});

DatasetRouter.get('/', async (req, res, next) => {
    try {
        await req.user.activeOrganizationMembership.organization.populate({
            path: 'datasets',
            options: {
                sort: {
                    createdAt: -1
                },
                limit: 100
            }
        });

        res.json(req.user.activeOrganizationMembership.organization.datasets);
    } catch (e) {
        next(e);
    }
});

DatasetRouter.post('/', (req, res, next) => {

    formidable({
        fileWriteStreamHandler: (file) => {
            const passthrough = new PassThrough();

            console.log('/Users/jacques/dioptra/services/frontend/src/server/controllers/dataset.mjs:50', file);
            console.log('/Users/jacques/dioptra/services/frontend/src/server/controllers/dataset.mjs:50', file.newFilename);

            s3Client.upload({
                Bucket: 'dioptra-batch-output-dev',
                Key: file.newFilename,
                Body: passthrough
            }, (err, data) => {
                console.log('/Users/jacques/dioptra/services/frontend/src/server/controllers/dataset.mjs:58', JSON.stringify(err, null, 4), data);
            });

            return passthrough;
        }
    }).parse(req, async (err, fields) => {
        if (err) {
            next(err);
        } else {

            try {
                const Dataset = mongoose.model('Dataset');

                await Dataset.create({
                    name: fields.name,
                    datasetId: fields.datasetId || undefined, // necessary for mongoose default
                    organization: req.user.activeOrganizationMembership.organization._id
                });

                res.redirect(req.headers.referer);
            } catch (e) {
                next(e);
            }
        }
    });
});

DatasetRouter.put('/:_id', async (req, res, next) => {
    try {
        const Dataset = mongoose.model('Dataset');

        const dataset = await Dataset.findByIdAndUpdate(req.params._id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

DatasetRouter.delete('/:_id', async (req, res, next) => {

    try {
        const Dataset = mongoose.model('Dataset');
        const dataset = await Dataset.findOneAndDelete({
            _id: req.params._id,
            organization: req.user.activeOrganizationMembership.organization._id
        });

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

export default DatasetRouter;
