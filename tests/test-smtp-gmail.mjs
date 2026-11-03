// SMTP protocol tests for functions/api/smtp-gmail.js
//
// The SMTP dialogue is validated twice:
//   1) Scripted  — readLine/write are mocked; every reply code/sequence checked
//   2) Real TCP   — a fake SMTP server on 127.0.0.1 exercises actual socket
//                   I/O, exercising the same wrapper pattern the Worker uses
//                   (line buffering over a byte stream). Plaintext locally;
//                   production wraps smtp.gmail.com:465 in TLS via secureTransport.
import assert from 'node:assert/strict'
import net from 'node:net'
import { buildMessage, smtpDialog } from '../functions/api/smtp-gmail.js'

const results = []
const test = (name, fn) =>
  fn().then(() => results.push(`✅ ${name}`)).catch((e) => {
    results.push(`❌ ${name} — ${e.message}`)
    process.exitCode = 1
  })

const USER = 'sender@gmail.com'
const PASS = 'abcd efgh ijkl mnop'

// A fake Gmail: valid replies for every step, in order of the dialogue.
function gmailScripted() {
  const replies = [
    '220 smtp.gmail.com ESMTP h12sm999\r\n',      // greeting
    '250-smtp.gmail.com at your service\r\n',      // EHLO (multi-line…)
    '250-SIZE 35882577\r\n',
    '250 SMTPUTF8\r\n',                           // …final line
    '334 ' + Buffer.from('Username:').toString('base64') + '\r\n', // AUTH LOGIN
    '334 ' + Buffer.from('Password:').toString('base64') + '\r\n',
    '235 2.7.0 Accepted\r\n',                     // credentials
    '250 2.1.0 OK\r\n',                          // MAIL FROM
    '250 2.1.5 OK\r\n',                          // RCPT TO
    '354 Go ahead\r\n',                           // DATA
    '250 2.0.0 queued as 123\r\n',                // message accepted
    '221 2.0.0 closing\r\n'                       // QUIT
  ]
  const queue = replies.map((r) => r.trimEnd().split('\n')).flat()
  const written = []
  return {
    written,
    readLine: async () => queue.shift(),
    write: async (s) => written.push(s)
  }
}

// 1. buildMessage: RFC 5322 shape, CRLF endings, dot-stuffing, RFC 2047
await test('buildMessage: headers, CRLF, dot-stuffing, RFC 2047 subject', async () => {
  const msg = buildMessage({
    from: 'sender@gmail.com',
    to: 'dest@gmail.com',
    replyTo: 'jane@acme.com',
    subject: 'New inquiry — from Jāné',
    body: 'Line one\n.\nStarts with dot'
  })
  assert.match(msg, /^From: sender@gmail\.com\r\n/)
  assert.match(msg, /To: dest@gmail\.com\r\n/)
  assert.match(msg, /Reply-To: jane@acme\.com\r\n/)
  assert.ok(!/\r\nSubject: New inquiry/.test(msg), 'non-ASCII subject must be RFC 2047 encoded')
  assert.match(msg, /Subject: =\?UTF-8\?B\?/)
  assert.match(msg, /Content-Type: text\/plain; charset=UTF-8\r\n/)
  assert.match(msg, /Line one\r\n\.\.\r\nStarts with dot\r\n$/, 'leading dot doubled, CRLF endings')
})

// 2. Happy-path dialogue: exact command sequence
await test('smtpDialog: full happy path sends the exact SMTP command sequence', async () => {
  const io = gmailScripted()
  const message = buildMessage({
    from: USER, to: 'dest@gmail.com', subject: 'Test', body: 'Hello from the unit test.'
  })
  await smtpDialog(io, { user: USER, pass: PASS, to: 'dest@gmail.com', message })
  assert.deepEqual(io.written, [
    'EHLO ivanbuilds.local\r\n',
    'AUTH LOGIN\r\n',
    Buffer.from(USER).toString('base64') + '\r\n',
    Buffer.from(PASS).toString('base64') + '\r\n',
    'MAIL FROM:<sender@gmail.com>\r\n',
    'RCPT TO:<dest@gmail.com>\r\n',
    'DATA\r\n',
    message + '\r\n.\r\n',
    'QUIT\r\n'
  ])
})

// 3. Auth failure surfaces as a clear error
await test('smtpDialog: bad credentials → AUTH failure error', async () => {
  const replies = [
    '220 ready', '250 ok', '334 VXNlcm5hbWU6', '334 UGFzc3dvcmQ6',
    '535-5.7.8 Username and Password not accepted', '535 5.7.8 learn more at…'
  ]
  const queue = [...replies]
  const io = { written: [], readLine: async () => queue.shift(), write: async () => {} }
  await assert.rejects(
    smtpDialog(io, { user: USER, pass: 'wrong', to: 'x@gmail.com', message: 'm' }),
    /AUTH password failed \(535\)/
  )
})

