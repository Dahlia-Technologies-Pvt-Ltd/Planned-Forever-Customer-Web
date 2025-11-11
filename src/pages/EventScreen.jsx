import moment from "moment";
import { Images } from "../assets/Assets";
import Input from "../components/common/Input";
import Dropdown from "../components/common/Dropdown";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../context/GlobalContext";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const EventScreen = () => {

  const { t: commonT } = useTranslation("common");

  // Context
  const { userData } = useThemeContext();
  console.log("userData",userData)
  // Navigation
  const navigate = useNavigate();

  const [selectEvent, setSelectEvent] = useState(null);

  const formattedEvents = userData?.user_event?.map((event) => ({
    value: event?.id,
    label: event?.name,
  }));

  const selectedEventDetail = userData?.user_event.find(
    (event) => event?.id === selectEvent?.value
  );

  useEffect(() => {
    if (selectEvent) {
      // Store event data in localStorage
      localStorage.setItem("event", selectEvent?.value);
      localStorage.setItem("eventDetail", JSON.stringify(selectedEventDetail));

      // ✅ Extract first permission name
      const firstPermission = Array.isArray(userData?.role?.permissions) && userData.role.permissions.length > 0
        ? userData.role.permissions[0].name.replace(/-(view|edit|create|delete)$/, "") // Remove -view, -edit, -create, -delete
        : "dashboard"; // Default to dashboard if no permissions

      const firstRoute = `/${firstPermission}`; // Create a valid route path

      // ✅ Navigate to the first allowed route
      navigate(firstRoute, { replace: true });
      window.location.reload();
    }
  }, [selectEvent, navigate, selectedEventDetail, userData]);

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
