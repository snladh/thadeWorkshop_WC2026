# WC 2026 Family Challenge

A family prediction game built for FIFA World Cup 2026. Cousins submit match predictions through Google Forms, earn points based on results, and compete on a live leaderboard - all in one place.

**Live site:** [snladh.github.io/thadeWorkshop_WC2026](https://snladh.github.io/thadeWorkshop_WC2026/)

---

## What It Does

- **Leaderboard** — pulls live standings directly from a Google Sheet and displays them in a styled table with gold, silver, and bronze rankings
- **Upcoming Forms** — shows active prediction forms with a live countdown to each deadline. Forms automatically disappear 3 hours after closing
- **Form Archive** — a separate page listing every form ever posted, past and upcoming, with open/closed status
- **Match Schedule** — local schedule data (`data/schedule.json`) covering group stage fixtures used to set form deadlines

---

## How It Works

Each matchday, a new Google Form is posted for that day's matches. Participants fill in their predictions before the 11 PM NPT deadline (which corresponds to before kick-off in US time). After results are in, scores are updated in the Google Sheet and the leaderboard refreshes automatically on next open.

**Deadline logic:** All deadlines are set to 11:00 PM NPT (UTC+05:45) on the US calendar date of the matchday. This lands safely before any match kicks off regardless of timezone.

---

## Project Structure

```
├── index.html           # Homepage
├── forms.html           # All forms archive
├── css/
│   └── style.css        # Full site styles (dark WC theme)
├── js/
│   ├── forms-data.js    # Form links, deadlines, and leaderboard config — edit this to add new forms
│   ├── main.js          # Homepage logic: leaderboard fetch, countdown timers
│   └── forms-page.js    # Forms archive page logic
├── images/
│   ├── wc2026-official-logo.png    # FIFA WC 2026 official logo (hero section)
│   └── ronaldo-messi-banner.webp   # Rivalry banner (leaderboard modal)
└── data/
    └── schedule.json    # Group stage match schedule (matches 1-20) with dates and kickoff times
```

---

## Adding New Forms

Open `js/forms-data.js` and add an entry to the `FORMS` array:

```js
{
  id: 9,
  name: "M09 · Team A vs Team B",
  url: "https://forms.gle/your-form-link",
  deadline: "2026-06-14T23:00:00+05:45"  // 11 PM NPT on matchday
}
```

That is the only file that needs to be touched for regular match-day updates.

---

## Leaderboard Setup

The leaderboard pulls data from a published Google Sheet (Leaderboard tab). For it to work the sheet must be published:

1. Open the Google Sheet
2. File > Share > Publish to web
3. Select the **Leaderboard** tab
4. Click **Publish**

The site fetches a CSV export and renders it — no embed, no iframe, fully custom styled.

---

## Tech Stack

Pure HTML, CSS, and vanilla JavaScript. No frameworks, no build step, no dependencies. Hosted on Netlify with automatic deploys on every push to `main`.

---

*Built by ThadeWorkshop · WC 2026 · Jay Lakuwa Kot Kalika!*
