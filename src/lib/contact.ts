export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}

export interface ContactResponse {
  ok: boolean;
  message?: string;
  error?: string;
}

export const sendContactMessage = async (payload: ContactPayload): Promise<ContactResponse> => {
  try {
    const response = await fetch('/.netlify/functions/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let data: ContactResponse | null = null;

    try {
      data = (await response.json()) as ContactResponse;
    } catch {
      // Fall through to generic error
    }

    if (!response.ok) {
      return {
        ok: false,
        error: data?.error || 'Failed to transmit message.',
      };
    }

    return {
      ok: data?.ok === true,
      message: data?.message || 'Message sent successfully.',
    };
  } catch { return { ok: false, error: 'Network error. Please try again or email eeshan@technightcity.com.' }; }
};
