import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import aiRouter from './routes/ai.js'
import stripeRouter from './routes/stripe.js'
import { startReminderCron } from './reminders.js'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = [
  process.env.APP_URL || 'http://localhost:5173',
  'https://trackr-taupe.vercel.app',
]
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)) }))

// Stripe webhooks need the raw body for signature verification — must come before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '4mb' }))

// General limit — all API routes: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict limit — AI routes: 20 requests per hour per IP
// Protects your Gemini free quota from abuse
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'AI request limit reached (20/hour). Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', generalLimiter)
app.use('/api/ai', aiLimiter)

app.use('/api/ai', aiRouter)
app.use('/api/stripe', stripeRouter)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Temporary test route — trigger reminders manually
app.post('/api/reminders/test', async (req, res) => {
  if (req.headers['x-test-secret'] !== 'trackr-test-2024') {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const { sendReminders } = await import('./reminders.js')
    await sendReminders()
    res.json({ ok: true, message: 'Reminders triggered — check your email and server logs' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Trackr API server running on http://localhost:${PORT}`)
  console.log(`Rate limits: 100 req/15min (general), 20 req/hour (AI)`)
  startReminderCron()
})
