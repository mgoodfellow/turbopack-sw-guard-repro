# Turbopack removes `if (!navigator.serviceWorker)` in production builds

A Turbopack production build treats `navigator.serviceWorker` as always truthy,
so a support check like this one is deleted from the client bundle:

```js
useEffect(() => {
  if (!navigator.serviceWorker) {
    // never reached: this branch is gone from the Turbopack bundle
    return;
  }
  navigator.serviceWorker.addEventListener('message', () => {});
}, []);
```

Browsers without service workers then throw instead of skipping the code. In
production we saw this crash iOS in-app browsers (WKWebView, the Google app,
Chrome on iOS), which do not expose `navigator.serviceWorker`.

`next build --webpack` keeps the check.

## Reproduce

```bash
pnpm install

# Turbopack (default)
pnpm build
pnpm check   # -> guard MISSING
pnpm start   # open http://localhost:3000/?nosw

# webpack, for comparison
pnpm build:webpack
pnpm check   # -> guard PRESENT
pnpm start   # open http://localhost:3000/?nosw
```

`?nosw` runs `delete Navigator.prototype.serviceWorker` before hydration to
simulate a browser without service worker support.

| Build | `/?nosw` shows |
| --- | --- |
| Turbopack | `guard was removed: Cannot read properties of undefined (reading 'addEventListener')` |
| webpack | `guard ran: no service worker support` |

`pnpm check` prints the compiled effect. Turbopack:

```js
(0,t.useEffect)(()=>{try{navigator.serviceWorker.addEventListener("message",()=>{}),s("service worker supported")}catch(e){...
```

webpack:

```js
(0,a.useEffect)(()=>{try{if(!navigator.serviceWorker)return void r("guard ran: no service worker support");navigator.serviceWorker.addEventListener(...
```

## Which spellings are affected

Built with Turbopack, Next.js 16.4.2 and 16.5.0-canary.19:

| Check | Survives the build |
| --- | --- |
| `if (!navigator.serviceWorker)` | no |
| `const sw = navigator.serviceWorker; if (!sw)` | no |
| `if (navigator.serviceWorker === undefined)` | yes |
| `if (typeof navigator.serviceWorker === 'undefined')` | yes |
| `if (!('serviceWorker' in navigator))` | yes |
| `if (!navigator?.serviceWorker)` | yes |
| `if (!window.navigator.serviceWorker)` | yes |
| `if (!navigator.clipboard)` (control) | yes |

Only truthiness checks on `navigator.serviceWorker` itself are folded. That
suggests the cause is Turbopack's well-known-object analysis, which models
`navigator.serviceWorker` to detect `navigator.serviceWorker.register(new URL(...))`
worker references and then treats the modelled object as truthy.

## Workaround

Use a spelling the analyzer doesn't fold, for example
`'serviceWorker' in navigator` or `Reflect.get(navigator, 'serviceWorker')`.
