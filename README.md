# Nostr Comments

A web comment component based on the Nostr network, implementing the [NIP-22](https://github.com/nostr-protocol/nips/blob/master/22.md) protocol (Web part), using the `I` tag to identify URLs.

## Features

- **NIP-22 Protocol**: Uses kind:1111 events, supports comments and replies
- **Multiple Login Methods**:
  - NIP-07 browser extensions (Alby, nos2x, etc.)
  - NIP-46 Bunker remote signing
  - Temporary account (locally generated key pair)
- **Multilingual**: 20 languages built-in (en, zh-CN, zh-TW, ja, ko, es, fr, de, pt, ru, ar, it, nl, pl, tr, vi, th, id, hi, uk), supports custom translations
- **Themes**: Light, dark, auto (follows system), easy customization with a few CSS variables
- **Headless Mode**: Disable default styles for fully custom UI

## Installation

```bash
npm install nostr-comments
```

## Quick Start

### React/Preact Usage

```tsx
import { NostrComments } from "nostr-comments";

function App() {
  return <NostrComments url="https://example.com/blog/my-post" locale="en" />;
}
```

## API

### NostrComments Component Props

| Prop                 | Type                                | Default            | Description                                                |
| -------------------- | ----------------------------------- | ------------------ | ---------------------------------------------------------- |
| `url`                | `string`                            | **Required**       | Web page URL, used to identify comment scope               |
| `mention`            | `string`                            | -                  | Public key to mention in comments (receives notifications) |
| `relays`             | `string[]`                          | Default relay list | List of Nostr relay addresses                              |
| `pageSize`           | `number`                            | `50`               | Number of comments per page                                |
| `locale`             | `string`                            | Auto-detect        | Interface language (20 languages supported)                |
| `translations`       | `Partial<Translations>`             | -                  | Custom translation text                                    |
| `theme`              | `'light' \| 'dark' \| 'auto'`       | `'auto'`           | Theme mode                                                 |
| `headless`           | `boolean`                           | `false`            | Enable Headless mode                                       |
| `classNames`         | `object`                            | -                  | Custom CSS class names                                     |
| `signer`             | `Signer`                            | -                  | External signer instance (skips login modal when provided) |
| `enabledSigners`     | `('nip07' \| 'bunker' \| 'temp')[]` | All enabled        | Enabled login methods                                      |
| `pow`                | `number`                            | `18`               | POW difficulty (leading zero bits) to prevent spam         |
| `onCommentPublished` | `(event: NostrEvent) => void`       | -                  | Callback when comment is published                         |
| `onError`            | `(error: Error) => void`            | -                  | Error callback                                             |

### classNames Object

```ts
{
  root?: string       // Root container
  list?: string       // Comment list
  item?: string       // Comment item
  editor?: string     // Editor
  loginModal?: string // Login modal
}
```

## Examples

### Custom Relays

```tsx
<NostrComments
  url="https://example.com/post/123"
  relays={["wss://relay.damus.io", "wss://relay.nostr.band", "wss://nos.lol"]}
/>
```

### Dark Theme

```tsx
<NostrComments url="https://example.com/post/123" theme="dark" />
```

### Custom Translations

```tsx
<NostrComments
  url="https://example.com/post/123"
  locale="en"
  translations={{
    comments: "Discussion",
    writeComment: "Share your thoughts...",
    publish: "Post",
    noComments: "Start the conversation!",
    keyCompatibility: "This key works with any Nostr app!",
  }}
/>
```

### Anti-Spam with POW

```tsx
<NostrComments url="https://example.com/post/123" pow={18} />
```

Requires commenters to compute a proof-of-work (NIP-13) before publishing. Higher values = more computation time = stronger spam prevention. Recommended: 10-20 bits.

### Extension Login Only

```tsx
<NostrComments url="https://example.com/post/123" enabledSigners={["nip07"]} />
```

### External Signer

Pass your own signer instance to skip the built-in login modal:

```tsx
import { NostrComments, Nip07Signer, TempSigner } from "nostr-comments";

// Use NIP-07 extension
const signer = new Nip07Signer();

// Or use a temporary signer
const signer = new TempSigner();

// Or any object that implements the Signer interface
const customSigner = {
  getPublicKey: async () => "your-pubkey",
  signEvent: async (event) => signedEvent,
};

<NostrComments url="https://example.com/post/123" signer={signer} />;
```

### Headless Mode

```tsx
<NostrComments
  url="https://example.com/post/123"
  headless={true}
  classNames={{
    root: "my-comments",
    list: "my-comments-list",
    editor: "my-editor",
  }}
/>
```

## CSS Variables

The component uses CSS variables for theme customization. Only a few base colors need to be set — all secondary, hover, border, and muted colors are **automatically derived** via `color-mix()`.

### Base Colors (override these to customize)

```css
.nostr-comments {
  --nc-bg: #ffffff; /* Background for inputs, modals */
  --nc-text: #1f2937; /* Primary text color */
  --nc-primary: #2563eb; /* Accent/brand color */
  --nc-error: #dc2626; /* Error states */
  --nc-success: #16a34a; /* Success states */
}
```

All other color variables (`--nc-bg-secondary`, `--nc-bg-hover`, `--nc-border`, `--nc-text-secondary`, `--nc-text-muted`, `--nc-primary-hover`, `--nc-primary-light`, `--nc-error-light`, `--nc-success-light`) are derived automatically from the base colors.

### Custom Theme Example

```css
/* A custom purple theme — works for both light and dark */
.nostr-comments {
  --nc-bg: #1a1a2e;
  --nc-text: #eaeaea;
  --nc-primary: #e94560;
}
```

For dark mode, override the base colors under `[data-theme="dark"]` or `[data-theme="auto"]` with `prefers-color-scheme: dark`. The derived colors will adjust automatically.

### Other Variables

```css
.nostr-comments {
  /* Spacing */
  --nc-space-xs: 4px;
  --nc-space-sm: 8px;
  --nc-space-md: 12px;
  --nc-space-lg: 16px;
  --nc-space-xl: 24px;

  /* Border Radius */
  --nc-radius-sm: 8px;
  /* button, textarea radius */
  --nc-radius-md: 12px;
  --nc-radius-lg: 16px;
  /* modal radius */
  --nc-radius-xl: 24px;

  /* Avatar Border Radius */
  --nc-avatar-radius: 50%;
}
```

## Advanced Usage

### Using Standalone Hooks

```tsx
import { useComments, useSigner } from "nostr-comments";

function CustomComments({ url }) {
  const { comments, loading, addEvent } = useComments({ url });
  const { signer, loginWithNip07 } = useSigner();

  // Custom UI...
}
```

### Using Service Functions

```tsx
import { publishComment, subscribeComments } from "nostr-comments";

// Publish a comment
const event = await publishComment(signer, relays, {
  url: "https://example.com/post",
  content: "Great post!",
});

// Subscribe to comments
const unsubscribe = subscribeComments({
  url: "https://example.com/post",
  relays,
  onEvent: (event) => console.log("New comment:", event),
});
```

### Custom Signers

```tsx
import { Nip07Signer, TempSigner, BunkerSigner } from "nostr-comments";

// NIP-07 extension
const nip07 = new Nip07Signer();
const pubkey = await nip07.getPublicKey();

// Temporary account
const temp = new TempSigner();
const nsec = temp.getNsec(); // Export private key
temp.downloadKeyFile(); // Download key file

// Bunker
const bunker = BunkerSigner.create("bunker://pubkey?relay=wss://...");
await bunker.connect();
```

## NIP-22 Event Format

### Top-level Comment

```json
{
  "kind": 1111,
  "content": "Nice article!",
  "tags": [
    ["I", "https://example.com/post/123"],
    ["K", "web"],
    ["i", "https://example.com/post/123"],
    ["k", "web"]
  ]
}
```

### Reply Comment

```json
{
  "kind": 1111,
  "content": "I agree!",
  "tags": [
    ["I", "https://example.com/post/123"],
    ["K", "web"],
    ["e", "<parent_event_id>", "<relay_hint>", "<parent_pubkey>"],
    ["k", "1111"],
    ["p", "<parent_pubkey>"]
  ]
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build
npm run build
```

## License

MIT
