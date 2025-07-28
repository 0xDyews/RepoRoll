# RepoRoll

A GitHub repository discovery app I built because I got tired of endlessly scrolling through GitHub looking for interesting projects.

## What it does

RepoRoll shows you GitHub repositories one at a time, learns what you like, and gets better at finding stuff you'll actually want to see. It's like Tinder for GitHub repos, but without the awkward conversations.

## Features

- **Smart recommendations** - The more you like, the better it gets
- **Dark mode** - Because staring at bright screens sucks
- **Works on mobile** - Tested on my phone, works fine
- **No account needed** - Everything stays on your device
- **Keyboard shortcuts** - Spacebar to skip, arrows to navigate

## How to use

1. Open `index.html` in your browser
2. Click the heart if you like a repo, thumbs down if you don't
3. Save interesting ones for later
4. Check out your stats to see your journey

That's it. No complicated setup, no accounts, no BS.

## Project structure

```
RepoRoll/
├── index.html          # Main file - just open this
├── styles/main.css     # All the styling
├── js/
│   ├── app.js         # Main logic
│   ├── pages.js       # Page handling
│   └── utils.js       # Helper functions
└── README.md          # This file
```

## How it works

The app fetches repos from GitHub's API, shows them one at a time, and remembers what you like. It uses your likes to prioritize similar repos while still showing you variety.

Your data stays on your device using localStorage. No tracking, no analytics, no creepy stuff.

## Customization

Want to change something? The code is pretty straightforward:

- `main.css` - Change colors, fonts, layout
- `app.js` - Add new features or modify behavior
- `pages.js` - Add new pages or modify existing ones
- `utils.js` - Helper functions and constants

## Browser support

Works on Chrome, Firefox, Safari, Edge. Probably works on other browsers too, but I haven't tested them.

## Mobile

Works fine on phones. The UI adapts to smaller screens and touch interactions.

## Performance

- Lazy loads images and content
- Caches data locally
- Debounces API calls to avoid rate limits
- Handles errors gracefully

## Contributing

Found a bug? Want to add a feature? Feel free to submit a PR or open an issue. I'm open to suggestions.

Some ideas for improvements:
- Better filtering options
- More detailed analytics
- Export/import functionality
- More customization options

## License

MIT License - do whatever you want with it.

---

Built because I was bored and wanted to discover cool GitHub projects more efficiently. Hope you find it useful! 