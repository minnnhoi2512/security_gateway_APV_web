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
  const [currentViewDate, setCurrentViewDate] = useState<Date>(
    selectedDate ? selectedDate.toDate() : new Date()
  );
  const [viewMode, setViewMode] = useState<"week" | "month">("week"); // New state for toggling view mode

  useEffect(() => {
    const days = daysOfSchedule
      .split(",")
      .map((day) => {
        const parsedDay = Number(day);
        return parsedDay === 7 ? 0 : parsedDay; // Convert 7 (Sunday) to 0, keep other days as-is
      })
      .filter((day) => day >= 0 && day <= 6); // Ensure valid days (0-6)
    setDaysArray(days);
  }, [daysOfSchedule]);

  useEffect(() => {
    calculateHighlightedDates();
  }, [currentViewDate, daysArray, duration, selectedDate]);

  const switchViewMode = () => {
    setViewMode(viewMode === "month" ? "week" : "month");
  };

  const calculateHighlightedDates = () => {
    if (!selectedDate) return;

    const startDate = selectedDate.toDate();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration - 1);

    const dates: string[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // Get day of the week (0 = Sunday, 6 = Saturday)
      if (daysArray.includes(dayOfWeek)) {
        dates.push(currentDate.toISOString().split("T")[0]);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setHighlightedDates(dates);
  };

  const weekdays = ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"];

  const getWeekDates = () => {
    const weekStart = new Date(currentViewDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Start from Monday

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const getMonthDates = () => {
    const firstDayOfMonth = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 0);

    const monthDates = [];
    let currentDate = new Date(firstDayOfMonth);

    while (currentDate <= lastDayOfMonth) {
      monthDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return monthDates;
  };

  const weekDates = getWeekDates();
  const monthDates = getMonthDates();

  const goToPreviousPeriod = () => {
    const previousPeriod = new Date(currentViewDate);
    if (viewMode === "week") {
      previousPeriod.setDate(currentViewDate.getDate() - 7);
    } else {
      previousPeriod.setMonth(currentViewDate.getMonth() - 1);
    }
    setCurrentViewDate(previousPeriod);
  };

  const goToNextPeriod = () => {
    const nextPeriod = new Date(currentViewDate);
    if (viewMode === "week") {
      nextPeriod.setDate(currentViewDate.getDate() + 7);
    } else {
      nextPeriod.setMonth(currentViewDate.getMonth() + 1);
    }
    setCurrentViewDate(nextPeriod);
  };

  const getMonthAndYear = () => {
    const options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
    return currentViewDate.toLocaleDateString("vi-VN", options);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousPeriod} className="p-2 hover:bg-gray-100 rounded">
          ←
        </button>
        <div className="text-lg font-bold">{getMonthAndYear()}</div>
        <button onClick={goToNextPeriod} className="p-2 hover:bg-gray-100 rounded">
          →
        </button>
        <button onClick={switchViewMode} className="ml-4 p-2 bg-gray-200 hover:bg-gray-300 rounded">
          {viewMode === "month" ? "Lịch theo tuần" : "Lịch theo tháng"}
        </button>
      </div>

      {viewMode === "week" ? (
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
              {day}
            </div>
          ))}
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
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
              {day}
            </div>
          ))}
          {monthDates.map((date, index) => {
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
      )}
    </div>
  );
};

export default ReadOnlyWeekCalendar;
