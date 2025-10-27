# 🐅 Clemson Class Scheduler

A lightweight web app that helps Clemson University students build and evaluate Spring 2026 class schedules. Enter your courses, choose schedule preferences (Early Bird, Compact, MWF/TR, etc.), optionally link courses (lecture ↔ lab), and generate ranked schedule options with calendar and list views.

Badges: ![Status](https://img.shields.io/badge/status-beta-yellow) ![License](https://img.shields.io/badge/license-MIT-blue)

## Key Features

- **Professor Selection**: Choose your preferred professor for each course or leave as "Any Professor" to see all options
- **Credit Hour Tracking**: Automatic calculation and display of total credit hours for selected courses and schedules
- Smart schedule generation that avoids time conflicts
- Nine schedule preference modes: Balanced, Early Bird, Night Owl, Compact, MWF Focus, T/R Focus, No Friday, Lunch Break, 3-Day Week
- Linked courses: require matching section numbers (useful for labs/recitations)
- Honors and RiSE program filtering for program-specific sections
- Duplicate schedule deduplication (each unique combination appears once)
- Improved scoring algorithm that considers:
  - start/end times per preference
  - total gaps (compactness)
  - day distribution (MWF vs TR)
  - seat availability (penalizes full sections)
  - professor preferences
- Calendar and List views for each generated schedule
- Export schedules as plain text files (includes CRNs, times, instructors, locations, credit hours)

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


## Usage

1. (Optional) Check "Honors" or "RiSE" if you are eligible to include those sections.
2. Add course codes (e.g., `ENGR 1410`, `MATH 1060`) and click Add.
3. (Optional) Select a preferred professor for each course from the dropdown, or leave as "Any Professor" to see all sections.
4. (Optional) Create linked groups so selected courses share the same section number.
5. Choose a schedule preference (Balanced / Early / Late / Compact / MWF / TR / No Friday / Lunch Break / 3-Day Week).
6. Click "Generate Schedules". The app will produce up to the top-ranked schedule options.
7. View total credit hours for your selected courses and in each schedule.
8. Toggle between calendar and list views to see professor names, CRNs, and times.
9. Export a schedule as a text file with all details included.

## Notes on Recent Fixes
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
- If a professor preference filters out all sections, try selecting "Any Professor" or a different professor.

## Future Enhancements

### RateMyProfessor Integration
The app currently supports professor selection based on available faculty in the course data. Future enhancements could include:

- Integration with RateMyProfessor API (e.g., using [ratemyprofessor-api](https://github.com/tisuela/ratemyprof-api))
- Display professor ratings, difficulty scores, and "would take again" percentages
- Automatic scoring boost for highly-rated professors
- Filter options based on professor ratings (e.g., only show professors with 4+ stars)
- Pass/fail rate data if available from institutional sources

**Note**: The current implementation uses professor data directly from the course catalog (`faculty.displayName` field). Since this is a client-side static site, direct integration with RateMyProfessor would require either:
1. A backend proxy service to avoid CORS issues
2. Pre-fetching and bundling rating data with the course JSON
3. Using a CORS-enabled RMP API wrapper

Contributions implementing this feature are welcome!

## License
MIT — see LICENSE file.

## Contact
Created by Patty and Tris — bug reports or suggestions: pwrigh3@clemson.edu
