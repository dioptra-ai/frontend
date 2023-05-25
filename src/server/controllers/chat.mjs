import express from 'express';
import {Configuration, OpenAIApi} from 'openai';
const configuration = new Configuration({
    organization: 'org-uSZdKnnv17FeGmjt737SzlOa',
    apiKey: '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'
});
const openai = new OpenAIApi(configuration);

const ChatRouter = express.Router();

ChatRouter.post('/send', async (req, res, next) => {
    try {
        const {messages} = req.body;
        const completion = await openai.createChatCompletion({
            model: 'gpt-4',
            temperature: 0,
            messages: [{
                role: 'system',
                content: 'You are an assistant named DataBot for the ML platform Dioptra. The documentation is located at https://dioptra.gitbook.io/dioptra-doc/EIKhoPaxsbOt062jkPon'
            }, ...messages, {
                role: 'system',
                content: 'Answer in Markdown:'
            }],
            user: req.reqestOrganizationId
        });

        res.json({
            'role': 'assistant',
            'content': completion.data.choices[0].message.content
        });
    } catch (e) {
        next(e);
    }
});

export default ChatRouter;
