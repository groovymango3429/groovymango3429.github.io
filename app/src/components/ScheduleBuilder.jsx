import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, AlertCircle, Plus, X, Download } from 'lucide-react';

const ClassScheduler = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [linkedCourses, setLinkedCourses] = useState([]);
  const [scheduleType, setScheduleType] = useState('balanced');
  const [generatedSchedules, setGeneratedSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [termCode, setTermCode] = useState('202601');
  const [apiUrl, setApiUrl] = useState('https://regssb.sis.clemson.edu/StudentRegistrationSsb/ssb/searchResults/searchResults');

  const addCourse = (course) => {
    if (!selectedCourses.find(c => c === course)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const removeCourse = (course) => {
    setSelectedCourses(selectedCourses.filter(c => c !== course));
    setLinkedCourses(linkedCourses.filter(link => 
      !link.courses.includes(course)
    ));
  };

  const addLinkedGroup = () => {
    setLinkedCourses([...linkedCourses, { id: Date.now(), courses: [] }]);
  };

  const addCourseToLink = (linkId, course) => {
    setLinkedCourses(linkedCourses.map(link => {
      if (link.id === linkId) {
        if (!link.courses.includes(course)) {
          return { ...link, courses: [...link.courses, course] };
        }
      }
      return link;
    }));
  };

  const removeCourseFromLink = (linkId, course) => {
    setLinkedCourses(linkedCourses.map(link => {
      if (link.id === linkId) {
        return { ...link, courses: link.courses.filter(c => c !== course) };
      }
      return link;
    }));
  };

  const removeLinkedGroup = (linkId) => {
    setLinkedCourses(linkedCourses.filter(link => link.id !== linkId));
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const hour = parseInt(timeStr.substring(0, 2));
    const min = parseInt(timeStr.substring(2, 4));
    return hour * 60 + min;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const hour = parseInt(timeStr.substring(0, 2));
    const min = timeStr.substring(2, 4);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${min} ${ampm}`;
  };

  const getDaysString = (meeting) => {
    if (!meeting) return '';
    const days = [];
    if (meeting.monday) days.push('M');
    if (meeting.tuesday) days.push('T');
    if (meeting.wednesday) days.push('W');
    if (meeting.thursday) days.push('R');
    if (meeting.friday) days.push('F');
    return days.join('');
  };

  const hasTimeConflict = (section1, section2) => {
    const meeting1 = section1.meetingsFaculty?.[0]?.meetingTime;
    const meeting2 = section2.meetingsFaculty?.[0]?.meetingTime;
    
    if (!meeting1 || !meeting2) return false;

    const days1 = getDaysString(meeting1);
    const days2 = getDaysString(meeting2);
    
    const hasCommonDay = days1.split('').some(d => days2.includes(d));
    if (!hasCommonDay) return false;

    const start1 = parseTime(meeting1.beginTime);
    const end1 = parseTime(meeting1.endTime);
    const start2 = parseTime(meeting2.beginTime);
    const end2 = parseTime(meeting2.endTime);

    return !(end1 <= start2 || end2 <= start1);
  };

  const scoreSchedule = (sections) => {
    let score = 100;
    const meetings = sections.map(s => s.meetingsFaculty?.[0]?.meetingTime).filter(Boolean);
    
    if (meetings.length === 0) return 50;

    const times = meetings.map(m => parseTime(m.beginTime));
    const endTimes = meetings.map(m => parseTime(m.endTime));
    
    const earliestStart = Math.min(...times);
    const latestEnd = Math.max(...endTimes);
    const totalSpan = latestEnd - earliestStart;

    if (scheduleType === 'early') {
      if (latestEnd > 840) score -= 20;
      if (earliestStart > 540) score -= 10;
    } else if (scheduleType === 'late') {
      if (earliestStart < 600) score -= 20;
      if (latestEnd < 900) score -= 10;
    } else if (scheduleType === 'compact') {
      const gapPenalty = (totalSpan - 300) / 30;
      score -= Math.max(0, gapPenalty * 5);
    }

    for (let i = 0; i < meetings.length - 1; i++) {
      const gap = parseTime(meetings[i + 1].beginTime) - parseTime(meetings[i].endTime);
      if (gap < 15) score -= 10;
      if (gap > 180) score -= 5;
    }

    const hasSeats = sections.every(s => s.seatsAvailable > 0);
    if (!hasSeats) score -= 30;

    return Math.max(0, Math.min(100, score));
  };

  const generateSchedules = async () => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockSchedules = [];
    
    for (let i = 1; i <= 3; i++) {
      const sections = selectedCourses.map((course, idx) => {
        const parts = course.split(' ');
        let startTime, endTime, days;
        
        if (scheduleType === 'early') {
          startTime = idx % 2 === 0 ? '0800' : '0930';
          endTime = idx % 2 === 0 ? '0915' : '1045';
          days = { monday: true, wednesday: true, friday: true };
        } else if (scheduleType === 'late') {
          startTime = idx % 2 === 0 ? '1400' : '1530';
          endTime = idx % 2 === 0 ? '1515' : '1645';
          days = { tuesday: true, thursday: true };
        } else if (scheduleType === 'mwf') {
          startTime = ['0800', '0930', '1100', '1220'][idx % 4];
          endTime = ['0915', '1045', '1215', '1335'][idx % 4];
          days = { monday: true, wednesday: true, friday: true };
        } else if (scheduleType === 'tr') {
          startTime = ['0800', '0930', '1230', '1400'][idx % 4];
          endTime = ['0915', '1045', '1345', '1515'][idx % 4];
          days = { tuesday: true, thursday: true };
        } else if (scheduleType === 'compact') {
          startTime = ['0930', '1100', '1220', '1325'][idx % 4];
          endTime = ['1045', '1215', '1335', '1440'][idx % 4];
          days = idx % 2 === 0 
            ? { monday: true, wednesday: true, friday: true }
            : { tuesday: true, thursday: true };
        } else {
          startTime = ['0800', '0930', '1100', '1400'][idx % 4];
          endTime = ['0915', '1045', '1215', '1515'][idx % 4];
          days = idx % 2 === 0
            ? { monday: true, wednesday: true, friday: true }
            : { tuesday: true, thursday: true };
        }

        return {
          courseReferenceNumber: `${10000 + i * 100 + idx}`,
          subject: parts[0] || 'SUBJ',
          courseNumber: parts[1] || '0000',
          sequenceNumber: linkedCourses.some(link => link.courses.includes(course))
            ? '001'
            : `00${(idx + i) % 9 + 1}`,
          courseTitle: `${course} - Introduction`,
          meetingsFaculty: [{
            meetingTime: {
              beginTime: startTime,
              endTime: endTime,
              ...days,
              building: ['POWERS', 'LEE', 'COOPER', 'DANIEL'][idx % 4],
              room: `${100 + idx * 10 + i}`
            }
          }],
          faculty: [{ displayName: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown'][idx % 4] }],
          seatsAvailable: Math.max(0, 30 - i * 5 - idx * 2)
        };
      });

      const schedule = { id: i, sections };
      schedule.score = scoreSchedule(sections);
      mockSchedules.push(schedule);
    }

    mockSchedules.sort((a, b) => b.score - a.score);

    setGeneratedSchedules(mockSchedules);
    setLoading(false);
  };

  const exportSchedule = (schedule) => {
    const text = schedule.sections.map(s => {
      const meeting = s.meetingsFaculty?.[0]?.meetingTime;
      return `${s.subject} ${s.courseNumber}-${s.sequenceNumber}\n` +
             `${s.courseTitle}\n` +
             `${formatTime(meeting?.beginTime)} - ${formatTime(meeting?.endTime)}\n` +
             `${getDaysString(meeting)}\n` +
             `${meeting?.building} ${meeting?.room}\n` +
             `CRN: ${s.courseReferenceNumber}\n\n`;
    }).join('---\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${schedule.id}.txt`;
    a.click();
  };

  const getScheduleTypeInfo = (type) => {
    switch(type) {
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
                value={termCode}
                onChange={(e) => setTermCode(e.target.value)}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., ENGR 1410, CPSC 1010, MATH 1060"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    addCourse(searchTerm.trim().toUpperCase());
                    setSearchTerm('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (searchTerm.trim()) {
                    addCourse(searchTerm.trim().toUpperCase());
                    setSearchTerm('');
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
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Selected Courses</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCourses.map((course, idx) => (
                  <div key={idx} className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full flex items-center gap-2">
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
                <h3 className="text-lg font-semibold text-gray-800">Linked Courses</h3>
                <p className="text-sm text-gray-600">Courses that must have matching section numbers</p>
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

            {linkedCourses.map((link) => (
              <div key={link.id} className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-purple-700 font-medium">
                    <span className="text-lg">🔗</span>
                    <span>Must have same section number</span>
                  </div>
                  <button
                    onClick={() => removeLinkedGroup(link.id)}
                    className="text-red-600 hover:bg-red-100 rounded-full p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {link.courses.map((course, idx) => (
                    <div key={idx} className="bg-white text-purple-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                      <span>{course}</span>
                      <button
                        onClick={() => removeCourseFromLink(link.id, course)}
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
                      addCourseToLink(link.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">+ Add course to this link group</option>
                  {selectedCourses
                    .filter(c => !link.courses.includes(c))
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
              {['balanced', 'early', 'late', 'compact', 'mwf', 'tr'].map((type) => {
                const info = getScheduleTypeInfo(type);
                return (
                  <button
                    key={type}
                    onClick={() => setScheduleType(type)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      scheduleType === type
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
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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

        {generatedSchedules.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Generated Schedules</h2>
            {generatedSchedules.map((schedule) => (
              <div key={schedule.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-full font-semibold ${
                      schedule.score >= 80 ? 'bg-green-100 text-green-800' :
                      schedule.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
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
                    const meeting = section.meetingsFaculty?.[0]?.meetingTime;
                    return (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                                <span>{formatTime(meeting?.beginTime)} - {formatTime(meeting?.endTime)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Calendar size={16} className="text-purple-600 flex-shrink-0" />
                                <span>{getDaysString(meeting)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Users size={16} className={`flex-shrink-0 ${section.seatsAvailable > 10 ? 'text-green-600' : section.seatsAvailable > 0 ? 'text-yellow-600' : 'text-red-600'}`} />
                                <span>{section.seatsAvailable} seats available</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <span>📍</span>
                                <span>{meeting?.building} {meeting?.room}</span>
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

        {generatedSchedules.length === 0 && !loading && selectedCourses.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <AlertCircle size={48} className="text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Generate</h3>
            <p className="text-blue-700">Click "Generate Schedules" to find your optimal class schedule!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassScheduler;
