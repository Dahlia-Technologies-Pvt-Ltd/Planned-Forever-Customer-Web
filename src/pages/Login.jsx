import moment from "moment";
import { Images } from "../assets/Assets";
import ApiServices from "../api/services";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { Link, useNavigate } from "react-router-dom";
import { useThemeContext } from "../context/GlobalContext";
import React, { useState, useEffect, useRef } from "react";
import { validateLoginForm } from "../utilities/HelperFunctions";
import { useTranslation } from "react-i18next";

import {
  ARRIVALS,
  CALENDAR,
  CARALLOCATION,
  CARD_ALLOCATION,
  CARS,
  CEREMONIES,
  CHECKLISTS,
  CONTACTS,
  DASHBOARD,
  DEPARTURES,
  EVENTS,
  EXPORT_DATA,
  FORGOT_PASSWORD,
  GIFTS,
  GIFT_ALLOCATION,
  GREETINGS,
  HOTELROOM,
  HOTELS,
  INVITATION_CARDS,
  INVITEES,
  MENU,
  PROFILE,
  QUICK_CONTACT,
  RECEIVED_GIFTS,
  RSVP,
  SAMAGRI,
  SCHEDULE_SEND_SMS,
  SEND_SMS,
  TASKS,
  USERS,
  VENDORS,
  VENUES,
} from "../routes/Names";

const permissionRoutes = {
  RSVP: RSVP,
  Cars: CARS,
  Menu: MENU,
  Budget: "",
  Tasks: TASKS,
  Gifts: GIFTS,
  Reports: "",
  Users: USERS,
  Events: EVENTS,
  Hotels: HOTELS,
  "Send Email": "",
  Venues: VENUES,
  Vendors: VENDORS,
  Samagri: SAMAGRI,
  Invitees: INVITEES,
  Contacts: CONTACTS,
  "Send SMS": SEND_SMS,
  Arrivals: ARRIVALS,
  Calendar: CALENDAR,
  "My Profile": PROFILE,
  Greetings: GREETINGS,
  Dashboard: DASHBOARD,
  "Hotel Room": HOTELROOM,
  Ceremonies: CEREMONIES,
  Checklists: CHECKLISTS,
  Departures: DEPARTURES,
  "Export Data": EXPORT_DATA,
  "Quick Contact": QUICK_CONTACT,
  "Car Allocation": CARALLOCATION,
  "Received Gifts": RECEIVED_GIFTS,
  "Gift Allocation": GIFT_ALLOCATION,
  "Card Allocation": CARD_ALLOCATION,
  "Invitation Cards": INVITATION_CARDS,
  "Schedule/Send SMS": SCHEDULE_SEND_SMS,
};
const Login = () => {
  // Context
  const {
    loading,
    setLoading,
    updateUser,
    getVenueList,
    getEventList,
    getCeremonies,
    getContactsByGroup,
    getHotels,
    getCarListing,
    getGifts,
    getContacts,
    getUserType,
    getUsers,
  } = useThemeContext();

  // Navigation
  const navigate = useNavigate();

  // Use States
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  // Handle Change Input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  // Submit Data
  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateLoginForm(formData);
    const { email, password } = errors;

    setErrors(errors);

    if (!email && !password) {
      try {
        setLoading(true);
        setMessage("");

        let payload = {
          email: formData.email,
          password: formData.password,
        };

        const response = await ApiServices.auth.loginUser(payload);

        if (response.data.code === 200) {
           
          setLoading(false);
          setMessage("");
          updateUser(response?.data?.data);
          const next24Hours = moment().add(24, "hours").valueOf();
          localStorage.setItem("sessionTime", next24Hours);
          localStorage.setItem("token", response.data?.data?.token);

          getVenueList();
          getEventList();
          getCeremonies();
          getContactsByGroup();
          getHotels();
          getCarListing();
          getGifts();
          getContacts();
          getUserType();
          getUsers();

          console.log({response})

          if (response?.data?.data?.role?.display_name === "web_admin") {
            console.log("webadmin")
            navigate(EVENT_SCREEN);
          } else if (response?.data?.data?.role?.permissions?.length > 0) {
            const firstPermission = response?.data?.data?.role?.permissions[0];
            const route = permissionRoutes[firstPermission?.name];
            if (route) {
              // navigate(route);
              navigate(EVENT_SCREEN);
            } else {
              console.error("No matching route found for permission:", firstPermission);
            }
          } else {
            console.error("User has no permissions set");
          }
        } else {
          setLoading(false);
          setMessage("Oops! There is some issue in login!");
        }
      } catch ({ response }) {
        setMessage(response?.data?.message);
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="mx-auto h-full max-w-lg space-y-8 lg:pr-20 2xl:py-12 3xl:pr-4">
        <img src={Images.LOGO1} className="w-52 3xl:w-60" alt="logo" />
        <div className="">
          <h2 className="text-xl font-medium">Sign In to your account</h2>
          <p className="mt-3 text-sm text-info-color">Welcome to planned forever, Access it by signing in with your account credentials.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-0">
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChange={handleChange}
            isRequired
            name="email"
            error={errors?.email}
          />

          <div className="mt-5">
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={handleChange}
              isRequired
              name="password"
              error={errors.password}
            />

            {loading ? (
              <p className="mt-2 block cursor-default text-right text-sm text-gray-500">Forgot Password?</p>
            ) : (
              <Link to={FORGOT_PASSWORD} className="mt-2 block text-right text-sm hover:underline">
                Forgot Password?
              </Link>
            )}
            {message && <p className="mt-2 text-red-500">{message}</p>}
          </div>
          <Button title="Sign In" type="submit" className="mt-10 w-full" loading={loading} />
        </form>
      </div>
    </>
  );
};

export default Login;
