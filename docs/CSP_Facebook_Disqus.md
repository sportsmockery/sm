# Content Security Policy: Facebook SDK (Disqus)

If the console shows:

```text
Loading the script 'https://connect.facebook.net/en_US/bundle/sdk.js/' violates the following Content Security Policy directive: "script-src ... https://connect.facebook.net/en_US/sdk.js ..."
```

the policy allows `sdk.js` but the Facebook SDK is loading `bundle/sdk.js`. Fix it by allowing the bundle URL (or the whole origin) in **script-src** wherever your CSP is defined.

## Where CSP might be set

- **Vercel:** Project → Settings → Security → Headers (or similar). Add to `script-src`:
  - `https://connect.facebook.net/en_US/bundle/sdk.js`, or
  - `https://connect.facebook.net` (allows any script from that host).
- **Disqus:** If the violation is inside a Disqus iframe, the policy may be from Disqus; check Disqus admin / embed settings.
- **WordPress / proxy:** If the Next app is behind a proxy or WordPress, CSP may be set there; add the same value to that policy’s `script-src`.

## Example addition to script-src

Append one of these to your existing `script-src` list:

- `https://connect.facebook.net/en_US/bundle/sdk.js`
- `https://connect.facebook.net` (broader; allows all Facebook connect scripts)

This repo does not set a global CSP in `next.config.ts`; the violation is resolved by updating the place that does send the policy (e.g. Vercel or the embed provider).
