import { useState } from "react";
import React, { useEffect } from "react";
import ApiServices from "../../api/services";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { CheckIcon } from "@heroicons/react/24/solid";
import Dropdown from "../../components/common/Dropdown";
import { useThemeContext } from "../../context/GlobalContext";
import ChooseFile from "../../components/common/ChooseFile";

const Greetings = () => {
  const { t } = useTranslation("common");

  // Context
  const {
    eventSelect,
    setBtnLoading,
    btnLoading,
    openSuccessModal,
    closeSuccessModel,
    setErrorMessage,
    allContactByGroup,
    allEvents,
    getContactsGroup,
  } = useThemeContext();

  // React Router Dom Hooks
  const location = useLocation();

  // useStates
  const [file, setFile] = useState(null);
  const [event, setEvent] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [replayTo, setReplayTo] = useState("");
  const [smsOption, setSmsOption] = useState("");
  // const [replayAt, setReplayAt] = useState("");
  const [contactOption, setContactOption] = useState("");
  const [greetingImage, setGreetingImage] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [messageBelowImage, setMessageBelowImage] = useState("");
  const [messageAboveImage, setMessageAboveImage] = useState("");

  const [groupId, setGroupID] = useState("");
  const [eventError, setEventError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [groupOptions, setGroupOptions] = useState([]);
  const [subjectError, setSubjectError] = useState("");
  const [groupContacts, setGroupContacts] = useState({});
  const [replayToError, setReplayToError] = useState("");
  const [smsOptionError, setSmsOptionError] = useState("");
  // const [replayAtError, setReplayAtError] = useState("");
  const [selectedGroupID, setSelectedGroupID] = useState(null);
  const [greetingImageError, setGreetingImageError] = useState("");
  const [contactOptionError, setContactOptionError] = useState("");
  const [selectedUsersEmail, setSelectedUsersEmail] = useState("");
  const [selectedContactsByGroup, setSelectedContactsByGroup] = useState({});

  const handleContactOptionChange = (value) => {
    setContactOption(value);
    setContactOptionError("");
  };

  // handle Image change
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    setGreetingImage(file);

    const uploadFile = async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await ApiServices.contact.contactProfileUpload(formData);
        const { data, message } = res;

        if (res.code === 200) {
          setGreetingImage(file);
          setFile(data);
          setGreetingImageError("");
          event.target.value = null;
        }
      } catch (err) {}
    };

    await uploadFile(file);
  };

  // handle cancel selected image
  const handleCrossClick = () => {
    setGreetingImage(null);
  };

  // Form Validation
  const isValidForm = () => {
    let isValidData = true;

    if (contactOption === "") {
      setContactOptionError("Required");
      isValidData = false;
    }
    // if (smsOption === "") {
    //   setSmsOptionError("Required");
    //   isValidData = false;
    // }

    // if (event === "") {
    //   setEventError("Required");
    //   isValidData = false;
    // }

    // if (replayTo === "") {
    //   setReplayToError(" Required");
    //   isValidData = false;
    // }

    // if (replayAt === "") {
    //   setReplayAtError(" Required");
    //   isValidData = false;
    // }

    // if (subject === "") {
    //   setSubjectError(" Required");
    //   isValidData = false;
    // }

    if (message === "") {
      setMessageError(" Required");
      isValidData = false;
    }

    if (!greetingImage) {
      setGreetingImageError("Required");
      isValidData = false;
    } else {
      setGreetingImageError("");
    }

    return isValidData;
  };

  // Handle Submit

  const getGroupNames = () => {
    let payload = {
      event_id: eventSelect,
    };
    ApiServices.contact
      .getGroup(payload)
      .then((res) => {
        const { data } = res;
        if (data?.code === 200) {
          const groupNames = data?.data?.data?.map((name) => ({
            value: name?.id,
            label: name?.name,
            count: name?.user_count,
          }));
          setGroupOptions(groupNames);
        }
      })
      .catch((err) => {
        console.error("Error fetching group names:", err);
      });
  };

  const getGroupContact = (groupId) => {
    let payload = { event_id: eventSelect };

    ApiServices.contact
      .getGroupContact(groupId, payload)
      .then((res) => {
        const { data } = res;
        if (data?.code === 200) {
          console.log("data", data);

          // Extract contacts and include "Main" email if available
          const updatedContacts = data?.data.map((contact) => {
            const mainEmailObj = contact.emails?.find((email) => email.type === "Main");
            return {
              ...contact,
              main_email: mainEmailObj ? mainEmailObj.contact_email : null,
            };
          });

          setGroupContacts((prevGroupContacts) => ({
            ...prevGroupContacts,
            [groupId]: updatedContacts,
          }));

          // Update selected contacts based on fetched contacts
          setSelectedContactsByGroup((prevSelectedContactsByGroup) => {
            const groupSelectedContacts = prevSelectedContactsByGroup[groupId] || [];
            const contactIds = updatedContacts.map((contact) => contact.uuid);
            const updatedGroupSelectedContacts = groupSelectedContacts.filter((id) => contactIds.includes(id));

            return {
              ...prevSelectedContactsByGroup,
              [groupId]: updatedGroupSelectedContacts,
            };
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching group contacts:", err);
      });
  };

  const handleGroupClick = (groupId) => {
    setSelectedGroupID(groupId);
    if (!groupContacts[groupId]) {
      getGroupContact(groupId);
    }
  };

  const handleCheckboxChange = (groupId, contactId) => {
    setSelectedContactsByGroup((prevSelectedContactsByGroup) => {
      const groupSelectedContacts = prevSelectedContactsByGroup[groupId] || [];
      const updatedGroupSelectedContacts = groupSelectedContacts.includes(contactId)
        ? groupSelectedContacts.filter((id) => id !== contactId)
        : [...groupSelectedContacts, contactId];

      // Remove the group from selectedContactsByGroup if no contacts are selected
      if (updatedGroupSelectedContacts.length === 0) {
        const { [groupId]: _, ...rest } = prevSelectedContactsByGroup;
        return rest;
      }

      return {
        ...prevSelectedContactsByGroup,
        [groupId]: updatedGroupSelectedContacts,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        // Prepare attachments array if file exists
        const attachments = greetingImage ? [greetingImage] : [];

        // Prepare payload according to the required format
        const payload = {
          sender_emails: ["info@plannedforever.com"], // Default sender email
          recipient: selectedUsersEmail, // Assuming selectedContacts contains email(s)
          subject: subject,
          body: message,
          replyTo: replayTo ? [replayTo] : [],
          attachments: attachments,
        };

        // Get the token from localStorage
        const token = localStorage.getItem("token");
        // Authorization: "Bearer " + token,
        // "Content-Type": "application/json",
        // Make the API call with headers
        const response = await fetch("https://mailsend.dahlia.tech/api/send-mail", {
          method: "POST",
          headers: {
            api_key: "D252B3A6-E833-415E-A404-B78D014A",
            app_name: "appplannedforever",
            origin: "app.plannedforever.com",
          },

          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.success || data.code === 200) {
          setBtnLoading(false);
          clearAllData();
          openSuccessModal({
            title: t("message.success"),
            message: t("greetings.greetingSuccess"),
            onClickDone: closeSuccessModel,
          });
        } else {
          setBtnLoading(false);
          console.error("API Error:", data);
        }
      } catch (err) {
        console.error("Error:", err);
        setBtnLoading(false);
      }
    }
  };

  // Clear States
  const clearAllData = () => {
    setEvent(null);
    setSelectedContacts([]);
    setMessageAboveImage("");
    setMessageBelowImage("");
    setSubject("");
    setReplayTo("");
    // setReplayAt("");
    setSmsOption("");
    setFile(null);
    setGreetingImage(null);
    setContactOption("");

    setEventError("");
    setMessageError("");
    setSubjectError("");
    setReplayToError("");
    // setReplayAtError("");
    setSmsOptionError("");
    setContactOptionError("");
  };

  useEffect(() => {
    getGroupNames();
  }, []);

  useEffect(() => {
    if (groupId) {
      getGroupContact();
    }
  }, [groupId]);

  useEffect(() => {
    getContactsGroup();
  }, [location.pathname]);

  return (
    <div className="card h-full min-h-[82vh] w-1/2">
      <h3 className="font-poppins text-lg font-semibold leading-7 text-secondary-color">{t("greetings.greetings")}</h3>

      <form onSubmit={handleSubmit} className="mt-6 flex min-h-[73vh] flex-col gap-y-8">
        <div className="flex-grow space-y-6">
          <div className="w-full space-y-3">
            <div className="label text-left">
              {t("greetings.selectContact")} <span className="text-red-500">*</span>
              {contactOptionError && <span className="text-xs text-red-500">{contactOptionError}</span>}
            </div>

            <div className="flex items-center">
              <input
                id="allContacts"
                type="radio"
                value="allContacts"
                name="contact-radio"
                checked={contactOption === "allContacts"}
                onChange={() => handleContactOptionChange("allContacts")}
                className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
              />
              <label htmlFor="allContacts" className="ms-2 text-sm font-medium text-gray-900">
                {t("greetings.allContacts")}
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="selectedContacts"
                type="radio"
                value="selectedContacts"
                name="contact-radio"
                checked={contactOption === "selectedContacts"}
                onChange={() => handleContactOptionChange("selectedContacts")}
                className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
              />
              <label htmlFor="selectedContacts" className="ms-2 text-sm font-medium text-gray-900">
                {t("greetings.selectedContacts")}
              </label>
            </div>
          </div>

          {/* {contactOption === "selectedContacts" && (
            <div className="mt-5">
              <div className="mb-5 text-left label">
                Selected Contacts
                {contactOptionError && <span className="text-xs text-red-500">* {contactOptionError}</span>}
              </div>
              <div className="flex flex-col space-y-3">
                {allContactByGroup?.map((item) => (
                  <div className="flex items-center" key={item.id}>
                    <input
                      id={item.id}
                      type="checkbox"
                      checked={selectedContacts?.includes(item?.id)}
                      onChange={() => handleCheckboxChange(item?.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
                    />
                    <label htmlFor={item.id} className="text-sm font-medium text-gray-900 capitalize ms-2">
                      {item.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )} */}
          {contactOption === "selectedContacts" && (
            <div className="mt-5">
              <div className="label mb-5 ml-6 text-left">
                <div className="flex items-center gap-x-2">
                  <div className="h-3 w-3 rounded-full bg-black"></div>
                  <div className="font-medium">{t("cardSchedule.groups")}</div>
                </div>
                {contactOptionError && <span className="text-xs text-red-500">* {contactOptionError}</span>}
              </div>
              <div className="ml-14 flex flex-col space-y-3">
                {groupOptions?.map((item, index) => (
                  <div className="" key={item?.value}>
                    <div className="flex items-center text-left">
                      <span className="text-sm font-medium">{index + 1})</span>
                      <label
                        htmlFor={item?.value}
                        onClick={() => handleGroupClick(item.value)}
                        className="ms-2 flex cursor-pointer items-center gap-x-2 text-left text-sm font-medium text-gray-900"
                      >
                        {item?.label}
                        <span className="text-xs font-semibold text-red-500">({item?.count})</span>
                        {/* <span className="text-xs text-red-500 ms-2">see contacts</span> */}
                      </label>
                    </div>

                    {selectedGroupID === item.value && (
                      <div className="mt-2 flex flex-col gap-y-3 pl-2">
                        {groupContacts[item.value] && groupContacts[item.value].length > 0 ? (
                          groupContacts[item.value]?.map((contact) => (
                            <div key={contact?.uuid} className="ml-4 flex items-center">
                              <input
                                id={contact?.uuid}
                                type="checkbox"
                                checked={(selectedContactsByGroup[item.value] || []).includes(contact?.uuid)}
                                onChange={() => {
                                  handleCheckboxChange(item.value, contact?.uuid);
                                  const mainEmail = contact.emails?.find((email) => email.type === "Main")?.contact_email || null;
                                  console.log("mainEmail", mainEmail);
                                  setSelectedUsersEmail(mainEmail);
                                }}
                                className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                              />
                              <span className="ms-2 text-xs">{contact.first_name + " " + contact.last_name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-500">No contacts available</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* <div className="space-y-3 w-full">
            <div className="text-left label">
              Send Sms to <span className="text-red-500">*</span>
              {smsOptionError && <span className="text-xs text-red-500">{smsOptionError}</span>}
            </div>

            <div className="flex items-center">
              <input
                id="allContactsSelectedAbove"
                type="radio"
                value="allContactsSelectedAbove"
                name="contact-selected-above-radio"
                checked={smsOption === "allContactsSelectedAbove"}
                onChange={() => handleSmsOptionChange("allContactsSelectedAbove")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
              />
              <label htmlFor="allContactsSelectedAbove" className="text-sm font-medium text-gray-900 ms-2">
                All Contacts selected above
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="selectedContactsInvited"
                type="radio"
                value="selectedContactsInvited"
                name="contact-invited-radio"
                checked={smsOption === "selectedContactsInvited"}
                onChange={() => handleSmsOptionChange("selectedContactsInvited")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
              />
              <label htmlFor="selectedContactsInvited" className="text-sm font-medium text-gray-900 ms-2">
                All selected contacts who have been invited to
              </label>
            </div>
          </div> */}

          {smsOption === "selectedContactsInvited" && (
            <div className="mt-5">
              <Dropdown
                isRequired
                title="Events"
                placeholder="Events"
                withError={eventError}
                options={allEvents}
                value={event}
                onChange={(e) => {
                  setEvent(e);
                  setEventError("");
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-5">
            <Input
              // isRequired
              type="email"
              label={t("greetings.replyTo")}
              placeholder={t("greetings.replyTo")}
              value={replayTo}
              error={replayToError}
              onChange={(e) => {
                setReplayTo(e.target.value);
                setReplayToError("");
              }}
            />

            {/* <Input
              type="email"
              // isRequired
              label="Replay At"
              placeholder="Replay At"
              value={replayAt}
              error={replayAtError}
              onChange={(e) => {
                setReplayAt(e.target.value);
                setReplayAtError("");
              }}
            /> */}
          </div>

          <Input
            // isRequired
            label={t("greetings.subject")}
            placeholder={t("greetings.subject")}
            value={subject}
            error={subjectError}
            onChange={(e) => {
              setSubject(e.target.value);
              setSubjectError("");
            }}
          />

          <Input
            isRequired
            labelOnTop
            label={t("greetings.message")}
            placeholder="Enter Message"
            textarea
            // readOnly
            error={messageError}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setMessageError("");
            }}
          />
          {/* <Input
            isRequired
            labelOnTop
            label={t("greetings.messageAboveImage")}
            placeholder="Enter Message"
            textarea
            // error={messageAboveImageError}
            value={messageAboveImage}
            onChange={(e) => {
              setMessageAboveImage(e.target.value);
              // setMessageAboveImageError("");
            }}
          /> */}

          <div className="space-y-2">
            <label className={`label ${greetingImage ? "self-start" : "self-center"} `}>
              {t("greetings.greetingImage")}
              {greetingImageError && <span className="text-xs text-red-500">* {greetingImageError}</span>}{" "}
            </label>
            <div className="w-3/12">
              <ChooseFile
                // textOnImage={messageOnTheImage}
                textAboveImage={messageAboveImage}
                textBelowImage={messageBelowImage}
                label="Menu File"
                onChange={handleImageChange}
                selectedFile={greetingImage}
                onClickCross={handleCrossClick}
              />
            </div>
          </div>

          {/* <Input
            isRequired
            labelOnTop
            label={t("greetings.messageBelowImage")}
            placeholder="Enter Message"
            textarea
            // error={messageAboveImageError}
            value={messageBelowImage}
            onChange={(e) => {
              setMessageBelowImage(e.target.value);
              // setMessageError("");
            }}
          /> */}
        </div>

        <div className="flex justify-end">
          <Button icon={<CheckIcon />} title={t("greetings.sendGreeting")} type="submit" loading={btnLoading} />
        </div>
      </form>
    </div>
  );
};

export default Greetings;
