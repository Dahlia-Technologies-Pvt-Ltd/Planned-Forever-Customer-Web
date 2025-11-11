import moment from "moment";
import { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ApiServices from "../../api/services";
import { getLocalDateFromUnixTimestamp } from "../../utilities/HelperFunctions";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import { useTranslation } from "react-i18next";

const Calendar = () => {
  const { t: commonT } = useTranslation("common");
  const localizer = momentLocalizer(moment);
  const [myEvents, setMyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date()); // Add state for calendar navigation
  
  console.log("apiResponse", apiResponse);
  
  // Handle Event Click - Updated to also select the date
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    // Also set the selected date to the event's start date
    setSelectedDate(event.start);
    
    // Fetch panchang data for the event's date
    if (location && location.latitude && location.longitude && location.timezone) {
      fetchDataForDate(event.start);
    }
  };

  // Transform API Data to Calendar Events - FIXED VERSION
  const transformAPIDataToEvents = (apiData) => {
    console.log("Raw API Data:", apiData); // Debug log
    
    if (!apiData || !Array.isArray(apiData)) {
      console.warn("Invalid API data:", apiData);
      return [];
    }
    
    return apiData.map((eventData) => {
      // Convert Unix timestamp to JavaScript Date
      const startDate = new Date(eventData.start_date_time * 1000);
      const endDate = new Date(eventData.end_date_time * 1000);
      
      console.log(`Event: ${eventData.name}`);
      console.log(`Raw start timestamp: ${eventData.start_date_time}`);
      console.log(`Raw end timestamp: ${eventData.end_date_time}`);
      console.log(`Converted start: ${startDate.toLocaleString()}`);
      console.log(`Converted end: ${endDate.toLocaleString()}`);
      console.log(`Is valid start date: ${!isNaN(startDate.getTime())}`);
      console.log(`Is valid end date: ${!isNaN(endDate.getTime())}`);
      console.log("---");
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error(`Invalid dates for event ${eventData.name}`);
        return null;
      }
      
      return {
        title: eventData.name || "Untitled Event",
        start: startDate,
        end: endDate,
        color: "#dda026",
        data: eventData,
      };
    }).filter(event => event !== null); // Remove invalid events
  };

  // Fetch Calendar Data - FIXED VERSION
  const getCalendarData = async () => {
    try {
      setLoading(true);
      const result = await ApiServices.calendar.getPanchangCalendarData();
      
      console.log("Full API Response:", result);
      
      if (result.data.code === 200 && result.data.data) {
        console.log("Calendar Data:", result.data.data);
        const transformedEvents = transformAPIDataToEvents(result.data.data);
        console.log("Transformed Events:", transformedEvents);
        
        if (transformedEvents.length > 0) {
          // Navigate calendar to show the first event's month
          const firstEventDate = transformedEvents[0].start;
          console.log("Navigating calendar to:", firstEventDate);
          setCalendarDate(firstEventDate);
        }
        
        setMyEvents(transformedEvents);
      } else {
        console.warn("No data or invalid response:", result.data);
        setMyEvents([]);
      }
    } catch (error) {
      console.error("Calendar API Error:", error);
      setMyEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Display Event Details
  const renderEventDetails = (event) => {
    if (!event) return <p>No panchang selected</p>;
    const { name, description, start_date_time, end_date_time } = event.data;
    return (
      <div className=" ">
        <p>
          <strong>Start Date:</strong> {getLocalDateFromUnixTimestamp(start_date_time, "DD MMM, YYYY HH:mmA") || "-"}
        </p>
        <p>
          <strong>End Date:</strong> {getLocalDateFromUnixTimestamp(end_date_time, "DD MMM, YYYY HH:mmA") || "-"}
        </p>
      </div>
    );
  };

  useEffect(() => {
    getCalendarData();
    // Set today's date as initial selected date
    setSelectedDate(new Date());
  }, []);

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    timezone: null,
    error: null,
  });

  useEffect(() => {
    // Function to get the user's current location
    const getLocation = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            // Get timezone offset in minutes and convert to hours
            const timezoneOffset = new Date().getTimezoneOffset();
            const timezone = -(timezoneOffset / 60);
            setLocation({
              latitude,
              longitude,
              timezone,
              error: null,
            });
          },
          (error) => {
            setLocation({
              latitude: null,
              longitude: null,
              timezone: null,
              error: error.message,
            });
          },
        );
      } else {
        setLocation({
          latitude: null,
          longitude: null,
          timezone: null,
          error: "Geolocation not supported in this browser.",
        });
      }
    };
    getLocation();
  }, []);

  const API_KEY = "p15M6eSai47IuG2hbGWhT3bUPHTv3FMi8pE3Wpdr";

  const fetchDataForDate = async (date) => {
    if (!location || !location.latitude || !location.longitude || !location.timezone) {
      console.warn("Location data is incomplete. Skipping API call.");
      return; // Exit if location data is missing
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const current = new Date();
    const hours = current.getHours();
    const minutes = current.getMinutes();
    const seconds = current.getSeconds();

    const payload = {
      year,
      month,
      date: day,
      hours,
      minutes,
      seconds,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone,
    };

    const apiUrls = [
      "https://json.freeastrologyapi.com/nakshatra-durations",
      "https://json.freeastrologyapi.com/tithi-durations",
      "https://json.freeastrologyapi.com/yoga-durations",
      "https://json.freeastrologyapi.com/karana-durations",
      "https://json.freeastrologyapi.com/vedicweekday",
      "https://json.freeastrologyapi.com/lunarmonthinfo",
      "https://json.freeastrologyapi.com/rituinfo",
      "https://json.freeastrologyapi.com/samvatinfo",
    ];

    const successfulResponses = [];
    setLoading(true);
    try {
      for (const url of apiUrls) {
        try {
          const response = await axios.post(url, payload, {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": API_KEY,
            },
          });
          successfulResponses.push(response.data);
        } catch (error) {
          console.warn(`API failed for ${url}:`, error);
        }
      }
      console.log("successfulResponses", successfulResponses);
      setApiResponse(successfulResponses);
    } catch (error) {
      console.error("Error during API fetch", error);
      setApiResponse([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch only when location data is available
    if (location && location.latitude && location.longitude && location.timezone) {
      fetchDataForDate(new Date());
    }
  }, [location]); // Re-run when location updates

  // Updated handleDateClick function to handle date selection more accurately
  const handleDateClick = (slotInfo) => {
    // Get the actual clicked date, accounting for timezone
    const clickedDate = new Date(slotInfo.start);
    
    // Ensure we're working with the local date without time components
    const localDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate());
    
    console.log("Raw slot info:", slotInfo);
    console.log("Clicked date:", clickedDate);
    console.log("Local date:", localDate);
    
    setSelectedDate(localDate);
    
    // Check if there's an event that overlaps with this date
    const eventOnThisDate = myEvents.find(event => {
      const eventStart = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
      const eventEnd = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());
      const clickedDateOnly = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
      
      // Check if clicked date falls within event range (inclusive)
      return clickedDateOnly >= eventStart && clickedDateOnly <= eventEnd;
    });
    
    if (eventOnThisDate) {
      console.log("Found event on this date:", eventOnThisDate);
      setSelectedEvent(eventOnThisDate);
    } else {
      setSelectedEvent(null); // Clear any selected event when clicking on a date with no events
    }
    
    console.log("Current location data:", location);
    
    if (!location.latitude || !location.longitude) {
      console.warn("Location data not available yet");
      return;
    }
    
    fetchDataForDate(localDate);
  };

  // Handle calendar navigation
  const handleNavigate = (date) => {
    setCalendarDate(date);
  };

  // Custom Date Cell Wrapper to handle clicks more precisely
  const CustomDateCellWrapper = ({ children, value }) => {
    const handleCellClick = (e) => {
      e.stopPropagation(); // Prevent event bubbling
      
      // Create a clean date object for the clicked date
      const clickedDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
      
      console.log("Cell clicked:", clickedDate);
      setSelectedDate(clickedDate);
      
      // Check if there's an event that overlaps with this date
      const eventOnThisDate = myEvents.find(event => {
        const eventStart = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
        const eventEnd = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());
        const clickedDateOnly = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate());
        
        // Check if clicked date falls within event range (inclusive)
        return clickedDateOnly >= eventStart && clickedDateOnly <= eventEnd;
      });
      
      if (eventOnThisDate) {
        console.log("Found event on this date:", eventOnThisDate);
        setSelectedEvent(eventOnThisDate);
      } else {
        setSelectedEvent(null);
      }
      
      if (location.latitude && location.longitude && location.timezone) {
        fetchDataForDate(clickedDate);
      }
    };

    const isSelected = selectedDate && 
      value.getDate() === selectedDate.getDate() && 
      value.getMonth() === selectedDate.getMonth() && 
      value.getFullYear() === selectedDate.getFullYear();
      
    const isToday = value.getDate() === new Date().getDate() &&
      value.getMonth() === new Date().getMonth() &&
      value.getFullYear() === new Date().getFullYear();

    return (
      <div
        className="rbc-day-bg"
        style={{
          height: "100%",
          cursor: "pointer",
          transition: "background-color 0.2s ease",
          backgroundColor: isSelected ? "#dbeafe" : (isToday ? "#e6f7ff" : undefined),
          border: isSelected ? "2px solid #3b82f6" : undefined,
        }}
        onClick={handleCellClick}
      >
        {children}
      </div>
    );
  };

  // New function to render the selected date header
  const renderSelectedDateHeader = () => {
    if (!selectedDate) return null;
    const formattedDate = moment(selectedDate).format("dddd, MMMM Do, YYYY");
    const isToday = moment(selectedDate).isSame(moment(), 'day');
    return (
      <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Panchang for {formattedDate}
              {isToday && <span className="ml-2 text-sm font-medium text-blue-600">(Today)</span>}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Click on any date in the calendar to view its panchang details
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600">
              {moment(selectedDate).format("DD")}
            </div>
            <div className="text-sm text-gray-500">
              {moment(selectedDate).format("MMM")}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderApiResponse = () => {
    if (!apiResponse || !selectedDate) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Select a date to view panchang details.</p>
        </div>
      );
    }

    const parseData = (data) => {
      if (typeof data === "string") {
        try {
          return JSON.parse(data); // Parse the JSON string
        } catch (error) {
          console.error("Error parsing JSON:", error);
          return null;
        }
      }
      return data; // Return the object directly if it's already parsed
    };

    return (
      <div className="mt-4 flex flex-wrap gap-3">
        {loading ? (
          <div className="w-full text-center py-4">
            <p className="text-lg text-blue-600">Loading panchang data...</p>
          </div>
        ) : (
          <>
            {apiResponse && apiResponse.length > 0 ? (
              apiResponse.map((response, index) => {
                if (response.statusCode === 200) {
                  const parsedOutput = parseData(response.output); // Parse the output data
                  console.log({ parsedOutput });
                  return (
                    <div key={index} className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
                      {/* Labeling the API data */}
                      {parsedOutput ? (
                        <div className="space-y-4">
                          {parsedOutput.name && (
                            <div>
                              <p className="font-bold text-gray-700">Nakshatra:</p>
                              <p className="text-gray-600">{parsedOutput.name}</p>
                            </div>
                          )}
                          {parsedOutput.starts_at && (
                            <div>
                              <p className="font-bold text-gray-700">Start Time (Nakshatra):</p>
                              <p className="text-gray-600">{parsedOutput.starts_at}</p>
                            </div>
                          )}
                          {parsedOutput.ends_at && (
                            <div>
                              <p className="font-bold text-gray-700">End Time (Nakshatra):</p>
                              <p className="text-gray-600">{parsedOutput.ends_at}</p>
                            </div>
                          )}
                          {parsedOutput.remaining_percentage_at_given_time && (
                            <div>
                              <p className="font-bold text-gray-700">Remaining Percentage (Nakshatra):</p>
                              <p className="text-gray-600">{parsedOutput.remaining_percentage_at_given_time}%</p>
                            </div>
                          )}
                          {/* Handle Tithi data */}
                          {parsedOutput.paksha && (
                            <div>
                              <p className="font-bold text-gray-700">Tithi:</p>
                              <p className="text-gray-600">{parsedOutput.paksha}</p>
                            </div>
                          )}
                          {parsedOutput.completes_at && (
                            <div>
                              <p className="font-bold text-gray-700">Tithi Completion Time:</p>
                              <p className="text-gray-600">{parsedOutput.completes_at}</p>
                            </div>
                          )}
                          {parsedOutput.left_precentage && (
                            <div>
                              <p className="font-bold text-gray-700">Left Percentage (Tithi):</p>
                              <p className="text-gray-600">{parsedOutput.left_precentage}%</p>
                            </div>
                          )}
                          {/* Handle Yoga data */}
                          {parsedOutput["1"] && parsedOutput["1"].name && (
                            <div>
                              <p className="font-bold text-gray-700">Yoga (Brahma):</p>
                              <p className="text-gray-600">Name: {parsedOutput["1"].name}</p>
                              <p className="text-gray-600">Completion: {parsedOutput["1"].completion}</p>
                              <p className="text-gray-600">Left Percentage: {parsedOutput["1"].yoga_left_percentage}%</p>
                            </div>
                          )}
                          {parsedOutput["2"] && parsedOutput["2"].name && (
                            <div>
                              <p className="font-bold text-gray-700">Yoga (Indra):</p>
                              <p className="text-gray-600">Name: {parsedOutput["2"].name}</p>
                              <p className="text-gray-600">Completion: {parsedOutput["2"].completion}</p>
                            </div>
                          )}
                          {/* Handle Karana data */}
                          {parsedOutput["1"] && parsedOutput["1"].karana_left_percentage && (
                            <div>
                              <p className="font-bold text-gray-700">Karana (Vanija):</p>
                              <p className="text-gray-600">Left Percentage: {parsedOutput["1"].karana_left_percentage}%</p>
                              <p className="text-gray-600">Completion: {parsedOutput["1"].completion}</p>
                            </div>
                          )}
                          {parsedOutput["2"] && parsedOutput["2"].name && (
                            <div>
                              <p className="font-bold text-gray-700">Karana (Vishti):</p>
                              <p className="text-gray-600">Name: {parsedOutput["2"].name}</p>
                              <p className="text-gray-600">Completion: {parsedOutput["2"].completion}</p>
                            </div>
                          )}
                          {/* Handle Vedic Weekday data */}
                          {parsedOutput.weekday_name && (
                            <div>
                              <p className="font-bold text-gray-700">Vedic Weekday:</p>
                              <p className="text-gray-600">{parsedOutput.weekday_name}</p>
                            </div>
                          )}
                          {/* Handle Lunar Month data */}
                          {parsedOutput.lunar_month_name && (
                            <div>
                              <p className="font-bold text-gray-700">Lunar Month:</p>
                              <p className="text-gray-600">{parsedOutput.lunar_month_name}</p>
                            </div>
                          )}
                          {/* Handle Ritu (Season) data */}
                          {parsedOutput.name && (
                            <div>
                              <p className="font-bold text-gray-700">Ritu (Season):</p>
                              <p className="text-gray-600">{parsedOutput.name}</p>
                            </div>
                          )}
                          {/* Handle Samvat and Vikram Chaitradi data */}
                          {parsedOutput.saka_salivahana_name_number && (
                            <div>
                              <p className="font-bold text-gray-700">Samvat and Vikram Chaitradi:</p>
                              <p className="text-gray-600">Saka Salivahana Year Name: {parsedOutput.saka_salivahana_year_name}</p>
                              <p className="text-gray-600">Vikram Chaitradi Year Name: {parsedOutput.vikram_chaitradi_year_name}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">No data available for this response.</p>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div key={index} className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
                      <h3 className="mb-4 text-2xl font-semibold text-gray-800">API Response {index + 1} - Error</h3>
                      <p className="text-red-500">Failed to fetch data from this API.</p>
                    </div>
                  );
                }
              })
            ) : (
              <div className="w-full text-center py-8">
                <p className="text-lg text-red-500">Error: Please select the date again.</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Debug useEffect to track selected date changes
  useEffect(() => {
    console.log("Selected date changed to:", selectedDate);
  }, [selectedDate]);

  return (
    <>
      <>
        <div className="mb-4">
          <p className="mb-2">
            {selectedEvent ? (
              <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 pb-1">Sava Details:</h2>
                <span className="font-semibold">Name:</span> {selectedEvent.title}
                {selectedEvent ? renderEventDetails(selectedEvent) : <p>Click on an panchang to see the details.</p>}
              </div>
            ) : (
              "Select an panchang"
            )}
          </p>
        </div>

        <div className="h-[45vh]">
          <BigCalendar
            localizer={localizer}
            events={myEvents}
            startAccessor="start"
            endAccessor="end"
            date={calendarDate} // Use controlled date
            onNavigate={handleNavigate} // Handle navigation
            views={["month"]}
            selectable={true}
            onSelectSlot={handleDateClick}
            onSelectEvent={handleEventClick}
            style={{ height: "100%" }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.color,
                minHeight: "25px",
              },
            })}
            dayPropGetter={(date) => {
              // Check if this date is today
              const today = new Date();
              const isToday =
                date.getDate() === today.getDate() && 
                date.getMonth() === today.getMonth() && 
                date.getFullYear() === today.getFullYear();
              
              // Check if this date is selected
              const isSelected = selectedDate && 
                date.getDate() === selectedDate.getDate() && 
                date.getMonth() === selectedDate.getMonth() && 
                date.getFullYear() === selectedDate.getFullYear();
                
              return {
                style: {
                  backgroundColor: isSelected ? "#dbeafe" : (isToday ? "#e6f7ff" : undefined),
                  cursor: "pointer",
                  border: isSelected ? "2px solid #3b82f6" : undefined,
                },
              };
            }}
            components={{
              dateCellWrapper: CustomDateCellWrapper, // Use the custom wrapper
            }}
          />
        </div>
      </>
      
      {/* Add the selected date header */}
      {renderSelectedDateHeader()}
      
      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          <Skeleton count={1} height={300} />
          <Skeleton count={1} height={300} />
          <Skeleton count={1} height={300} />
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-4">{renderApiResponse()}</div>
        </div>
      )}
    </>
  );
};

export default Calendar;