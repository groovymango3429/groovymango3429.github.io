# \# 🐅 Clemson Class Scheduler

# 

# \*\*Find your perfect class schedule for Spring 2026 at Clemson University\*\*

# 

# \[!\[Live Demo](https://img.shields.io/badge/demo-live-orange)](https://cuschedules.me)

# \[!\[GitHub Pages](https://img.shields.io/badge/hosted-GitHub%20Pages-blue)](https://groovymango3429.github.io)

# \[!\[Status](https://img.shields.io/badge/status-beta-yellow)](https://github.com/groovymango3429/groovymango3429.github.io)

# 

# ---

# 

# \## 🎯 About

# 

# The Clemson Class Scheduler is a web-based tool that helps Clemson University students generate optimal class schedules based on their preferences. Built by students, for students.

# 

# \### ✨ Key Features

# 

# \- 🔍 \*\*Smart Schedule Generation\*\* - Automatically generates conflict-free schedules

# \- ⚖️ \*\*Multiple Preferences\*\* - Choose from 6 different schedule types (Balanced, Early Bird, Night Owl, Compact, MWF Focus, T/R Focus)

# \- 🎓 \*\*Special Programs Support\*\* - Filters for Honors and RiSE program sections

# \- 🔗 \*\*Linked Courses\*\* - Ensure certain courses have matching section numbers

# \- 📊 \*\*Schedule Scoring\*\* - Each schedule is scored based on your preferences

# \- 💾 \*\*Export Functionality\*\* - Download your schedules as text files

# \- 📱 \*\*Fully Responsive\*\* - Works on desktop, tablet, and mobile

# \- 🌐 \*\*No Backend Required\*\* - 100% client-side JavaScript

# 

# ---

# 

# \## 🚀 Live Demo

# 

# \*\*Primary URL:\*\* \[https://cuschedules.me](https://cuschedules.me)  

# \*\*GitHub Pages:\*\* \[https://groovymango3429.github.io](https://groovymango3429.github.io)

# 

# ---

# 

# \## 📸 Screenshots

# 

# \### Main Interface

# Clean, Clemson-themed interface with course selection and preferences:

# \- Orange (#f56600) and Purple (#522d80) Clemson colors

# \- Intuitive course input system

# \- Visual schedule preference selector

# 

# \### Generated Schedules

# \- Top 10 best schedules ranked by score

# \- Color-coded seat availability

# \- Detailed course information (CRN, instructor, location, times)

# \- One-click export to text file

# 

# ---

# 

# \## 🛠️ Technology Stack

# 

# \- \*\*HTML5\*\* - Semantic markup

# \- \*\*CSS3\*\* - Custom styling with Clemson branding, responsive design

# \- \*\*Vanilla JavaScript\*\* - No frameworks, pure ES6+

# \- \*\*Font Awesome\*\* - Icons

# \- \*\*GitHub Pages\*\* - Free hosting

# \- \*\*LocalStorage API\*\* - Visitor counter persistence

# 

# ---

# 

# \## 📦 Project Structure

# 

# ```

# groovymango3429.github.io/

# │

# ├── index.html                    # Main application (single-page app)

# ├── course\_schedule\_2026.json     # Spring 2026 course data (28MB)

# ├── README.md                     # This file

# └── CNAME                         # Custom domain configuration

# ```

# 

# ---

# 

# \## 🎓 How to Use

# 

# \### 1. \*\*Select Your Programs\*\* (Optional)

# Check the boxes if you're in:

# \- 🎓 Honors Program

# \- 🚀 RiSE Program

# 

# This filters course sections to only show what you can enroll in.

# 

# \### 2. \*\*Add Courses\*\*

# \- Type course code (e.g., `ENGR 1410` or `MATH 1060`)

# \- Click "Add" or press Enter

# \- Repeat for all your courses

# 

# \### 3. \*\*Link Courses\*\* (Optional)

# If you need certain courses to have the same section number (e.g., lab and lecture):

# \- Click "Add Link Group"

# \- Select courses that must match

# \- Can create multiple link groups

