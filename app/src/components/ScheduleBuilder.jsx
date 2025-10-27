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
      if (latestEnd > 840) score -= 20;
      if (earliestStart > 540) score -= 10;
    } else if (preference === 'late') {
      if (earliestStart < 600) score -= 20;
      if (latestEnd < 900) score -= 10;
    } else if (preference === 'balanced') {
      if (earliestStart < 510) score -= 25;
      if (earliestStart < 540) score -= 15;
      if (latestEnd > 960) score -= 15;
      if (latestEnd > 1020) score -= 10;
      if (earliestStart >= 540 && earliestStart <= 600) score += 10;
      if (latestEnd >= 840 && latestEnd <= 900) score += 5;
    } else if (preference === 'compact') {
      const excessMinutes = (daySpan - 300) / 30;
      score -= Math.max(0, excessMinutes * 5);
    }
    
    for (let i = 0; i < meetingTimes.length - 1; i++) {
      const gap = timeToMinutes(meetingTimes[i + 1].beginTime) - timeToMinutes(meetingTimes[i].endTime);
      if (gap < 15) score -= 10;
      if (gap > 180) score -= 5;
    }
    
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
        } else {
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 p-4 relative overflow-hidden">
      {/* Tiger Paw Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, #F66733 2px, transparent 2px),
                         radial-gradient(circle at 75% 75%, #522D80 2px, transparent 2px)`,
        backgroundSize: '120px 120px'
      }}></div>
      
      {/* Clemson Stripe Accent */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-orange-500 to-purple-600 z-50 shadow-lg"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 border-t-4 border-orange-500 relative overflow-hidden">
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100 to-transparent rounded-bl-full opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-100 to-transparent rounded-tr-full opacity-50"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-4">
              {/* Tiger Paw Icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🐅</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-orange-500 to-purple-600 bg-clip-text text-transparent mb-2 animate-gradient">
                  Clemson Class Scheduler
                </h1>
                <p className="text-gray-600 font-medium">Find your perfect Tigers schedule 🐾</p>
              </div>
            </div>
            <div className="text-right bg-gradient-to-br from-purple-50 to-orange-50 p-4 rounded-xl border-2 border-purple-200 shadow-md">
              <label className="block text-sm font-bold text-purple-700 mb-2">
                Term
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="border-2 border-orange-300 rounded-lg px-4 py-2 font-semibold text-gray-700 focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all bg-white shadow-sm hover:shadow-md"
              >
                <option value="202601">Spring 2026</option>
                <option value="202508">Fall 2025</option>
              </select>
            </div>
          </div>

          {/* Clemson Stripe Divider */}
          <div className="h-1 bg-gradient-to-r from-purple-500 via-orange-500 to-purple-500 rounded-full mb-6 shadow-sm"></div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-orange-500">📚</span>
              Add Courses
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g., ENGR 1410, CPSC 1010, MATH 1060"
                className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all shadow-sm hover:shadow-md font-medium"
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
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center gap-2 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Plus size={20} />
                Add
              </button>
            </div>
          </div>

          {selectedCourses.length > 0 && (
            <div className="mb-6 bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border-2 border-orange-200 shadow-inner">
              <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
                <span>🎯</span>
                Selected Courses
              </h3>
              <div className="flex flex-wrap gap-3">
                {selectedCourses.map((course, idx) => (
                  <div
                    key={idx}
                    className="bg-white border-2 border-orange-300 text-orange-800 px-4 py-2 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="font-bold">{course}</span>
                    <button
                      onClick={() => removeCourse(course)}
                      className="hover:bg-orange-200 rounded-full p-1 transition-colors"
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
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-purple-600">🔗</span>
                  Linked Courses
                </h3>
                <p className="text-sm text-gray-600">
                  Courses that must have matching section numbers
                </p>
              </div>
              <button
                onClick={addLinkedGroup}
                disabled={selectedCourses.length < 2}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none"
              >
                <span className="text-lg">🔗</span>
                Add Link Group
              </button>
            </div>
            {linkedGroups.map(group => (
              <div
                key={group.id}
                className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-4 mb-3 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-purple-700 font-bold">
                    <span className="text-lg">🔗</span>
                    <span>Must have same section number</span>
                  </div>
                  <button
                    onClick={() => removeLinkedGroup(group.id)}
                    className="text-red-600 hover:bg-red-100 rounded-full p-2 transition-all transform hover:scale-110"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {group.courses.map((course, idx) => (
                    <div
                      key={idx}
                      className="bg-white border-2 border-purple-300 text-purple-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-semibold shadow-sm"
                    >
                      <span>{course}</span>
                      <button
                        onClick={() => removeCourseFromGroup(group.id, course)}
                        className="hover:bg-purple-100 rounded-full p-0.5 transition-colors"
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
                  className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all bg-white shadow-sm"
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
            <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="text-orange-500">⚙️</span>
              Schedule Preference
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['balanced', 'early', 'late', 'compact', 'mwf', 'tr'].map(pref => {
                const info = getPreferenceInfo(pref);
                return (
                  <button
                    key={pref}
                    onClick={() => setPreference(pref)}
                    className={`p-5 rounded-xl border-3 transition-all duration-300 transform hover:scale-105 ${
                      preference === pref
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-purple-50 shadow-lg scale-105 ring-4 ring-orange-200'
                        : 'border-gray-300 bg-white hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-3xl mb-2">{info.icon}</div>
                    <div className="font-bold text-gray-800">{info.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{info.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={generateSchedules}
            disabled={selectedCourses.length === 0 || loading}
            className="w-full bg-gradient-to-r from-orange-500 via-purple-500 to-orange-500 bg-[length:200%_100%] text-white py-5 rounded-xl font-bold text-lg hover:bg-[position:right_center] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:transform-none flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                Generating Your Tiger Schedule...
              </>
            ) : (
              <>
                <Calendar size={24} />
                Generate Schedules
                <span className="text-2xl">🐅</span>
              </>
            )}
          </button>
        </div>

        {schedules.length > 0 && (
          <div className="space-y-5">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
              <span className="text-orange-500">📋</span>
              Generated Schedules
            </h2>
            {schedules.map(schedule => (
              <div key={schedule.id} className="bg-white rounded-2xl shadow-xl p-6 border-l-8 border-orange-500 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div
                      className={`px-6 py-3 rounded-full font-bold text-lg shadow-md ${
                        schedule.score >= 80
                          ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                          : schedule.score >= 60
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                          : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                      }`}
                    >
                      Score: {Math.round(schedule.score)}%
                    </div>
                    <span className="text-gray-700 font-bold text-lg flex items-center gap-2">
                      <span className="text-purple-500">🎯</span>
                      Schedule Option {schedule.id}
                    </span>
                  </div>
                  <button
                    onClick={() => exportSchedule(schedule)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Download size={20} />
                    Export
                  </button>
                </div>
                <div className="grid gap-4">
                  {schedule.sections.map((section, idx) => {
                    const mt = section.meetingsFaculty?.[0]?.meetingTime;
                    return (
                      <div
                        key={idx}
                        className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-orange-300 transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <h3 className="text-xl font-bold text-gray-800">
                                {section.subject} {section.courseNumber}-{section.sequenceNumber}
                              </h3>
                              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-semibold border-2 border-gray-200">
                                CRN: {section.courseReferenceNumber}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-4 font-medium">{section.courseTitle}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-3 text-gray-700 bg-white p-3 rounded-lg border border-orange-200">
                                <Clock size={18} className="text-orange-600 flex-shrink-0" />
                                <span className="font-semibold">
                                  {formatTime(mt?.beginTime)} - {formatTime(mt?.endTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-gray-700 bg-white p-3 rounded-lg border border-purple-200">
                                <Calendar size={18} className="text-purple-600 flex-shrink-0" />
                                <span className="font-semibold">{formatDays(mt)}</span>
                              </div>
                              <div className="flex items-center gap-3 text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                                <Users
                                  size={18}
                                  className={`flex-shrink-0 ${
                                    section.seatsAvailable > 10
                                      ? 'text-green-600'
                                      : section.seatsAvailable > 0
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                  }`}
                                />
                                <span className="font-semibold">{section.seatsAvailable} seats available</span>
                              </div>
                              <div className="flex items-center gap-3 text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                                <span className="text-lg">📍</span>
                                <span className="font-semibold">{mt?.building} {mt?.room}</span>
                              </div>
                              <div className="flex items-center gap-3 text-gray-700 bg-white p-3 rounded-lg border border-gray-200 col-span-full">
                                <span className="text-lg">👨‍🏫</span>
                                <span className="font-semibold">{section.faculty?.[0]?.displayName}</span>
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
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-3 border-blue-300 rounded-2xl p-8 text-center shadow-xl">
            <CircleAlert size={56} className="text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-blue-900 mb-3">
              Ready to Generate! 🐅
            </h3>
            <p className="text-blue-700 font-medium text-lg">
              Click "Generate Schedules" to find your optimal Tiger class schedule!
            </p>
          </div>
        )}
      </div>
      
      {/* Bottom Stripe */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-orange-500 to-purple-600 z-50 shadow-lg"></div>
    </div>
  );
};

export default ScheduleBuilder;
