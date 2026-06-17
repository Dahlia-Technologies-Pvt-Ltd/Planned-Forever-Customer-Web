import moment from "moment";
import { Images } from "../assets/Assets";
import Input from "../components/common/Input";
import Dropdown from "../components/common/Dropdown";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../context/GlobalContext";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const EventScreen = () => {

  const { t: commonT } = useTranslation("common");

  // Context
  const { userData, updateSelectedEvent, allEventsNotFormatted, getEventList } = useThemeContext();
  // Navigation
  const navigate = useNavigate();

  const [selectEvent, setSelectEvent] = useState(null);
  const hasRequestedEvents = useRef(false);

  const userEvents = Array.isArray(userData?.user_event) ? userData.user_event : [];
  const fallbackEvents = Array.isArray(allEventsNotFormatted)
    ? allEventsNotFormatted.filter((event) => !userData?.event_id || event?.id === userData.event_id)
    : [];
  const eventOptions = userEvents.length > 0 ? userEvents : fallbackEvents;

  const formattedEvents = eventOptions.map((event) => ({
    value: event?.id,
    label: event?.name,
  }));

  const selectedEventDetail = eventOptions.find(
    (event) => event?.id === selectEvent?.value
  );

  useEffect(() => {
    if (userEvents.length === 0 && fallbackEvents.length === 0 && !hasRequestedEvents.current) {
      hasRequestedEvents.current = true;
      getEventList();
    }
  }, [fallbackEvents.length, getEventList, userEvents.length]);

  useEffect(() => {
    if (selectEvent) {
      updateSelectedEvent(selectEvent?.value, selectedEventDetail);

      // ✅ Extract first permission name
      const firstPermission = Array.isArray(userData?.role?.permissions) && userData.role.permissions.length > 0
        ? userData.role.permissions[0].name.replace(/-(view|edit|create|delete)$/, "") // Remove -view, -edit, -create, -delete
        : "dashboard"; // Default to dashboard if no permissions

      const firstRoute = `/${firstPermission}`; // Create a valid route path

      // ✅ Navigate to the first allowed route
      navigate(firstRoute, { replace: true });
    }
  }, [selectEvent, navigate, selectedEventDetail, updateSelectedEvent, userData]);

  return (
    <>
      <div className="max-w-lg">
        <img src={Images.LOGO1} className="w-52 3xl:w-60" alt="logo" />
        <div className="">
          <h2 className="heading">Sign In to your account</h2>
          <p className="mt-3 text-sm text-info-color">
            Welcome to planned forever, Access it by selecting the event.
          </p>
        </div>
        <div className="mt-5">
          <Dropdown
            isRequired
            title="Events"
            placeholder="Events"
            options={formattedEvents}
            value={selectEvent}
            onChange={(selectedEvent) => setSelectEvent(selectedEvent)}
          />
        </div>
      </div>
    </>
  );
};

export default EventScreen;
