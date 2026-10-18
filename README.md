# Art site

Static portfolio site. Plain HTML, CSS, and JS. No build step, no dependencies, no npm.

```
index.html          Home: hero, collage, about, merch teaser, contact
work.html           Gallery with filters and lightbox, plus process
merch.html          Products, wired for hosted checkout
assets/css/site.css All styling. Theme variables at the top.
assets/js/site.js   Filters, lightbox, scroll reveal
assets/img/         Placeholder SVGs, replace with real photos
```

Open `index.html` in a browser to preview. For local testing with correct paths:

```bash
python3 -m http.server 8000     # then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a repo and push these files to `main`.
2. Settings, Pages, Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Live at `https://username.github.io/reponame` in about a minute.

### Custom domain

1. Add a file named `CNAME` at the repo root containing only your domain, e.g. `example.com`.
2. At your registrar, create four A records for the apex pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a CNAME for `www` pointing to `username.github.io`.
3. Back in Settings, Pages, enter the domain and check "Enforce HTTPS" once the cert issues (can take up to an hour).

## Changing the color scheme

Every color lives in one block at the top of `assets/css/site.css`:

```css
:root {
  --paper:       #eee6dd;   /* page background */
  --paper-alt:   #f8f6f5;   /* alternating sections */
  --ink:         #323232;   /* text, rules, borders */
  --accent:      #94badd;   /* offset blocks behind images */
  --accent-soft: #d9e5f1;   /* hovers, image loading state */
  --scrim:       rgba(30, 28, 26, 0.94); /* lightbox backdrop */
}
```

Change those values and the whole site follows. No other rule in the stylesheet hardcodes a color.

Fonts are in the same block under "Typography roles", loaded from Google Fonts in each page's `<head>`. Swapping a face means changing the `<link>` and the `--display` / `--caps` / `--body` variable.

## Replacing the placeholder images

The placeholders are SVGs so the layout renders before real photos exist. To swap one:

1. Drop your JPG in `assets/img/`.
2. Change the `src` in the HTML from `assets/img/hero.svg` to `assets/img/hero.jpg`.
3. Update the `alt` text to describe the actual image.

Before uploading, resize to about 1600px on the long edge and export at 80% quality. Phone photos run 4 to 8 MB each and will make the site crawl on mobile data. Roughly 300 KB per image is the target.

Optional but worth it later: convert to WebP and serve both with `<picture>`.

## Adding a piece to the gallery

In `work.html`, copy any `<figure>` block inside `.grid` and change four things: the image path, the `alt` text, the `data-category` (`murals`, `live`, or `studio`), and the caption. The filter buttons and lightbox pick it up automatically.

## Where the about content lives

There are three pages and three nav tabs. The bio, the "how I work" list, and the contact card are sections on the home page (`#about` and `#contact`), not a fourth page. The "Inquire" buttons on the other pages link to `index.html#contact`.

If you later want About as its own tab, move those two `<section>` blocks into a new `about.html`, add a fourth `<li>` to the nav on every page, and change `index.html#contact` to `about.html#contact` in the two places it appears.

## Merch checkout

There is deliberately no cart in this repo. The "Buy" buttons are `<a href="#" data-buy>` placeholders waiting for a hosted checkout link, which keeps payment handling, sales tax, and card data entirely off this site.

Options, roughly in order of least work:

- **Gumroad**: paste an overlay link. Best for digital plus simple physical goods.
- **Square Online checkout links**: one link per item, no monthly fee.
- **Shopify Buy Button**: a script snippet per product, real cart, $ per month. Pairs with Printful for print on demand so you never touch inventory.
- **Etsy**: just link out. Zero integration, highest fees, brings its own traffic.

Whichever you pick, the change is replacing `href="#"` with their link.

## Contact form

The contact page uses `mailto:`, which needs no server. If you want a real form, GitHub Pages cannot process one, so use a third party endpoint like Formspree or Netlify Forms (the latter requires hosting on Netlify instead).

## Before launch

- [ ] Replace "Artist Name" and "Studio Name" throughout all three HTML files
- [ ] Replace `hello@example.com` and the phone number
- [ ] Point the Instagram links at the real profile
- [ ] Swap every placeholder image and write real alt text
- [ ] Replace `assets/img/social-card.svg` with a 1200x630 JPG and update the `og:image` path
- [ ] Check the title and description in each page's `<head>`
- [ ] Trim the gallery to your strongest eight or ten pieces
