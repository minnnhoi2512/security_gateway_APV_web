import { Dayjs } from "dayjs";
import React, { useState, useEffect } from "react";

interface ReadOnlyMonthCalendarProps {
  selectedDate?: Dayjs;
  daysOfSchedule?: string;
  duration?: number;
}

const ReadOnlyMonthCalendar: React.FC<ReadOnlyMonthCalendarProps> = ({
  selectedDate,
  daysOfSchedule = "",
  duration = 1,
}) => {
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [daysArray, setDaysArray] = useState<number[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  // console.log(daysOfSchedule);
  const months = [
    "tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6", 
    "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"
  ];

  useEffect(() => {
    const days = daysOfSchedule.split(",").map(Number).filter(Boolean);
    console.log(selectedDate);
    setDaysArray(days);
  }, [daysOfSchedule]);

  useEffect(() => {
    calculateHighlightedDates();
  }, [currentMonth, currentYear, daysArray, duration, selectedDate]);

  const calculateHighlightedDates = () => {
    const dates: string[] = [];
    console.log(duration);
    // Use selectedDate or default to the first day of the current month
    const startDate = selectedDate ? selectedDate.toDate() : new Date(currentYear, currentMonth, 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (duration * 30) - 1);

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (daysArray.includes(currentDate.getDate())) {
        dates.push(currentDate.toISOString().split("T")[0]);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setHighlightedDates(dates);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">←</button>
        <h2 className="text-lg font-semibold">{months[currentMonth]} năm {currentYear}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">→</button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["CN", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 p-2 ">{day}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2"></div>
        ))}
        {days.map((day) => {
          const dateStr = new Date(currentYear, currentMonth, day).toISOString().split("T")[0];
          const isHighlighted = highlightedDates.includes(dateStr);
          const isToday =
            day === currentDate.getDate() &&
            currentMonth === currentDate.getMonth() &&
            currentYear === currentDate.getFullYear();

          return (
            <div
              key={day}
              className={`p-2 text-center relative ${
                isToday ? "bg-blue-100 text-blue-600 font-semibold rounded" : "text-gray-700"
              }`}
            >
              {day}
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

export default ReadOnlyMonthCalendar;
