import Lottie from "react-lottie";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useReactToPrint } from "react-to-print";
import { CONTACTS, RSVP } from "../../routes/Names";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import React, { useEffect, useState, useRef } from "react";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { ArrowLeftIcon, ClockIcon, MapIcon, PrinterIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import { useTranslation } from "react-i18next";

const RsvpPrint = () => {
  const { t: commonT } = useTranslation("common");

  const { eventSelect, allEvents, userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allRsvpList, setAllRsvpList] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [statsCount, setStatsCount] = useState(null);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    getRsvpListToPrint(!isChecked);
  };

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const getRsvpListToPrint = async (check) => {
    try {
      let payload = {
        event_id: eventSelect,
        type: check ? "group" : "contact",
      };
      setLoading(true);
      const result = await ApiServices.rsvp.getRsvpReport(payload);
      if (result.status === 200) {
        setAllRsvpList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRsvpListToPrint();
  }, []);

  const PrintableContactList = React.forwardRef(({ allRsvpList, loading }, ref) => (
    <div ref={ref} className="printableContactList pr-2">
      {loading ? (
        <div>
          <div>
            <Skeleton count={8} height={50} />
          </div>
        </div>
      ) : (allRsvpList && allRsvpList?.users?.length > 0) || allRsvpList?.groups?.length > 0 ? (
        <div className="px-10">
          {!isChecked ? (
            <table className="w-full text-left">
              {/* Table Header */}
              <thead>
                <tr>
                  {TABLE_HEAD_VENUE.map((head, index) => (
                    <th key={index} className="border-b border-gray-100 bg-white p-4 first:pl-6">
                      <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {allRsvpList?.users?.map((item) => (
                  <tr key={item?.uuid}>
                    <td className="py-3 pl-6 pr-4">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{`${item.first_name} ${item.last_name} `}</p>
                    </td>
                    <td className="py-3 pl-4 pr-3 3xl:px-4">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.invitees[0]?.rsvp_yes || "-"}</p>
                    </td>
                    <td className="py-3 pl-4 pr-3 3xl:px-4">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.invitees[0]?.rsvp_no || "-"}</p>
                    </td>
                    <td className="py-3 pl-4 pr-3 3xl:px-4">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.invitees[0]?.rsvp_may_attend || "-"}</p>
                    </td>
                    <td className="py-3 pl-4 pr-3 3xl:px-4">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.invitees[0]?.rsvp_pending || "-"}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // Displaying a list if isChecked is false
            <>
              {allRsvpList?.groups?.map((item) => (
                <div className="space-y-1">
                  <div className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg border-2 p-4 text-gray-900">
                    <div className="flex gap-x-4">
                      <h2 className="font-medium">{item?.name}</h2>
                    </div>
                  </div>
                  <div className="ml-12">
                    <table className="table w-full table-auto rounded-lg text-left">
                      <thead>
                        <tr>
                          {TABLE_HEAD_VENUE.map((head, index) => (
                            <th key={index} className="border-b border-gray-100 bg-white p-4 first:pl-6">
                              <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {item?.members?.map((member) => (
                          <tr key={member?.uuid}>
                            <td className="py-3 pl-6 pr-4">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{`${member.first_name} ${member.last_name} `}</p>
                            </td>
                            <td className="py-3 pl-4 pr-3 3xl:px-4">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{member?.invitees[0]?.rsvp_yes || "-"}</p>
                            </td>
                            <td className="py-3 pl-4 pr-3 3xl:px-4">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{member?.invitees[0]?.rsvp_no || "-"}</p>
                            </td>
                            <td className="py-3 pl-4 pr-3 3xl:px-4">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{member?.invitees[0]?.rsvp_may_attend || "-"}</p>
                            </td>
                            <td className="py-3 pl-4 pr-3 3xl:px-4">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{member?.invitees[0]?.rsvp_pending || "-"}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="h-[400px] pt-24">
          <div>
            <Lottie options={emptyFolderAnimation} width={200} height={200} />
            {/* <p className="text-center text-lg text-gray-500">Please select an Event type!</p> */}
          </div>
        </div>
      )}
    </div>
  ));
  return (
    <>
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("RSVP")) && (
        <div onClick={() => navigate(RSVP)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
          <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
          <span> Back to Rsvp list</span>
        </div>
      )}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Rsvp</h3>

        <div className="mt-5 grid grid-cols-12 gap-x-8">
          <div className="col-span-4 flex items-center gap-x-12">
            <h3 className="text-base font-medium">Include:</h3>
            <div className="flex items-center gap-x-2 pl-2">
              <input
                onChange={handleCheckboxChange}
                type="checkbox"
                id="addressCheckbox"
                name="addressCheckbox"
                className="rounded"
                checked={isChecked}
              />
              <label htmlFor="addressCheckbox" className="label">
                Grouped
              </label>
            </div>
          </div>
        </div>

        <div className="mt-5 h-[52vh] overflow-y-auto overflow-x-hidden">
          <div className="-mx-6 mb-8 overflow-x-auto">
            <PrintableContactList ref={componentRef} allRsvpList={allRsvpList} loading={loading} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button icon={<PrinterIcon />} title={commonT("buttons.print")} type="button" onClick={handlePrint} />
        </div>
      </div>
    </>
  );
};

export default RsvpPrint;
const TABLE_HEAD_VENUE = ["Guest Name", "Yes", "No", "Maybe", "Pending"];
