import Lottie from "react-lottie";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useReactToPrint } from "react-to-print";
import { CONTACTS, INVITEES, RSVP } from "../../routes/Names";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import React, { useEffect, useState, useRef } from "react";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { ArrowLeftIcon, ClockIcon, MapIcon, PrinterIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import { useTranslation } from "react-i18next";

const InviteesPrint = () => {

  const { t: commonT } = useTranslation("common");
  
  const {eventSelect, allEvents , userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allInviteesList, setAllInviteesList] = useState([]);
   
  const [selectedEventItem, setSelectedEventItem] = useState(null);
  const [selectedCityItem, setSelectedCityItem] = useState(null);
  const [allCities, setAllCities] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedAddress, setIsCheckedAddress] = useState(false);
  const [showNoInviteeMsg, setShowNoInviteeMsg] = useState(false);
  const handleCheckboxChangeGroup = () => {
    setIsChecked(!isChecked);
    getInviteesListToPrint(selectedEventItem, !isChecked, selectedCityItem);
  };

  const handleCheckboxChangeAdress = () => {
    setIsCheckedAddress(!isCheckedAddress);
  };

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // get invitee list to print
  const getInviteesListToPrint = async (eventType, group, city) => {
    try {
      setLoading(true);
      // const eventValue = eventType?.value;
      const cityValue = city?.value;

      if (cityValue != null) {
        const payload = {
          event_id: eventSelect,
          type: group ? "group" : "contact",
          city: cityValue,
        };
         

        const result = await ApiServices.rsvp.getRsvpReport(payload);
        if (result.status === 200) {
          setAllInviteesList(result?.data?.data);
          setShowNoInviteeMsg(true);
        }
      }
    } catch (error) {
      console.error("Error fetching invitees list:", error);
    } finally {
      setLoading(false);
    }
  };

  // get city list
  const getCityList = async () => {
    try {
      let payload = {};
      const res = await ApiServices.city.getCity(payload);
      const { data, message } = res;
      if (data.code === 200) {
        const formattedCities = data?.data?.map((city) => ({
          value: city,
          label: city,
        }));
        setAllCities(formattedCities);
      }
    } catch (err) {
       
    }
  };

  useEffect(() => {
    getCityList();
    getInviteesListToPrint(isChecked, selectedCityItem);
  }, []);

  const PrintableContactList = React.forwardRef(({ allInviteesList, loading }, ref) => (
    <div ref={ref} className="printableContactList pr-2">
      {loading ? (
        <div>
          <div>
            <Skeleton count={8} height={50} />
          </div>
        </div>
      ) : (allInviteesList && allInviteesList?.users?.length > 0) || allInviteesList?.groups?.length > 0 ? (
        <div className="px-10">
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="flex items-center gap-x-3">
              <MapIcon className="h-8 w-8 shrink-0 text-blue-500" />
              <div className="space-y-1">
                <h2 className="font-medium">{allInviteesList?.stats?.event?.event_name}</h2>
                <p className="text-sm">{allInviteesList?.stats?.venu?.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-x-3">
              <ClockIcon className="h-8 w-8 shrink-0 text-green-600" />
              <div className="space-y-1">
                <h2 className="font-medium">Start Date & Time</h2>
                <p className="text-sm">{moment.unix(allInviteesList?.stats?.event?.start_date).format("D MMM YYYY h:mm A") || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-x-3">
              <ClockIcon className="h-8 w-8 shrink-0 text-red-500" />
              <div className="space-y-1">
                <h2 className="font-medium">End Date & Time</h2>
                <p className="text-sm">{moment.unix(allInviteesList?.stats?.event?.end_date).format("D MMM YYYY h:mm A") || "-"}</p>
              </div>
            </div>
          </div>

          <div className="my-8 grid divide-gray-400 rounded-lg border-2 border-gray-400 text-gray-700 lg:divide-x-2 xl:grid-cols-5 3xl:w-2/3">
            <div className="flex flex-col items-center justify-center gap-y-3 p-4">
              <p className="text-lg font-semibold">Invited</p>
              <p className="text-xl font-medium text-green-500">{allInviteesList?.stats?.total_invited || "0"}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-y-3 p-4">
              <p className="text-lg font-semibold">RSVP Pending</p>
              <p className="text-xl font-medium text-green-500">{allInviteesList?.stats?.rsvp_pending || "0"}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-y-3 p-4">
              <p className="text-lg font-semibold">RSVP Yes</p>
              <p className="text-xl font-medium text-green-500">{allInviteesList?.stats?.rsvp_yes || "0"}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-y-3 p-4">
              <p className="text-lg font-semibold">RSVP No</p>
              <p className="text-xl font-medium text-green-500">{allInviteesList?.stats?.rsvp_no || "0"}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-y-3 p-4">
              <p className="text-lg font-semibold">RSVP May Attend</p>
              <p className="text-xl font-medium text-green-500">{allInviteesList?.stats?.rsvp_may_attend || "0"}</p>
            </div>
            <div></div>
          </div>
          {!isChecked ? (
            <table className="w-full text-left">
              {/* Table Header */}
              <thead>
                {isCheckedAddress ? (
                  <tr>
                    {TABLE_HEAD_INVITEES_BY_ADDRESS.map((head, index) => (
                      <th key={index} className="border-b border-gray-100 bg-white p-4 first:pl-6">
                        <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
                      </th>
                    ))}
                  </tr>
                ) : (
                  <tr>
                    {TABLE_HEAD_INVITEES.map((head, index) => (
                      <th key={index} className="border-b border-gray-100 bg-white p-4 first:pl-6">
                        <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
                      </th>
                    ))}
                  </tr>
                )}
              </thead>
              {/* Table Body */}
              <tbody>
                {allInviteesList?.users?.map((item) => (
                  <tr key={item?.uuid}>
                    <td className="py-3 pl-6 pr-4">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{`${item.first_name} ${item.last_name} `}</p>
                    </td>
                    <td className="py-3 pl-4 pr-3 3xl:px-4">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.city || "-"}</p>
                    </td>
                    <td className="py-3 pl-4 pr-3 3xl:px-4">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.contact_numbers[0]?.contact_number || "-"}</p>
                    </td>
                    <td className="py-3 pl-4 pr-3 3xl:px-4">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.invitees[0]?.rsvp_pending || "-"}</p>
                    </td>
                    {isCheckedAddress && (
                      <td className="py-3 pl-4 pr-3 3xl:px-4">
                        <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.address || "-"}</p>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // Displaying a list if isChecked is false
            <>
              {allInviteesList?.groups?.map((item) => (
                <div className="space-y-1">
                  <div className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg border-2 p-4 text-gray-900">
                    <div className="flex gap-x-4">
                      <h2 className="font-medium">{item?.name}</h2>
                    </div>
                  </div>
                  <div className="ml-12">
                    <table className="table w-full table-auto rounded-lg text-left">
                      <thead>
                        <tr className="border">
                          <th className="p-4 font-medium">Name</th>
                          <th className="p-4 font-medium">City</th>
                          <th className="p-4 font-medium">Phone Number</th>
                          <th className="p-4 font-medium">RSVP Status</th>
                          {isCheckedAddress && <th className="p-4 font-medium">Address</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {item?.members?.map((member) => (
                          <tr key={member?.uuid}>
                            <td className="py-3 pl-6 pr-4">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{`${member.first_name} ${member.last_name} `}</p>
                            </td>
                            <td className="py-3 pl-4 pr-3 3xl:px-4">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{member?.city || "-"}</p>
                            </td>
                            <td className="py-3 pl-4 pr-3 3xl:px-4">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                                {member?.contact_numbers[0]?.contact_number || "-"}
                              </p>
                            </td>
                            <td className="py-3 pl-4 pr-3 3xl:px-4">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{member?.invitees[0]?.rsvp_pending || "-"}</p>
                            </td>
                            {isCheckedAddress && (
                              <td className="py-3 pl-4 pr-3 3xl:px-4">
                                <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{member?.address || "-"}</p>
                              </td>
                            )}
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
            <p className="text-center text-lg text-gray-500">
              {showNoInviteeMsg ? "No Invitee from this City for the selected event" : "Please select an City!"}{" "}
            </p>
          </div>
        </div>
      )}
    </div>
  ));
  return (
    <>
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Invitees")) && <div onClick={() => navigate(INVITEES)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
        <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
        <span> Back to Invitees list</span>
      </div>}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Invitees</h3>

        <div className="mt-5 grid grid-cols-6 xl:grid-cols-12 gap-8">
          {/* <div className="col-span-3">
            <Dropdown
              isRequired
              withoutTitle
              options={allEvents}
              placeholder="Select Event Type"
              value={selectedEventItem}
              onChange={(e) => {
                setSelectedEventItem(e);
                getInviteesListToPrint(e, isChecked, selectedCityItem);
              }}
            />
          </div> */}
          <div className="col-span-3">
            <Dropdown
              isRequired
              withoutTitle
              options={allCities}
              placeholder="Select City"
              value={selectedCityItem}
              onChange={(e) => {
                setSelectedCityItem(e);
                getInviteesListToPrint(selectedEventItem, isChecked, e);
              }}
            />
          </div>
          <div className="col-span-4 flex items-center gap-x-12">
            <h3 className="text-base font-medium">Include:</h3>
            <div className="flex items-center gap-x-2 pl-2">
              <input
                onChange={handleCheckboxChangeGroup}
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
            <div className="flex items-center gap-x-2 pl-2">
              <input
                onChange={handleCheckboxChangeAdress}
                type="checkbox"
                id="addressCheckbox"
                name="addressCheckbox"
                className="rounded"
                checked={isCheckedAddress}
              />
              <label htmlFor="addressCheckbox" className="label">
                Address
              </label>
            </div>
          </div>
        </div>

        <div className="mt-5 h-[52vh] overflow-y-auto overflow-x-hidden">
          <div className="-mx-6 mb-8 overflow-x-auto">
            <PrintableContactList ref={componentRef} allInviteesList={allInviteesList} loading={loading} />
          </div>
        </div>

        {selectedEventItem !== null && (
          <div className="mt-4 flex items-center justify-end">
            <Button icon={<PrinterIcon />} title={commonT('buttons.print')} type="button" onClick={handlePrint} />
          </div>
        )}
      </div>
    </>
  );
};

export default InviteesPrint;

const TABLE_HEAD_INVITEES = [" Name", "City", "Phone Number", "RSVP Status"];

const TABLE_HEAD_INVITEES_BY_ADDRESS = [" Name", "City", "Phone Number","RSVP Status", "Adress"];
