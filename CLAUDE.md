# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nostr Comments is a web component library for decentralized commenting using the Nostr protocol. It implements NIP-22 (kind:1111 events) for comments. Built with React, it works as a React component or via CDN.

## Commands

- `npm run dev` - Start dev server on port 5175
- `npm run build` - Build library (vite build + TypeScript declarations)
- `npm run preview` - Preview built distribution
- `npm run demo` - Start demo site dev server
- `npm run build:demo` - Build demo site to `demo-dist/`

No test or lint commands are configured.

## Architecture

### Core Structure

```
/src
├── /components      # UI components (CommentList, CommentEditor, LoginModal, etc.)
├── /hooks           # Custom hooks (useSigner, useComments, useProfile)
├── /services        # Nostr operations (nostr.ts, comment.ts, reaction.ts)
├── /signers         # Auth implementations (Nip07Signer, TempSigner, BunkerSigner)
├── /i18n            # Internationalization (20 languages in /locales)
├── /utils           # Helpers (nip22.ts, avatar.ts, storage.ts)
├── /styles          # CSS with custom properties for theming
└── NostrComments.tsx  # Main component wrapper
/demo               # Demo site (App.tsx, demo.css)
```

### Key Patterns

**Component Hierarchy:** `NostrComments` → `NostrCommentsInner` → `CommentEditor`, `CommentList`, `LoginModal`

**Service Layer:** `nostr.ts` wraps SimplePool from nostr-tools; `comment.ts` provides high-level operations

**Signer Abstraction:** Common `Signer` interface with `getPublicKey()` and `signEvent()` methods. Three implementations for NIP-07 browser extensions, NIP-46 Bunker remote signing, and temporary accounts.

**State Management:** useSyncExternalStore for global signer state; local state with useState

**Two-Level Comment Tree:** Root comments and direct replies, with nested replies supported via `replyTo` metadata

### Nostr Protocol Details

- Comment events: kind 1111 (NIP-22)
- URL identification via `#I` tag (case-sensitive)
- Relay communication uses SimplePool with subscription/EOSE pattern

### Styling

CSS uses `nc-` prefix namespace. Theme support via `data-theme` attribute (light/dark/auto). The root container has no background (transparent) for easy integration. CSS custom properties in `variables.css` define a few base colors (`--nc-bg`, `--nc-text`, `--nc-primary`, `--nc-error`, `--nc-success`); all secondary/hover/border/muted colors are derived via `color-mix()`. Headless mode available via `data-headless` attribute.

### Build Output

- UMD: `/dist/nostr-comments.umd.js`
- ES modules: `/dist/nostr-comments.js`
- CommonJS: `/dist/nostr-comments.cjs`
- Styles: CSS is auto-injected via JS (no separate CSS file needed)

## Development Guidelines

**Icons:** Use [Lucide](https://lucide.dev/) icons instead of hand-writing SVGs. Import from `lucide-react`.

When modifying component APIs (props changes, new features, breaking changes) or adding new functionality, update the following documentation:
- `README.md` - Usage examples and API reference
- This file (`CLAUDE.md`) - Architecture sections if structural changes occur
