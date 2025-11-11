import moment from "moment";
import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { RSVP_PRINT } from "../../routes/Names";
import React, { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import Accordian from "../../components/common/Accordian";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { ArrowLeftIcon, ClockIcon, MapIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const Rsvp = () => {
  const { t } = useTranslation("common");

  // Context
  const { eventSelect, allEvents, allEventsList, setLoading, loading, getEventList } = useThemeContext();

  // useStates
  const [event, setEvent] = useState("");
  const [statsCount, setStatsCount] = useState(null);
  const [allContactGroup, setAllContactGroup] = useState([]);

  // Filter the eventDetails based on the selected event
  let selectedEventDetails = {};
  selectedEventDetails = allEventsList.find((item) => item.id === event.value) || {};

  // Event selection handler
  // const handleEventChange = (selectedEvent) => {
  //   setEvent(selectedEvent);
  //   getEventStatsById(selectedEvent?.value);
  //   getContactsByGroup(selectedEvent?.value);
  // };

  // Get Event Stats by id
  const getEventStatsById = async (givenId) => {
    try {
      const payload = {};
      const response = await ApiServices.events.getEventStatsById(eventSelect, payload);

      if (response.data.code === 200) {
        setStatsCount(response.data.data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Get Contact by group
  const getContactsByGroup = async () => {
    setLoading(true);
    try {
      const payload = {
        event_id: eventSelect,
      };
      const response = await ApiServices.invites.getContactsByGroup(payload);

      if (response.data.code === 200) {
        setAllContactGroup(response.data.data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEventStatsById();
    getContactsByGroup();
  }, []);

  return (
    <>
      <div className="card h-[83vh] space-y-8 overflow-y-auto">
        {/* <h3 onClick={() => setEvent("")} className="text-base text-gray-700 underline cursor-pointer underline-offset-4">
            <ArrowLeftIcon className="inline-block w-4 h-4" /> Back to Event
          </h3> */}

        <Link to={RSVP_PRINT}>
              <Button title={t('buttons.print')} buttonColor="border-primary  bg-primary " />
            </Link>

        <h2 className="heading">RSVP</h2>

        <div>
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
                  <p className="text-sm">{moment.unix(selectedEventDetails.start_date).format("D MMM YYYY h:mm A") || "N/A"}</p>
                </div>
              </div>

              <div className="flex gap-x-3 items-center">
                <ClockIcon className="w-8 h-8 text-red-500 shrink-0" />
                <div className="space-y-1">
                  <h2 className="font-medium">End Date & Time</h2>
                  <p className="text-sm">{moment.unix(selectedEventDetails.end_date).format("D MMM YYYY h:mm A") || "N/A"}</p>
                </div>
              </div>
            </div> */}

          {/* <div className="grid my-8 text-gray-700 rounded-lg border-2 border-gray-400 divide-gray-400 lg:divide-x-2 xl:grid-cols-5 3xl:w-2/3">
              <div className="flex flex-col gap-y-3 justify-center items-center p-4">
                <p className="text-lg font-semibold">Invited</p>
                <p className="text-xl font-medium text-green-500">{statsCount?.total_invited || "0"}</p>
              </div>

              <div className="flex flex-col gap-y-3 justify-center items-center p-4">
                <p className="text-lg font-semibold">RSVP Pending</p>
                <p className="text-xl font-medium text-green-500">{statsCount?.rsvp_pending || "0"}</p>
              </div>

              <div className="flex flex-col gap-y-3 justify-center items-center p-4">
                <p className="text-lg font-semibold">RSVP Yes</p>
                <p className="text-xl font-medium text-green-500">{statsCount?.rsvp_yes || "0"}</p>
              </div>

              <div className="flex flex-col gap-y-3 justify-center items-center p-4">
                <p className="text-lg font-semibold">RSVP No</p>
                <p className="text-xl font-medium text-green-500">{statsCount?.rsvp_no || "0"}</p>
              </div>

              <div className="flex flex-col gap-y-3 justify-center items-center p-4">
                <p className="text-lg font-semibold">RSVP May Attend</p>
                <p className="text-xl font-medium text-green-500">{statsCount?.rsvp_may_attend || "0"}</p>
              </div>
              <div></div>
            </div> */}

          <div className="my-8 grid divide-gray-400 rounded-lg border-2 border-gray-400 text-gray-700 lg:grid-cols-5 lg:divide-x-2 xl:grid-cols-5 3xl:w-2/3">
            <div className="flex flex-col items-center justify-center gap-y-3 p-4">
              <p className="text-lg font-semibold">{t("invitee.invited")}</p>
              <p className="text-xl font-medium text-green-500">{statsCount?.total_invited || "0"}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-y-3 p-4">
              <p className="text-lg font-semibold">{t("invitee.pending")}</p>
              <p className="text-xl font-medium text-green-500">{statsCount?.rsvp_pending || "0"}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-y-3 p-4">
              <p className="text-lg font-semibold">{t("invitee.yes")}</p>
              <p className="text-xl font-medium text-green-500">{statsCount?.rsvp_yes || "0"}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-y-3 p-4">
              <p className="text-lg font-semibold">{t("invitee.no")}</p>
              <p className="text-xl font-medium text-green-500">{statsCount?.rsvp_no || "0"}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-y-3 p-4">
              <p className="text-lg font-semibold">{t("invitee.mayAttend")}</p>
              <p className="text-xl font-medium text-green-500">{statsCount?.rsvp_may_attend || "0"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-body pt-4">
              {loading ? (
                <Skeleton count={1} height={100} className="!rounded-lg" />
              ) : allContactGroup?.length > 0 ? (
                <Accordian
                  setStatsCount={setStatsCount}
                  data={allContactGroup}
                  eventId={event}
                  rsvpModal
                  onSuccess={() => getContactsByGroup(event?.value)}
                />
              ) : (
                <div className="m-2">
                  <h2 className="text-base text-red-500">No Contact found against this event</h2>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Rsvp;
