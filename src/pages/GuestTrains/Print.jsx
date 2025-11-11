import Lottie from "react-lottie";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { GUEST_TRAINS } from "../../routes/Names";
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

const GuestTrainsPrint = () => {
  const { t } = useTranslation("common");

  const TABLE_HEAD_GUEST_TRAINS = [
    t("guestTrain.guestName"),
    t("guestTrain.departureDate"),
    t("guestTrain.departureTime"),
    t("guestTrain.arrivalDate"),
    t("guestTrain.arrivalTime"),
    t("guestTrain.departureFrom"),
    t("guestTrain.arrivingAt"),
    t("guestTrain.trainNo"),
    t("guestTrain.bookingPNR"),
  ];

  // Navigations
  const navigate = useNavigate();

  const { eventSelect, allEvents, userData } = useThemeContext();

  // Ref
  const componentRef = useRef();

  // Use States
  // Departure date filters
  const [departureStartDate, setDepartureStartDate] = useState(null);
  const [departureEndDate, setDepartureEndDate] = useState(null);
  const [departureStartDateError, setDepartureStartDateError] = useState("");
  const [departureEndDateError, setDepartureEndDateError] = useState("");

  // Arrival date filters
  const [arrivalStartDate, setArrivalStartDate] = useState(null);
  const [arrivalEndDate, setArrivalEndDate] = useState(null);
  const [arrivalStartDateError, setArrivalStartDateError] = useState("");
  const [arrivalEndDateError, setArrivalEndDateError] = useState("");

  const [loading, setLoading] = useState(false);
  const [allCities, setAllCities] = useState([]);
  const [updatedReport, setUpdatedReport] = useState(true);
  const [allGuestTrainsList, setAllGuestTrainsList] = useState([]);
  const [selectedCityItem, setSelectedCityItem] = useState(null);
  const [selectedCityItemError, setSelectedCityItemError] = useState("");

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // Validation
  const isValidForm = () => {
    let isValidData = true;

    // Validate departure dates if either one is filled
    if ((departureStartDate && !departureEndDate) || (!departureStartDate && departureEndDate)) {
      if (!departureStartDate) {
        setDepartureStartDateError("Required");
        isValidData = false;
      }
      if (!departureEndDate) {
        setDepartureEndDateError("Required");
        isValidData = false;
      }
    }

    // Validate arrival dates if either one is filled
    if ((arrivalStartDate && !arrivalEndDate) || (!arrivalStartDate && arrivalEndDate)) {
      if (!arrivalStartDate) {
        setArrivalStartDateError("Required");
        isValidData = false;
      }
      if (!arrivalEndDate) {
        setArrivalEndDateError("Required");
        isValidData = false;
      }
    }
    return isValidData;
  };

  // get guest trains list to print
  const getGuestTrainsListToPrint = async () => {
    try {
      let payload;
      if (updatedReport) {
        payload = {
          type: "Train",
          city: selectedCityItem ? selectedCityItem?.value : null,
          event_id: eventSelect,
        };

        // Add departure date filters if both are set
        if (departureStartDate && departureEndDate) {
          payload.departure_start_date = toUTCUnixTimestamp(departureStartDate);
          payload.departure_end_date = toUTCUnixTimestamp(departureEndDate);
        }

        // Add arrival date filters if both are set
        if (arrivalStartDate && arrivalEndDate) {
          payload.arrival_start_date = toUTCUnixTimestamp(arrivalStartDate);
          payload.arrival_end_date = toUTCUnixTimestamp(arrivalEndDate);
        }
      } else {
        payload = {
          type: "Train",
          event_id: eventSelect,
        };
      }

      setLoading(true);
      const result = await ApiServices.guestTrain.getGuestTrainReport(payload);
      if (result.data.code === 200) {
        setAllGuestTrainsList(result?.data?.data?.data || result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching guest trains report data:", error);
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
      console.error("Error fetching city list:", err);
    }
  };

  // Filter
  const handleFilter = (e) => {
    e.preventDefault();
    if (isValidForm()) {
      getGuestTrainsListToPrint();
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setDepartureStartDate(null);
    setDepartureEndDate(null);
    setArrivalStartDate(null);
    setArrivalEndDate(null);
    setSelectedCityItem(null);
    setDepartureStartDateError("");
    setDepartureEndDateError("");
    setArrivalStartDateError("");
    setArrivalEndDateError("");
    setSelectedCityItemError("");
    
    // Set updatedReport to false to get all data without filters
    setUpdatedReport(false);
    
    // Refresh the data after clearing filters
    getGuestTrainsListToPrint();
    
    // Reset updatedReport back to true for future filter operations
    setTimeout(() => {
      setUpdatedReport(true);
    }, 100);
  };

  // useEffects
  useEffect(() => {
    getCityList();
  }, []);

  useEffect(() => {
    getGuestTrainsListToPrint();
  }, []);

  const PrintableGuestTrainsList = React.forwardRef(({ allGuestTrainsList, loading }, ref) => (
    <div ref={ref} className="printableGuestTrainsList pr-2">
      <table className="w-full text-left">
        <thead>
          <tr>
            {TABLE_HEAD_GUEST_TRAINS.map((head) => (
              <th className="border-b border-gray-100 bg-white p-4 first:pl-6" key={head}>
                <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9">
                <Skeleton count={5} height={50} />
              </td>
            </tr>
          ) : allGuestTrainsList && allGuestTrainsList.length > 0 ? (
            allGuestTrainsList.map((item, index) => (
              <tr key={item?.id}>
                <td className="py-3 pl-6 pr-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{`${item?.user?.first_name} ${item?.user?.last_name}`}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {getLocalDateFromUnixTimestamp(item?.departure_datetime, "DD MMM, YYYY")}
                  </p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {getLocalDateFromUnixTimestamp(item?.departure_datetime, "HH:mm A")}
                  </p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {getLocalDateFromUnixTimestamp(item?.arrival_datetime, "DD MMM, YYYY")}
                  </p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {getLocalDateFromUnixTimestamp(item?.arrival_datetime, "HH:mm A")}
                  </p>
                </td>
                <td className="py-3 pl-6 pr-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.departure_from || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.arrival_at || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.flight_train_no || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.booking_png || "-"}</p>
                </td>
              </tr>
            ))
          ) : (
            <tr className="h-[400px]">
              <td colSpan="9">
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
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("GuestTrains")) && (
        <div onClick={() => navigate(GUEST_TRAINS)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
          <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
          <span>Back to Guest Trains list</span>
        </div>
      )}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Guest Trains</h3>
        <div className="grid grid-cols-12 gap-x-5">
          <div className="mb-4 col-span-6 2xl:col-span-3">
            <h4 className="mb-2 text-base font-semibold text-gray-700">{t("guestTrain.departureDate")}</h4>
            <div className="grid grid-cols-12 gap-4 xl:grid-cols-12">
              <div className="col-span-6">
                <Input
                  type="date"
                  error={departureStartDateError}
                  placeholder="Select Departure Start Date"
                  value={departureStartDate}
                  onChange={(e) => {
                    setDepartureStartDate(e.target.value);
                    setDepartureStartDateError("");
                  }}
                  label={t("guestTrain.startDate")}
                />
              </div>
              <div className="col-span-6">
                <Input
                  type="date"
                  error={departureEndDateError}
                  placeholder="Select Departure End Date"
                  value={departureEndDate}
                  onChange={(e) => {
                    setDepartureEndDate(e.target.value);
                    setDepartureEndDateError("");
                  }}
                  label={t("guestTrain.endDate")}
                />
              </div>
            </div>
          </div>

          <div className="mb-4 col-span-6 2xl:col-span-3">
            <h4 className="mb-2 text-base font-semibold text-gray-700">{t("guestTrain.arrivalDate")}</h4>
            <div className="grid grid-cols-12 gap-4 xl:grid-cols-12">
              <div className="col-span-6">
                <Input
                  type="date"
                  error={arrivalStartDateError}
                  placeholder="Select Arrival Start Date"
                  value={arrivalStartDate}
                  onChange={(e) => {
                    setArrivalStartDate(e.target.value);
                    setArrivalStartDateError("");
                  }}
                  label={t("guestTrain.startDate")}
                />
              </div>
              <div className="col-span-6">
                <Input
                  type="date"
                  error={arrivalEndDateError}
                  placeholder="Select Arrival End Date"
                  value={arrivalEndDate}
                  onChange={(e) => {
                    setArrivalEndDate(e.target.value);
                    setArrivalEndDateError("");
                  }}
                  label={t("guestTrain.endDate")}
                />
              </div>
            </div>
          </div>

          <div className="mb-6 mt-8 col-span-8 2xl:col-span-6">
            <div className="grid grid-cols-12 gap-4 xl:grid-cols-12">
              <div className="col-span-4">
                <Dropdown
                  withError={selectedCityItemError}
                  options={allCities}
                  placeholder="Select City"
                  value={selectedCityItem}
                  onChange={(e) => {
                    setSelectedCityItem(e);
                    setSelectedCityItemError("");
                  }}
                  title={t("guestTrain.city")}
                />
              </div>
              <div className="col-span-8 flex items-end gap-4">
                <Button title={t("guestTrain.updateReport")} onClick={handleFilter} />
                <Button 
                  title={t("buttons.clearFilters") || "Clear Filters"} 
                  onClick={clearFilters} 
                  variant="outline"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 h-[48vh] overflow-y-auto overflow-x-hidden">
          <div className="-mx-6 mb-8 overflow-x-auto">
            <PrintableGuestTrainsList ref={componentRef} allGuestTrainsList={allGuestTrainsList} loading={loading} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button icon={<PrinterIcon />} title={t("buttons.print")} type="button" onClick={handlePrint} />
        </div>
      </div>
    </>
  );
};

export default GuestTrainsPrint;