/**
 * WC 2026 Family Challenge — Form Data
 *
 * To add a form, copy one of the objects below and fill in:
 *   id       — unique number (increment each time)
 *   name     — what shows on the card
 *   url      — your Google Form link
 *   deadline — when the form closes (YYYY-MM-DDTHH:MM:SS, local time)
 *              Match this to the deadline you set inside Google Forms.
 *
 * Homepage behaviour:
 *   - Open forms show with a live countdown.
 *   - After deadline: card stays for 3 hours (shows "Closed"), then disappears.
 *   - forms.html always lists every form regardless of deadline.
 */
// Deadline format: ISO 8601 with NPT offset (+05:45)
// All deadlines = 11:00 PM NPT on the US calendar date of the matchday.
// 11 PM NPT = 17:15 UTC = 1:15 PM ET = 10:15 AM PT — safely before any match kicks off.
const FORMS = [
  {
    id: 5,
    name: "M05 — Qatar vs Switzerland",
    url: "https://forms.gle/xfEDm5GGstA1cvHJ6",
    deadline: "2026-06-13T23:00:00+05:45"
  },
  {
    id: 6,
    name: "M06 — Brazil vs Morocco",
    url: "https://forms.gle/zdkZR6Rskp1A8TbQ6",
    deadline: "2026-06-13T23:00:00+05:45"
  },
  {
    id: 7,
    name: "M07 — Haiti vs Scotland",
    url: "https://forms.gle/fCDBSUY5L7ie521k8",
    deadline: "2026-06-13T23:00:00+05:45"
  },
  {
    id: 8,
    name: "M08 — Australia vs Türkiye",
    url: "https://forms.gle/n1pocqzirY9dQVkP9",
    deadline: "2026-06-13T23:00:00+05:45"
  }
];

/**
 * Leaderboard — Google Sheet config
 *
 * IMPORTANT: For the embedded view in the modal to work, you must publish
 * the sheet first:
 *   Google Sheets → File → Share → Publish to web →
 *   select the "Leaderboard" tab → Publish
 */
const LEADERBOARD = {
  embedUrl:  "https://docs.google.com/spreadsheets/d/1gDzLJzDPWOdX_LMPP4eL6KtU1OeC6_aIb4Aux-ydGHk/pubhtml?gid=934359014&single=true",
  directUrl: "https://docs.google.com/spreadsheets/d/1gDzLJzDPWOdX_LMPP4eL6KtU1OeC6_aIb4Aux-ydGHk/edit?gid=934359014#gid=934359014"
};
