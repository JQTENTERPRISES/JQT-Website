// jqt-lead: the server side of the website's three forms.
//
// Served on jqtenterprises.com/api/* in front of GitHub Pages, so the forms
// post to their own origin and there is no CORS to configure. One job per
// submission, in this order:
//
//   1. validate (and quietly drop bots: honeypot, fill time, rate limit)
//   2. answer the visitor at once, so the Rowan redirect is never held up
//   3. after the response: write People / Companies / Deals in Attio, then
//      email the lead to the inbox WHATEVER Attio did. If both fail, the
//      submission is written to the Worker log as the copy of last resort.
//
// Secrets: ATTIO_TOKEN only, set with `wrangler secret put`. Never in git.

import { EmailMessage } from 'cloudflare:email';

const ROLES = ['Owner', 'General Manager', 'Operations', 'Housekeeping leadership', 'Other'];
const ROOMS = ['Under 50', '50 to 99', '100 to 150', '151 to 250', '250+'];
const TYPES = {
  kept_demo:        { line: 'Kept',        entry: 'Rowan gate',          label: 'Rowan gate' },
  kept_walkthrough: { line: 'Kept',        entry: 'Walkthrough request', label: 'Walkthrough request' },
  jqt_project:      { line: 'JQT Project', entry: 'JQT form',            label: 'JQT project' },
};
const OPEN_STAGES_THAT_ADVANCE = ['New', 'Qualified'];
const CLOSED = ['Won', 'Lost'];

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname !== '/api/lead') return json(404, { ok: false, error: 'not_found' });
    if (req.method !== 'POST') return new Response(null, { status: 405, headers: { allow: 'POST' } });

    const origin = req.headers.get('origin');
    if (origin !== env.SITE_ORIGIN) return json(403, { ok: false, error: 'origin' });
    if (!(req.headers.get('content-type') || '').startsWith('application/json')) return json(415, { ok: false, error: 'type' });
    if (Number(req.headers.get('content-length') || 0) > 16384) return json(413, { ok: false, error: 'size' });

    const ip = req.headers.get('cf-connecting-ip') || 'unknown';
    if (env.LIMITER) {
      const { success } = await env.LIMITER.limit({ key: ip });
      if (!success) return json(429, { ok: false, error: 'rate' });
    }

    let body;
    try { body = await req.json(); } catch { return json(400, { ok: false, error: 'json' }); }

    // Bots: a filled honeypot or a form "filled" in under two seconds gets the
    // same answer a person gets, so there is nothing to learn from probing it.
    if (body.website || (Number(body.elapsed) > 0 && Number(body.elapsed) < 2000)) return json(200, { ok: true });

    const v = validate(body);
    if (v.errors) return json(422, { ok: false, error: 'invalid', fields: v.errors });

    ctx.waitUntil(handle(v.lead, env, req));
    return json(200, { ok: true });
  },
};

// ---------------------------------------------------------------- validation