// 4. Non-final greeting rejected
await test('smtpDialog: server not ready (421) → greeting error', async () => {
  const io = { written: [], readLine: async () => '421 Service unavailable', write: async () => {} }
  await assert.rejects(
    smtpDialog(io, { user: USER, pass: PASS, to: 'x@gmail.com', message: 'm' }),
    /greeting failed \(421\)/
  )
})

// 5. Recipient rejected
await test('smtpDialog: RCPT TO rejected (550) → error', async () => {
  const replies = ['220 ready', '250 ok', '334 VXNlcm5hbWU6', '334 UGFzc3dvcmQ6', '235 ok', '250 ok', '550 no such user']
  const queue = [...replies]
  const io = { written: [], readLine: async () => queue.shift(), write: async () => {} }
  await assert.rejects(
    smtpDialog(io, { user: USER, pass: PASS, to: 'x@gmail.com', message: 'm' }),
    /RCPT TO failed \(550\)/
  )
})

// 6. Read timeout
await test('smtpDialog: server silence → timeout error', async () => {
  const io = { written: [], readLine: () => new Promise(() => {}), write: async () => {} }
  await assert.rejects(
    smtpDialog(io, { user: USER, pass: PASS, to: 'x@gmail.com', message: 'm', timeoutMs: 50 }),
    /greeting timed out/
  )
})

// 7. Real TCP: fake SMTP server + line-buffered wrapper (mirrors the Worker socket wrapper)
await test('real-socket integration: full delivery through a local TCP SMTP server', async () => {
  const received = { from: '', to: '', data: '' }
  let dataMode = false

  const server = net.createServer((sock) => {
    sock.on('error', () => {}) // tolerate abrupt client teardown
    sock.write('220 smtp.test ESMTP fake\r\n')
    sock.on('data', (chunk) => {
      let buf = chunk.toString()
      while (buf.length) {
        // Handle DATA payload (ends at CRLF.CRLF) — process byte-wise chunks too
        if (dataMode) {
          const end = buf.indexOf('\r\n.\r\n')
          if (end === -1) { received.data += buf; return }
          received.data += buf.slice(0, end)
          buf = buf.slice(end + 5)
          dataMode = false
          sock.write('250 2.0.0 queued as TEST123\r\n')
          continue
        }
        const nl = buf.indexOf('\r\n')
        if (nl === -1) return
        const line = buf.slice(0, nl).trim()
        buf = buf.slice(nl + 2)
        if (line.startsWith('EHLO')) sock.write('250-smtp.test\r\n250 AUTH LOGIN\r\n')
        else if (line === 'AUTH LOGIN') sock.write('334 VXNlcm5hbWU6\r\n')
        else if (line === Buffer.from(USER).toString('base64')) sock.write('334 UGFzc3dvcmQ6\r\n')
        else if (line === Buffer.from(PASS).toString('base64')) sock.write('235 2.7.0 Accepted\r\n')
        else if (line.startsWith('MAIL FROM')) { received.from = line; sock.write('250 OK\r\n') }
        else if (line.startsWith('RCPT TO')) { received.to = line; sock.write('250 OK\r\n') }
        else if (line === 'DATA') { dataMode = true; sock.write('354 Go ahead\r\n') }
        else if (line === 'QUIT') { sock.write('221 bye\r\n'); sock.end() }
      }
    })
  })

  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const port = server.address().port

  // Wrapper mirrors functions/api/contact.js's sendViaGmail io (line buffering over bytes)
  const sock = net.connect(port, '127.0.0.1')
  sock.on('error', () => {})
  await new Promise((r) => sock.once('connect', r))
  let tcpBuf = ''
  const pending = []
  const pump = () => {
    while (pending.length && tcpBuf.includes('\n')) {
      const idx = tcpBuf.indexOf('\n')
      pending.shift()(tcpBuf.slice(0, idx).replace(/\r$/, ''))
      tcpBuf = tcpBuf.slice(idx + 1)
    }
  }
  sock.on('data', (c) => { tcpBuf += c.toString(); pump() })
  const io = {
    readLine: () => new Promise((res) => { pending.push(res); pump() }),
    write: async (s) => { sock.write(s) }
  }

  const message = buildMessage({
    from: USER, to: 'dest@gmail.com', replyTo: 'jane@acme.com',
    subject: 'TCP integration', body: 'Through a real socket.\n.\nDot line included.'
  })
  await smtpDialog(io, { user: USER, pass: PASS, to: 'dest@gmail.com', message })

  assert.equal(received.from, 'MAIL FROM:<sender@gmail.com>')
  assert.equal(received.to, 'RCPT TO:<dest@gmail.com>')
  assert.match(received.data, /Subject: TCP integration/)
  assert.match(received.data, /Reply-To: jane@acme\.com/)
  assert.match(received.data, /Through a real socket\.\r\n\.\.\r\nDot line included/, 'dot-stuffing survives the wire')
  sock.destroy()
  server.close()
})

console.log(results.join('\n'))
console.log(`\n${process.exitCode ? 'FAILED' : 'PASSED'}: ${results.filter((r) => r.startsWith('✅')).length}/${results.length} SMTP protocol tests`)
