# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DevTrack: a developer work tracker (Kanban board, dashboard, daily standup log) built for the IISC Technobytes Claude AI Workshop. The whole app is a single self-contained file, `work-tracker.html` (inline CSS and vanilla JS, no dependencies). `1.py` is an empty placeholder.

**File types:** the project can include `.py`, `.html`, `.js`, `.css`, `.json`, `.ts` files and build configs.

## Running

There is no build, lint, or test tooling. Open `work-tracker.html` directly in a browser (no server needed). Reload to see changes.

## Architecture

- **State**: one global `state` object `{ tasks, logs, theme, profile }`, persisted to `localStorage` under key `devtrack-v1` via `save()`. `load()` merges defaults, so new top-level state fields should get defaults there. Sample tasks are seeded only when the key is absent.
- **Rendering**: no framework. `renderAll()` re-renders the board, dashboard, log, and profile by rebuilding `innerHTML` from template strings. After mutating `state`, call `save()` then `renderAll()`. Drag/click handlers are re-bound on each `renderBoard()` (`bindDrag`).
- **Escaping**: all user-supplied text interpolated into templates must go through `esc()`.
- **Status transitions**: always go through `setStatus(task, status)`, which maintains `completedAt`/`startedAt` and stops the timer on `done`. The dashboard's "done this week" and "recently completed" depend on `completedAt`.
- **Timers**: a task's hours = `logged` + elapsed since `timerStart` (see `hours()`). Only one timer runs at a time (`toggleTimer`). Starting a timer on a `todo` task moves it to `progress`.
- **Auth gate**: client-side demo login only (not real security). `TEST_CREDENTIALS` (`testuser01` / `Test@1234`) are checked in `#loginForm`; the session flag lives in `sessionStorage['devtrack-auth']`, separate from `devtrack-v1`, so Export/Import is unaffected. `body.logged-out` hides the header and main content, and a capture-phase keydown listener blocks shortcuts while logged out.
- **Progress view**: `renderProgress()` shows weekly (Mon–Sun) or monthly KPI tiles with change vs the previous period (`periodRange`, `periodStats`). Hours are cumulative per task, so a task's full hours count toward the period it was completed in.
- **Views**: four `<section class="view">` blocks (board, dashboard, progress, log) toggled by the header nav; modals (task, profile) are `.modal-bg` elements toggled with the `hidden` attribute.
- **Import/Export**: JSON dump of the full `state`; import requires a `tasks` array.
- **UI conventions**: no native `confirm()` dialogs (delete uses a two-click arm-and-confirm); `n` opens a new task when no input is focused; theming via `data-theme` on `<html>` and CSS variables.