const clean = (s, max) => (typeof s === 'string' ? s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');
const cleanBlock = (s, max) => (typeof s === 'string' ? s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').trim().slice(0, max) : '');

function validate(b) {
  const errors = {};
  const type = TYPES[b.type] ? b.type : null;
  if (!type) return { errors: { type: 'unknown' } };
  const kept = type !== 'jqt_project';

  const name = clean(b.name, 120);
  const email = clean(b.email, 254).toLowerCase();
  const company = clean(b.company, 160);
  const role = ROLES.includes(b.role) ? b.role : '';
  const rooms = ROOMS.includes(b.rooms) ? b.rooms : '';
  const message = cleanBlock(b.message, 4000);

  if (name.length < 2) errors.name = 'required';
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) errors.email = 'invalid';
  if (company.length < 2) errors.company = 'required';
  if (!role) errors.role = 'required';
  if (kept && !rooms) errors.rooms = 'required';
  if (type === 'jqt_project' && message.length < 5) errors.message = 'required';
  if (Object.keys(errors).length) return { errors };

  const a = b.attr && typeof b.attr === 'object' ? b.attr : {};
  const firstSeen = Date.parse(a.first_seen);
  const attr = {
    utm_source: clean(a.utm_source, 120), utm_medium: clean(a.utm_medium, 120),
    utm_campaign: clean(a.utm_campaign, 160), utm_content: clean(a.utm_content, 160),
    landing_page: clean(a.landing_page, 300), referrer: clean(a.referrer, 200),
    first_seen: Number.isFinite(firstSeen) && firstSeen <= Date.now() ? new Date(firstSeen).toISOString() : '',
  };
  return { lead: { type, name, email, company, role, rooms, message, attr, page: clean(b.page, 300), at: new Date().toISOString() } };
}

// ---------------------------------------------------------------- handling

async function handle(lead, env, req) {
  let crm;
  try { crm = await toAttio(lead, env); }
  catch (e) { crm = { ok: false, error: String(e && e.message || e).slice(0, 400) }; console.error('attio failed', crm.error); }

  try { await notify(lead, crm, env); }
  catch (e) {
    console.error('notify failed', String(e && e.message || e));
    // The only copy left. Logged only when both Attio and email failed.
    if (!crm.ok) console.error('LEAD NOT DELIVERED', JSON.stringify(lead));
  }
}

// ---------------------------------------------------------------- Attio

async function toAttio(lead, env) {
  const t = TYPES[lead.type];
  const api = async (method, path, data) => {
    const r = await fetch(`https://api.attio.com/v2${path}`, {
      method,
      headers: { authorization: `Bearer ${env.ATTIO_TOKEN}`, 'content-type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify({ data }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`${method} ${path.split('?')[0]} ${r.status} ${j.message || ''}`);
    return j.data;
  };
  const query = async (obj, body) => {
    const r = await fetch(`https://api.attio.com/v2/objects/${obj}/records/query`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.ATTIO_TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`query ${obj} ${r.status} ${j.message || ''}`);
    return j.data;
  };
  const first = (rec, slug) => (rec.values[slug] || [])[0];
  const title = (rec, slug) => { const x = first(rec, slug); return x && (x.option?.title || x.status?.title || x.value); };

  // Person, matched on email (Attio's unique key for people).
  const [given, ...rest] = lead.name.split(' ');
  const person = await api('PUT', '/objects/people/records?matching_attribute=email_addresses', {
    values: {
      email_addresses: [lead.email],
      name: [{ first_name: given, last_name: rest.join(' '), full_name: lead.name }],
      jqt_role: lead.role,
    },
  });
  const pid = person.id.record_id;

  // Company / property, matched on its NAME. The email domain is kept as a
  // note to self and never used to match: one chain domain covers many hotels.
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const candidates = await query('companies', { filter: { name: { $contains: lead.company.split(' ').sort((a, b) => b.length - a.length)[0] } }, limit: 50 });
  let company = candidates.find(c => norm(title(c, 'name') || '') === norm(lead.company));
  const domain = lead.email.split('@')[1];
  if (!company) {
    company = await api('POST', '/objects/companies/records', {
      values: { name: lead.company, email_domain: domain, ...(lead.rooms ? { rooms: lead.rooms } : {}) },
    });
  } else if (lead.rooms && title(company, 'rooms') !== lead.rooms) {
    await api('PATCH', `/objects/companies/records/${company.id.record_id}`, { values: { rooms: lead.rooms } });
  }
  const cid = company.id.record_id;

  // Employer link, only when the person has none yet.
  if (!first(person, 'company')) {
    await api('PATCH', `/objects/people/records/${pid}`, { values: { company: [{ target_object: 'companies', target_record_id: cid }] } });
  }

  // An open deal for this person, this property and this line?
  const deals = await query('deals', {
    filter: { associated_company: { target_object: 'companies', target_record_id: cid } }, limit: 50,
  });
  const open = deals.find(d =>
    title(d, 'line') === t.line &&
    !CLOSED.includes(title(d, 'stage')) &&
    (d.values.associated_people || []).some(p => p.target_record_id === pid));

  const walk = lead.type === 'kept_walkthrough';
  let deal, action;
  if (open) {
    deal = open;
    const values = {};
    if (walk) {
      values.walkthrough_requested_at = lead.at;
      if (OPEN_STAGES_THAT_ADVANCE.includes(title(open, 'stage'))) values.stage = 'Walkthrough';
    }
    if (Object.keys(values).length) await api('PATCH', `/objects/deals/records/${open.id.record_id}`, { values });
    action = values.stage ? 'Updated deal, moved to Walkthrough' : 'Updated existing open deal';
  } else {
    const owner = await ownerId(api, env);
    const attr = Object.fromEntries(Object.entries(lead.attr).filter(([, v]) => v));
    deal = await api('POST', '/objects/deals/records', {
      values: {
        name: `${lead.company} · ${t.line}`,
        stage: walk ? 'Walkthrough' : 'New',
        owner: [{ referenced_actor_type: 'workspace-member', referenced_actor_id: owner }],
        line: t.line,
        entry_point: t.entry,
        associated_company: [{ target_object: 'companies', target_record_id: cid }],
        associated_people: [{ target_object: 'people', target_record_id: pid }],
        ...(walk ? { walkthrough_requested_at: lead.at } : {}),
        ...attr,
      },
    });
    action = walk ? 'Created deal at Walkthrough' : 'Created deal';
  }

  await api('POST', '/notes', {
    parent_object: 'deals', parent_record_id: deal.id.record_id,
    title: `${t.label} · ${lead.name}`, format: 'plaintext', content: noteBody(lead),
  });

  return { ok: true, action, url: deal.web_url || '' };
}

let OWNER;
async function ownerId(api, env) {
  if (OWNER) return OWNER;
  const members = await api('GET', '/workspace_members');
  const m = members.find(x => env.OWNER_EMAIL && x.email_address === env.OWNER_EMAIL) || members.find(x => x.access_level === 'admin') || members[0];
  OWNER = m.id.workspace_member_id;
  return OWNER;
}

function noteBody(l) {
  const lines = [
    `${TYPES[l.type].label}, ${new Date(l.at).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })} ET`,
    `${l.name} <${l.email}>, ${l.role}`,
    `${l.company}${l.rooms ? `, ${l.rooms} rooms` : ''}`,
  ];
  if (l.message) lines.push('', l.message);
  if (l.page) lines.push('', `Submitted on ${l.page}`);
  return lines.join('\n');
}

// ---------------------------------------------------------------- email

async function notify(lead, crm, env) {
  const t = TYPES[lead.type];
  const subject = `${t.line === 'Kept' ? 'Kept' : 'JQT'} lead: ${t.label}, ${lead.company} (${lead.name})`;
  const a = lead.attr;
  const body = [
    noteBody(lead),
    '',
    'Attribution',
    `  source ${a.utm_source || '-'} / medium ${a.utm_medium || '-'} / campaign ${a.utm_campaign || '-'} / content ${a.utm_content || '-'}`,
    `  landing ${a.landing_page || '-'}, referrer ${a.referrer || 'direct'}, first seen ${a.first_seen || '-'}`,
    '',
    crm.ok ? `Attio: ${crm.action}${crm.url ? `\n${crm.url}` : ''}` : `ATTIO FAILED, nothing was saved there: ${crm.error}`,
    '',
    'Reply to this email to answer them directly.',
  ].join('\n');

  const raw = mime({
    from: `JQT Leads <${env.FROM_ADDR}>`, to: env.NOTIFY_TO, replyTo: `${lead.email}`,
    subject, body, domain: env.FROM_ADDR.split('@')[1],
  });
  await env.NOTIFY.send(new EmailMessage(env.FROM_ADDR, env.NOTIFY_TO, raw));
}

function mime({ from, to, replyTo, subject, body, domain }) {
  const enc = (s) => /^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`;
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${enc(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(body).replace(/.{76}/g, '$&\r\n'),
  ];
  return lines.join('\r\n');
}

function b64(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const x of bytes) bin += String.fromCharCode(x);
  return btoa(bin);
}

export { validate, mime };
