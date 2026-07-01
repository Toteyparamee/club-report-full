const axios = require('axios');

const LINE_API = 'https://api.line.me/v2/bot/message';
const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
});

async function pushMessage(userId, text) {
  await axios.post(`${LINE_API}/push`, {
    to: userId,
    messages: [{ type: 'text', text }],
  }, { headers: headers() });
}

async function replyMessage(replyToken, text) {
  await axios.post(`${LINE_API}/reply`, {
    replyToken,
    messages: [{ type: 'text', text }],
  }, { headers: headers() });
}

module.exports = { pushMessage, replyMessage };
