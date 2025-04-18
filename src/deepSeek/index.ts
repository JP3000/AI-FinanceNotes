import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: process.env.DEEPSEEK_API_URL,
    apiKey: process.env.DEEPSEEK_API_KEY,
});

export default openai;







