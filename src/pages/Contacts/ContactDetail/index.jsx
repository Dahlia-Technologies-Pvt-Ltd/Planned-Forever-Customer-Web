// src/pages/Contacts/ContactDetail.jsx
import { Tab } from "@headlessui/react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import ApiServices from "../../../api/services";
import { Images } from "../../../assets/Assets";
import { useThemeContext } from "../../../context/GlobalContext";
import { CONTACTS } from "../../../routes/Names";

// Import tab components
import ArrivalTab from "./tabs/ArrivalTab";
import CardTab from "./tabs/CardTab";
import CarTab from "./tabs/CarTab";
import DepartureTab from "./tabs/DepartureTab";
import FamilyTab from "./tabs/Family";
import GeneralTab from "./tabs/GeneralTab";
import GiftTab from "./tabs/GiftTab";
import HotelTab from "./tabs/HotelTab";
import GuestFlightTab from "./tabs/guestFlightTab";
import GuestTrainsTab from "./tabs/GuestTrainsTab";

const ContactDetail = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const location = useLocation();
  const { setBtnLoading, getContactsByGroup } = useThemeContext();

  const [userIdData, setUserIdData] = useState("");
  const data = location.state?.item;

  // console.log("data: ", data);

  const TabData = [
    {
      id: 1,
      name: t("contacts.general"),
      image: Images.General,
      component: "general",
    },
    {
      id: 2,
      name: t("contacts.family"),
      image: Images.PEOPLE,
      component: "family",
    },
    {
      id: 3,
      name: t("contacts.card"),
      image: Images.Mail,
      component: "card",
    },
    {
      id: 4,
      name: t("contacts.gift"),
      image: Images.Gift,
      component: "gift",
    },
    {
      id: 5,
      name: t("contacts.arrival"),
      image: Images.ArrivalGreen,
      component: "arrival",
    },
    {
      id: 6,
      name: t("contacts.departure"),
      image: Images.Departure,
      component: "departure",
    },
    {
      id: 7,
      name: t("contacts.hotels"),
      image: Images.HOTELGREEN,
      component: "hotel",
    },
    {
      id: 8,
      name: t("contacts.cars"),
      image: Images.CARGREEN,
      component: "car",
    },
    {
      id: 9,
      name: t("pageTitles.guestFlightsTitle"),
      image: Images.ARRIVALGREEN,
      component: "guestFlights",
    },
    {
      id: 10,
      name: t("pageTitles.guestTrainsTitle"),
      image: Images.TRAIN_ACTIVE,
      component: "guestTrains",
    },
  ];

  const getUserDetailByID = () => {
    if (data?.uuid) {
      setBtnLoading(true);
      ApiServices.profile
        .getUserDataById(data?.uuid)
        .then((res) => {
          const { data: responseData, message } = res;
          if (responseData.code === 200) {
            setBtnLoading(false);
            setUserIdData(responseData?.data);
          }
        })
        .catch((err) => {
          setBtnLoading(false);
        });
    }
  };

  useEffect(() => {
    getUserDetailByID();
    // Call getContactsByGroup to populate allContactGroup state
    getContactsByGroup(data?.uuid);
  }, [data]);

  const renderTabContent = (componentType) => {
    const commonProps = {
      data,
      userIdData,
      t,
    };

    switch (componentType) {
      case "general":
        return <GeneralTab {...commonProps} />;
      case "family":
        return <FamilyTab {...commonProps} />;
      case "card":
        return <CardTab {...commonProps} />;
      case "gift":
        return <GiftTab {...commonProps} />;
      case "arrival":
        return <ArrivalTab {...commonProps} />;
      case "departure":
        return <DepartureTab {...commonProps} />;
      case "hotel":
        return <HotelTab {...commonProps} />;
      case "car":
        return <CarTab {...commonProps} />;
      case "guestFlights":
        return <GuestFlightTab {...commonProps} />;
      case "guestTrains":
        return <GuestTrainsTab {...commonProps} />;
      default:
        return <div>Tab content not found</div>;
    }
  };

  return (
    <>
      <div onClick={() => navigate(CONTACTS)} className="mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline">
        <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
        <span>{t("contacts.backToContactList")}</span>
      </div>

      <div className="card flex h-[83vh] flex-col">
        <div className="container mx-auto flex h-full flex-col">
          <Tab.Group>
            {/* Sticky Tab List */}
            <div className="sticky top-0 z-10 bg-white pb-4">
              <Tab.List className="grid-col-1 grid justify-around rounded-10 md:grid-cols-3 md:bg-[#E9EEF5] lg:grid-cols-4 xl:grid-cols-10 xl:gap-x-0 2xl:gap-x-0">
                {TabData.map((item, index) => (
                  <Tab as={Fragment} key={index}>
                    {({ selected }) => (
                      <div
                        className={`flex cursor-pointer items-start justify-start space-x-2 rounded-10 px-2 py-4 transition duration-200 ease-in-out focus:outline-none md:items-center md:justify-center md:pr-0 xl:px-0 ${
                          selected ? "shadow-tab bg-primary/80" : "bg-transparent"
                        }`}
                      >
                        <img src={item?.image} alt={item?.name} className="h-4 w-4 2xl:h-6 2xl:w-6" />
                        <h3
                          className={`font-nunito text-xs font-semibold leading-[18px] 2xl:text-sm ${
                            selected ? "text-secondary" : "text-secondary"
                          } 2xl:text-base`}
                        >
                          {item?.name}
                        </h3>
                      </div>
                    )}
                  </Tab>
                ))}
              </Tab.List>
            </div>

            {/* Scrollable Tab Panels */}
            <div className="flex-1 overflow-y-auto">
              <Tab.Panels className="space-y-8">
                {TabData.map((item, index) => (
                  <Tab.Panel key={index}>{renderTabContent(item.component)}</Tab.Panel>
                ))}
              </Tab.Panels>
            </div>
          </Tab.Group>
        </div>
      </div>
    </>
  );
};

export default ContactDetail;
