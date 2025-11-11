import moment from "moment";
import Lottie from "react-lottie";
import React, { useState, useEffect } from "react";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { ArrowLeftIcon, CheckIcon, ClockIcon, MapIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const SendEmail = () => {
  const { t } = useTranslation("common");

  // Context
  const {
    eventSelect,
    allEvents,
    allInvitationCards,
    allEventsList,
    btnLoading,
    setBtnLoading,
    openSuccessModal,
    closeSuccessModel,
    getEventList,
    getInvitationCards,
  } = useThemeContext();

  // useStates
  const [event, setEvent] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [replayTo, setReplayTo] = useState("");
  // const [replayAt, setReplayAt] = useState("");
  const [includeRsvp, setIncludeRsvp] = useState(false);
  const [invitationCard, setInvitationCard] = useState(null);

  const [messageError, setMessageError] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [replayToError, setReplayToError] = useState("");
  // const [replayAtError, setReplayAtError] = useState("");
  // const [includeRsvpError, setIncludeRsvpError] = useState(false);
  const [invitationCardError, setInvitationCardError] = useState("");

  // Filter the eventDetails based on the selected event
  let selectedEventDetails = {};
  selectedEventDetails = allEventsList?.find((item) => item?.id === event?.value) || {};

  // Event selection handler
  // const handleEventChange = (selectedEvent) => {
  //   setEvent(selectedEvent);
  // };
  // Invitation card selection handler
  const handleInvitationCardChange = (selectedCard) => {
    setInvitationCard(selectedCard);
    setInvitationCardError("");
  };

  // Form Validation
  const isValidForm = () => {
    let isValidData = true;

    if (invitationCard === null) {
      setInvitationCardError("Required");
      isValidData = false;
    }

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

    // if (includeRsvp === false) {
    //   setIncludeRsvpError("Required");
    //   isValidData = false;
    // }

    return isValidData;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        let payload = {
          event_id: eventSelect,
          reply_to: replayTo,
          // reply_at: replayAt,
          subject: subject,
          invitation_card: invitationCard?.value,
          message: message,
        };

        const response = await ApiServices.email.sendEmail(payload);

        if (response?.statusText === "OK") {
          setBtnLoading(false);
          clearAllData();
          openSuccessModal({
            title: t("message.success"),
            message: t("sendEmail.emailSuccess"),
            onClickDone: closeSuccessModel,
          });
        } else {
          setBtnLoading(false);
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
    // setReplayAt("");
    setReplayTo("");
    setSubject("");
    setInvitationCard(null);
    setInvitationCardError("");
    setIncludeRsvp(false);
    setMessage("");
    setMessageError("");
  };

  useEffect(() => {
    getInvitationCards();
  }, []);

  return (
    <>
      <div className="card h-[83vh] space-y-8 overflow-y-auto">
        {/* <h3 onClick={() => setEvent("")} className="text-base text-gray-700 underline cursor-pointer underline-offset-4">
            <ArrowLeftIcon className="inline-block w-4 h-4" /> Back to Event
          </h3> */}

        <h2 className="heading">Send Email</h2>

        {/* Event Detail */}
        {/* <div className="grid gap-6 xl:grid-cols-3">
            <div className="flex gap-x-3 items-center">
              <MapIcon className="w-8 h-8 text-blue-500 shrink-0" />
              <div className="space-y-1">
                <h2 className="font-medium">{selectedEventDetails?.venue?.name || "N/A"}</h2>
                <p className="text-sm">{selectedEventDetails?.venue?.address || "N/A"}</p>
              </div>
            </div>

            <div className="flex gap-x-3 items-center">
              <ClockIcon className="w-8 h-8 text-green-600 shrink-0" />
              <div className="space-y-1">
                <h2 className="font-medium">Start Date & Time</h2>
                <p className="text-sm">{moment.unix(selectedEventDetails?.start_date).format("D MMM YYYY h:mm A") || "N/A"}</p>
              </div>
            </div>

            <div className="flex gap-x-3 items-center">
              <ClockIcon className="w-8 h-8 text-red-500 shrink-0" />
              <div className="space-y-1">
                <h2 className="font-medium">End Date & Time</h2>
                <p className="text-sm">{moment.unix(selectedEventDetails?.end_date).format("D MMM YYYY h:mm A") || "N/A"}</p>
              </div>
            </div>
          </div> */}
        {/* End Event Detail */}

        <div className="w-1/2 rounded-xl border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Input
                type="email"
                // isRequired
                label={t("sendEmail.replyTo")}
                placeholder={t("sendEmail.replyTo")}
                value={replayTo}
                error={replayToError}
                onChange={(e) => {
                  setReplayTo(e.target.value);
                  setReplayToError("");
                }}
              />

              {/* <Input
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
              label={t("sendEmail.subject")}
              placeholder={t("sendEmail.subject")}
              value={subject}
              error={subjectError}
              onChange={(e) => {
                setSubject(e.target.value);
                setSubjectError("");
              }}
            />

            <Dropdown
              isRequired
              withError={invitationCardError}
              title={t("sendEmail.invitationCard")}
              options={allInvitationCards}
              placeholder="-- Select a Card --"
              value={invitationCard}
              onChange={handleInvitationCardChange}
            />

            <Input
              isRequired
              labelOnTop
              label={t("sendEmail.message")}
              placeholder="Enter Message"
              textarea
              error={messageError}
              value={message}
              // readOnly
              onChange={(e) => {
                setMessage(e.target.value);
                setMessageError("");
              }}
            />

            {/* <div className="flex gap-x-2 items-center pl-2">
                <input
                  isRequired
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={includeRsvp}
                  className="rounded"
                  onChange={(e) => {
                    setIncludeRsvp(e.target.checked);
                    setIncludeRsvpError("");
                  }}
                />
                <label for="remember" className="label">
                  Include RSVP Links
                  {includeRsvpError && <span className="text-xs text-red-500">* {includeRsvpError}</span>}
                </label>
              </div> */}

            <div className="flex justify-end">
              <Button icon={<CheckIcon />} title={t("sendEmail.sendEmail")} type="submit" loading={btnLoading} />
            </div>
          </form>
        </div>
      </div>
      {/* ) : (
        <>
          <div className="heading">Send Email</div>

          <div className="flex h-[70vh] flex-col items-center justify-center gap-y-8">
            <div className="w-96 card">
              <Lottie options={emptyFolderAnimation} height={100} width={100} />
              <div className="space-y-3 w-full">
                <Dropdown title="Events:" options={allEvents} placeholder="-- Select an Event --" value={event} onChange={handleEventChange} />
              </div>
            </div>
          </div>
        </>
      )} */}
    </>
  );
};

export default SendEmail;
