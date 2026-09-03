// The backend's POST /bookings/{id}/payments returns { sessionUrl } where
// sessionUrl is actually the JSON string of a Razorpay Order object
// (CheckoutServiceImpl#getCheckoutSession returns `order.toString()`), not
// a redirect URL. So the correct integration is Razorpay's embedded
// Checkout.js modal (using the order id/amount/currency), not a redirect —
// see README for details.

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptPromise = null;

export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return scriptPromise;
}

// Parses the backend's "sessionUrl" field, which is really a serialized
// Razorpay Order object, e.g. {"id":"order_...","amount":..., "currency":"INR", ...}
export function parseRazorpayOrder(sessionUrl) {
  try {
    const order = JSON.parse(sessionUrl);
    if (order?.id) return order;
    return null;
  } catch {
    return null;
  }
}

export async function openRazorpayCheckout({ order, keyId, name, description, prefillEmail, onSuccess, onDismiss, onError }) {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    onError?.(new Error('Could not load the Razorpay checkout script. Check your connection.'));
    return;
  }
  if (!keyId) {
    onError?.(new Error('Razorpay is not configured (missing VITE_RAZORPAY_KEY_ID).'));
    return;
  }

  const rzp = new window.Razorpay({
    key: keyId,
    amount: order.amount,
    currency: order.currency || 'INR',
    order_id: order.id,
    name: name || 'Stayora',
    description: description || 'Stay booking',
    prefill: prefillEmail ? { email: prefillEmail } : undefined,
    theme: { color: '#0F1E1A' },
    handler: (response) => {
      onSuccess?.({
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: () => onDismiss?.(),
    },
  });

  rzp.on('payment.failed', (resp) => {
    onError?.(new Error(resp?.error?.description || 'Payment failed.'));
  });

  rzp.open();
}
