import React, { useState } from 'react';
import { Plus, X, Calendar, Clock, Users, Download, CircleAlert } from 'lucide-react';

const ScheduleBuilder = () => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [linkedGroups, setLinkedGroups] = useState([]);
  const [preference, setPreference] = useState('balanced');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [term, setTerm] = useState('202601');

  const addCourse = (course) => {
    if (!selectedCourses.find(c => c === course)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const removeCourse = (course) => {
    setSelectedCourses(selectedCourses.filter(c => c !== course));
    setLinkedGroups(linkedGroups.filter(g => !g.courses.includes(course)));
  };

  const addLinkedGroup = () => {
    setLinkedGroups([...linkedGroups, {
      id: Date.now(),
      courses: []
    }]);
  };

  const addCourseToGroup = (groupId, course) => {
    setLinkedGroups(linkedGroups.map(g => 
      g.id === groupId && !g.courses.includes(course) 
        ? { ...g, courses: [...g.courses, course] }
        : g
    ));
  };

  const removeCourseFromGroup = (groupId, course) => {
    setLinkedGroups(linkedGroups.map(g =>
      g.id === groupId
        ? { ...g, courses: g.courses.filter(c => c !== course) }
        : g
    ));
  };

  const removeLinkedGroup = (groupId) => {
    setLinkedGroups(linkedGroups.filter(g => g.id !== groupId));
  };

  const timeToMinutes = (time) => {
    if (!time) return 0;
    const hours = parseInt(time.substring(0, 2));
    const minutes = parseInt(time.substring(2, 4));
    return hours * 60 + minutes;
  };

  const formatTime = (time) => {
    if (!time) return '';
    const hours = parseInt(time.substring(0, 2));
    const minutes = time.substring(2, 4);
    const period = hours >= 12 ? 'PM' : 'AM';
    return `${hours > 12 ? hours - 12 : hours === 0 ? 12 : hours}:${minutes} ${period}`;
  };

  const formatDays = (meetingTime) => {
    if (!meetingTime) return '';
    const days = [];
    if (meetingTime.monday) days.push('M');
    if (meetingTime.tuesday) days.push('T');
    if (meetingTime.wednesday) days.push('W');
    if (meetingTime.thursday) days.push('R');
    if (meetingTime.friday) days.push('F');
    return days.join('');
  };

  const scoreSchedule = (sections) => {
    let score = 100;
    const meetingTimes = sections.map(s => s.meetingsFaculty?.[0]?.meetingTime).filter(Boolean);
    
    if (meetingTimes.length === 0) return 50;
    
    const startTimes = meetingTimes.map(mt => timeToMinutes(mt.beginTime));
    const endTimes = meetingTimes.map(mt => timeToMinutes(mt.endTime));
    const earliestStart = Math.min(...startTimes);
    const latestEnd = Math.max(...endTimes);
    const daySpan = latestEnd - earliestStart;
    
    if (preference === 'early') {
      // Penalize if classes end too late
      if (latestEnd > 840) score -= 20;  // After 2:00 PM
      if (earliestStart > 540) score -= 10;  // After 9:00 AM
    } else if (preference === 'late') {
      // Penalize if classes start too early or end too early
      if (earliestStart < 600) score -= 20;  // Before 10:00 AM
      if (latestEnd < 900) score -= 10;  // Before 3:00 PM
    } else if (preference === 'balanced') {
      // Prefer classes starting 9 AM or later, penalize 8 AM classes
      if (earliestStart < 510) score -= 25;  // Before 8:30 AM (heavy penalty)
      if (earliestStart < 540) score -= 15;  // Before 9:00 AM (moderate penalty)
      
      // Prefer classes that don't end too late
      if (latestEnd > 960) score -= 15;  // After 4:00 PM
      if (latestEnd > 1020) score -= 10;  // After 5:00 PM
      
      // Prefer more centered times
      if (earliestStart >= 540 && earliestStart <= 600) score += 10;  // 9:00-10:00 AM start bonus
      if (latestEnd >= 840 && latestEnd <= 900) score += 5;  // 2:00-3:00 PM end bonus
    } else if (preference === 'compact') {
      // Penalize long day spans
      const excessMinutes = (daySpan - 300) / 30;
      score -= Math.max(0, excessMinutes * 5);
    }
    
    // Check for gaps between classes (too short or too long)
    for (let i = 0; i < meetingTimes.length - 1; i++) {
      const gap = timeToMinutes(meetingTimes[i + 1].beginTime) - timeToMinutes(meetingTimes[i].endTime);
      if (gap < 15) score -= 10;  // Too tight
      if (gap > 180) score -= 5;  // Too long
    }
    
    // Penalize if seats aren't available
    if (!sections.every(s => s.seatsAvailable > 0)) {
      score -= 30;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const generateSchedules = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const generatedSchedules = [];
    
    for (let scheduleNum = 1; scheduleNum <= 3; scheduleNum++) {
      const sections = selectedCourses.map((course, courseIdx) => {
        const parts = course.split(' ');
        let startTime, endTime, days;
        
        if (preference === 'early') {
          startTime = courseIdx % 2 === 0 ? '0800' : '0930';
          endTime = courseIdx % 2 === 0 ? '0915' : '1045';
          days = { monday: true, wednesday: true, friday: true };
        } else if (preference === 'late') {
          startTime = courseIdx % 2 === 0 ? '1400' : '1530';
          endTime = courseIdx % 2 === 0 ? '1515' : '1645';
          days = { tuesday: true, thursday: true };
        } else if (preference === 'mwf') {
          startTime = ['0900', '1030', '1200', '1330'][courseIdx % 4];
          endTime = ['1015', '1145', '1315', '1445'][courseIdx % 4];
          days = { monday: true, wednesday: true, friday: true };
        } else if (preference === 'tr') {
          startTime = ['0900', '1030', '1230', '1400'][courseIdx % 4];
          endTime = ['1015', '1145', '1345', '1515'][courseIdx % 4];
          days = { tuesday: true, thursday: true };
        } else if (preference === 'compact') {
          startTime = ['0930', '1100', '1220', '1325'][courseIdx % 4];
          endTime = ['1045', '1215', '1335', '1440'][courseIdx % 4];
          days = courseIdx % 2 === 0 
            ? { monday: true, wednesday: true, friday: true }
            : { tuesday: true, thursday: true };
        } else {  // balanced
          startTime = ['0900', '1030', '1200', '1400'][courseIdx % 4];
          endTime = ['1015', '1145', '1315', '1515'][courseIdx % 4];
          days = courseIdx % 2 === 0
            ? { monday: true, wednesday: true, friday: true }
            : { tuesday: true, thursday: true };
        }
        
        return {
          courseReferenceNumber: `${10000 + scheduleNum * 100 + courseIdx}`,
          subject: parts[0] || 'SUBJ',
          courseNumber: parts[1] || '0000',
          sequenceNumber: linkedGroups.some(g => g.courses.includes(course)) 
            ? '001' 
            : `00${(courseIdx + scheduleNum) % 9 + 1}`,
          courseTitle: `${course} - Introduction`,
          meetingsFaculty: [{
            meetingTime: {
              beginTime: startTime,
              endTime: endTime,
              ...days,
              building: ['POWERS', 'LEE', 'COOPER', 'DANIEL'][courseIdx % 4],
              room: `${100 + courseIdx * 10 + scheduleNum}`
            }
          }],
          faculty: [{
            displayName: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown'][courseIdx % 4]
          }],
          seatsAvailable: Math.max(0, 30 - scheduleNum * 5 - courseIdx * 2)
        };
      });
      
      const schedule = {
        id: scheduleNum,
        sections: sections
      };
      schedule.score = scoreSchedule(sections);
      generatedSchedules.push(schedule);
    }
    
    generatedSchedules.sort((a, b) => b.score - a.score);
    setSchedules(generatedSchedules);
    setLoading(false);
  };

  const exportSchedule = (schedule) => {
    const text = schedule.sections.map(section => {
      const mt = section.meetingsFaculty?.[0]?.meetingTime;
      return `${section.subject} ${section.courseNumber}-${section.sequenceNumber}
${section.courseTitle}
CRN: ${section.courseReferenceNumber}
Time: ${formatTime(mt?.beginTime)} - ${formatTime(mt?.endTime)}
Days: ${formatDays(mt)}
Location: ${mt?.building} ${mt?.room}
Professor: ${section.faculty?.[0]?.displayName}
Seats: ${section.seatsAvailable}
---`;
    }).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schedule-${schedule.id}.txt`;
    link.click();
  };

  const getPreferenceInfo = (pref) => {
    switch (pref) {
      case 'early':
        return { label: 'Early Bird', desc: 'Classes end by early afternoon', icon: '🌅' };
      case 'late':
        return { label: 'Night Owl', desc: 'Classes start later in the day', icon: '🌙' };
      case 'compact':
        return { label: 'Compact', desc: 'Minimize gaps between classes', icon: '⚡' };
      case 'mwf':
        return { label: 'MWF Focus', desc: 'Prefer Monday/Wednesday/Friday', icon: '📅' };
      case 'tr':
        return { label: 'T/R Focus', desc: 'Prefer Tuesday/Thursday', icon: '📆' };
      default:
        return { label: 'Balanced', desc: 'Even distribution throughout day', icon: '⚖️' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-orange-600 mb-2">
                Clemson Class Scheduler
              </h1>
              <p className="text-gray-600">Find your perfect class schedule</p>
            </div>
            <div className="text-right">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="202601">Spring 2026</option>
                <option value="202508">Fall 2025</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Courses
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g., ENGR 1410, CPSC 1010, MATH 1060"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && inputValue.trim()) {
                    addCourse(inputValue.trim().toUpperCase());
                    setInputValue('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (inputValue.trim()) {
                    addCourse(inputValue.trim().toUpperCase());
                    setInputValue('');
                  }
                }}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Add
              </button>
            </div>
          </div>

          {selectedCourses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Selected Courses
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedCourses.map((course, idx) => (
                  <div
                    key={idx}
                    className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    <span className="font-medium">{course}</span>
                    <button
                      onClick={() => removeCourse(course)}
                      className="hover:bg-orange-200 rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Linked Courses
                </h3>
                <p className="text-sm text-gray-600">
                  Courses that must have matching section numbers
                </p>
              </div>
              <button
                onClick={addLinkedGroup}
                disabled={selectedCourses.length < 2}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg">🔗</span>
                Add Link Group
              </button>
            </div>
            {linkedGroups.map(group => (
              <div
                key={group.id}
                className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-purple-700 font-medium">
                    <span className="text-lg">🔗</span>
                    <span>Must have same section number</span>
                  </div>
                  <button
                    onClick={() => removeLinkedGroup(group.id)}
                    className="text-red-600 hover:bg-red-100 rounded-full p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {group.courses.map((course, idx) => (
                    <div
                      key={idx}
                      className="bg-white text-purple-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                    >
                      <span>{course}</span>
                      <button
                        onClick={() => removeCourseFromGroup(group.id, course)}
                        className="hover:bg-purple-100 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addCourseToGroup(group.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">+ Add course to this link group</option>
                  {selectedCourses
                    .filter(c => !group.courses.includes(c))
                    .map((course, idx) => (
                      <option key={idx} value={course}>{course}</option>
                    ))}
                </select>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Schedule Preference
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['balanced', 'early', 'late', 'compact', 'mwf', 'tr'].map(pref => {
                const info = getPreferenceInfo(pref);
                return (
                  <button
                    key={pref}
                    onClick={() => setPreference(pref)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preference === pref
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{info.icon}</div>
                    <div className="font-semibold text-gray-800">{info.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{info.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={generateSchedules}
            disabled={selectedCourses.length === 0 || loading}
            className="w-full bg-gradient-to-r from-orange-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-orange-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Generating Schedules...
              </>
            ) : (
              <>
                <Calendar size={24} />
                Generate Schedules
              </>
            )}
          </button>
        </div>

        {schedules.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Generated Schedules
            </h2>
            {schedules.map(schedule => (
              <div key={schedule.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`px-4 py-2 rounded-full font-semibold ${
                        schedule.score >= 80
                          ? 'bg-green-100 text-green-800'
                          : schedule.score >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      Score: {Math.round(schedule.score)}%
                    </div>
                    <span className="text-gray-600">Schedule Option {schedule.id}</span>
                  </div>
                  <button
                    onClick={() => exportSchedule(schedule)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Download size={18} />
                    Export
                  </button>
                </div>
                <div className="grid gap-4">
                  {schedule.sections.map((section, idx) => {
                    const mt = section.meetingsFaculty?.[0]?.meetingTime;
                    return (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {section.subject} {section.courseNumber}-{section.sequenceNumber}
                              </h3>
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                CRN: {section.courseReferenceNumber}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{section.courseTitle}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Clock size={16} className="text-orange-600 flex-shrink-0" />
                                <span>
                                  {formatTime(mt?.beginTime)} - {formatTime(mt?.endTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Calendar size={16} className="text-purple-600 flex-shrink-0" />
                                <span>{formatDays(mt)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Users
                                  size={16}
                                  className={`flex-shrink-0 ${
                                    section.seatsAvailable > 10
                                      ? 'text-green-600'
                                      : section.seatsAvailable > 0
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                  }`}
                                />
                                <span>{section.seatsAvailable} seats available</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <span>📍</span>
                                <span>{mt?.building} {mt?.room}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700 col-span-full">
                                <span>👨‍🏫</span>
                                <span>{section.faculty?.[0]?.displayName}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {schedules.length === 0 && !loading && selectedCourses.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <CircleAlert size={48} className="text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Ready to Generate
            </h3>
            <p className="text-blue-700">
              Click "Generate Schedules" to find your optimal class schedule!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleBuilder;
