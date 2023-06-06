import mongoose from 'mongoose';
import {
    APIGatewayClient,
    CreateApiKeyCommand, CreateUsagePlanKeyCommand
} from '@aws-sdk/client-api-gateway';

const {AWS_API_GATEWAY_PLAN_ID, ENVIRONMENT} = process.env;
const apiGatewayClient = new APIGatewayClient({region: 'us-east-2'});

const Schema = mongoose.Schema;
const apiKeySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    awsApiKeyId: {
        type: String,
        required: true
    },
    awsApiKey: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

apiKeySchema.statics.createApiKeyForUser = async (user) => {
    const dioptraUserId = user._id;
    const requestOrganization = user.requestOrganization;
    const dioptraOrganizationId = requestOrganization._id;
    const dioptraApiKey = new ApiKey({
        user: dioptraUserId,
        organization: requestOrganization._id
    });

    let awsApiKey = {
        id: `__api_key_id__${Date.now()}__`,
        value: `__api_key_value__${Date.now()}__`
    };

    if (ENVIRONMENT !== 'local-dev') {

        awsApiKey = await apiGatewayClient.send(new CreateApiKeyCommand({
            enabled: true,
            name: `${dioptraApiKey._id} (as: ${user.username} | ${requestOrganization.name})`,
            tags: {
                dioptraUserId, dioptraOrganizationId,
                dioptraApiKeyId: dioptraApiKey._id
            }
        }));

        await apiGatewayClient.send(new CreateUsagePlanKeyCommand({
            keyId: awsApiKey.id,
            keyType: 'API_KEY',
            // TODO: Change this depending on what plan the organization is on when people are paying us.
            usagePlanId: AWS_API_GATEWAY_PLAN_ID
        }));
    }

    // Wait for propagation... Not sure why this is needed.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    dioptraApiKey.awsApiKeyId = awsApiKey.id;
    dioptraApiKey.awsApiKey = awsApiKey.value;

    return dioptraApiKey.save();
};

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;
