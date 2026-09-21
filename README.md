# Recura — interactive concept pitch

A single-page interactive pitch for **Recura**, a repeat-revenue and CRM integration layer
for cash-pay clinics (med spas, weight-loss, hormone, dental aesthetics).

Built for CRM platform teams: it shows the clinic problem, the product model, the two-sided
economics, and how Recura would integrate with Salesforce, HubSpot, Dynamics 365, Zoho,
GoHighLevel, Keap, and anything else via API.

> Concept stage. The numbers are modelled, the integrations are designed, and nothing here
> is shipped software. That is stated on the page itself.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page — content and structure |
| `styles.css` | Local Marketing Geeks house theme (light-only), tokens at the top |
| `app.js` | All interactive modules, no dependencies |

## Running it locally

Any static server. For example:

```bash
python -m http.server 8123
```

Then open <http://127.0.0.1:8123>. Opening `index.html` directly via `file://` works too,
though some browsers restrict local file loading.

## Deploying

Static site, no build step, no framework, no environment variables.

- **Vercel:** import the repo and deploy. Framework preset "Other", build command empty,
  output directory `.`
- **CLI:** `npx vercel --prod` from this folder.

Fonts load from Google Fonts. Everything else ships with the repo.

## Interactive pieces

- Live counter of revenue lost to unsold appointment slots
- Flip cards covering six recurring complaints about tools in this category
- A five-step walkthrough of one empty slot being filled, phone and clinic console side by side
- A clinic week that fills itself, with the reason each patient was chosen
- **Proof lab** — a holdout simulation: set the true lift to zero and the success fee goes to zero
- A two-sided revenue simulator for clinic and platform
- An interactive revenue mix and a CRM integration board with a live data-flow pipeline
