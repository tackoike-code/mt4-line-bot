const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

// ===== 環境変数 =====
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// ===== LINE Webhook受信 =====
app.post("/webhook", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // ここでは「画像を受け取った」という前提で固定返答
    // 後でAI分析ロジックを入れる
    const resultText = `
【MT4短期判定・試作】

30秒：↑（勝率 63%）
1分：↑（勝率 66%）
3分：↓（勝率 58%）
5分：↓（勝率 61%）

推奨エントリー：
次足確定後、5〜10秒待ってから
`;

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken: req.body.events[0].replyToken,
        messages: [{ type: "text", text: resultText }],
      },
      {
        headers: {
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    fs.unlinkSync(imagePath);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// ===== 起動 =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("MT4 Judge Bot running");
});

