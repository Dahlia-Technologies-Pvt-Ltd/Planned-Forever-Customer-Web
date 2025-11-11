import Lottie from "react-lottie";
import ApiServices from "../../api/services";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Dropdown from "../../components/common/Dropdown";
import Accordian from "../../components/common/Accordian";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import Skeleton from "react-loading-skeleton";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const CardAllocation = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  const { eventSelect , allEvents , getEventList } = useThemeContext();

  const [search, setSearch] = useState("");
  const [event, setEvent] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [allContactByGroup, setAllContactByGroup] = useState([]);

  // Get All Contacts By Group
  const getAllContactByGroup = async () => {
    setLoading(true);
    try {
      let payload = {
        // search: searchText,
        event_id: eventSelect,
        isRSVP:1
      };

      const res = await ApiServices.allocateGift.GetAllContactByGroup(payload);
      const { data, message } = res;

       

      if (data.code === 200) {
        const transformedData = data?.data?.map((group) => ({
          name: group?.name,
          memberData: group?.members,
        }));

        setFilterData(transformedData);

        setLoading(false);
      }
    } catch (err) {
       
    }
  };

   

  useEffect(()=>{
    getAllContactByGroup()
  },[])


  return (
    <>
      {/* {event && event?.value ? ( */}
        <>
      
        <div className="card  ">
          {/* <h3 onClick={() => setEvent("")} className="cursor-pointer pb-8 text-base text-gray-700 underline underline-offset-4">
            <ArrowLeftIcon className="inline-block h-4 w-4" /> Back to Event
          </h3> */}
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{t("cardAllocation.allContact")}</h2>
              
              <button
                onClick={() => navigate("/card-allocation-print")}
                className="flex items-center gap-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <PrinterIcon className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>

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
              <Accordian data={filterData} cardAllocate eventId={event?.value} onSuccess={() => getAllContactByGroup(event?.value)} />
            ) : (
              <div className="m-2">
                <h2 className="text-base text-red-500">No Contact found against this event</h2>
              </div>
            )}
          </div>
        </div>
      </>
        
        
      {/* ) : (<>
            <h2 className="heading">Card Allocation</h2>
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
      </>
      )} */}
    </>
  );
};

export default CardAllocation;
