import Lottie from "react-lottie";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { ARRIVALS } from "../../routes/Names";
import { useReactToPrint } from "react-to-print";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import React, { useEffect, useRef, useState } from "react";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { getLocalDateFromUnixTimestamp, toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import { useTranslation } from "react-i18next";

  const ArrivalPrint = () => {

    const { t } = useTranslation("common");

    const TABLE_HEAD_ARRIVALS = [
      t("arrival.guestName"),
      t("arrival.arrivalDate"),
      t("arrival.arrivalTime"),
      t("arrival.arrivingFrom"),
      t("arrival.arrivingAt"),
      t("Train / Flight No"),
      t("arrival.noOfPeople"),
      t("Allocated Car"),
      t("Allocation Type"),
      t("From Date Time"),
      t("To Date Time"),
    ];
    

    // Navigations
    const navigate = useNavigate();
    
    const { eventSelect , allEvents , userData } = useThemeContext();
  // Ref
  const componentRef = useRef();

  // Use States
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allCities, setAllCities] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDateError, setEndDateError] = useState("");
  const [updatedReport, setUpdatedReport] = useState(true);
  const [allArrivalList, setAllArrivalList] = useState([]);
  const [startDateError, setStartDateError] = useState("");
  const [selectedCityItem, setSelectedCityItem] = useState(null);
  const [selectedCityItemError, setSelectedCityItemError] = useState("");

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // Validation
  const isValidForm = () => {
    let isValidData = true;
    if (startDate === null) {
      setStartDateError(" Required");
      isValidData = false;
    }
    if (endDate === null) {
      setEndDateError(" Required");
      isValidData = false;
    }
    if (selectedCityItem === null) {
      setSelectedCityItemError(" Required");
      isValidData = false;
    }
    return isValidData;
  };

  // get ceremony list to print
  const getArrivalsListToPrintAll = async () => {
    try {
      let payload;
      if (updatedReport) {
        payload = {
          type: "arrival",
          point: selectedCityItem ? selectedCityItem?.value : null,
          start_date: startDate ? toUTCUnixTimestamp(startDate) : null,
          end_date: endDate ? toUTCUnixTimestamp(endDate) : null,
          event_id: eventSelect,
        };
      } else {
        payload = {
          type: "arrival",
          event_id: eventSelect,
        };
      }

      setLoading(true);
      const result = await ApiServices.arrivalDeparture.getArrivalDepartureReport(payload);
      if (result.data.code === 200) {
        setAllArrivalList(result?.data?.data);
        setLoading(false);
      }
       
    } catch (error) {
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

  // Filter
  const handleFilter = (e) => {
    e.preventDefault();
    // if (isValidForm()) {
      getArrivalsListToPrintAll();
    // }
  };

  // useEffects
  useEffect(() => {
    getCityList();
  }, []);

  useEffect(() => {
    getArrivalsListToPrintAll();
  }, []);

  const PrintableVenueList = React.forwardRef(({ allArrivalList, loading }, ref) => (
    <div ref={ref} className="printableVenueList pr-2">
      <table className="w-full text-left">
        <thead>
          <tr>
            {TABLE_HEAD_ARRIVALS.map((head) => (
              <th className="border-b border-gray-100 bg-white p-4 first:pl-6" key={head}>
                <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="11">
                <Skeleton count={5} height={50} />
              </td>
            </tr>
          ) : allArrivalList && allArrivalList.length > 0 ? (
            allArrivalList.map((item, index) => (
              <tr key={item?.id}>
                <td className="py-3 pl-6 pr-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {`${item?.contact?.first_name} ${item?.contact?.last_name}` || "-"}
                  </p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {getLocalDateFromUnixTimestamp(item?.date, "DD MMM, YYYY")}
                  </p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{getLocalDateFromUnixTimestamp(item?.date, "HH:mmA")}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.from || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.to || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.fligh_train_no || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.no_of_person || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.car?.make_and_model || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.car_allocation?.type || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {item?.car_allocation?.from ? getLocalDateFromUnixTimestamp(item?.car_allocation?.from, "DD MMM, YYYY HH:mmA") : "-"}
                  </p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {item?.car_allocation?.till ? getLocalDateFromUnixTimestamp(item?.car_allocation?.till, "DD MMM, YYYY HH:mmA") : "-"}
                  </p>
                </td>
              </tr>
            ))
          ) : (
            <tr className="h-[400px]">
              <td colSpan="11">
                <Lottie options={emptyFolderAnimation} width={200} height={200} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ));

  return (
    <>
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Arrivals")) && <div onClick={() => navigate(ARRIVALS)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
        <ArrowLeftIcon className="w-4 h-6 mr-2 text-secondary" />
        <span> Back to Arrivals list</span>
      </div>}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Arrivals</h3>
        <div className="mt-5 grid grid-cols-6 gap-8 xl:grid-cols-12">
          <div className="col-span-3">
            <Input
              // isRequired
              type="date"
              error={startDateError}
              placeholder="Select Start Date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setStartDateError("");
              }}
              label={t("arrival.startDate")}
            />
          </div>
          <div className="col-span-3">
            <Input
              // isRequired
              type="date"
              error={endDateError}
              placeholder="Select Start Date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setEndDateError("");
              }}
              label={t("arrival.endDate")}
            />
          </div>
          <div className="col-span-3 ">
            <Dropdown
              // isRequired
              withError={selectedCityItemError}
              options={allCities}
              placeholder="Select City"
              value={selectedCityItem}
              onChange={(e) => {
                setSelectedCityItem(e);
                setSelectedCityItemError("");
              }}
              title={t("arrival.city")}
            />
          </div>
          <div className="col-span-3 mt-8">
            <Button title={t("arrival.updateReport")} onClick={handleFilter} />
          </div>
        </div>

        <div className="mt-5 h-[54vh] overflow-y-auto overflow-x-hidden">
          <div className="-mx-6 mb-8 overflow-x-auto">
            <PrintableVenueList ref={componentRef} allArrivalList={allArrivalList} loading={loading} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button icon={<PrinterIcon />} title={t("buttons.print")} type="button" onClick={handlePrint} />
        </div>
      </div>
    </>
  );
};

export default ArrivalPrint;



