# NPAS website: HTML + CSS prototype

Open `index.html` in a browser. All pages link to each other.

## Files
- `index.html` Home · `events.html` · `event-detail.html` (Space Week 2026) · `register.html` · `tenures.html` · `blog.html` · `blog-post.html` · `about.html` · `contact.html`
- `css/styles.css` one shared stylesheet (colours and spacing are variables at the top)
- `js/main.js` small script: sticky navbar, countdown, filters, tabs, form steps, lightbox

## Where to drop your assets
| Placeholder | What to do |
|---|---|
| Logo (navbar, footer) | Search `LOGO PLACEHOLDER` and replace the `<span class="logo-slot">` with `<img src="assets/images/npas-logo.svg" alt="NPAS logo">`. Use a transparent PNG/SVG. |
| Hero video | Put the file at `assets/videos/hero.mp4`, then uncomment the `<source>` line in `index.html` (search `HERO VIDEO PLACEHOLDER`). Delete the `slot-tag` label. |
| Second video | `assets/videos/reel.mp4`, same method (search `SECOND VIDEO PLACEHOLDER`). |
| People photos | Every person uses the same `.portrait` card. Uncomment the `<img>` inside `.portrait-photo` and point it to `assets/people/NAME.jpg`. Use square photos. |
| Event / blog / poster images | Uncomment the `<img>` comment inside any `.ph` block. |
| NUST map | `contact.html`, search `MAP PLACEHOLDER`. |
| Favicon | `assets/images/favicon.png` |

## Sample data
Everything dated 2024 onward (stats, Space Week 2026 schedule, 2024-27 tenure names, guest speakers) is fabricated. The tenure panels are marked `SAMPLE DATA` in comments.
The forms only show success screens. Your registration team connects the real submission later.
