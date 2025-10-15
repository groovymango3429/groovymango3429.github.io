import React, { useState, useMemo } from 'react';
import { Clock, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const ScheduleBuilder = () => {
  const [selectedSections, setSelectedSections] = useState({
    'ENGR1410': '',
    'ENGR1411': '',
    'ENGR2080': '',
    'ENGR2081': '',
    'MATH2080': '',
    'PHYS1220': '',
    'PHYS1240': '',
    'ENGL2150': ''
  });

  // Parse time string to minutes since midnight
  const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Class data structure
  const classes = {
    'ENGR1410': [
      { section: '221', days: ['M', 'F'], time: '08:00 AM - 08:50 AM', location: 'Holtzendorff Hall 200' },
      { section: '222', days: ['M', 'F'], time: '09:05 AM - 09:55 AM', location: 'Holtzendorff Hall 200' },
      { section: '223', days: ['M', 'F'], time: '10:10 AM - 11:00 AM', location: 'Holtzendorff Hall 200' },
      { section: '224', days: ['M', 'F'], time: '11:15 AM - 12:05 PM', location: 'Holtzendorff Hall 200' },
      { section: '225', days: ['M', 'F'], time: '12:20 PM - 01:10 PM', location: 'Holtzendorff Hall 200' },
      { section: '226', days: ['M', 'F'], time: '01:25 PM - 02:15 PM', location: 'Holtzendorff Hall 200' },
      { section: '227', days: ['M', 'F'], time: '02:30 PM - 03:20 PM', location: 'Holtzendorff Hall 200' },
      { section: '621', days: ['M', 'F'], time: '08:00 AM - 08:50 AM', location: 'Watt Innovation 106' },
      { section: '622', days: ['M', 'F'], time: '09:05 AM - 09:55 AM', location: 'Watt Innovation 106' },
      { section: '623', days: ['M', 'F'], time: '10:10 AM - 11:00 AM', location: 'Watt Innovation 106' },
      { section: '624', days: ['M', 'F'], time: '11:15 AM - 12:05 PM', location: 'Watt Innovation 106' },
      { section: '625', days: ['M', 'F'], time: '12:20 PM - 01:10 PM', location: 'Watt Innovation 106' },
      { section: '626', days: ['M', 'F'], time: '01:25 PM - 02:15 PM', location: 'Watt Innovation 106' },
      { section: '628', days: ['M', 'F'], time: '03:35 PM - 04:25 PM', location: 'Watt Innovation 106' },
      { section: '821', days: ['M', 'F'], time: '08:00 AM - 08:50 AM', location: 'Watt Innovation 208' },
      { section: '822', days: ['M', 'F'], time: '09:05 AM - 09:55 AM', location: 'Watt Innovation 208' },
      { section: '823', days: ['M', 'F'], time: '10:10 AM - 11:00 AM', location: 'Watt Innovation 208' },
      { section: '824', days: ['M', 'F'], time: '11:15 AM - 12:05 PM', location: 'Watt Innovation 208' },
      { section: '825', days: ['M', 'F'], time: '12:20 PM - 01:10 PM', location: 'Watt Innovation 208' },
      { section: '826', days: ['M', 'F'], time: '01:25 PM - 02:15 PM', location: 'Watt Innovation 208' },
      { section: '827', days: ['M', 'F'], time: '02:30 PM - 03:20 PM', location: 'Watt Innovation 208' },
    ],
    'ENGR1411': [
      { section: '221', days: ['W'], time: '08:00 AM - 09:55 AM', location: 'Holtzendorff Hall 200' },
      { section: '222', days: ['T'], time: '12:30 PM - 02:25 PM', location: 'Holtzendorff Hall 200' },
      { section: '223', days: ['W'], time: '10:10 AM - 12:05 PM', location: 'Holtzendorff Hall 200' },
      { section: '224', days: ['R'], time: '12:30 PM - 02:25 PM', location: 'Holtzendorff Hall 200' },
      { section: '225', days: ['W'], time: '12:20 PM - 02:15 PM', location: 'Holtzendorff Hall 200' },
      { section: '226', days: ['T'], time: '02:45 PM - 04:35 PM', location: 'Holtzendorff Hall 200' },
      { section: '227', days: ['W'], time: '02:30 PM - 04:25 PM', location: 'Holtzendorff Hall 200' },
      { section: '621', days: ['W'], time: '08:00 AM - 09:55 AM', location: 'Watt Innovation 106' },
      { section: '622', days: ['T'], time: '08:00 AM - 09:55 AM', location: 'Watt Innovation 106' },
      { section: '623', days: ['W'], time: '10:10 AM - 12:05 PM', location: 'Watt Innovation 106' },
      { section: '624', days: ['R'], time: '08:00 AM - 09:55 AM', location: 'Watt Innovation 106' },
      { section: '625', days: ['W'], time: '12:20 PM - 02:15 PM', location: 'Watt Innovation 106' },
      { section: '626', days: ['T'], time: '10:10 AM - 12:05 PM', location: 'Watt Innovation 106' },
      { section: '628', days: ['R'], time: '10:10 AM - 12:05 PM', location: 'Watt Innovation 106' },
      { section: '821', days: ['W'], time: '08:00 AM - 09:55 AM', location: 'Watt Innovation 208' },
      { section: '822', days: ['T'], time: '08:00 AM - 09:55 AM', location: 'Watt Innovation 208' },
      { section: '823', days: ['W'], time: '10:10 AM - 12:05 PM', location: 'Watt Innovation 208' },
      { section: '824', days: ['R'], time: '08:00 AM - 09:55 AM', location: 'Watt Innovation 208' },
      { section: '825', days: ['W'], time: '12:20 PM - 02:15 PM', location: 'Watt Innovation 208' },
      { section: '826', days: ['T'], time: '10:10 AM - 12:05 PM', location: 'Watt Innovation 208' },
      { section: '827', days: ['W'], time: '02:30 PM - 04:25 PM', location: 'Watt Innovation 208' },
    ],
    'ENGR2080': [
      { section: '281', days: ['R'], time: '08:00 AM - 09:15 AM', location: 'Holtzendorff Hall 200' },
      { section: '282', days: ['R'], time: '09:30 AM - 10:45 AM', location: 'Holtzendorff Hall 200' },
      { section: '283', days: ['R'], time: '11:00 AM - 12:15 PM', location: 'Holtzendorff Hall 200' },
      { section: '381', days: ['R'], time: '08:00 AM - 09:15 AM', location: 'Holtzendorff Hall B03' },
      { section: '382', days: ['R'], time: '09:30 AM - 10:45 AM', location: 'Holtzendorff Hall B03' },
      { section: '383', days: ['R'], time: '11:00 AM - 12:15 PM', location: 'Holtzendorff Hall B03' },
      { section: '582', days: ['R'], time: '09:30 AM - 10:45 AM', location: 'Lowry Hall 15' },
      { section: '583', days: ['R'], time: '11:00 AM - 12:15 PM', location: 'Lowry Hall 15' },
      { section: '584', days: ['R'], time: '12:30 PM - 01:45 PM', location: 'Lowry Hall 15' },
      { section: '684', days: ['R'], time: '12:30 PM - 01:45 PM', location: 'Watt Innovation 106' },
      { section: '685', days: ['R'], time: '02:00 PM - 03:15 PM', location: 'Watt Innovation 106' },
      { section: '686', days: ['R'], time: '03:30 PM - 04:45 PM', location: 'Watt Innovation 106' },
      { section: '884', days: ['R'], time: '12:30 PM - 01:45 PM', location: 'Watt Innovation 208' },
      { section: '885', days: ['R'], time: '02:00 PM - 03:15 PM', location: 'Watt Innovation 208' },
      { section: '886', days: ['R'], time: '03:30 PM - 04:45 PM', location: 'Watt Innovation 208' },
    ],
    'ENGR2081': [
      { section: '281', days: ['T'], time: '08:00 AM - 09:15 AM', location: 'Holtzendorff Hall 200' },
      { section: '282', days: ['T'], time: '09:30 AM - 10:45 AM', location: 'Holtzendorff Hall 200' },
      { section: '283', days: ['T'], time: '11:00 AM - 12:15 PM', location: 'Holtzendorff Hall 200' },
      { section: '381', days: ['T'], time: '08:00 AM - 09:15 AM', location: 'Holtzendorff Hall B03' },
      { section: '382', days: ['T'], time: '09:30 AM - 10:45 AM', location: 'Holtzendorff Hall B03' },
      { section: '383', days: ['T'], time: '11:00 AM - 12:15 PM', location: 'Holtzendorff Hall B03' },
      { section: '582', days: ['T'], time: '09:30 AM - 10:45 AM', location: 'Lowry Hall 15' },
      { section: '583', days: ['T'], time: '11:00 AM - 12:15 PM', location: 'Lowry Hall 15' },
      { section: '584', days: ['T'], time: '12:30 PM - 01:45 PM', location: 'Lowry Hall 15' },
      { section: '684', days: ['T'], time: '12:30 PM - 01:45 PM', location: 'Watt Innovation 106' },
      { section: '685', days: ['T'], time: '02:00 PM - 03:15 PM', location: 'Watt Innovation 106' },
      { section: '686', days: ['T'], time: '03:30 PM - 04:45 PM', location: 'Watt Innovation 106' },
      { section: '884', days: ['T'], time: '12:30 PM - 01:45 PM', location: 'Watt Innovation 208' },
      { section: '885', days: ['T'], time: '02:00 PM - 03:15 PM', location: 'Watt Innovation 208' },
      { section: '886', days: ['T'], time: '03:30 PM - 04:45 PM', location: 'Watt Innovation 208' },
    ],
    'MATH2080': [
      { section: '001', days: ['M', 'W', 'F'], time: '09:05 AM - 09:55 AM', timeR: '09:30 AM - 10:20 AM', daysR: ['R'], location: 'Daniel Hall Exp 260' },
      { section: '002', days: ['M', 'W', 'F'], time: '12:20 PM - 01:10 PM', timeR: '12:30 PM - 01:20 PM', daysR: ['R'], location: 'Martin Hall M1' },
      { section: '003', days: ['M', 'W', 'F'], time: '08:00 AM - 08:50 AM', timeR: '08:00 AM - 08:50 AM', daysR: ['R'], location: 'Daniel Hall Exp 265' },
      { section: '004', days: ['M', 'W'], time: '02:30 PM - 03:20 PM', timeR: '02:00 PM - 02:50 PM', daysR: ['T', 'R'], location: 'Martin Hall M1' },
      { section: '005', days: ['M', 'W'], time: '03:35 PM - 04:25 PM', timeR: '03:30 PM - 04:20 PM', daysR: ['T', 'R'], location: 'Martin Hall M1' },
      { section: '006', days: ['M', 'W', 'F'], time: '11:15 AM - 12:05 PM', timeR: '11:00 AM - 11:50 AM', daysR: ['R'], location: 'Martin Hall M1' },
      { section: '007', days: ['M', 'W', 'F'], time: '10:10 AM - 11:00 AM', timeR: '09:30 AM - 10:20 AM', daysR: ['R'], location: 'Daniel Hall Exp 265' },
      { section: '008', days: ['M', 'W', 'F'], time: '11:15 AM - 12:05 PM', timeR: '11:00 AM - 11:50 AM', daysR: ['R'], location: 'Daniel Hall Exp 265' },
      { section: '009', days: ['M', 'W', 'F'], time: '08:00 AM - 08:50 AM', timeR: '08:00 AM - 08:50 AM', daysR: ['R'], location: 'Daniel Hall Exp 260' },
      { section: '010', days: ['M', 'W', 'F'], time: '12:20 PM - 01:10 PM', timeR: '12:30 PM - 01:20 PM', daysR: ['R'], location: 'Daniel Hall Exp 260' },
    ],
    'PHYS1220': [
      { section: '001', days: ['M', 'W', 'F'], time: '08:00 AM - 08:50 AM', location: 'Daniel Hall Exp G66' },
      { section: '002', days: ['M', 'W', 'F'], time: '09:05 AM - 09:55 AM', location: 'Daniel Hall Exp G66' },
      { section: '003', days: ['M', 'W', 'F'], time: '10:10 AM - 11:00 AM', location: 'Daniel Hall Exp G66' },
      { section: '004', days: ['M', 'W', 'F'], time: '11:15 AM - 12:05 PM', location: 'Daniel Hall Exp G66' },
      { section: '005', days: ['M', 'W', 'F'], time: '01:25 PM - 02:15 PM', location: 'Kinard Lab 223' },
      { section: '006', days: ['M', 'W', 'F'], time: '01:25 PM - 02:15 PM', location: 'Kinard Lab 223' },
    ],
    'PHYS1240': [
      { section: '001', days: ['M'], time: '12:20 PM - 02:10 PM', location: 'Kinard Lab 314' },
      { section: '002', days: ['M'], time: '02:25 PM - 04:15 PM', location: 'Kinard Lab 314' },
      { section: '005', days: ['T'], time: '08:00 AM - 09:50 AM', location: 'Kinard Lab 314' },
      { section: '006', days: ['T'], time: '12:30 PM - 02:20 PM', location: 'Kinard Lab 314' },
      { section: '007', days: ['T'], time: '02:35 PM - 04:25 PM', location: 'Kinard Lab 314' },
      { section: '010', days: ['W'], time: '08:00 AM - 09:50 AM', location: 'Kinard Lab 314' },
      { section: '011', days: ['W'], time: '12:20 PM - 02:10 PM', location: 'Kinard Lab 314' },
      { section: '012', days: ['W'], time: '02:25 PM - 04:15 PM', location: 'Kinard Lab 314' },
      { section: '015', days: ['R'], time: '08:00 AM - 09:50 AM', location: 'Kinard Lab 314' },
      { section: '016', days: ['R'], time: '12:30 PM - 02:20 PM', location: 'Kinard Lab 314' },
      { section: '017', days: ['F'], time: '12:20 PM - 02:10 PM', location: 'Kinard Lab 314' },
      { section: '022', days: ['T'], time: '12:30 PM - 02:20 PM', location: 'Kinard Lab 316' },
      { section: '026', days: ['W'], time: '12:20 PM - 02:10 PM', location: 'Kinard Lab 316' },
      { section: '029', days: ['R'], time: '12:30 PM - 02:20 PM', location: 'Kinard Lab 316' },
    ],
    'ENGL2150': [
      { section: '001', days: ['M', 'W', 'F'], time: '08:00 AM - 08:50 AM', location: 'Daniel Hall 206' },
      { section: '002', days: ['M', 'W', 'F'], time: '09:05 AM - 09:55 AM', location: 'Daniel Hall 206' },
      { section: '003', days: ['M', 'W', 'F'], time: '10:10 AM - 11:00 AM', location: 'Daniel Hall 218' },
      { section: '004', days: ['M', 'W', 'F'], time: '11:15 AM - 12:05 PM', location: 'Daniel Hall 218' },
      { section: '005', days: ['T', 'R'], time: '09:30 AM - 10:45 AM', location: 'Daniel Hall 223' },
      { section: '006', days: ['T', 'R'], time: '11:00 AM - 12:15 PM', location: 'Daniel Hall 218' },
      { section: '007', days: ['T', 'R'], time: '12:30 PM - 01:45 PM', location: 'Daniel Hall 218' },
      { section: '008', days: ['T', 'R'], time: '02:00 PM - 03:15 PM', location: 'Daniel Hall 218' },
      { section: '009', days: ['M', 'W', 'F'], time: '08:00 AM - 08:50 AM', location: 'Daniel Hall Exp 366' },
      { section: '010', days: ['M', 'W', 'F'], time: '09:05 AM - 09:55 AM', location: 'Daniel Hall Exp 366' },
    ],
  };

  // Check if two time slots conflict
  const checkConflict = (class1, class2) => {
    const commonDays = class1.days.filter(d => class2.days.includes(d));
    if (commonDays.length === 0) return false;

    const time1 = class1.timeR || class1.time;
    const time2 = class2.timeR || class2.time;
    
    const [start1, end1] = time1.split(' - ').map(timeToMinutes);
    const [start2, end2] = time2.split(' - ').map(timeToMinutes);

    return !(end1 <= start2 || end2 <= start1);
  };

  // Check conflicts for Thursday time for MATH2080
  const checkMathThursdayConflict = (mathSection, otherClass) => {
    const mathData = classes['MATH2080'].find(c => c.section === mathSection);
    if (!mathData || !mathData.daysR) return false;
    
    const commonDays = mathData.daysR.filter(d => otherClass.days.includes(d));
    if (commonDays.length === 0) return false;

    const [start1, end1] = mathData.timeR.split(' - ').map(timeToMinutes);
    const [start2, end2] = otherClass.time.split(' - ').map(timeToMinutes);

    return !(end1 <= start2 || end2 <= start1);
  };

  const validateSchedule = () => {
    const selected = Object.entries(selectedSections)
      .filter(([_, section]) => section)
      .map(([course, section]) => ({
        course,
        section,
        data: classes[course].find(c => c.section === section)
      }));

    // Check ENGR pairs
    if (selectedSections['ENGR1410'] && selectedSections['ENGR1411']) {
      if (selectedSections['ENGR1410'] !== selectedSections['ENGR1411']) {
        return { valid: false, message: 'ENGR 1410 and 1411 must have matching section numbers!' };
      }
    }

    if (selectedSections['ENGR2080'] && selectedSections['ENGR2081']) {
      if (selectedSections['ENGR2080'] !== selectedSections['ENGR2081']) {
        return { valid: false, message: 'ENGR 2080 and 2081 must have matching section numbers!' };
      }
    }

    // Check time conflicts
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        if (checkConflict(selected[i].data, selected[j].data)) {
          return { 
            valid: false, 
            message: `Time conflict between ${selected[i].course} and ${selected[j].course}!` 
          };
        }
        
        // Special check for MATH Thursday time
        if (selected[i].course === 'MATH2080' && checkMathThursdayConflict(selected[i].section, selected[j].data)) {
          return { 
            valid: false, 
            message: `Time conflict between MATH2080 (Thursday) and ${selected[j].course}!` 
          };
        }
        if (selected[j].course === 'MATH2080' && checkMathThursdayConflict(selected[j].section, selected[i].data)) {
          return { 
            valid: false, 
            message: `Time conflict between MATH2080 (Thursday) and ${selected[i].course}!` 
          };
        }
      }
    }

    return { valid: true, message: 'Schedule is valid!' };
  };

  const getScheduleEndTime = () => {
    const selected = Object.entries(selectedSections)
      .filter(([_, section]) => section)
      .map(([course, section]) => classes[course].find(c => c.section === section));

    if (selected.length === 0) return null;

    let latestEnd = 0;
    selected.forEach(classData => {
      const times = [classData.time];
      if (classData.timeR) times.push(classData.timeR);
      
      times.forEach(time => {
        const endTime = timeToMinutes(time.split(' - ')[1]);
        if (endTime > latestEnd) latestEnd = endTime;
      });
    });

    const hours = Math.floor(latestEnd / 60);
    const minutes = latestEnd % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const validation = validateSchedule();
  const endTime = getScheduleEndTime();

  // Find multiple optimal schedules
  const findOptimalSchedules = () => {
    const validSchedules = [];

    // Get all ENGR 1410 sections
    for (const engr1410 of classes['ENGR1410']) {
      const engr1411 = classes['ENGR1411'].find(c => c.section === engr1410.section);
      if (!engr1411) continue;

      // Get all ENGR 2080 sections
      for (const engr2080 of classes['ENGR2080']) {
        const engr2081 = classes['ENGR2081'].find(c => c.section === engr2080.section);
        if (!engr2081) continue;

        // Try all MATH sections
        for (const math of classes['MATH2080']) {
          // Try all PHYS 1220 sections
          for (const phys1220 of classes['PHYS1220']) {
            // Try all PHYS 1240 sections
            for (const phys1240 of classes['PHYS1240']) {
              // Try all ENGL sections
              for (const engl of classes['ENGL2150']) {
                const schedule = [
                  { course: 'ENGR1410', ...engr1410 },
                  { course: 'ENGR1411', ...engr1411 },
                  { course: 'ENGR2080', ...engr2080 },
                  { course: 'ENGR2081', ...engr2081 },
                  { course: 'MATH2080', ...math },
                  { course: 'PHYS1220', ...phys1220 },
                  { course: 'PHYS1240', ...phys1240 },
                  { course: 'ENGL2150', ...engl }
                ];

                // Check for conflicts
                let hasConflict = false;
                for (let i = 0; i < schedule.length && !hasConflict; i++) {
                  for (let j = i + 1; j < schedule.length; j++) {
                    if (checkConflict(schedule[i], schedule[j])) {
                      hasConflict = true;
                      break;
                    }
                    if (schedule[i].course === 'MATH2080' && checkMathThursdayConflict(schedule[i].section, schedule[j])) {
                      hasConflict = true;
                      break;
                    }
                    if (schedule[j].course === 'MATH2080' && checkMathThursdayConflict(schedule[j].section, schedule[i])) {
                      hasConflict = true;
                      break;
                    }
                  }
                }

                if (!hasConflict) {
                  // Check if starts at 8 AM
                  const startsAt8 = schedule.some(c => {
                    const time = c.time || c.timeR;
                    const startTime = timeToMinutes(time.split(' - ')[0]);
                    return startTime === 480; // 8 AM
                  });

                  if (startsAt8) {
                    // Calculate end times by day
                    const dayEndTimes = { M: 0, T: 0, W: 0, R: 0, F: 0 };
                    let latestEnd = 0;
                    
                    schedule.forEach(classData => {
                      const times = [{ time: classData.time, days: classData.days }];
                      if (classData.timeR && classData.daysR) {
                        times.push({ time: classData.timeR, days: classData.daysR });
                      }
                      
                      times.forEach(({ time, days }) => {
                        const endTime = timeToMinutes(time.split(' - ')[1]);
                        if (endTime > latestEnd) latestEnd = endTime;
                        
                        days.forEach(day => {
                          if (endTime > dayEndTimes[day]) {
                            dayEndTimes[day] = endTime;
                          }
                        });
                      });
                    });

                    // Calculate variation in end times
                    const endTimeValues = Object.values(dayEndTimes).filter(t => t > 0);
                    const avgEndTime = endTimeValues.reduce((a, b) => a + b, 0) / endTimeValues.length;
                    const variation = Math.max(...endTimeValues) - Math.min(...endTimeValues);

                    validSchedules.push({
                      schedule,
                      latestEnd,
                      dayEndTimes,
                      avgEndTime,
                      variation
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    // Sort and pick diverse options
    validSchedules.sort((a, b) => a.latestEnd - b.latestEnd);
    
    const options = [];
    if (validSchedules.length > 0) {
      // Option 1: Absolute earliest finish
      options.push({
        name: "Earliest Finish Overall",
        description: "Ends as early as possible every day",
        ...validSchedules[0]
      });

      // Option 2: Most balanced (moderate variation)
      const balanced = validSchedules.filter(s => s.variation > 60 && s.variation < 180)
        .sort((a, b) => a.avgEndTime - b.avgEndTime)[0];
      if (balanced && balanced !== validSchedules[0]) {
        options.push({
          name: "Balanced Schedule",
          description: "Some days end earlier, some later - more balanced",
          ...balanced
        });
      }

      // Option 3: Most variation (one or two early days)
      const varied = [...validSchedules]
        .sort((a, b) => b.variation - a.variation)
        .find(s => s.avgEndTime < validSchedules[0].avgEndTime + 120);
      if (varied && !options.includes(varied)) {
        options.push({
          name: "Early Days Available",
          description: "Some days end much earlier than others",
          ...varied
        });
      }
    }

    return options.slice(0, 3);
  };

  const [optimalSchedules] = useState(() => findOptimalSchedules());
  const [selectedOption, setSelectedOption] = useState(0);

  const loadOptimalSchedule = (optionIndex) => {
    if (optimalSchedules[optionIndex]) {
      const newSections = {};
      optimalSchedules[optionIndex].schedule.forEach(c => {
        newSections[c.course] = c.section;
      });
      setSelectedSections(newSections);
      setSelectedOption(optionIndex);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-orange-50 to-purple-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-orange-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Spring 2026 Schedule Builder</h1>
        </div>

        {optimalSchedules.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📅 Recommended Schedule Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {optimalSchedules.map((option, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOption === idx
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 bg-white hover:border-orange-300'
                  }`}
                  onClick={() => loadOptimalSchedule(idx)}
                >
                  <h3 className="font-bold text-gray-800 mb-2">{option.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-gray-700">Daily End Times:</div>
                    {Object.entries(option.dayEndTimes)
                      .filter(([_, time]) => time > 0)
                      .sort((a, b) => a[1] - b[1])
                      .map(([day, time]) => (
                        <div key={day} className="flex justify-between">
                          <span className="text-gray-600">{day === 'M' ? 'Mon' : day === 'T' ? 'Tue' : day === 'W' ? 'Wed' : day === 'R' ? 'Thu' : 'Fri'}:</span>
                          <span className="font-mono text-gray-800">{formatTime(time)}</span>
                        </div>
                      ))}
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-700">Latest End:</span>
                        <span className="text-orange-600">{formatTime(option.latestEnd)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadOptimalSchedule(idx);
                    }}
                    className="mt-3 w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-semibold"
                  >
                    Load This Schedule
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong> Choose one of the recommended options above, or manually select sections below. ENGR 1410/1411 and ENGR 2080/2081 must have matching section numbers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.keys(classes).map(course => (
            <div key={course} className="bg-gray-50 p-4 rounded-lg">
              <label className="block font-semibold text-gray-700 mb-2">
                {course.replace(/(\d)/, ' $1')}
              </label>
              <select
                value={selectedSections[course]}
                onChange={(e) => setSelectedSections({...selectedSections, [course]: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select a section...</option>
                {classes[course].map(section => (
                  <option key={section.section} value={section.section}>
                    Section {section.section} - {section.days.join('')} {section.time}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className={`p-4 rounded-lg mb-6 ${validation.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2">
            {validation.valid ? 
              <CheckCircle className="text-green-600" size={20} /> : 
              <AlertCircle className="text-red-600" size={20} />
            }
            <span className={validation.valid ? 'text-green-800' : 'text-red-800'}>
              {validation.message}
            </span>
          </div>
          {endTime && validation.valid && (
            <div className="mt-2 flex items-center gap-2 text-gray-700">
              <Clock size={16} />
              <span>Latest class ends at: <strong>{endTime}</strong></span>
            </div>
          )}
        </div>

        {validation.valid && Object.values(selectedSections).some(s => s) && (
          <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3 text-gray-800">Your Schedule:</h3>
            <div className="space-y-2">
              {Object.entries(selectedSections)
                .filter(([_, section]) => section)
                .map(([course, section]) => {
                  const classData = classes[course].find(c => c.section === section);
                  return (
                    <div key={course} className="p-3 bg-orange-50 rounded border border-orange-200">
                      <div className="font-semibold text-gray-800">{course.replace(/(\d)/, ' $1')} - Section {section}</div>
                      <div className="text-sm text-gray-600">
                        {classData.days.join('')} {classData.time}
                        {classData.timeR && ` | ${classData.daysR.join('')} ${classData.timeR}`}
                      </div>
                      <div className="text-xs text-gray-500">{classData.location}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleBuilder;