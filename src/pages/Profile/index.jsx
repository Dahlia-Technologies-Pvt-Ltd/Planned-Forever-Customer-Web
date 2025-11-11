import { Tab } from "@headlessui/react";
import { Images } from "../../assets/Assets";
import React, { Fragment, useEffect, useState } from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useThemeContext } from "../../context/GlobalContext";
import ApiServices from "../../api/services";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import countriesData from "../../utilities/country.json";

const Profile = () => {
  const { t } = useTranslation("common");

  const TabData = [
    {
      id: 1,
      name: t("profile.myProfile"),
      activeImage: Images.MYTASKGREEN,
      inactiveImage: Images.MYTASK,
    },
    {
      id: 2,
      name: t("profile.password"),
      activeImage: Images.PASSWORDGREEN,
      inactiveImage: Images.PASSWORD,
    },
    // {
    //   id: 3,
    //   name: t("profile.setting"),
    //   activeImage: Images.SETTINGGREEN,
    //   inactiveImage: Images.SETTING,
    // },
  ];

  const { openSuccessModal, closeSuccessModel, userData, logout, eventDetail } = useThemeContext();

  // fields states
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [salutation, setSalutation] = useState("");
  const [userStatus, setUserStatus] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [presentPassword, setPresentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [serverErr, setServerErr] = useState("");
  const [doubleTickCredientials, setDoubleTickCredientials] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [userDetailData, setUserDetailData] = useState(null);
  
  // error states
  const [lastNameError, setLastNameError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [salutationError, setSalutationError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [emailAddressError, setEmailAddressError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Format date helper function
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get country name helper function
  const getCountryName = (countryCode) => {
    if (!countryCode) return "N/A";
    
    console.log("Country code received:", countryCode);
    console.log("Countries data structure:", countriesData);
    
    // Handle different country code formats
    let searchCode = countryCode;
    
    // If it's a 2-letter code like "IN", find the country name
    if (countryCode.length === 2) {
      // Try different possible property names for country code
      const country = countriesData.countries.find(
        (country) => 
          country.alpha2Code === countryCode.toUpperCase() ||
          country.code === countryCode.toUpperCase() ||
          country.countryCode === countryCode.toUpperCase() ||
          country.iso2 === countryCode.toUpperCase()
      );
      
      console.log("Found country:", country);
      return country ? country.name : countryCode;
    }
    
    // If it's already a country name, return it
    const foundCountry = countriesData.countries.find(
      (country) => country.name.toLowerCase() === countryCode.toLowerCase()
    );
    
    return foundCountry ? foundCountry.name : countryCode;
  };

  // validate task state
  const isValidFormTask = () => {
    let isValidData = true;

    if (!firstName) {
      setFirstNameError("Required");
      isValidData = false;
    } else {
      setFirstNameError("");
    }
    if (!lastName) {
      setLastNameError("Required");
      isValidData = false;
    } else {
      setLastNameError("");
    }
    if (!salutation) {
      setSalutationError("Required");
      isValidData = false;
    } else {
      setSalutationError("");
    }
    return isValidData;
  };

  // validate password state
  const isValidFormPassword = () => {
    let isValidData = true;

    if (!newPassword) {
      setNewPasswordError("Required");
      isValidData = false;
    } else {
      setNewPasswordError("");
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Required");
      isValidData = false;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValidData = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValidData;
  };

  // Handle Submit task
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (isValidFormTask()) {
      try {
        setBtnLoading(true);
        let payload = {
          salutation: salutation,
          first_name: firstName,
          last_name: lastName,
        };
        const response = await ApiServices.profile.updateProfile(userData?.uuid, payload);

        if (response.data.code === 200) {
          setBtnLoading(false);
          getUserData();

          openSuccessModal({
            title: t("messages.success"),
            message: t("profile.profileUpdateSuccess"),
            onClickDone: (close) => {
              closeSuccessModel();
              window.location.reload(); // Refresh the page
            },
          });
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        setBtnLoading(false);
        setServerErr(err?.response?.data?.message);
      }
    }
  };

  // Handle Submit password
  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (isValidFormPassword()) {
      try {
        setBtnLoading(true);
        let payload = {
          current_password: presentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        };
        const response = await ApiServices.profile.resetPassword(payload);

        if (response.data.code === 200) {
          setBtnLoading(false);
          getUserData();
          openSuccessModal({
            title: t("messages.success"),
            message: t("profile.passwordUpdateSuccess"),
            onClickDone: (close) => {
              closeSuccessModel();
              logout();
            },
          });
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        setBtnLoading(false);
        setServerErr(err?.response?.data?.message);
      }
    }
  };

  // Clear States
  const clearAllData = () => {
    setLastNameError("");
    setFirstNameError("");
    setSalutationError("");
    setEmailAddressError("");
  };

  const getUserData = async () => {
    try {
      const res = await ApiServices.profile.getUserDataById(userData?.uuid);
      const { data, message } = res;
      if (data.code === 200) {
        console.log("User Data: ", data?.data);
        const apiUserData = data?.data;
        setUserDetailData(apiUserData);
        setSalutation(apiUserData?.salutation);
        setFirstName(apiUserData?.first_name);
        setLastName(apiUserData?.last_name);
        setEmailAddress(apiUserData?.email);
        setUserType(apiUserData?.role?.display_name);
        setUserStatus(apiUserData?.status === 1 ? "Active" : "Inactive");
      }
    } catch (err) {}
  };

  useEffect(() => {
    getUserData();
  }, []);
  
  console.log("eventDetail Data: ", eventDetail);

  return (
    <>
      <div className="flex h-[82vh] flex-col items-center justify-center gap-y-8">
        <div className="card h-[82vh] w-[35vw]">
          <h3 className="heading mb-3">My Profile</h3>
          


          <div className="">
            <Tab.Group onChange={setSelectedTab}>
              <Tab.List className="grid-col-1 grid justify-around rounded-10 md:grid-cols-2 md:bg-[#E9EEF5] xl:gap-x-4" data-aos="fade-up">
                {TabData.map((item, index) => (
                  <Tab as={Fragment} key={index}>
                    {({ selected }) => (
                      <div
                        className={`flex cursor-pointer  items-start justify-start space-x-2 rounded-10 px-4 py-3 transition duration-200 ease-in-out md:items-center md:justify-center md:pr-0 xl:px-0 ${
                          selected ? "shadow-tab bg-primary" : "bg-transparent"
                        } `}
                      >
                        {selected ? (
                          <img src={item?.activeImage} alt={item?.name} className="w-6" />
                        ) : (
                          <img src={item?.inactiveImage} alt={item?.name} className="w-6" />
                        )}
                        <h3 className={` text-sm font-semibold leading-[18px] ${selected ? "text-secondary" : "text-info-color"}   2xl:text-base`}>
                          {item?.name}
                        </h3>
                      </div>
                    )}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  {/* Event Information Section */}
                  {eventDetail && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Event Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Event Name:</span>
                          <span className="text-gray-800">{eventDetail.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Bride & Groom:</span>
                          <span className="text-gray-800">
                            {eventDetail.bride_name && eventDetail.groom_name 
                              ? `${eventDetail.bride_name} & ${eventDetail.groom_name}`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Start Date:</span>
                          <span className="text-gray-800">{formatDate(eventDetail.start_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">End Date:</span>
                          <span className="text-gray-800">{formatDate(eventDetail.end_date)}</span>
                        </div>
                        {eventDetail.wedding_types && eventDetail.wedding_types.length > 0 && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Wedding Type:</span>
                            <span className="text-gray-800">
                              {eventDetail.wedding_types.map(type => type.name).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Details Section */}
                  {userDetailData && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Contact Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Salutation:</span>
                          <span className="text-gray-800">{userDetailData.salutation || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">First Name:</span>
                          <span className="text-gray-800">{userDetailData.first_name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Last Name:</span>
                          <span className="text-gray-800">{userDetailData.last_name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Email:</span>
                          <span className="text-gray-800">{userDetailData.email || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Country:</span>
                          <span className="text-gray-800">{getCountryName(userDetailData.country)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">City:</span>
                          <span className="text-gray-800">{userDetailData.city || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Address:</span>
                          <span className="text-gray-800">{userDetailData.address || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Phone:</span>
                          <span className="text-gray-800">
                            {userDetailData.contact_numbers && userDetailData.contact_numbers.length > 0 
                              ? userDetailData.contact_numbers.map(contact => contact.number).join(", ")
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </Tab.Panel>
                <Tab.Panel>
                  <div className="space-y-5">
                    <div className="mt-8 space-y-5">
                      <Input
                        type="password"
                        label={t("profile.currentPassword")}
                        placeholder="Enter your password"
                        value={presentPassword}
                        onChange={(e) => {
                          setPresentPassword(e.target.value);
                        }}
                        isRequired
                        name="password"
                      />
                      <Input
                        type="password"
                        label={t("profile.password")}
                        placeholder="Enter your password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setNewPasswordError("");
                        }}
                        isRequired
                        name="password"
                        error={newPasswordError}
                      />
                      <Input
                        type="password"
                        label={t("profile.confirmPassword")}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setConfirmPasswordError("");
                        }}
                        isRequired
                        name="confirmPassword"
                        error={confirmPasswordError}
                      />
                    </div>

                    <div className="float-right flex items-center gap-x-2">
                      <InformationCircleIcon className="w-6 text-info-color" />
                      <h2 className="text-info-color">You've been signed out.</h2>
                    </div>
                  </div>
                </Tab.Panel>
              </Tab.Panels>

              {/* Show save button only for password tab (index 1) */}
              {selectedTab === 1 && (
                <div className="absolute bottom-[5%] right-[50%] flex translate-x-[50%] transform gap-x-5">
                  <Button
                    icon={<CheckIcon />}
                    title={t("buttons.save")}
                    type="button"
                    onClick={handleSubmitPassword}
                    loading={btnLoading}
                  />
                </div>
              )}
            </Tab.Group>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;