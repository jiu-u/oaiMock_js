import express, { Request, Response } from 'express';

const app = express();
const port = 8080;

// 解析JSON请求体
app.use(express.json());

// 定义请求体和响应体的类型
interface ChatMessage {
    role: string;
    content: string;
}

interface ChatCompletionRequest {
    messages: ChatMessage[];
    stream: boolean;
    model: string;
}

interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// 模拟的OpenAI Chat接口
app.post('/v1/chat/completions', async (req: Request<{}, {}, ChatCompletionRequest>, res: Response) => {
    const { messages,stream,model } = req.body;
    const mockMessage = "Hello! This is a mock response from the OpenAI Chat API!";

    // 模拟的响应数据
    const response: ChatCompletionResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [
            {
                index: 0,
                message: {
                    role: 'assistant',
                    content: 'Hello! This is a mock response from the OpenAI Chat API!',
                },
                delta: {
                    content: 'Hello! This is a mock response from the OpenAI Chat API!',
                },
                // finish_reason: 'stop',
            },
        ],
        usage: {
            prompt_tokens: 9,
            completion_tokens: 12,
            total_tokens: 21,
        },
    };
    if(!stream){
      res.json(response);
      return
    }
    response.object = "chat.completion.chunk";
    response.choices[0].message = null;
    // 流式返回响应
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 模拟流式返回
    let index = 0;
    const interval = setInterval(() => {
        if (index < mockMessage.length) {
            // 模拟流式返回
            response.choices[0].delta.content = mockMessage[index];
            let str = JSON.stringify(response);
            res.write(`data: ${str}\n\n`);
            index++;
        } else {
            clearInterval(interval);
            res.write(`data: [DONE]\n\n`);
            res.end();
        }
    }, 80);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
