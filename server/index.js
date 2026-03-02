const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const stripe = require('stripe')(fs.readFileSync('../secrets/stripe_secret_key.txt', 'utf8').trim());
const { Coinbase, Wallet } = require("@coinbase/coinbase-sdk");
const axios = require('axios'); // For OpenNode API calls

const app = express();
const port = 3000;

// Load Secrets
const endpointSecret = fs.readFileSync('../secrets/stripe_webhook_secret.txt', 'utf8').trim();
const cdpKeyName = fs.readFileSync('../secrets/cdp_key_name.txt', 'utf8').trim();
const cdpKeyPrivate = fs.readFileSync('../secrets/cdp_key_private.txt', 'utf8').trim();
// OpenNode Secret
let openNodeKey = "";
try { 
  // Prefer the Invoices key for webhook signature verification if needed
  openNodeKey = fs.readFileSync('../secrets/opennode_api_key_invoices.txt', 'utf8').trim(); 
} catch(e) {
  try {
    openNodeKey = fs.readFileSync('../secrets/opennode_api_key.txt', 'utf8').trim();
  } catch(e2) {}
}

// Initialize Coinbase SDK
Coinbase.configure({ apiKeyName: cdpKeyName, privateKey: cdpKeyPrivate });

// --- STRIPE WEBHOOK ---
app.post('/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`🔒 Stripe Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    processSale(event.data.object.metadata.referral_id, event.data.object.amount_total);
  }
  res.json({received: true});
});

const crypto = require('crypto');

// --- OPENNODE WEBHOOK ---
app.post('/opennode-webhook', bodyParser.json(), async (req, res) => {
  const sig = req.headers['x-opennode-signature'];
  const charge = req.body;

  // 1. Verify HMAC Signature (Security check)
  if (openNodeKey && sig) {
    const hmac = crypto.createHmac('sha256', openNodeKey);
    hmac.update(JSON.stringify(charge));
    const digest = hmac.digest('hex');
    
    if (digest !== sig) {
      console.error('🔒 OpenNode Signature Verification Failed!');
      return res.status(401).send('Unauthorized');
    }
  }

  // 2. Check for payment completion
  // status: 'paid' is the typical success trigger for OpenNode
  if (charge.status === 'paid') {
    console.log(`⚡ Bitcoin/Lightning Sale! ID: ${charge.id} | Status: ${charge.status}`);
    
    // Referral ID is typically stored in the metadata field
    // or as a custom field if we passed it during charge creation.
    const referralId = charge.metadata ? charge.metadata.referral_id : null;
    
    // OpenNode amount is usually in Satoshis or Fiat value depending on setup.
    // If it's fiat-based, charge.price or charge.fiat_value is used.
    // Assuming we standardized on fiat (cents) for the splitter:
    const amountCents = charge.fiat_value ? (charge.fiat_value * 100) : 0;

    if (amountCents > 0) {
      processSale(referralId, amountCents);
    } else {
      console.warn(`⚠️ Received OpenNode 'paid' event with 0 value or missing fiat data.`);
    }
  }

  res.status(200).send('OK');
});

const { processSale } = require('./payout_engine.js');

// --- CHECKOUT ROUTE (The Bridge) ---
app.get('/checkout', async (req, res) => {
  const { product, ref } = req.query;
  const referralId = ref || '0x1CD1F4eD8D9EAB34DF0a7BbCa1643620d7FFeF7B'; // Default to admin

  console.log(`🔗 Checkout initiated for product: ${product} | Referral: ${referralId}`);

  try {
    // 1. Create a Stripe Checkout Session
    // In production, we'd look up the actual price_id from products.json
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: product.replace(/-/g, ' ').toUpperCase() },
          unit_amount: 5000, // Placeholder 50 EUR (5000 cents)
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://ignoreo.com/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://ignoreo.com/cancel`,
      metadata: {
        product_id: product,
        referral_id: referralId
      }
    });

    // 2. Redirect the human to Stripe
    res.redirect(303, session.url);
  } catch (err) {
    console.error(`❌ Checkout Error: ${err.message}`);
    res.status(500).send("Unable to initiate checkout. Please try again.");
  }
});

app.listen(port, () => {
    console.log(`🐾 Moltie Merchant Bot Live with Stripe + OpenNode on port ${port}`);
});
