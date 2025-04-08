// 帮我用起一个服务，暴露一个接口
import { createServer } from 'http';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-e8fdee1f5291411fa805cfe9c54eff54',
});

// 文本总结函数
async function summarizeText(text) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            '你是一个专业的文本总结助手。请简明扼要地总结用户提供的文本，保留关键信息。',
        },
        { role: 'user', content: `请总结以下文本：\n\n${text}` },
      ],
      model: 'deepseek-chat',
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('总结文本时出错:', error);
    return '总结失败，请稍后再试。';
  }
}

// 创建HTTP服务器
const server = createServer(async (req, res) => {
  // 设置CORS和响应头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 只处理POST请求和/summarize路径
  if (req.method === 'POST' && req.url === '/summarize') {
    let body = '';

    // 接收请求数据
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    // 处理请求
    req.on('end', async () => {
      try {
        const { text } = JSON.parse(body);

        if (!text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '请提供要总结的文本' }));
          return;
        }

        // 调用总结函数
        const summary = await summarizeText(text);

        // 返回总结结果
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ summary }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '请求格式错误' }));
      }
    });
  } else {
    // 其他路径返回简单说明
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(
      '文本总结API服务\n使用方法: 发送POST请求到/summarize，请求体为JSON格式，包含text字段',
    );
  }
});

// 启动服务器
server.listen(3000, () => {
  console.log('文本总结服务已启动，监听端口3000');
});
