# Plan: Login page + Weekly/Monthly progress dashboard

## Context
Two additions to DevTrack (`work-tracker.html`, single self-contained file, no backend):
1. A login page with test credentials. It is a client-side demo gate, not real security.
2. A visual progress dashboard with **Weekly** and **Monthly** views, using KPI tiles (the user's earlier choice) with change vs the previous period.

All edits are in `D:\spuranik\IISC_Technobytes_ClaudeAI_Workshop\project\work-tracker.html`. No new files.

## Part 1: Login
1. Add `TEST_CREDENTIALS` next to `TEST_PROFILE` (~line 254): username `testuser01` (matches `TEST_PROFILE.username`), password `Test@1234`.
2. Add a full-screen `#loginScreen` overlay using the existing `.modal-bg` / `.modal` / `.form-grid` styles and CSS variables (dark theme works). It has username and password inputs, a show-password toggle, a Sign in button, an inline error for bad credentials (no native `alert`), and a "Demo credentials" hint with a Fill button.
3. Session: on success set `sessionStorage['devtrack-auth']`. On load, if unset, show the login screen and hide `<header>` and `<main>`; otherwise run the existing `applyTheme(); renderAll();`. Keep this key separate from `devtrack-v1` so Export/Import is unaffected.
4. Add a Logout button in the header next to the profile chip; it clears the key and shows the login screen.

## Part 2: Progress tab (Weekly / Monthly)
1. Add a **Progress** nav button and `<section class="view" id="view-progress" hidden>` with a Week | Month segmented toggle, a period label (e.g. "Oct 27 – Nov 2" or "October 2026"), prev/next buttons, and a `<div class="stats" id="progressStats">`. Extend the nav handler (~line 569) to call `renderProgress()`.
2. `renderProgress()` (new, near `renderDashboard`) with module-level `period` ('week' | 'month') and `offset`. The range is Monday to Monday for week, calendar month for month. Tiles reuse `.stats` / `.stat` / `.label` / `.value` CSS plus a small new `.delta` class (green up / red down via `--green` / `--red`) comparing against the previous period:
   - Tasks completed (`completedAt` in range)
   - Tasks started (`startedAt` in range)
   - Bugs closed (type `bug`, completed in range)
   - Overdue now
   - Hours logged (sum of `hours(t)` for tasks completed in range)
   - Standup entries written (`state.logs` dates in range)
3. Call `renderProgress()` from `renderAll()` (~line 537). Reuse `hours()`, `fmtH()`, `esc()`, `today()`.

**Known limitation:** hours are stored as a cumulative `logged` total per task with no per-day timestamps, so a task's full hours count toward the period in which it was completed. Exact per-day hours would need a new time-entry log in `state` (out of scope).

## Docs
Update `CLAUDE.md`: add the auth gate (session key, test credentials, client-side only) and the fourth view.

## Verification
- Open `work-tracker.html` in a browser. The login screen should appear, with the app hidden.
- Wrong password shows an inline error. `testuser01` / `Test@1234` enters the app with data intact.
- A reload in the same tab stays signed in, a new tab shows login, and Logout returns to login.
- Progress tab: the seeded task "Evaluate message queue options" (done 2 days ago) counts in this week and month. Complete more tasks, then switch Week/Month and prev/next. Counts and deltas should update correctly.
- Dark theme stays readable. The `n` shortcut and Escape do nothing on the login screen.
