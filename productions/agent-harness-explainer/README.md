# Agent & Harness explainer: review package (gate 1)

This is the script and storyboard for review. **It is not the finished film.** The full video build starts only after you approve this package.

| File | What it is |
|---|---|
| `script.md` | The full Mandarin narration, written to be spoken, with notes for the voice |
| `storyboard.md` | Scene-by-scene shot list: timing, exact on-screen text, the main visual change and the purpose of each shot |
| `storyboard.html` | The visual storyboard: 12 portrait frames next to the shot list. There's a toggle that shows the RedNote overlay zones |
| `preview/storyboard-sheet.png` / `.pdf` | Static render of the storyboard sheet |
| `preview/frames/frame-01…12.png` | Each frame at full 1080×1920, for checking readability on a phone |
| `preview/frames-contact*.png` | All 12 frames on one sheet, with and without the overlay zones marked |
| `sources.md` | Checked claims, synthetic example data, and decisions still open |

## What the viewer should understand by the end

> **The model proposes the next step. The harness (运行与控制系统) executes it, blocks what isn't allowed, and keeps records. A result counts only after it has been checked.**

How the storyboard gets there: the film follows one task (20 PDFs → one index, originals untouched) on **one diagram that grows**. Each new idea appears only when the task needs it:

- the model alone can only *propose* (S3)
- the harness frame grows around it and actually executes (S4a)
- the loop closes, and the whole loop is the agent (S4b)
- file 08 fails, gets recorded, gets a second attempt, then goes to a person (S6)
- a proposed delete hits a red gate that a prompt like "请小心" (be careful) can't replace (S7)
- a progress file survives a new session (S8)
- checking turns "saved ✓" into "19/20, 1 needs you" (S9)

The colours carry meaning throughout (blue = executing, amber = unresolved, red = denied). Each colour also has its own shape, so the meaning doesn't rely on colour alone. The quiz answer in S11 lands on the exact gate the viewer watched in S7.

## Checks run on this package

- All 12 frames were rendered at 1080×1920 in headless Chromium, using **Noto Sans SC** and **JetBrains Mono**. Both fonts were confirmed loaded, and no Chinese characters were missing.
- An automated check on every frame found no text above y=168, no text below y=1330, no text in the right-hand button area, nothing smaller than 28 px, and nothing spilling outside the frame.
- I checked the frames visually and fixed the problems I found: request text clipped in its card, the loop label overlapping the "检查" bar, the "新会话" chip covering a heading, and arrow characters that didn't render properly (now drawn icons).
- The storyboard sheet has no sideways scrolling on a 390 px-wide phone screen.

## Production plan after approval

HyperFrames (HTML/CSS/SVG + GSAP → MP4), 1080×1920 at 30 fps. Order of work: local Mandarin voice sample → you approve the voice → full narration → re-time scenes and subtitles to the real audio → build → preview → delivery render → check the actual export (size, length, fonts, safe zones, audio/video sync, full-file decode, plus frames from the start, middle, end and key transitions).

**Blocker to clear first:** in this cloud session the permission system blocked running the downloaded `hyperframes` CLI. The voice also needs `pip install kokoro-onnx soundfile` plus model files. Building the film needs you to allow both. Details are in `sources.md` §4.
