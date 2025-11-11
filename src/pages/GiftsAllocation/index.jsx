import Lottie from "react-lottie";
import ApiServices from "../../api/services";
import React, { useEffect, useState } from "react";
import Dropdown from "../../components/common/Dropdown";
import Accordian from "../../components/common/Accordian";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import Skeleton from "react-loading-skeleton";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { GIFT_ALLOCATION_PRINT, GIFT_PRINT } from "../../routes/Names";
import Button from "../../components/common/Button";
import { useTranslation } from "react-i18next";

const GiftAllocation = () => {
  const { t } = useTranslation("common");

  const { eventSelect, allEvents, getEventList } = useThemeContext();

  const [search, setSearch] = useState("");
  const [event, setEvent] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [allContactByGroup, setAllContactByGroup] = useState([]);

  // Updated getAllContactByGroup function with filtering
  const getAllContactByGroup = async (eventId) => {
    setLoading(true);
    try {
      let payload = {
        // search: searchText,
        event_id: eventSelect,
      };

      const res = await ApiServices.allocateGift.GetAllContactByGroup(payload);
      const { data, message } = res;
      console.log("data", data);

      if (data.code === 200) {
        // Filter and transform the data in one step
        const transformedData =
          data?.data
            ?.map((group) => ({
              name: group?.name,
              memberData:
                group?.members?.filter((member) => {
                  // Filter members who have at least 1 rsvp_yes or rsvp_may_attend
                  if (!member?.invitees || !Array.isArray(member?.invitees)) {
                    return false;
                  }

                  return member?.invitees?.some(
                    (invitee) => (invitee?.rsvp_yes && invitee?.rsvp_yes > 0) || (invitee?.rsvp_may_attend && invitee?.rsvp_may_attend > 0),
                  );
                }) || [],
            }))
            ?.filter((group) => group?.memberData && group?.memberData?.length > 0) || []; // Remove empty groups

        setFilterData(transformedData);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // getEventList()
    getAllContactByGroup();
  }, []);

  return (
    <>
      {/* {event && event?.value ? ( */}
      <div className="card  ">
        <div className="flex items-center justify-between py-5">
          <h2 className="text-xl font-medium">Gift Allocation</h2>
          <Link to={GIFT_ALLOCATION_PRINT}>
            <Button title={t("buttons.print")} buttonColor="border-primary  bg-primary " />
          </Link>
        </div>
        
        {/* <h3 onClick={() => setEvent("")} className="cursor-pointer pb-8 text-base text-gray-700 underline underline-offset-4">
            <ArrowLeftIcon className="inline-block h-4 w-4" /> Back to Event
          </h3> */}
        <div className="card-header">
          <h2 className="text-lg font-semibold">{t("giftAllocation.allContact")}</h2>

          {/* <div className="ms-4">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={futureCeremonies}
                onChange={(e) => setFutureCeremonies(e.target.checked)}
              />
              <label htmlFor="remember" className="label ps-2">
                Future ceremonies only
              </label>
            </div> */}
        </div>
        <div className="card-body pt-4">
          {loading ? (
            <Skeleton count={1} height={100} className="!rounded-lg" />
          ) : filterData?.length > 0 ? (
            <Accordian data={filterData} eventId={event?.value} onSuccess={() => getAllContactByGroup(event?.value)} />
          ) : (
            <div className="m-2">
              <h2 className="text-base text-red-500">No Contact found against this event</h2>
            </div>
          )}
        </div>
      </div>
      {/* ) : (
          <div className="flex items-center justify-between">
            <h2 className="heading">Gift Allocation</h2>
            <Link to={GIFT_ALLOCATION_PRINT}>
            <Button title={commonT('buttons.print')} buttonColor="border-primary  bg-primary " />
            </Link>
          </div>
        <div>
          <div className="flex h-[70vh] flex-col items-center justify-center gap-y-8">
            <div className="card w-96">
              <Lottie options={emptyFolderAnimation} height={100} width={100} />
              <div className="w-full space-y-3">
                <Dropdown
                  title="Events:"
                  options={allEvents}
                  placeholder="-- Select an Event --"
                  value={event}
                  onChange={(e) => {
                    setEvent(e);
                    getAllContactByGroup(e?.value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
};

export default GiftAllocation;
