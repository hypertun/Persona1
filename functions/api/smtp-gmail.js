// Portable Gmail-SMTP client for Cloudflare Pages Functions.
//
// Cloudflare Workers cannot run nodemailer (no Node.js net/tls), but it CAN
// open raw TCP sockets via `cloudflare:sockets` — outbound SMTPS to
// smtp.gmail.com:465 is allowed (Cloudflare only blocks port 25).
//
// This module implements just enough of RFC 5321 to authenticate with a Gmail
// app password and deliver one message. Transport-agnostic: callers inject
// readLine/write, so the protocol is unit-testable against a simulated server.
// (Protocol reference: epone-web/functions/app.js — the same Gmail pattern,
// there via nodemailer.)

const HOSTNAME = 'ivanbuilds.local'

/** UTF-8-safe base64 (works in Workers and Node ≥ 18). */
function toBase64(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

/** RFC 2047 encode non-ASCII subjects (e.g. names with accents). */
function encodeHeader(str) {
  return /^[\x20-\x7e]*$/.test(str) ? str : `=?UTF-8?B?${toBase64(str)}?=`
}

/** RFC 5322 message with CRLF line endings + DATA dot-stuffing. */
export function buildMessage({ from, to, replyTo, subject, body }) {
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    replyTo ? `Reply-To: ${replyTo}` : null,
    `Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    `Date: ${new Date().toUTCString()}`
  ].filter(Boolean)

  const stuffed = body.replace(/\r?\n/g, '\r\n').replace(/(^|\r\n)\./g, '$1..')
  return headers.join('\r\n') + '\r\n\r\n' + stuffed + '\r\n'
}

/**
 * Full SMTP dialogue (one connection, one message).
 * @param {object} io            - { readLine: async () => string, write: async (s) => void }
 * @param {object} opts
 * @param {string} opts.user     - Gmail address (authenticated sender)
 * @param {string} opts.pass     - Gmail app password
 * @param {string} opts.to       - recipient
 * @param {string} opts.message  - pre-built RFC 5322 message (from buildMessage)
 * @param {number} [opts.timeoutMs=10000]
 * @throws Error with the SMTP reply text on any unexpected response/timeout
 */
export async function smtpDialog(io, { user, pass, to, message, timeoutMs = 10000 }) {
  const withTimeout = (p, step) =>
    Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error(`SMTP ${step} timed out`)), timeoutMs))
    ])

  /** Read one SMTP reply — possibly multi-line (e.g. `250-…` … `250 …`). */
  async function readReply(step) {
    const lines = []
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const line = await withTimeout(io.readLine(), step)
      lines.push(line)
      if (!/^\d{3}-/.test(line)) break // final line is `NNN<space>…`
    }
    const raw = lines.join('\n')
    const code = parseInt(raw.slice(0, 3), 10)
    return { code, raw }
  }

  const expect = async (step, code) => {
    const reply = await readReply(step)
    if (reply.code !== code) {
      throw new Error(`SMTP ${step} failed (${reply.code}): ${reply.raw.split('\n').pop()}`)
    }
    return reply
  }

  await expect('greeting', 220)
  await io.write(`EHLO ${HOSTNAME}\r\n`)
  await expect('EHLO', 250)
  await io.write('AUTH LOGIN\r\n')
  await expect('AUTH LOGIN', 334)
  await io.write(`${toBase64(user)}\r\n`)
  await expect('AUTH username', 334)
  await io.write(`${toBase64(pass)}\r\n`)
  await expect('AUTH password', 235)
  await io.write(`MAIL FROM:<${user}>\r\n`) // Gmail requires MAIL FROM = authenticated user
  await expect('MAIL FROM', 250)
  await io.write(`RCPT TO:<${to}>\r\n`)
  await expect('RCPT TO', 250)
  await io.write('DATA\r\n')
  await expect('DATA', 354)
  await io.write(`${message}\r\n.\r\n`) // message already ends with CRLF
  await expect('message body', 250)
  await io.write('QUIT\r\n')
}
