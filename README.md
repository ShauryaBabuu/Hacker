# SHAURYA BABU — Hacker Landing Page

A cinematic, hacker-themed personal landing page for GitHub Pages.

## Deploy

1. Upload all files to a GitHub repository (keep structure intact)
2. Go to **Settings → Pages → Source → main branch / root**
3. Done. Live in ~60 seconds.

## Structure

```
/
├── index.html       ← Entry point
├── style.css        ← All styles, animations, layout
├── script.js        ← All canvas + terminal animations
└── assets/
    ├── images/      ← Drop custom images here
    ├── fonts/       ← Drop custom fonts here (woff2)
    └── icons/       ← Drop favicon/icons here
```

## Customization

- **Name**: Edit `index.html` — change `SHAURYA BABU` in the `glitch-wrapper` div
- **Subtitle lines**: Edit `script.js` → `initSubtitle()` → `lines` array
- **Terminal commands**: Edit `script.js` → `initTerminal()` → `SEQUENCES` array
- **Colors**: All in `style.css` → `:root` CSS variables

## Features

- Matrix digital rain (top-left)
- Rotating wireframe humanoid with scan ring (top-right)
- Live simulated hacker terminal (bottom-left)
- Animated network node graph (bottom-right)
- Glitch name with neon glow (center)
- Scanlines, screen flicker, typewriter subtitle
- Zero dependencies, zero backend
