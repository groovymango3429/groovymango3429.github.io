# 🐅 Clemson Class Scheduler

A lightweight web app that helps Clemson University students build and evaluate Spring 2026 class schedules. Enter your courses, choose schedule preferences (Early Bird, Compact, MWF/TR, etc.), optionally link courses (lecture ↔ lab), and generate ranked schedule options with calendar and list views.

Badges: ![Status](https://img.shields.io/badge/status-beta-yellow) ![License](https://img.shields.io/badge/license-MIT-blue)

## Key Features

- Smart schedule generation that avoids time conflicts
- Six schedule preference modes: Balanced, Early Bird, Night Owl, Compact, MWF Focus, T/R Focus
- Linked courses: require matching section numbers (useful for labs/recitations)
- Honors and RiSE program filtering for program-specific sections
- Duplicate schedule deduplication (each unique combination appears once)
- Improved scoring algorithm that considers:
  - start/end times per preference
  - total gaps (compactness)
  - day distribution (MWF vs TR)
  - seat availability (penalizes full sections)
- Calendar and List views for each generated schedule
- Export schedules as plain text files (includes CRNs, times, instructors, locations)

## Quick Start

Prerequisites:
- A modern browser (Chrome, Firefox, Edge, Safari)
- The course data JSON file (`course_schedule_2026.json`) in the same folder as `index.html`

Run locally:
1. Clone the repo:
   git clone https://github.com/groovymango3429/clemson-scheduler.git
   cd clemson-scheduler

2. Ensure `index.html` and `course_schedule_2026.json` are in the same directory.

3. Open `index.html` in your web browser.

No build tools or server required — just static files.

## Usage

1. (Optional) Check "Honors" or "RiSE" if you are eligible to include those sections.
2. Add course codes (e.g., `ENGR 1410`, `MATH 1060`) and click Add.
3. (Optional) Create linked groups so selected courses share the same section number.
4. Choose a schedule preference (Balanced / Early / Late / Compact / MWF / TR).
5. Click "Generate Schedules". The app will produce up to the top-ranked schedule options.
6. Toggle between calendar and list views, or export a schedule as a text file.

## Notes on Recent Fixes (what changed)
- Fixed a bug where changing schedule preference would only re-score existing schedules instead of fully regenerating them. Now changing preferences, special program toggles, adding/removing courses, or editing linked groups will clear previous results so schedules are regenerated correctly.
- Added deduplication using a schedule hash so duplicate schedule combinations are removed.
- Improved scoring logic to better reflect user preferences and seat availability; schedules should now rank more sensibly.

## Data Format
This app expects `course_schedule_2026.json` to contain an array of section objects with fields used in the UI, such as:
- subject, courseNumber, sequenceNumber, courseReferenceNumber, courseTitle
- meetingsFaculty → [ { meetingTime: { beginTime, endTime, monday, tuesday, ... , building, room } } ]
- faculty → [ { displayName } ]
- seatsAvailable
- sectionAttributes (array of { code }) for HONR or similar attributes

If your JSON uses a wrapper (e.g., `{ data: [...] }`), the loader will attempt to read that too.

## Contributing
Contributions welcome! Suggested workflow:
1. Fork the repo
2. Create a branch (e.g., `fix/score-adjustment`)
3. Make changes, include tests or example JSON if needed
4. Open a PR with a clear title and description

Please include reproducible steps if reporting bugs and example course JSON snippets when relevant.

## Troubleshooting
- "No available sections found" — ensure the JSON file contains that course and that Honors / RiSE toggles match the section attributes.
- Calendar rendering issues — check meeting times in the JSON (expected `HHMM` strings like `0830`).
- If schedules are missing, try increasing variety by adding more sections or removing overly restrictive linked groups.

## License
MIT — see LICENSE file.

## Contact
Created by Patty and Tris — bug reports or suggestions: pwrigh3@clemson.edu
