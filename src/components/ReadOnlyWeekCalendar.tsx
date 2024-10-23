import { Dayjs } from "dayjs";
import React, { useState, useEffect } from "react";

interface ReadOnlyWeekCalendarProps {
  selectedDate?: Dayjs;
  daysOfSchedule?: string; // Expecting 0,1,2,...,6 where 0 is Sunday, 6 is Saturday
  duration?: number;
}

const ReadOnlyWeekCalendar: React.FC<ReadOnlyWeekCalendarProps> = ({
  selectedDate,
  daysOfSchedule = "",
  duration = 1,
}) => {
  const [daysArray, setDaysArray] = useState<number[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    selectedDate ? selectedDate.toDate() : new Date()
  );

  useEffect(() => {
    const days = daysOfSchedule
      .split(",")
      .map((day) => {
        const parsedDay = Number(day);
        // Convert from 1-7 to 0-6: 1 (Mon) -> 1, ..., 7 (Sun) -> 0
        return parsedDay === 7 ? 0 : parsedDay;
      })
      .filter((day) => day >= 0 && day <= 6); // Convert and filter valid days (0-6)
    setDaysArray(days);
  }, [daysOfSchedule]);

  useEffect(() => {
    calculateHighlightedDates();
  }, [currentWeekStart, daysArray, duration, selectedDate]);

  const calculateHighlightedDates = () => {
    if (!selectedDate) return;

    const startDate = selectedDate.toDate();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration - 1); // Set the end date based on duration

    const dates: string[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      if (daysArray.includes(dayOfWeek)) {
        dates.push(currentDate.toISOString().split("T")[0]);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setHighlightedDates(dates);
  };

  const weekdays = ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"];

  const getWeekDates = () => {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Start from Monday

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const weekDates = getWeekDates();

  const goToPreviousWeek = () => {
    const previousWeek = new Date(currentWeekStart);
    previousWeek.setDate(currentWeekStart.getDate() - 7); // Move to the start of the previous week
    setCurrentWeekStart(previousWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + 7); // Move to the start of the next week
    setCurrentWeekStart(nextWeek);
  };

  // Format to show Month and Year
  const getMonthAndYear = () => {
    const options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
    return currentWeekStart.toLocaleDateString("vi-VN", options);
  };
  

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousWeek} className="p-2 hover:bg-gray-100 rounded">
          ←
        </button>
        <div className="text-lg font-bold">{getMonthAndYear()}</div>
        <button onClick={goToNextWeek} className="p-2 hover:bg-gray-100 rounded">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {weekdays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
            {day}
          </div>
        ))}

        {/* Week days */}
        {weekDates.map((date, index) => {
          const dateStr = date.toISOString().split("T")[0];
          const isHighlighted = highlightedDates.includes(dateStr);
          const isToday =
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={index}
              className={`p-2 text-center relative ${
                isToday ? "bg-blue-100 text-blue-600 font-semibold rounded" : "text-gray-700"
              }`}
            >
              {date.getDate()}
              {isHighlighted && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReadOnlyWeekCalendar;
