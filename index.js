require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const executionCounts = new Map();
const OPS_CHANNELS = new Set([
  "craftlymade-ops",
  "sakeenah-ops",
  "boardroom",
]);

const CEO_SYSTEM_PROMPT = `তুমি Jahid Hossan-এর মালিকানাধীন দুটি faceless, US-targeted YouTube channel-এর CEO:

1) CraftlyMade (@CraftlyMadeDIY): DIY Shorts। বর্তমানে 848টি clip আছে, recipe v7 ব্যবহার হচ্ছে, এবং প্রতিদিন 1টি Short প্রকাশের schedule হলো Mon-Fri 6 PM ET ও Sat-Sun 11 AM ET। Nov 19-25 পর্যন্ত Static বনাম Motion A/B test চলবে, Nov 27-এ review হবে। লক্ষ্য: YPP।
2) Sakeenah Tilawah (@SakeenahTilawah): Quran recitation long-form। Mishary Alafasy, per-ayah Arabic + English subtitles, এবং 40% dimmed unique calm backgrounds ব্যবহার করতে হবে। Launch আনুমানিক Nov 29। Mon/Wed/Fri 8 PM ET-এ surah এবং Sun 8 PM ET-এ 1-hour sleep compilation প্রকাশের schedule। লক্ষ্য: YPP।

সবসময় বাংলায় উত্তর দেবে। সিদ্ধান্তমূলক ও data-driven হবে। Muse AI-এর updates review করে পরবর্তী directive দেবে। Jahid-এর explicit approval ছাড়া কখনো publish করবে না।`;

function splitMessage(content, maxLength = 1950) {
  const chunks = [];
  for (let index = 0; index < content.length; index += maxLength) {
    chunks.push(content.slice(index, index + maxLength));
  }
  return chunks.length > 0 ? chunks : [""];
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!OPS_CHANNELS.has(message.channel.name)) {
    return;
  }

  const ownerId = process.env.OWNER_ID;
  const museBotId = process.env.MUSE_BOT_ID;
  if (![ownerId, museBotId].includes(message.author.id)) {
    return;
  }

  const channelId = message.channel.id;
  if (message.author.id === ownerId) {
    executionCounts.set(channelId, 0);
  } else if (message.author.id === museBotId) {
    const count = (executionCounts.get(channelId) || 0) + 1;
    executionCounts.set(channelId, count);

    if (count >= 3) {
      await message.reply("Execution pause করা হলো। Jahid-এর approval না পাওয়া পর্যন্ত আর কোনো action নেওয়া হবে না।");
      return;
    }
  }

  try {
    const recentMessages = await message.channel.messages.fetch({ limit: 10 });
    const context = [...recentMessages.values()]
      .reverse()
      .map((item) => `${item.author.username}: ${item.content}`)
      .join("\n");

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-pro-preview",
      systemInstruction: CEO_SYSTEM_PROMPT,
    });
    const result = await model.generateContent(context);
    const response = result.response.text();

    for (const chunk of splitMessage(response)) {
      await message.channel.send(chunk);
    }
  } catch (error) {
    console.error("Failed to generate CEO response:", error);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
