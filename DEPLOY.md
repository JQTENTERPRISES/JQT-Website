# Deploying jqtenterprises.com

Static site on GitHub Pages, served through Cloudflare. Pushing to `main`
publishes, usually within a minute or two.

    git push origin main

There is no build step. What is in the repository is what is served.

---

## Security headers

**Status as of 2026-09-06: not yet applied. The live site sends none.**

A scan grades the site F for this, and the reason is worth stating plainly rather
than filing under housekeeping: this site spends most of its length arguing that
Kept is built with unusual care, and Kept genuinely is. `kept.jqtenterprises.com`
sends a full header suite with 26 QA assertions guarding it. The site selling it
sends nothing. Anyone technical who checks finds that gap in fifteen seconds, and
the buyer most likely to check is the one who reads the record section.

### Why it is not already fixed

GitHub Pages cannot set custom response headers. That is a real constraint of the
host, not an oversight in the repository, and no file committed here can change
it. The apex is proxied through Cloudflare, which can.

### The fix

Cloudflare dashboard, `jqtenterprises.com` zone:

**Rules → Transform Rules → Modify Response Header → Create rule**

Name it `security headers`. Condition: `Hostname equals jqtenterprises.com`.
Then add each of the following as a **Set static** header.

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()` |

And the content security policy, as one line:

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

### Why the policy says what it says

Every clause was derived from what the site actually loads, not copied from a
template, because a content security policy assembled from a template is a policy
that breaks the page.

- `style-src` allows `fonts.googleapis.com` and `font-src` allows
  `fonts.gstatic.com` because the typefaces are loaded from Google. Self hosting
  the fonts would let both of those go, and would close the privacy disclosure in
  the privacy policy at the same time. One job, two problems.
- `'unsafe-inline'` on **script-src** is forced by 14 inline `onclick` handlers on
  the homepage. Moving those to `addEventListener` would let it be dropped, which
  is the single biggest available improvement to this policy and is a real piece
  of work rather than a settings change.
- `'unsafe-inline'` on **style-src** is forced by the inline `<style>` block in
  every page. Both pages are deliberately self contained.
- `form-action 'self'` rather than `'none'`: there are no forms today, and `'self'`
  means adding one later does not silently break.
- `img-src` needs `data:` for the inline SVG favicon.
- `frame-ancestors 'none'` is the clause that does actual work here. It stops the
  site being embedded inside somebody else's page, which is how a brand gets used
  as the front of a phishing flow.
- `upgrade-insecure-requests` is cheap insurance against a future relative URL
  being written as `http://`.

`schema.org` and `instagram.com` appear in the source but need no allowance.
The first is a JSON-LD vocabulary string and the second is a link target. Neither
is a resource the browser fetches.

### After applying

    curl -sI https://jqtenterprises.com/ | grep -iE 'content-security|strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy'

Six lines back means it took. Zero means the rule is saved but not deployed, or
the hostname condition does not match.

### Honest scope

This is a static site with no forms, no cookies and no login, so the genuinely
exploitable surface is small. Two of these headers do real work, `frame-ancestors`
and HSTS. The rest is grade. That is not a reason to skip it, because the grade is
the part a prospect sees, but it is a reason not to treat it as an emergency.

---

## Hostnames

| Host | Serves | Cloudflare |
|---|---|---|
| `jqtenterprises.com` | This repository, via GitHub Pages | Proxied, orange |
| `kept.jqtenterprises.com` | Kept production, on the droplet | **DNS only, grey** |
| `demo.kept.jqtenterprises.com` | The public Kept demo | **DNS only, grey** |

The two Kept hosts must stay grey. Caddy terminates TLS on the droplet and
proxying them breaks its certificate renewal. That is why the header rule above
is scoped to the apex hostname rather than applied zone wide.
