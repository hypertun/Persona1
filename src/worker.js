// Cloudflare Worker — IvanBuilds site: static assets + the contact API.
//
// Requests:
//   POST /api/contact → src/contact.js (delivers the inquiry via Telegram)
//   everything else  → static assets from dist/ (Vite build output)
//
// Config lives in wrangler.toml (name "ivanbuilds", [assets] → ./dist).
// Secrets (dashboard → Settings → Variables & Secrets, or .dev.vars locally):
//   NOTIFY_TELEGRAM_TOKEN   – bot token from @BotFather (https://t.me/BotFather)
//   NOTIFY_TELEGRAM_CHAT_ID – your chat id (message the bot, then open
//                             https://api.telegram.org/bot<TOKEN>/getUpdates)
import { handleContactPost } from './contact.js'

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/contact') {
      if (request.method === 'POST') return handleContactPost(request, env)
      return json({ ok: false, error: 'method_not_allowed' }, 405)
    }

    // Everything else: serve the static site (dist/).
    return env.ASSETS.fetch(request)
  }
}