# 

# \### 4. \*\*Choose Schedule Preference\*\*

# Select your preferred schedule type:

# \- ⚖️ \*\*Balanced\*\* - Even distribution throughout the day

# \- 🌅 \*\*Early Bird\*\* - Classes end by early afternoon

# \- 🌙 \*\*Night Owl\*\* - Classes start later in the day

# \- ⚡ \*\*Compact\*\* - Minimize gaps between classes

# \- 📅 \*\*MWF Focus\*\* - Prefer Monday/Wednesday/Friday

# \- 📆 \*\*T/R Focus\*\* - Prefer Tuesday/Thursday

# 

# \### 5. \*\*Generate Schedules\*\*

# \- Click "Generate Schedules"

# \- View top 10 options ranked by score

# \- Export your favorite schedule(s)

# 

# ---

# 

# \## 🧮 How the Scoring Works

# 

# Each schedule is scored 0-100 based on:

# 

# \### Base Scoring Criteria

# 

# \- ✅ \*\*No Friday Classes\*\* - Bonus points for Friday-free schedules

# \- ✅ \*\*Reasonable Times\*\* - Penalizes very early (before 8 AM) or very late (after 5 PM) classes

# 

# \### Preference-Based Scoring

# 

# \*\*Early Bird:\*\*

# \- Bonus for classes starting at or before 8 AM

# \- Penalty for classes ending after 3 PM

# 

# \*\*Night Owl:\*\*

# \- Bonus for classes starting at or after 10 AM

# \- Penalty for classes ending before 2 PM

# 

# \*\*Compact:\*\*

# \- Bonus for minimal gaps between classes

# \- Penalty for long breaks (>4 hours)

# 

# \*\*MWF/T/R Focus:\*\*

# \- Bonus for higher ratio of preferred days

# \- Penalty if non-preferred days dominate

# 

# \*\*Balanced:\*\*

# \- Bonus for reasonable start times (8-10 AM)

# \- Bonus for reasonable end times (1-4 PM)

# \- Bonus for moderate daily span (5-7 hours)

# 

# ---

# 

# \## 📊 Course Data Format

# 

# The `course\_schedule\_2026.json` file contains an array of course sections with this structure:

# 

# ```json

# {

# &nbsp; "subject": "CPSC",

# &nbsp; "courseNumber": "1010",

# &nbsp; "sequenceNumber": "001",

# &nbsp; "courseReferenceNumber": "12345",

# &nbsp; "courseTitle": "Introduction to Computer Science",

# &nbsp; "seatsAvailable": 25,

# &nbsp; "sectionAttributes": \[

# &nbsp;   { "code": "HONR" }

# &nbsp; ],

# &nbsp; "meetingsFaculty": \[

# &nbsp;   {

# &nbsp;     "meetingTime": {

# &nbsp;       "monday": true,

# &nbsp;       "wednesday": true,

# &nbsp;       "friday": true,

# &nbsp;       "beginTime": "0900",

# &nbsp;       "endTime": "0950",

# &nbsp;       "building": "MCADAMS",

# &nbsp;       "room": "101"

# &nbsp;     }

# &nbsp;   }

# &nbsp; ],

# &nbsp; "faculty": \[

# &nbsp;   {

# &nbsp;     "displayName": "John Smith"

# &nbsp;   }

# &nbsp; ]

# }

# ```

# 

# ---

# 

# \## 🔧 Local Development

# 

# \### Prerequisites

# \- Any modern web browser (Chrome, Firefox, Safari, Edge)

# \- A local web server (optional but recommended for testing)

# 

# \### Setup

# 

# 1\. \*\*Clone the repository:\*\*

# &nbsp;  ```bash

# &nbsp;  git clone https://github.com/groovymango3429/groovymango3429.github.io.git

# &nbsp;  cd groovymango3429.github.io

# &nbsp;  ```

# 

# 2\. \*\*Ensure you have the course data:\*\*

# &nbsp;  - `course\_schedule\_2026.json` should be in the same directory as `index.html`

# 

