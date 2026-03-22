import { createHmac } from 'crypto';

export interface PaymentGateway {
  createOrder(amount: number, currency: string, receipt: string): Promise<{ id: string; amount: number; currency: string }>;
  verifyPayment(orderId: string, paymentId: string, signature: string): boolean;
  fetchPayment(paymentId: string): Promise<Record<string, unknown>>;
}

class RazorpayMock implements PaymentGateway {
  async createOrder(amount: number, currency: string, receipt: string) {
    const id = `order_mock_${Date.now()}`;
    console.log(`[MOCK RAZORPAY] Order ${id} created for ₹${amount / 100}`);
    return { id, amount, currency };
  }

  verifyPayment(): boolean {
    return true; // Mock always passes
  }

  async fetchPayment(paymentId: string) {
    return { id: paymentId, status: 'captured', amount: 500000, currency: 'INR' };
  }
}

class RazorpayLive implements PaymentGateway {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID!;
    this.keySecret = process.env.RAZORPAY_KEY_SECRET!;
    if (!this.keyId || !this.keySecret) throw new Error('Razorpay credentials not configured');
  }

  async createOrder(amount: number, currency: string, receipt: string) {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency, receipt }),
    });
    if (!res.ok) throw new Error(`Razorpay order failed: ${res.status}`);
    return res.json();
  }

  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    const expectedSignature = createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return expectedSignature === signature;
  }

  async fetchPayment(paymentId: string) {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!res.ok) throw new Error(`Razorpay fetch failed: ${res.status}`);
    return res.json();
  }
}

export function getPaymentGateway(): PaymentGateway {
  if (process.env.RAZORPAY_MODE === 'live') return new RazorpayLive();
  return new RazorpayMock();
}
