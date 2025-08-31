import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hola, prueba de OpenAI. Dime algo breve." }]
    });
    console.log(resp.choices[0].message.content);
  } catch (err) {
    console.error("Error OpenAI:", err);
  }
}

test();