# 3\. \*\*Run a local server\*\* (choose one):

# &nbsp;  

# &nbsp;  \*\*Python:\*\*

# &nbsp;  ```bash

# &nbsp;  # Python 3

# &nbsp;  python -m http.server 8000

# &nbsp;  ```

# &nbsp;  

# &nbsp;  \*\*Node.js:\*\*

# &nbsp;  ```bash

# &nbsp;  npx http-server

# &nbsp;  ```

# &nbsp;  

# &nbsp;  \*\*VS Code:\*\*

# &nbsp;  - Install "Live Server" extension

# &nbsp;  - Right-click `index.html` → "Open with Live Server"

# 

# 4\. \*\*Open in browser:\*\*

# &nbsp;  ```

# &nbsp;  http://localhost:8000

# &nbsp;  ```

# 

# \### Testing

# \- Test with different course combinations

# \- Verify all 6 schedule preferences work correctly

# \- Test linked courses functionality

# \- Check mobile responsiveness (DevTools responsive mode)

# \- Verify Honors/RiSE filtering

# 

# ---

# 

# \## 🐛 Known Issues \& Limitations

# 

# \### Current Limitations

# \- ⚠️ \*\*Single Term Only\*\* - Currently only supports Spring 2026

# \- ⚠️ \*\*Local Counter\*\* - Visitor count is stored locally (per browser)

# \- ⚠️ \*\*Max 1000 Combinations\*\* - Limits schedule generation for performance

# \- ⚠️ \*\*No Multi-Section Courses\*\* - Assumes one meeting time per section

# \- ⚠️ \*\*No Waitlist Support\*\* - Only considers currently available seats

# 

# \### Upcoming Features

# \- \[ ] Support for multiple semesters

# \- \[ ] Save/load schedule preferences

# \- \[ ] Calendar export (ICS format)

# \- \[ ] Professor rating integration

# \- \[ ] Dark mode

# \- \[ ] More advanced filtering options

# 

# ---

# 

# \## 🤝 Contributing

# 

# This is a beta project! We welcome contributions and bug reports.

# 

# \### Found a Bug?

# 📧 Email: \[pwrigh3@clemson.edu](mailto:pwrigh3@clemson.edu)

# 

# \### Want to Contribute?

# 1\. Fork the repository

# 2\. Create a feature branch (`git checkout -b feature/amazing-feature`)

# 3\. Commit your changes (`git commit -m 'Add amazing feature'`)

# 4\. Push to the branch (`git push origin feature/amazing-feature`)

# 5\. Open a Pull Request

# 

# ---

# 

# \## 📝 License

# 

# This project is open source and available for educational purposes.

# 

# \*\*Note:\*\* Course data is pulled from Clemson University's public course catalog. This tool is not officially affiliated with Clemson University.

# 

# ---

# 

# \## 👥 Authors

# 

# \*\*Created by Patty and Tris\*\*

# \- Clemson University Students

# \- Class of 2026

# 

# ---

# 

# \## 🙏 Acknowledgments

# 

# \- Clemson University for the course data

# \- Font Awesome for icons

# \- The Clemson student community for testing and feedback

# 

# ---

# 

# \## 📈 Statistics

# 

# !\[Visitor Count](https://img.shields.io/badge/dynamic/json?color=orange\&label=schedules%20generated\&query=%24.value\&url=https%3A%2F%2Fapi.countapi.xyz%2Fget%2Fcuschedules%2Fstudents)

# 

# ---

# 

# \## 📞 Support

# 

# \- \*\*Email:\*\* \[pwrigh3@clemson.edu](mailto:pwrigh3@clemson.edu)

# \- \*\*Issues:\*\* \[GitHub Issues](https://github.com/groovymango3429/groovymango3429.github.io/issues)

# 

# ---

# 

# \## 🎓 Clemson University

# 

# > "Education • Research • Service"

# 

# \*\*Go Tigers! 🐅\*\*

# 

# ---

# 

# <div align="center">

# &nbsp; <sub>Built with 🧡 and 💜 by Clemson students</sub>

# </div>

