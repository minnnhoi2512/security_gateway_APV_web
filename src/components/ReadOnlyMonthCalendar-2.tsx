import dayjs, { Dayjs } from "dayjs";
import React, { useState, useEffect } from "react";
import { DatePicker, notification } from "antd"; // Import DatePicker from Ant Design
import moment from "moment";

interface ReadOnlyMonthCalendarProps {
  daysOfSchedule?: string;
  expectedStartTime?: any;
  expectedEndTime?: any;
}

const ReadOnlyMonthCalendar2: React.FC<ReadOnlyMonthCalendarProps> = ({
  daysOfSchedule = "",
  expectedStartTime,
  expectedEndTime,
}) => {
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [daysArray, setDaysArray] = useState<number[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Dayjs| null>(expectedStartTime);
  const [endDate, setEndDate] = useState<Dayjs| null>(expectedEndTime);
  const convertStartDate = startDate
    ? dayjs(startDate).format("DD/MM/YYYY")
    : "";
  const convertEndDate = endDate ? dayjs(endDate).format("DD/MM/YYYY") : "";
  const months = [
    "tháng 1",
    "tháng 2",
    "tháng 3",
    "tháng 4",
    "tháng 5",
    "tháng 6",
    "tháng 7",
    "tháng 8",
    "tháng 9",
    "tháng 10",
    "tháng 11",
    "tháng 12",
  ];

  useEffect(() => {
    const days = daysOfSchedule.split(",").map(Number).filter(Boolean);
    setDaysArray(days);
  }, [daysOfSchedule]);

  useEffect(() => {
    calculateHighlightedDates();
  }, [currentMonth, currentYear, daysArray, startDate, endDate]);

  const calculateHighlightedDates = () => {
    // Clear highlighted dates if either date is null
    if (!startDate || !endDate) {
      setHighlightedDates([]);
      return;
    }

    const dates: string[] = [];
    let currentDate = new Date(startDate.toString());
    let expectedEndDate = new Date(endDate.toString());

    while (currentDate <= expectedEndDate) {
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

  const goToPreviousPeriod = () => {
    const previousPeriod = new Date(currentYear, currentMonth - 1, 1);
    setCurrentMonth(previousPeriod.getMonth());
    setCurrentYear(previousPeriod.getFullYear());
  };

  const goToNextPeriod = () => {
    const nextPeriod = new Date(currentYear, currentMonth + 1, 1);
    setCurrentMonth(nextPeriod.getMonth());
    setCurrentYear(nextPeriod.getFullYear());
  };

  const renderDays = (days: number[]) => {
    return days.map((day, index) => {
      const dateStr = new Date(currentYear, currentMonth, day)
        .toISOString()
        .split("T")[0];
      const isHighlighted = highlightedDates.includes(dateStr);
      const isToday =
        day === currentDate.getDate() &&
        currentMonth === currentDate.getMonth() &&
        currentYear === currentDate.getFullYear();

      return (
        <div
          key={index}
          className={`p-2 text-center relative ${
            isToday
              ? "bg-blue-100 text-blue-600 font-semibold rounded"
              : "text-gray-700"
          }`}
        >
          {day > 0 ? day : ""}
          {isHighlighted && day > 0 && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow p-4">
      <div>
        <div className="flex flex-col">
          <label className="mb-1 text-gray-700 font-semibold">
            Ngày bắt đầu
          </label>
          <DatePicker
            placeholder="Chọn ngày bắt đầu"
            format={"DD/MM/YYYY"}
            disabled
            value={
              convertStartDate ? moment(convertStartDate, "DD/MM/YYYY") : null
            }
            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500"
          />
        </div>

        {/* End Date Picker */}
        <div className="flex flex-col mt-4">
          <label className="mb-1 text-gray-700 font-semibold">
            Ngày kết thúc
          </label>
          <DatePicker
            placeholder="Chọn ngày kết thúc"
            format={"DD/MM/YYYY"}
            value={convertEndDate ? moment(convertEndDate, "DD/MM/YYYY") : null}
            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500"
            disabled
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousPeriod}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">
          {months[currentMonth]} năm {currentYear}
        </h2>
        <button
          onClick={goToNextPeriod}
          className="p-2 hover:bg-gray-100 rounded"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["CN", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-600 p-2"
          >
            {day}
          </div>
        ))}
        <>
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="p-2"></div>
          ))}
          {renderDays(days)}
        </>
      </div>
    </div>
  );
};

export default ReadOnlyMonthCalendar2;
