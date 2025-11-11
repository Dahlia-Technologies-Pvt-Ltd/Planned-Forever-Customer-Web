import { Fragment, useState, useEffect } from "react"; // Remove useTransition
import { Images } from "../assets/Assets";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon, UserCircleIcon } from "@heroicons/react/20/solid"; // Remove unused UserPlusIcon
import { useThemeContext } from "../context/GlobalContext";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline"; // Remove unused Cog8ToothIcon
import ConfirmationModal from "./common/ConfirmationModal";
import { useNavigate, useLocation } from "react-router-dom";
import { PROFILE } from "../routes/Names";
import ApiServices from "../api/services";
import { useTranslation } from "react-i18next";

const ProfileSelect = () => {
  // translation
  const { t, i18n } = useTranslation("common");
  const isRTL = i18n.dir() === "rtl";
  const navigate = useNavigate();
  const location = useLocation(); // Add missing location
  const { logout, userData, eventDetail } = useThemeContext();

  // States
  const [isOpen, setIsOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    lastName: "",
    userType: null,
    firstName: "",
    salutation: "",
  });

  const getUserData = async () => {
    try {
      const res = await ApiServices.profile.getUserDataById(userData?.uuid);
      if (res?.data?.code === 200) {
        const { data } = res;
        setProfileData({
          lastName: data?.data?.last_name || "",
          userType: data?.data?.role?.display_name || null,
          firstName: data?.data?.first_name || "",
          salutation: data?.data?.salutation || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (userData?.uuid) {
      getUserData();
    }
  }, [userData]);

  console.log({ userData });

  return (
    <div className="w-full text-right">
      <Menu as="div" className="relative mr-4 inline-block text-left">
        <Menu.Button
          className={`flex w-full items-center bg-transparent px-4 py-2 text-base font-medium text-secondary-color ${isRTL ? "flex-row-reverse" : "flex-row"}`}
        >
          {/* Profile Image */}
          {/* <img src={Images?.PLACEHOLDER} alt="profile" className={`mr-2 h-10 w-10`} /> */}

          {/* Name and Role */}
          <div className={`text-${isRTL ? "right" : "left"}`}>
            {profileData.salutation || profileData.firstName || profileData.lastName ? (
              <p>
                {profileData.salutation} {profileData.firstName} {profileData.lastName}
              </p>
            ) : (
              <p>{eventDetail?.name}</p>
            )}

            {/* {userData?.role ? (
              <div>{profileData.userType ? <p className="text-xs text-info-color">{profileData.userType}</p> : null}</div>
            ) : (
              <p className="text-xs text-info-color">No role found</p>
            )} */}
          </div>

          {/* Chevron Icon */}
          <ChevronDownIcon className={`ml-2 h-5 w-5 shrink-0 text-secondary-color`} aria-hidden="true" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-40 mt-2 w-44 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="px-1 py-1">
              {location.pathname === "/event-screen" ? (
                <></>
              ) : (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${active ? "bg-primary text-white" : "text-gray-900"} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        onClick={() => navigate(PROFILE)}
                      >
                        <UserCircleIcon className="h-5 w-5 ltr:mr-2 rtl:ml-2" aria-hidden="true" />
                        {t("headings.profile")}
                      </button>
                    )}
                  </Menu.Item>
                </>
              )}
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setIsOpen(true)}
                    className={`${active ? "bg-primary text-white" : "text-gray-900"} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <ArrowLeftEndOnRectangleIcon className="h-5 w-5 ltr:mr-2 rtl:ml-2" aria-hidden="true" />
                    {t("headings.logout")}
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      <ConfirmationModal message="Are you sure you want to Logout?" isOpen={isOpen} setIsOpen={setIsOpen} handleSubmit={logout} />
    </div>
  );
};

export default ProfileSelect;
