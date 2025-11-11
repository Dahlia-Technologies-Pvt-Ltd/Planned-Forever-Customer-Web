import React, { useState, useEffect } from "react";
import { Images } from "../../assets/Assets";
import { useLocation } from "react-router-dom";
import moment from "moment"; // Import moment.js
import { mediaUrl } from "../../utilities/config";
import Dropdown from "../../components/common/Dropdown";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

const InvitationCardView = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const invitationData = location.state?.invitationData || [];
  const [selectEvent, setSelectEvent] = useState(null);
  const [selectedEventData, setSelectedEventData] = useState(null);

  // Format events for dropdown
  const formattedEvents = invitationData?.map((item) => ({
    label: item.event.name,
    value: item.event.id,
    data: item,
  }));

  // Set default selection to first event if available
  useEffect(() => {
    if (formattedEvents.length > 0 && !selectEvent) {
      setSelectEvent(formattedEvents[0]);
      setSelectedEventData(formattedEvents[0].data);
    }
  }, [formattedEvents]);

  // Handle event selection
  const handleEventChange = (selectedEvent) => {
    setSelectEvent(selectedEvent);
    setSelectedEventData(selectedEvent.data);
  };

  // Check if data is available and has the expected structure
  const hasData = selectedEventData && selectedEventData.event;

  // Default values in case data is missing
  const eventName = hasData ? selectedEventData.event.name : "Event name not found";

  // Format dates and times separately using moment.js
  const startDate =
    hasData && selectedEventData.event.start_date ? moment.unix(selectedEventData.event.start_date).format("MMMM DD, YYYY") : "Date not found";

  const startTime =
    hasData && selectedEventData.event.start_date ? moment.unix(selectedEventData.event.start_date).format("h:mm A") : "Time not found";

  const endDate =
    hasData && selectedEventData.event.end_date ? moment.unix(selectedEventData.event.end_date).format("MMMM DD, YYYY") : "Date not found";

  const endTime = hasData && selectedEventData.event.end_date ? moment.unix(selectedEventData.event.end_date).format("h:mm A") : "Time not found";

  // Get all cards for the selected event
  const eventCards = hasData && selectedEventData.cards ? selectedEventData.cards : [];

  // Function to check if file is PDF
  const isPDF = (filename) => {
    return filename && filename.toLowerCase().endsWith(".pdf");
  };

  // Function to handle PDF click
  const handlePDFClick = (pdfUrl) => {
    window.open(mediaUrl + pdfUrl, "_blank");
  };

  const isVideo = (filename) => {
    return (
      filename && (filename.toLowerCase().endsWith(".mp4") || filename.toLowerCase().endsWith(".webm") || filename.toLowerCase().endsWith(".ogg"))
    );
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div>
        <img src={Images.LOGO1} className="h-40 md:h-60" alt="Logo" />
      </div>
      <div className="mb-8 md:mb-18 mt-0 w-10/12 md:w-2/12 xl:w-2/12">
        <Dropdown
          isRequired
          title="Events"
          placeholder="Select an event"
          options={formattedEvents}
          value={selectEvent}
          onChange={handleEventChange}
        />
      </div>

      <div className="flex w-10/12 flex-col items-start gap-x-20 md:w-6/12 lg:flex-row xl:w-6/12">
        <div>
          <div className="space-y-2.5 md:space-y-8">
            {/* <div className="flex items-center gap-x-3">
              <h2 className="text-base text-primary-color">Event Name: </h2>
              <h2 className="text-lg font-medium text-secondary-color">{eventName}</h2>
            </div> */}
            <div className="flex items-center gap-x-3">
              <h2 className="text-base text-primary-color">From: </h2>
              <h2 className="text-lg font-medium text-secondary-color">{startDate} {startTime}</h2>
            </div>
            {/* <div className="flex items-center gap-x-3">
              <h2 className="text-base text-primary-color">Start Time: </h2>
              <h2 className="text-lg font-medium text-secondary-color"></h2>
            </div> */}
            <div className="flex items-center gap-x-3">
              <h2 className="text-base text-primary-color">To: </h2>
              <h2 className="text-lg font-medium text-secondary-color">{endDate} {endTime}</h2>
            </div>
            {/* <div className="flex items-center gap-x-3">
              <h2 className="text-base text-primary-color">End Time: </h2>
              <h2 className="text-lg font-medium text-secondary-color">{endTime}</h2>
            </div> */}
          </div>
        </div>
        <div className="-mr-4 flex max-h-[45vh] flex-col gap-4 overflow-y-auto py-9 pr-4 md:py-0">
          {eventCards?.length > 0 ? (
            eventCards?.map((cardData, index) => {
              const cardUrl = mediaUrl + cardData?.card?.invitation_card;

              return (
                <div key={cardData.id} className="h-[400px] w-[350px] md:h-[400px] md:w-[400px]">
                  {isPDF(cardData.card.invitation_card) ? (
                    <div
                      className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded border bg-gray-50 transition-colors hover:bg-gray-100"
                      onClick={() => handlePDFClick(cardData.card.invitation_card)}
                    >
                      <svg className="mb-2 h-16 w-16 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 18h12V6h-4V2H4v16zm-2 1V1a1 1 0 011-1h8.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a1 1 0 01-1 1H3a1 1 0 01-1-1z" />
                        <path d="M9 8v2h2V8H9zm0 4v2h2v-2H9z" />
                      </svg>
                      <p className="text-center text-sm text-gray-600">PDF Document</p>
                      <p className="mt-1 text-center text-xs text-gray-500">Click to open</p>
                    </div>
                  ) : isVideo(cardData?.card?.invitation_card) ? (
                    <video src={cardUrl} controls className="h-full w-full rounded border object-contain">
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img src={cardUrl} alt={cardData.card.name} className="h-full w-full rounded border object-contain" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex h-[300px] w-[400px] items-center justify-center rounded bg-gray-100 text-gray-500">
              No cards available for this event
            </div>
          )}
        </div>
      </div>
      <div className="mt-28 w-10/12 md:w-2/12 xl:w-2/12">
        <Button title="Go Back" className="w-full" onClick={() => navigate("/get-invitation-card")} />
      </div>
    </div>
  );
};

export default InvitationCardView;
