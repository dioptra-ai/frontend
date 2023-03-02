import {GetCallerIdentityCommand, STSClient} from '@aws-sdk/client-sts';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const integrationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    data: {
        type: Object,
        required: true
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    type: {
        type: String,
        enum: ['AWS_S3', 'GOOGLE_CLOUD_STORAGE'],
        default: 'AWS_S3',
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    methods: {
        async getIdentity() {
            switch (this.type) {
            case 'AWS_S3': {
                const stsResponse = await new STSClient({
                    credentials: {
                        accessKeyId: this.data['aws']['aws_access_key_id'],
                        secretAccessKey: this.data['aws']['aws_secret_access_key'],
                        sessionToken: this.data['aws']['aws_session_token']
                    }
                }).send(new GetCallerIdentityCommand({}));

                return stsResponse['Arn'];
            }
            case 'GOOGLE_CLOUD_STORAGE':
                // TODO: Implement this
                return 'GCS';
            default:
                return Promise.reject(new Error('Unknown integration type'));
            }
        }
    }
});

integrationSchema.statics.getIdentity = async function (data, type) {
    switch (type) {
    case 'AWS_S3': {
        const stsResponse = await new STSClient({
            credentials: {
                accessKeyId: data['aws']['aws_access_key_id'],
                secretAccessKey: data['aws']['aws_secret_access_key'],
                sessionToken: data['aws']['aws_session_token']
            },
            region: 'us-east-2'
        }).send(new GetCallerIdentityCommand({}));

        return stsResponse['Arn'];
    }
    case 'GOOGLE_CLOUD_STORAGE':
        // TODO: Implement this
        return 'GCS';
    default:
        return Promise.reject(new Error('Unknown integration type'));
    }
};

export default mongoose.model('Integrations', integrationSchema);
