import { Pattern } from '../Pattern.js';

export const stripePattern = new Pattern({
  id: 'stripe',
  name: 'Stripe',
  regex: /\b(sk_live_[a-zA-Z0-9]{24,})\b/g,
  providerBonus: 50,
  envKeyHint: 'STRIPE_SECRET_KEY',
});
