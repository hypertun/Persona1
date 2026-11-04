// Contact API — POST /api/contact (invoked by src/worker.js).
//
// The single delivery path for contact-form submissions: a Telegram message
// to Ivan's phone. Inquiries arrive ONLY as a Telegram ping; replies to leads
// are composed from Gmail (one tap on the mailto: link in the message).
//
// Runs in the Cloudflare Workers runtime. Secrets:
//   NOTIFY_TELEGRAM_TOKEN   – bot token from @BotFather (https://t.me/BotFather)
//   NOTIFY_TELEGRAM_CHAT_ID – your chat id (message the bot, then open
//                             https://api.telegram.org/bot<TOKEN>/getUpdates)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Strip control chars and cap length.
function clean(value, maxLen = 500) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, maxLen)
}

// Telegram sendMessage limit is 4096 chars; stay comfortably under per message.
const MAX_CHARS_PER_MESSAGE = 3500

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })

export async function handleContactPost(request, env) {
  let data
  try {
    data = await request.json()
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400)
  }

  // Honeypot: bots auto-fill hidden "website" field — silently accept & drop.
  if (clean(data.website, 200)) {
    return json({ ok: true })
  }

  const name = clean(data.name, 100)
  const email = clean(data.email, 200)
  const inquiryType = clean(data.inquiry_type, 120)
  const message = clean(data.message, 5000)

  if (!name || !EMAIL_RE.test(email) || message.length < 20) {
    return json({ ok: false, error: 'validation_failed' }, 400)
  }

  const token = env.NOTIFY_TELEGRAM_TOKEN
  const chatId = env.NOTIFY_TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    console.error('No delivery path configured (NOTIFY_TELEGRAM_TOKEN / NOTIFY_TELEGRAM_CHAT_ID)')
    return json({ ok: false, error: 'relay_not_configured' }, 500)
  }

  // ── Delivery: Telegram messages (header → body chunks → reply link) ─────
  const escaped = escapeHtml(message)
  const chunks = []
  for (let i = 0; i < escaped.length; i += MAX_CHARS_PER_MESSAGE) {
    chunks.push(escaped.slice(i, i + MAX_CHARS_PER_MESSAGE))
  }

  const header =
    `📩 <b>New inquiry — IvanBuilds</b>\n\n` +
    `<b>From:</b> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;\n` +
    `<b>Inquiry:</b> ${escapeHtml(inquiryType || 'General')}\n\n`
  const footer = `\n\n<a href="mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Re: your inquiry — IvanBuilds')}">Reply to ${escapeHtml(name)}</a>`

  try {
    if (chunks.length === 1) {
      await sendTelegram(token, chatId, header + chunks[0] + footer)
    } else {
      await sendTelegram(token, chatId, header + chunks[0])
      for (let i = 1; i < chunks.length; i++) {
        const isLast = i === chunks.length - 1
        await sendTelegram(token, chatId, `${isLast ? '' : '(cont.) '}${chunks[i]}${isLast ? footer : ''}`)
      }
    }
  } catch (e) {
    console.error('Telegram delivery failed:', e?.message)
    return json({ ok: false, error: 'relay_failed' }, 502)
  }

  return json({ ok: true })
}

async function sendTelegram(token, chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Telegram responded ${res.status}: ${detail}`)
  }
}
