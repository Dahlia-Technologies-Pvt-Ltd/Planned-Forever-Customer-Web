import moment from "moment";
import { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ApiServices from "../../api/services";
import { getLocalDateFromUnixTimestamp } from "../../utilities/HelperFunctions";
import Skeleton from "react-loading-skeleton";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

const Calendar = () => {
  const { t } = useTranslation("common");
  const { eventSelect } = useThemeContext();

  const localizer = momentLocalizer(moment);

  const [myEvents, setMyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle Event Click
  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  // Calendar Style
  const categoryStyles = {
    Arrival: { prefix: "Arr:", color: "#375ed1" },
    Departure: { prefix: "Dep:", color: "#e04c41" },
    Samagri: { prefix: "Smg:", color: "#48BB78" },
    Ceremony: { prefix: "Cer:", color: "#199EF1" },
    Event: { prefix: "Ev:", color: "#dda026" },
  };

  // Change data to show in calendar
  const transformAPIDataToEvents = (apiData) => {
    const events = [];

    apiData.forEach((category) => {
      const { prefix, color } = categoryStyles[category.title] || { prefix: "", color: "#6c757d" }; // Fallback style

      category.data.forEach((eventData) => {
        let eventTitle = prefix;
        if (eventData.type === "arrival" || eventData.type === "departure") {
          eventTitle += ` ${eventData.from} to ${eventData.to}`;
        } else if (eventData.name) {
          eventTitle += ` ${eventData.name}`;
        } else if (eventData.title) {
          eventTitle += ` ${eventData.title}`;
        } else {
          eventTitle += ` ${category.title}`;
        }

        const event = {
          title: eventTitle,
          start: new Date(eventData.date * 1000),
          end: new Date(eventData.date * 1000 + 3600000),
          color: color,
          data: eventData,
        };

        if (eventData.start_date && eventData.end_date) {
          const startDate = new Date(eventData.start_date * 1000);
          const endDate = new Date(eventData.end_date * 1000);

          if (eventData.start_time) {
            const [startHours, startMinutes] = eventData.start_time.split(":");
            startDate.setHours(startHours, startMinutes);
          }
          if (eventData.end_time) {
            const [endHours, endMinutes] = eventData.end_time.split(":");
            endDate.setHours(endHours, endMinutes);
          }

          event.start = startDate;
          event.end = endDate;
        }

        events.push(event);
      });
    });

    return events;
  };

  // Get Calendar Data
  const getCalendarData = async () => {
    let payload = {
      event_id: eventSelect,
    };

    try {
      setLoading(true);
      const result = await ApiServices.calendar.getCalendarData(payload);
      if (result.data.code === 200) {
        const transformedEvents = transformAPIDataToEvents(result.data.data);
        setMyEvents(transformedEvents);
        setLoading(false);
      } else {
        setLoading(false);
        setMyEvents([]);
      }
    } catch (error) {
      setMyEvents([]);
      setLoading(false);
    }
  };

  // Display Event Details
  const renderEventDetails = (event) => {
    if (!event) return <p>No event selected</p>;

    return (
      <div className="flex items-center gap-x-5">
        {event?.data?.name && (
          <p>
            <span className="text-xs text-info-color">Name:</span> {event.data.name || "-"}
          </p>
        )}
        {event?.data?.title && (
          <p>
            <span className="text-xs text-info-color">Name:</span> {event.data.title}
          </p>
        )}
        {event?.data?.start_date && (
          <p>
            <span className="text-xs text-info-color">Start Date:</span>{" "}
            {getLocalDateFromUnixTimestamp(event.data.start_date, "DD MMM, YYYY") || "-"}
          </p>
        )}
        {event?.data?.end_date && (
          <p>
            <span className="text-xs text-info-color">End Date:</span> {getLocalDateFromUnixTimestamp(event.data.end_date, "DD MMM, YYYY") || "-"}
          </p>
        )}
        {event?.data?.from && (
          <p>
            <span className="text-xs text-info-color">From:</span> {event.data.from || "-"}
          </p>
        )}
        {event?.data?.to && (
          <p>
            <span className="text-xs text-info-color">Location:</span> {event.data.to || "-"}
          </p>
        )}
        {event?.data?.date && (
          <p>
            <span className="text-xs text-info-color">Date:</span> {getLocalDateFromUnixTimestamp(event.data.date, "DD MMM, YYYY") || "-"}
          </p>
        )}
        {event?.data?.no_of_person && (
          <p>
            <span className="text-xs text-info-color">No of Person:</span> {event.data.no_of_person}
          </p>
        )}
      </div>
    );
  };

  // Use Effects
  useEffect(() => {
    getCalendarData();
  }, []);

  return (
    <>
      {loading ? (
        <Skeleton count={6} height={100} />
      ) : (
        <>
          <div className="mb-4">
            <p className="mb-2 font-semibold">{selectedEvent ? selectedEvent.title : t("calender.selectAnEvent")}</p>
            {selectedEvent ? renderEventDetails(selectedEvent) : <p>{t("calender.eventMsg")}</p>}
          </div>
          <div className="h-[70vh]">
            <BigCalendar
              localizer={localizer}
              events={myEvents}
              startAccessor="start"
              endAccessor="end"
              views={["month", "week", "day"]}
              onSelectEvent={handleEventClick}
              style={{ height: "100%" }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: event.color,
                },
              })}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Calendar;
