import React from "react";
import { useState, useEffect } from "react";
import GlobalHeader from "../../components/common/GlobalHeader";
import Dropdown from "../../components/common/Dropdown";
import { CheckIcon, ClockIcon, MapIcon, PrinterIcon } from "@heroicons/react/24/outline";
import Lottie from "react-lottie";
import animationData from "../../assets/lottie/events.json";
import ReactQuill from "react-quill";
import Button from "../../components/common/Button";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { useThemeContext } from "../../context/GlobalContext";
import { getLocalDateFromUnixTimestamp } from "../../utilities/HelperFunctions";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import { useTranslation } from "react-i18next";

const SendSms = () => {
  const { t } = useTranslation("common");

  const { eventSelect, allEvents, allEventsList, getEventList, openSuccessModal, closeSuccessModel } = useThemeContext();

  const [event, setEvent] = useState("");

  const [btnLoading, setBtnLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageErr, setMessageErr] = useState("");

  // const selectedEventDetails = allEventsList?.find((item) => item.id === eventSelect,) || {};

  // Handle Send Message
  const validateForm = (e) => {
    let isValidData = true;
    if (message === "") {
      setMessageErr(" Required");
      isValidData = false;
    }
    return isValidData;
  };

  const handleSendMessage = () => {
    const isValid = validateForm();
    if (!isValid) return;

    const requestData = {
      event_id: eventSelect,
      message: message,
    };
    setBtnLoading(true);

    ApiServices.SendSms.sendSMS(requestData)
      .then((res) => {
        const { data, message } = res;

        if (data?.code === 200) {
          setBtnLoading(false);
          setMessage("");
          openSuccessModal({
            title: t("message.success"),
            message: t("sendSms.smsSuccess"),
            onClickDone: closeSuccessModel,
          });
        }
      })
      .catch((err) => {
        setBtnLoading(false);
      });
  };

  // useEffect(() => {
  //   getEventList()
  // }, [])

  console.log({ allEventsList });

  return (
    <>
      <div className="card h-[83vh] space-y-8 overflow-y-auto">
        <GlobalHeader title="Send SMS" withoutBtns />

        {/* dropdown */}
        {/* <div>
          <h3 className="text-base text-gray-700">Select an Event</h3>
          <div className="grid gap-6 xl:grid-cols-4">
            <Dropdown
                withoutTitle
                options={allEvents}
                placeholder="-- Select an Event --"
                value={event}
                onChange={(e) => {
                  setEvent(e);
                }}
              />

            <div className="flex gap-x-3 items-center">
              <MapIcon className="w-8 h-8 text-blue-500 shrink-0" />
              <div className="space-y-1">
                <h2 className="font-medium">{selectedEventDetails?.name || "N/A"}</h2>
                <p className="text-sm">{selectedEventDetails?.description || "N/A"}</p>
              </div>
            </div>

            <div className="flex gap-x-3 items-center">
              <ClockIcon className="w-8 h-8 text-green-600 shrink-0" />
              <div className="space-y-1">
                <h2 className="font-medium">Start Date & Time</h2>
                <p className="text-sm">{getLocalDateFromUnixTimestamp(selectedEventDetails?.start_date, "DD MMM, YYYY, HH:mmA") || "N/A"}</p>
              </div>
            </div>

            <div className="flex gap-x-3 items-center">
              <ClockIcon className="w-8 h-8 text-red-500 shrink-0" />
              <div className="space-y-1">
                <h2 className="font-medium">End Date & Time</h2>
                <p className="text-sm">{getLocalDateFromUnixTimestamp(selectedEventDetails?.end_date, "DD MMM, YYYY, HH:mmA") || "N/A"}</p>
              </div>
            </div>
          </div>
        </div> */}

        <div className="mx-auto mt-5 w-8/12">
          <div className="">
            <label>
              {t("sendSms.message")} <span className="text-red-500">*</span>
              {messageErr && <span className="mt-3 text-red-500">{messageErr}</span>}
            </label>
            {/* <ReactQuill
                value={message}
                onChange={(value) => {
                  setMessage(value);
                  setMessageErr("");
                }}
                placeholder="Write here..."
                className="mt-3"
              /> */}
            <Input
              placeholder="Write here..."
              textarea
              value={message}
              rows={2}
              onChange={(e) => {
                setMessage(e.target.value);
                setMessageErr("");
              }}
            />
          </div>
          <div className="flex items-start justify-between">
            <div className="">
              <p className="text-gray-500">
                {t("headings.notes")}: {t("sendSms.messageNote")}
              </p>
            </div>
            <div className="mt-4">
              <Button title={t("sendSms.send")} loading={btnLoading} onClick={handleSendMessage} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SendSms;
