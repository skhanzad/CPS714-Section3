/**
 * ClassCalendar Component for Dashboard:
 * This component provides a weekly calendar view of the user's scheduled fitness classes pulled from Supabase.
 * It allows users to navigate between weeks and view their class schedule in a structured format.
 * 
 * The component receives the following prop:
 * - userId: A string representing the unique identifier of the user. This is used to fetch user-specific class schedule data from Supabase.
 * 
 * The following states are maintained within the component:
 * - currentWeekStart: A Date object representing the start date of the currently displayed week.
 * - events: An array of class schedule objects fetched from the "class_schedules" database in Supabase.
 * 
 * The component uses the useEffect hook to fetch class schedule data from Supabase when the component mounts
 * or when the userId prop or currentWeekStart state changes.
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { GiWeightLiftingUp, GiMuscleUp, GiRunningShoe, GiBiceps, GiBoxingGlove, GiStrongMan } from 'react-icons/gi';
import { FaDumbbell, FaHeartbeat } from 'react-icons/fa';
import { supabase } from '../../../lib/supabase';

interface classInSchedule {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  date: string;
  instructor: string;
}

interface ClassCalendarProps {
  userId: string;
}

export const ClassCalendar: React.FC<ClassCalendarProps> = ({ userId }) => {

  /* Set up weekly calendar state */
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [events, updateEvents] = useState<classInSchedule[]>([]);

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
  ];

  /* The start of the week is always Monday */
  function startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    /* Convert JS weekday (0=Sun..6=Sat) to an offset that makes Monday the start (0 = Monday)
       ((day + 6) % 7) gives 0 for Monday and 6 for Sunday. */
    const diff = d.getDate() - ((day + 6) % 7);
    return new Date(d.setDate(diff));
  }

  /* Get all days of the week from a start date */
  function daysOfWeek(startDate: Date): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  }

  /* Convert a Date object to a string in YYYY-MM-DD format */
  function dateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /* Basic Helper to format the day and date in the calendar header */
  function formatDayHeader(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    return `${date.getDate()} ${dayName}`;
  }

  /* Helper function that displays the month and year on the calendar */
  function monthYearDisplay(startDate: Date): string {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const startMonth = months[startDate.getMonth()];
    const endMonth = months[endDate.getMonth()];
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    /* Check if the date crosses month or year and will display accordingly*/
    if (startYear !== endYear) {
      /* e.g December 2025 - January 2026 */
      return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
    } else if (startMonth !== endMonth) {
      /* e.g November 2025 - December 2025 */
      return `${startMonth} - ${endMonth} ${startYear}`;
    } else {
      /* e.g November 2025 */
      return `${startMonth} ${startYear}`;
    }
  }

  /* Helper function to check if a given date is today */
  function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /* If the week changes or user hits the "today button" the data should be refreshed */
  useEffect(() => {
    fetchSchedule();
  }, [currentWeekStart, userId]);

  /* Grab the schedule data from team 3 */
  const fetchSchedule = async () => {
    try {
      const weekDays = daysOfWeek(currentWeekStart);
      const startDate = dateString(weekDays[0]);
      const endDate = dateString(weekDays[6]);

      const { data, error } = await supabase
        .from('class_schedules')
        .select(`
          id,
          scheduled_date,
          start_time,
          end_time,
          fitness_classes (
            name,
            instructor_name
          )
        `)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate);

      if (error) throw error;

      if (!data) {
        updateEvents([]);
        return;
      }

      const formattedEvents = data
        .filter(event => event.scheduled_date && event.start_time && event.end_time) // Filter out events with missing crucial data
        .map((event: any) => ({
          id: event.id,
          title: event.fitness_classes?.name || 'Unknown Class',
          start_time: event.start_time,
          end_time: event.end_time,
          date: event.scheduled_date,
          instructor: event.fitness_classes?.instructor_name || 'N/A',
        }));

      updateEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  /* Update Schedule View depending on which arrow button is pressed */
  const updateWeek = (direction: 0 | 1 | 2, goToCurrentWeek: 0 | 1) => {
    if (goToCurrentWeek === 1) {
      setCurrentWeekStart(startOfWeek(new Date()));
    }
    else {
      const updatedDate = new Date(currentWeekStart);
      const addDate = direction === 1 ? -7 : 7
      updatedDate.setDate(currentWeekStart.getDate() + addDate)
      setCurrentWeekStart(updatedDate);
    }
  };

  /* Helper function that calculates the minutes difference from 9am */
  function eventPosition(startTime: string): number {
    // Accept both 12-hour strings like "9:00 AM" and 24-hour SQL times like "09:00:00" or "09:00"
    let hours = 0;
    let minutes = 0;

    if (/AM|PM/i.test(startTime)) {
      const [time, period] = startTime.split(' ');
      [hours, minutes] = time.split(':').map(Number);
      if (/PM/i.test(period) && hours !== 12) hours += 12;
      if (/AM/i.test(period) && hours === 12) hours = 0;
    } else {
      // Handle "HH:MM:SS" or "HH:MM"
      const parts = startTime.split(':').map(Number);
      hours = parts[0] || 0;
      minutes = parts[1] || 0;
    }

    const startHour = 9;
    const position = (hours - startHour) * 60 + minutes;
    return position;
  }

  function formatTime(start_time: string): string {
    let hours = 0;
    let minutes = 0;
    let period = "";

    const parts_of_time = start_time.split(':').map(Number);

    if (parts_of_time[0] > 12) {
      hours = parts_of_time[0] - 12;
      period = "PM";
    }
    else {
      hours = parts_of_time[0];
      period = "AM";
    }
    minutes = parts_of_time[1];

    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /* Gets the events duration which allows you to calculate the height of the block in the calendar */
  function eventblockHeight(startTime: string, endTime: string): number {
    const start = eventPosition(startTime);
    const end = eventPosition(endTime);
    return end - start;
  }

  /* Basic helper function to provide you the number of pixels needed if the event does not start on the hour */
  function minutesPastHour(position: number): number {
    return position % 60
  }

  /* Helper function to get events for a specific day */
  function todaysEvents(date: Date): classInSchedule[] {
    return events.filter(event => event.date === dateString(date));
  }

  /* Add icons to events for fun and extra personalization */
  function getRandomIcon(eventId: string) {
    const icons = [
      GiWeightLiftingUp,
      GiMuscleUp,
      GiRunningShoe,
      GiBiceps,
      GiBoxingGlove,
      GiStrongMan,
      FaDumbbell,
      FaHeartbeat
    ];

    /* Use the ID to generate a random icon to be added to the class in the calendar*/
    const hash = eventId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const iconIndex = hash % icons.length;
    return icons[iconIndex];
  }

  const weekDays = daysOfWeek(currentWeekStart);

  return (
    <div className="relative base-container overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1728486145245-d4cb0c9c3470?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-gold-400" />
              <h1 className="text-2xl font-bold text-gray-100">Fitness Schedule</h1>
            </div>
            <h2 className="ml-9 text-xs font-bold text-gray-100">{monthYearDisplay(currentWeekStart)}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateWeek(0, 1)}
              className="p-2 general-button-hover rounded-lg font-medium text-sm"
            >
              Today
            </button>
            <button
              onClick={() => updateWeek(1, 0)}
              className="p-2 general-button-hover rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => updateWeek(2, 0)}
              className="p-2 general-button-hover rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Grid */}
            <div className="grid grid-cols-8 gap-px bg-gray-800/30 rounded-xl border border-gray-600/50">
              {/* Time column header */}
              <div className="bg-gray-700/90 p-3">
                <div className="text-sm font-bold text-gray-300">Time</div>
              </div>

              {/* Day header */}
              {weekDays.map((day, index) => (
                <div key={index} className={`bg-gray-700/90 p-3 text-center ${isToday(day) ? 'bg-gold-500/10 border-b-2 border-gold-500' : ''}`}>
                  <div className={`text-sm font-bold ${isToday(day) ? 'text-gold-400' : 'text-gray-300'}`}>
                    {formatDayHeader(day)}
                  </div>
                </div>
              ))}

              {/* Time slots and events */}
              {timeSlots.map((time, timeIndex) => (
                <React.Fragment key={`time-row-${timeIndex}`}>
                  {/* Time */}
                  <div key={`time-${timeIndex}`} className="bg-gray-700/90 p-3 text-right border border-gray-700/30">
                    <div className="text-sm text-gray-300 font-bold ">{time}</div>
                  </div>

                  {/* Fill Cells With Events If Any */}
                  {weekDays.map((day, dayIndex) => {
                    /* filter events to only the ones that fall in the 60 minutes between the start time and next time */
                    const dayEvents = todaysEvents(day);
                    const cellEvents = dayEvents.filter(event => {
                      const eventStartMinutes = eventPosition(event.start_time);
                      const timeFromStart = timeIndex * 60;
                      return eventStartMinutes >= timeFromStart && eventStartMinutes < timeFromStart + 60;
                    });

                    return (
                      <div
                        key={`cell-${timeIndex}-${dayIndex}`}
                        className={"relative bg-gray-800/30 p-1 min-h-[60px] overflow-visible items-list"}>
                        {cellEvents.map((event, eventIndex) => {
                          const IconComponent = getRandomIcon(event.id);
                          return (
                            <div
                              key={`event-${event.id}-${eventIndex}`}
                              className="absolute left-[1px] right-[1px] rounded-md p-2 text-xs transition-all duration-300 hover:scale-105 bg-gold-500/90 text-gray-900 border border-gold-400 z-10"
                              style={{
                                top: `${minutesPastHour(eventPosition(event.start_time))}px`,
                                height: `${eventblockHeight(event.start_time, event.end_time)}px`
                              }}>
                              <div className="flex items-center gap-1">
                                <IconComponent className="w-4 h-4 flex-shrink-0" />
                                <div className="font-bold truncate">{event.title}</div>
                              </div>
                              <div className="text-xs truncate ml-1">{formatTime(event.start_time)}-{formatTime(event.end_time)}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
