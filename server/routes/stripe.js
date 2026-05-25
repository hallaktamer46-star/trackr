import { Router } from 'express'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const router = Router()

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

function getSupabaseAdmin() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error('Supabase admin credentials not configured')
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// Create a Stripe Checkout session for the Pro subscription
router.post('/create-checkout', async (req, res) => {
  const { userId, email } = req.body
  if (!userId || !email) return res.status(400).json({ error: 'userId and email are required' })

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: 1500,
          recurring: { interval: 'month' },
          product_data: {
            name: 'Trackr Pro',
            description: 'Unlimited applications + AI coaching tools',
          },
        },
        quantity: 1,
      }],
      metadata: { userId },
      success_url: `${process.env.APP_URL || 'http://localhost:5173'}/?checkout=success`,
      cancel_url:  `${process.env.APP_URL || 'http://localhost:5173'}/?checkout=cancelled`,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Webhook — raw body is applied in index.js before express.json()
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature']
  if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(400).send('Webhook secret not configured')

  try {
    const stripe = getStripe()
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.metadata?.userId
      if (userId) {
        const supabase = getSupabaseAdmin()
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { is_paid: true },
        })
        console.log(`User ${userId} upgraded to Pro`)
      }
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    res.status(400).send(`Webhook Error: ${err.message}`)
  }
})

export default router
