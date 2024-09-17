import React, { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Bell, Search } from "lucide-react";

const localizer = momentLocalizer(moment);

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  attendees: number;
}

const CalendarPage: React.FC = () => {
  const [events] = useState<Event[]>([
    {
      id: 1,
      title: "Meeting department 1",
      start: new Date(2024, 4, 13, 9, 0),
      end: new Date(2024, 4, 13, 10, 0),
      attendees: 2,
    },
    {
      id: 2,
      title: "Meeting department 2",
      start: new Date(2024, 4, 13, 12, 0),
      end: new Date(2024, 4, 13, 13, 0),
      attendees: 2,
    },
    // Add an event for the current month to test visibility
    {
      id: 3,
      title: "Test Current Month Event",
      start: new Date(),
      end: new Date(new Date().setHours(new Date().getHours() + 1)),
      attendees: 1,
    },
  ]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendar page</h1>
          <div className="flex items-center">
            <div className="relative mr-4">
              <input
                type="text"
                placeholder="Search"
                className="pl-8 pr-2 py-1 border rounded"
              />
              <Search
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
            <Bell className="text-gray-600" />
          </div>
        </div>

        {/* Calendar */}
        <div className="h-[calc(100vh-200px)]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={['month', 'week', 'day']}
            defaultView={Views.MONTH}
            defaultDate={new Date(2024, 4, 1)} // Set to May 2024
            eventPropGetter={() => ({
              style: {
                backgroundColor: '#d1fae5', // Light green background
                borderColor: '#34d399', // Green border
                color: '#065f46', // Dark green text
              },
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;