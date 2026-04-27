# HTML Presentation Project

A lightweight, static HTML presentation scaffold for science and engineering topics.

## Structure

- `index.html`: Landing page with navigation cards.
- `topics/*.html`: Individual topic pages.
- `assets/images`: Place presentation images here.
- `assets/icons`: Place custom icons here.
- `prompts/html-template-prompt.md`: Prompt template for generating additional pages.

## Run locally

Open `index.html` in your browser, or serve the folder:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080/html-presentation-project/`.

## Add a new topic

1. Duplicate a file from `topics/`.
2. Update title, summary, and bullets.
3. Add a card link in `index.html`.
