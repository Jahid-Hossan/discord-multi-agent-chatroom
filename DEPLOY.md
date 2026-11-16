# CEO bot deploy guide — Coolify (coolify.appscloud.tech)

## আগে যা লাগবে

1. **CEO bot-এর Discord token** — [Discord Developer Portal](https://discord.com/developers/applications)-এ নতুন application বানাও (নাম যেমন "CEO")।
   - **Bot** পেজে: **Message Content Intent** চালু করো, তারপর **Reset Token** দিয়ে token-টা নাও।
   - **OAuth2 > URL Generator** পেজে: scope `bot`, permissions **View Channel / Send Messages / Read Message History** — তৈরি হওয়া link দিয়ে bot-টাকে "Multi agent chatroom" server-এ invite করো।
2. **Gemini API key** — [Google AI Studio](https://aistudio.google.com/apikey) থেকে।

> Token আর API key কখনো chat-এ বা git-এ দেবে না — শুধু Coolify-র Environment Variables-এ থাকবে।

## Coolify-তে deploy

1. [coolify.appscloud.tech](https://coolify.appscloud.tech)-এ login করে **+ New > Application** নাও।
2. Source হিসেবে GitHub repo-টা দাও: `https://github.com/Jahid-Hossan/discord-multi-agent-chatroom` (branch: `main`)।
3. Build Pack: **Dockerfile** (auto-detect হবে — repo-তে Dockerfile আগেই আছে)।
4. **Domain আর Port কিছুই বসাবে না** — এই bot-এর কোনো web server নেই; ও শুধু বাইরের দিকে connection করে (Discord + Gemini API)।
5. **Environment Variables**-এ এই ৪টা বসাও:

   | Name | Value |
   |---|---|
   | `DISCORD_BOT_TOKEN` | তোমার CEO bot-এর token |
   | `GEMINI_API_KEY` | তোমার Gemini API key |
   | `OWNER_ID` | `915608191985909761` |
   | `MUSE_BOT_ID` | `1571775641651773521` |

6. **Deploy** চাপো। Logs-এ `Logged in as CEO#....` দেখলেই bot online।

পরে code বদলালে repo-তে push করলেই Coolify আবার deploy করা যাবে (Deploy বাটন, বা auto-deploy চালু থাকলে নিজে থেকেই)।

## বিকল্প: সরাসরি Docker দিয়ে (Coolify ছাড়া)

```bash
git clone https://github.com/Jahid-Hossan/discord-multi-agent-chatroom
cd discord-multi-agent-chatroom
cp .env.example .env
nano .env          # দুটো secret বসাও, ID দুটো আগেই বসানো আছে
docker compose up -d --build
docker compose logs -f
```

Bot online হলে ও শুধু `craftlymade-ops`, `sakeenah-ops` আর `boardroom` channel-এ শুনবে, আর শুধু Jahid আর Muse bot-এর message-এর উত্তর দেবে।
