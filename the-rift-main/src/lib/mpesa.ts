// Safaricom Daraja API — M-Pesa STK Push Integration
// Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate

const SANDBOX_URL = "https://sandbox.safaricom.co.ke";
const PRODUCTION_URL = "https://api.safaricom.co.ke";

const BASE_URL = process.env.MPESA_ENVIRONMENT === "production" ? PRODUCTION_URL : SANDBOX_URL;

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface STKCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

// Get OAuth token from Safaricom
export async function getOAuthToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  if (!res.ok) {
    throw new Error(`M-Pesa OAuth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token;
}

// Generate password for STK Push (Base64 of Shortcode+Passkey+Timestamp)
function generatePassword(timestamp: string): string {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

// Format timestamp: YYYYMMDDHHmmss
function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

import { normalizePhone } from "./utils/validation";
export { normalizePhone };

// Initiate STK Push
export async function initiateSTKPush(
  phone: string,
  amount: number,
  orderNumber: string
): Promise<STKPushResponse> {
  const token = await getOAuthToken();
  const timestamp = getTimestamp();
  const password = generatePassword(timestamp);
  const shortcode = process.env.MPESA_SHORTCODE!;
  const callbackUrl = process.env.MPESA_CALLBACK_URL!;

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: normalizePhone(phone),
      PartyB: shortcode,
      PhoneNumber: normalizePhone(phone),
      CallBackURL: callbackUrl,
      AccountReference: orderNumber,
      TransactionDesc: `Ayola Foods Order ${orderNumber}`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`M-Pesa STK Push failed: ${res.status} ${err}`);
  }

  return res.json();
}

// Query STK Push status
export async function querySTKStatus(checkoutRequestId: string) {
  const token = await getOAuthToken();
  const timestamp = getTimestamp();
  const password = generatePassword(timestamp);
  const shortcode = process.env.MPESA_SHORTCODE!;

  const res = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  });

  return res.json();
}

// Check if M-Pesa is configured
export function isMpesaConfigured(): boolean {
  return !!(
    process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_SHORTCODE &&
    process.env.MPESA_PASSKEY &&
    process.env.MPESA_CALLBACK_URL
  );
}
