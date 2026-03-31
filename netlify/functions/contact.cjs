const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 160;
const MAX_SUBJECT_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 2000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders,
  },
  body: JSON.stringify(body),
});

const sanitize = (value) => String(value || '').trim();

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      ok: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    const payload = JSON.parse(event.body || '{}');

    const name = sanitize(payload.name);
    const email = sanitize(payload.email);
    const subject = sanitize(payload.subject);
    const message = sanitize(payload.message);

    if (!name || !email || !subject || !message) {
      return jsonResponse(400, {
        ok: false,
        error: 'All fields are required.',
      });
    }

    if (
      name.length > MAX_NAME_LENGTH ||
      email.length > MAX_EMAIL_LENGTH ||
      subject.length > MAX_SUBJECT_LENGTH ||
      message.length > MAX_MESSAGE_LENGTH
    ) {
      return jsonResponse(400, {
        ok: false,
        error: 'One or more fields exceed allowed limits.',
      });
    }

    if (!isValidEmail(email)) {
      return jsonResponse(400, {
        ok: false,
        error: 'Invalid email format.',
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';

    if (!apiKey || !toEmail) {
      return jsonResponse(500, {
        ok: false,
        error: 'Server is not configured for email delivery yet.',
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
        <h2>New portfolio message</h2>
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        html,
        text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error('Resend API error:', errorData);

      return jsonResponse(502, {
        ok: false,
        error: 'Failed to deliver message to inbox.',
      });
    }

    return jsonResponse(200, {
      ok: true,
      message: 'Transmission successful. Message delivered.',
    });
  } catch (error) {
    console.error('Contact function error:', error);
    return jsonResponse(500, {
      ok: false,
      error: 'Unexpected server error while sending message.',
    });
  }
};
