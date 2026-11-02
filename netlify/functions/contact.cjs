const subjects = require('../../src/content/contact-subjects.json');
const recipient = 'eeshan@technightcity.com';
const reply = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });
exports.config = { path: '/.netlify/functions/contact', rateLimit: { windowLimit: 5, windowSize: 180, aggregateBy: ['ip', 'domain'] } };
exports.handler = async event => {
  if (event.httpMethod !== 'POST') return reply(405, {ok:false,error:'Use POST to send a message.'});
  const origin = event.headers?.origin || event.headers?.Origin;
  if (origin && !['https://technightcity.com','https://www.technightcity.com','https://eeshanportfolio.netlify.app'].includes(origin)) return reply(403,{ok:false,error:'This form can only be submitted from TechNightCity.'});
  if (Buffer.byteLength(event.body || '') > 16000) return reply(413,{ok:false,error:'Message is too large.'});
  let data;
  try { data=JSON.parse(event.body || '{}'); } catch { return reply(400,{ok:false,error:'Invalid message format.'}); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(400,{ok:false,error:'Invalid message format.'});
  if (data.website) return reply(400,{ok:false,error:'Message could not be submitted.'});
  const limits={name:80,email:160,subject:120,message:2000};
  const payload={};
  for (const [key,max] of Object.entries(limits)) {
    if (typeof data[key] !== 'string' || !data[key].trim() || data[key].trim().length > max) return reply(400,{ok:false,error:'Please complete every field within the displayed limits.'});
    payload[key]=data[key].trim();
  }
  if (!/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(payload.email) || /[\r\n]/.test(payload.name) || !subjects.includes(payload.subject)) return reply(400,{ok:false,error:'Choose a listed subject and provide a valid name and email.'});
  // Netlify Forms is included on the existing credit-based hosting plan.
  // The site's notification destination is configured to the fixed owner inbox.
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_FROM_EMAIL) {
    try {
      const response = await fetch('https://technightcity.com/', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'form-name': 'quick-message', ...payload, website: '' }).toString(),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) return reply(502, {ok:false,error:'The form service could not accept the message. Please email eeshan@technightcity.com.'});
      return reply(200, {ok:true,message:'Message accepted. Thank you — I’ll reply to your email.'});
    } catch { return reply(502, {ok:false,error:'The form service is unavailable. Please email eeshan@technightcity.com.'}); }
  }
  try {
    const response=await fetch('https://api.resend.com/emails',{
      method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({from:process.env.CONTACT_FROM_EMAIL,to:[recipient],reply_to:payload.email,subject:`[TechNightCity] ${payload.subject}`,text:`From: ${payload.name} <${payload.email}>\nSubject: ${payload.subject}\n\n${payload.message}`}),
      signal:AbortSignal.timeout(12000),
    });
    if (!response.ok) return reply(502,{ok:false,error:'The email provider could not accept the message. Please try again later or email eeshan@technightcity.com.'});
    const accepted=await response.json();
    if (!accepted.id) return reply(502,{ok:false,error:'The provider did not confirm acceptance. Please email eeshan@technightcity.com.'});
    return reply(200,{ok:true,message:'Message accepted for email delivery. Thank you — I’ll reply to your email.'});
  } catch { return reply(502,{ok:false,error:'Delivery could not be confirmed. Please email eeshan@technightcity.com if the problem continues.'}); }
};
