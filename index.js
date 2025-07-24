const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const token = process.env.ACCESS_TOKEN;
const phoneId = process.env.PHONE_NUMBER_ID;

// Verificación inicial de webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const verify_token = req.query["hub.verify_token"];

  if (mode && verify_token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// Webhook de recepción de mensajes
app.post("/webhook", async (req, res) => {
  const body = req.body;

  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = message?.from;
  const text = message?.text?.body;

  if (from && text) {
    console.log(`Mensaje recibido de ${from}: ${text}`);

    // Responder automáticamente
    await axios.post(
      `https://graph.facebook.com/v17.0/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: "¡Hola! 🛍️ ¿Deseas ver nuestro menú?" },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Bot activo en puerto 3000");
});
