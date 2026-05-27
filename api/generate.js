// ClawDocs AI - 生成 API (Vercel Serverless Function)
// POST /api/generate
// Body: { apiKey, model, prompt }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  const { apiKey, model = 'google/gemini-2.5-flash', prompt } = req.body;

  if (!apiKey || !prompt) {
    return res.status(400).json({ error: '缺少 apiKey 或 prompt 参数' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://clawdocs-ai.vercel.app',
        'X-Title': 'ClawDocs AI',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || `API 请求失败 (${response.status})`;
      return res.status(response.status).json({ error: msg });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'AI 返回内容为空' });
    }

    return res.status(200).json({ content: content.trim() });
  } catch (err) {
    console.error('[generate API]', err);
    return res.status(500).json({ error: '服务器内部错误：' + err.message });
  }
}