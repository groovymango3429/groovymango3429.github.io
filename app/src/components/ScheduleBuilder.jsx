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
    <div className="container">
      <div className="main-card">
        <div className="header">
          <div>
            <h1>🐅 Clemson Class Scheduler</h1>
            <p className="subtitle">Find your perfect class schedule</p>
          </div>
          <div className="term-badge">
            {term === '202601' ? 'Spring 2026' : 'Fall 2025'}
          </div>
        </div>

        <div className="section">
          <label htmlFor="courseInput">Add Courses</label>
          <div className="input-group">
            <input
              type="text"
              id="courseInput"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g., ENGR 1410, CPSC 1010, MATH 1060"
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
              className="btn-primary"
            >
              <Plus size={20} />
              Add
            </button>
          </div>
        </div>

        {selectedCourses.length > 0 && (
          <div className="section">
            <h3>Selected Courses</h3>
            <div className="course-tags">
              {selectedCourses.map((course, idx) => (
                <div key={idx} className="course-tag">
                  <span>{course}</span>
                  <button onClick={() => removeCourse(course)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section">
          <div className="section-header">
            <div>
              <h3>Linked Courses</h3>
              <p className="helper-text">Courses that must have matching section numbers</p>
            </div>
            <button
              onClick={addLinkedGroup}
              disabled={selectedCourses.length < 2}
              className="btn-secondary"
            >
              <span>🔗</span>
              Add Link Group
            </button>
          </div>
          {linkedGroups.map(group => (
            <div key={group.id} className="linked-group">
              <div className="linked-group-header">
                <div className="linked-group-title">
                  <span>🔗</span>
                  <span>Must have same section number</span>
                </div>
                <button onClick={() => removeLinkedGroup(group.id)} style={{background: 'none', color: '#dc2626', padding: '0.25rem'}}>
                  <X size={18} />
                </button>
              </div>
              <div className="linked-courses">
                {group.courses.map((course, idx) => (
                  <div key={idx} className="linked-course-tag">
                    <span>{course}</span>
                    <button onClick={() => removeCourseFromGroup(group.id, course)} style={{background: 'none', color: '#522d80', padding: '0.125rem'}}>
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
                style={{width: '100%', padding: '0.5rem', border: '2px solid #522d80'}}
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

        <div className="section">
          <label>Schedule Preference</label>
          <div className="schedule-types">
            {['balanced', 'early', 'late', 'compact', 'mwf', 'tr'].map(pref => {
              const info = getPreferenceInfo(pref);
              return (
                <button
                  key={pref}
                  onClick={() => setPreference(pref)}
                  className={`schedule-type ${preference === pref ? 'active' : ''}`}
                >
                  <div className="icon">{info.icon}</div>
                  <div className="label">{info.label}</div>
                  <div className="desc">{info.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={generateSchedules}
          disabled={selectedCourses.length === 0 || loading}
          className="btn-generate"
        >
          <Calendar size={24} />
          {loading ? 'Generating Schedules...' : 'Generate Schedules'}
        </button>
      </div>

      {schedules.length > 0 && (
        <div id="schedulesSection">
          <h2>Generated Schedules</h2>
          {schedules.map(schedule => (
            <div key={schedule.id} className="schedule-card">
              <div className="schedule-header">
                <div className="schedule-info">
                  <div className={`score-badge ${
                    schedule.score >= 80 ? 'score-high' :
                    schedule.score >= 60 ? 'score-medium' : 'score-low'
                  }`}>
                    Score: {Math.round(schedule.score)}%
                  </div>
                  <span style={{color: '#6b7280', fontWeight: '600'}}>Schedule Option {schedule.id}</span>
                </div>
                <button onClick={() => exportSchedule(schedule)} className="btn-export">
                  <Download size={18} />
                  Export
                </button>
              </div>
              <div>
                {schedule.sections.map((section, idx) => {
                  const mt = section.meetingsFaculty?.[0]?.meetingTime;
                  return (
                    <div key={idx} className="class-section">
                      <div className="class-header">
                        <h3 className="class-title">
                          {section.subject} {section.courseNumber}-{section.sequenceNumber}
                        </h3>
                        <span className="crn-badge">
                          CRN: {section.courseReferenceNumber}
                        </span>
                      </div>
                      <p className="class-name">{section.courseTitle}</p>
                      <div className="class-details">
                        <div className="detail-item">
                          <Clock size={16} style={{color: '#f56600'}} />
                          <span>{formatTime(mt?.beginTime)} - {formatTime(mt?.endTime)}</span>
                        </div>
                        <div className="detail-item">
                          <Calendar size={16} style={{color: '#522d80'}} />
                          <span>{formatDays(mt)}</span>
                        </div>
                        <div className="detail-item">
                          <Users size={16} style={{
                            color: section.seatsAvailable > 10 ? '#059669' :
                                   section.seatsAvailable > 0 ? '#d97706' : '#dc2626'
                          }} />
                          <span>{section.seatsAvailable} seats available</span>
                        </div>
                        <div className="detail-item">
                          <span>📍</span>
                          <span>{mt?.building} {mt?.room}</span>
                        </div>
                        <div className="detail-item">
                          <span>👨‍🏫</span>
                          <span>{section.faculty?.[0]?.displayName}</span>
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
        <div className="ready-card">
          <CircleAlert size={48} style={{color: '#f56600', marginBottom: '1rem'}} />
          <h3>Ready to Generate</h3>
          <p>Click "Generate Schedules" to find your optimal class schedule!</p>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Generating Schedules...</p>
        </div>
      )}
    </div>
  );
};

export default ScheduleBuilder;