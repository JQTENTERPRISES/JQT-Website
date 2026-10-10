// Creates the Attio schema the lead Worker writes to. Safe to re-run: anything
// that already exists is left alone. Token is read from ~/JQT/.attio_token and
// never printed.
//   node worker/attio-schema.mjs
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const TOKEN = readFileSync(`${homedir()}/JQT/.attio_token`, 'utf8').trim();
const api = async (method, path, body) => {
  const r = await fetch(`https://api.attio.com/v2${path}`, {
    method, headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify({ data: body }) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${method} ${path} ${r.status} ${j.message || ''}`);
  return j.data;
};

const ATTRS = {
  deals: [
    ['Line', 'line', 'select', ['Kept', 'JQT Project']],
    ['Entry point', 'entry_point', 'select', ['Rowan gate', 'Walkthrough request', 'JQT form']],
    ['Source', 'utm_source', 'text'],
    ['Medium', 'utm_medium', 'text'],
    ['Campaign', 'utm_campaign', 'text'],
    ['Content', 'utm_content', 'text'],
    ['Landing page', 'landing_page', 'text'],
    ['Referrer', 'referrer', 'text'],
    ['First seen', 'first_seen', 'timestamp'],
    ['Walkthrough requested', 'walkthrough_requested_at', 'timestamp'],
  ],
  companies: [
    ['Rooms', 'rooms', 'select', ['Under 50', '50 to 99', '100 to 150', '151 to 250', '250+']],
    ['Email domain', 'email_domain', 'text'],
  ],
  people: [
    ['Role', 'jqt_role', 'select', ['Owner', 'General Manager', 'Operations', 'Housekeeping leadership', 'Other']],
  ],
};

for (const [obj, list] of Object.entries(ATTRS)) {
  const have = new Set((await api('GET', `/objects/${obj}/attributes`)).map(a => a.api_slug));
  for (const [title, slug, type, options] of list) {
    if (!have.has(slug)) {
      await api('POST', `/objects/${obj}/attributes`, {
        title, api_slug: slug, type, description: null, is_required: false, is_unique: false,
        is_multiselect: false, config: {},
      });
      console.log(`created ${obj}.${slug}`);
    }
    if (options) {
      const got = new Set((await api('GET', `/objects/${obj}/attributes/${slug}/options`)).map(o => o.title));
      for (const t of options) if (!got.has(t)) { await api('POST', `/objects/${obj}/attributes/${slug}/options`, { title: t }); console.log(`  option ${t}`); }
    }
  }
}

// Stages. Attio orders statuses by creation, so the four defaults are renamed in
// place to the first four stages and Won and Lost are appended after them.
const WANT = ['New', 'Qualified', 'Walkthrough', 'Pilot / Proposal', 'Won', 'Lost'];
let st = (await api('GET', '/objects/deals/attributes/stage/statuses')).filter(s => !s.is_archived);
if (st.map(s => s.title).join('|') !== WANT.join('|')) {
  const defaults = ['Lead', 'In Progress', 'Won 🎉', 'Lost'];
  if (st.map(s => s.title).join('|') !== defaults.join('|')) throw new Error('stages are neither default nor target, fix by hand: ' + st.map(s => s.title));
  for (let i = 0; i < 4; i++) await api('PATCH', `/objects/deals/attributes/stage/statuses/${st[i].id.status_id}`, { title: WANT[i], celebration_enabled: false });
  await api('POST', '/objects/deals/attributes/stage/statuses', { title: 'Won', celebration_enabled: true });
  await api('POST', '/objects/deals/attributes/stage/statuses', { title: 'Lost', celebration_enabled: false });
  console.log('stages set');
}
st = (await api('GET', '/objects/deals/attributes/stage/statuses')).filter(s => !s.is_archived);
console.log('stages:', st.map(s => s.title).join(' > '));
