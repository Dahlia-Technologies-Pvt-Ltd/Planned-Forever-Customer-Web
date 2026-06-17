import React, { Fragment, useEffect, useState } from "react";
import moment from "moment";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import { useThemeContext } from "../../context/GlobalContext";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import QuickImportArrivalModal from "./QuickImportArrivalModal";

const AddDepartureModal = ({
  isOpen,
  setIsOpen,
  data,
  refreshData,
  setModalData,
}) => {
  const { t } = useTranslation("common");

  const {
    eventSelect,
    eventDetail,
    btnLoading,
    setBtnLoading,
    openSuccessModal,
    closeSuccessModel,
    allContact,
    allCars,
    getContacts,
    getCarListing,
  } = useThemeContext();

  const [guest, setGuest] = useState(null);
  const [departureDateAndTime, setDepartureDateAndTime] = useState("");
  const [departingFrom, setDepartingFrom] = useState("");
  const [departingTo, setDepartingTo] = useState("");
  const [departureFlightTrainNo, setDepartureFlightTrainNo] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [notes, setNotes] = useState("");
  const [hasDeparted, setHasDeparted] = useState(false);

  const [car, setCar] = useState(null);
  const [carAllocationType, setCarAllocationType] = useState(null);
  const [allocateFromDate, setAllocateFromDate] = useState("");
  const [allocateToDate, setAllocateToDate] = useState("");

  const [serverError, setServerError] = useState("");
  const [openQuickImport, setOpenQuickImport] = useState(false);
  const [departureDateError, setDepartureDateError] = useState("");
  const [allocateFromError, setAllocateFromError] = useState("");
  const [allocateToError, setAllocateToError] = useState("");

  const dropOffOption = { label: "Drop Off", value: "drop_off" };
  const weddingWindowStart = eventDetail?.start_date ? moment.unix(eventDetail.start_date).subtract(72, "hours") : null;
  const weddingWindowEnd = eventDetail?.end_date ? moment.unix(eventDetail.end_date).add(72, "hours") : null;
  const weddingWindowStartValue = weddingWindowStart ? weddingWindowStart.format("YYYY-MM-DDTHH:mm") : "";
  const weddingWindowEndValue = weddingWindowEnd ? weddingWindowEnd.format("YYYY-MM-DDTHH:mm") : "";

  const isWithinWeddingWindow = (value) => {
    if (!value || !weddingWindowStart || !weddingWindowEnd) return true;
    const current = moment(value);
    return current.isBetween(weddingWindowStart, weddingWindowEnd, undefined, "[]");
  };

  const isValidForm = () => {
    let isValid = true;

    if (
      !guest ||
      !departureDateAndTime ||
      !departingFrom ||
      !departingTo ||
      !departureFlightTrainNo ||
      !numberOfPeople
    ) {
      isValid = false;
    }

    if (!isWithinWeddingWindow(departureDateAndTime)) {
      setDepartureDateError(" Must be within 72 hours before wedding start and 72 hours after wedding end");
      isValid = false;
    } else {
      setDepartureDateError("");
    }

    if (allocateFromDate && !isWithinWeddingWindow(allocateFromDate)) {
      setAllocateFromError(" Must be within the wedding allocation window");
      isValid = false;
    } else {
      setAllocateFromError("");
    }

    if (allocateToDate && !isWithinWeddingWindow(allocateToDate)) {
      setAllocateToError(" Must be within the wedding allocation window");
      isValid = false;
    } else {
      setAllocateToError("");
    }

    if (allocateFromDate && allocateToDate && moment(allocateFromDate).isAfter(moment(allocateToDate))) {
      setAllocateFromError(" From date must be before To date");
      setAllocateToError(" To date must be after From date");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidForm()) return;

    try {
      setBtnLoading(true);

      const payload = {
        event_id: eventSelect,
        user_id: guest?.value,
        date: toUTCUnixTimestamp(departureDateAndTime),
        from: departingFrom,
        to: departingTo,
        no_of_person: numberOfPeople,
        fligh_train_no: departureFlightTrainNo,
        notes,
        status: hasDeparted,
        type: "departure",
        car_id: car?.value,
        car_allocation_type: carAllocationType?.value,
        ...(allocateFromDate &&
          allocateToDate && {
            car_from: toUTCUnixTimestamp(allocateFromDate),
            car_to: toUTCUnixTimestamp(allocateToDate),
          }),
      };

      const response = data
        ? await ApiServices.arrivalDeparture.updateArrivalDeparture(data.id, payload)
        : await ApiServices.arrivalDeparture.addArrivalDeparture(payload);

      if (response?.data?.code === 200) {
        closeModal();
        refreshData();
        openSuccessModal({
          title: t("message.success"),
          message: data ? t("departure.departureUpdatedSucess") : t("departure.departureAddedSuccess"),
          onClickDone: closeSuccessModel,
        });
      }
    } catch (err) {
      setServerError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBtnLoading(false);
    }
  };

  const closeModal = () => {
    if (openQuickImport) return;
    setIsOpen(false);
    setModalData(null);
    setServerError("");
  };

  useEffect(() => {
    if (data) {
      setGuest({
        label: `${data?.contact?.first_name} ${data?.contact?.last_name}`,
        value: data?.contact?.uuid,
      });
      setDepartingFrom(data.from);
      setDepartingTo(data.to);
      setNumberOfPeople(data.no_of_person);
      setDepartureDateAndTime(moment.unix(data.date).format("YYYY-MM-DDTHH:mm"));
      setDepartureFlightTrainNo(data.fligh_train_no);
      setNotes(data.notes || "");
      setHasDeparted(data.status === 1 || data.status === "1" || data.status === true);
      setCar(data?.car ? { label: data.car.make_and_model, value: data.car.id } : null);
      setCarAllocationType(
        data?.car_allocation_type
          ? {
              label: data.car_allocation_type === "pick_up" ? "Pick Up" : "Drop Off",
              value: data.car_allocation_type,
            }
          : dropOffOption,
      );
      setAllocateFromDate(data?.car_from ? moment.unix(data.car_from).format("YYYY-MM-DDTHH:mm") : "");
      setAllocateToDate(data?.car_to ? moment.unix(data.car_to).format("YYYY-MM-DDTHH:mm") : "");
    }
  }, [data]);

  useEffect(() => {
    if (isOpen) {
      getContacts();
      getCarListing();
      setServerError("");
      setDepartureDateError("");
      setAllocateFromError("");
      setAllocateToError("");
      if (!data) {
        setCarAllocationType(dropOffOption);
      }
    }
  }, [isOpen, data]);

  const handleChildData = (from, to, departureDate, flighTrainNo) => {
    setDepartingFrom(from);
    setDepartingTo(to);
    setDepartureDateAndTime(moment(departureDate, "YYYY-MM-DD HH:mm").format("YYYY-MM-DDTHH:mm"));
    setDepartureFlightTrainNo(flighTrainNo);
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/25" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="flex max-h-[90vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <Dialog.Title className="text-base font-semibold">
                  {data ? t("departure.updateDeparture") : t("departure.addDeparture")}
                </Dialog.Title>
                <div className="flex gap-3">
                  <Button
                    title="Quick Import"
                    type="button"
                    onClick={() => setOpenQuickImport(true)}
                    className="h-9 px-4 text-xs"
                  />
                  <XMarkIcon className="h-5 w-5 cursor-pointer" onClick={closeModal} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <form className="grid grid-cols-2 gap-4 [&_.label]:text-xs [&_.label]:font-medium [&_.css-b62m3t-container]:text-sm [&_.css-13cymwt-control]:min-h-[36px] [&_.css-13cymwt-control]:text-sm [&_.css-13cymwt-control]:py-0 [&_.css-t3ipsp-control]:min-h-[36px] [&_.css-t3ipsp-control]:text-sm [&_.css-t3ipsp-control]:py-0 [&_.css-hlgwow]:min-h-[34px] [&_.css-hlgwow]:py-0 [&_.css-19bb58m]:my-0 [&_.css-1dimb5e-singleValue]:text-sm [&_.css-1dimb5e-singleValue]:leading-5 [&_.css-1jqq78o-placeholder]:text-sm [&_.css-1jqq78o-placeholder]:leading-5 [&_input]:h-9 [&_input]:text-sm [&_textarea]:text-sm">
                  <Dropdown
                    title={t("departure.guestName")}
                    options={allContact}
                    value={guest}
                    onChange={setGuest}
                    controlMinHeight="36px"
                    compact
                  />
                  <Input
                    type="datetime-local"
                    label={t("departure.departureDateTime")}
                    value={departureDateAndTime}
                    error={departureDateError}
                    min={weddingWindowStartValue}
                    max={weddingWindowEndValue}
                    onChange={(e) => {
                      setDepartureDateAndTime(e.target.value);
                      setDepartureDateError("");
                    }}
                  />
                  <Input
                    label={t("departure.departingFrom")}
                    value={departingFrom}
                    onChange={(e) => setDepartingFrom(e.target.value)}
                  />
                  <Input
                    label={t("departure.departureAt")}
                    value={departingTo}
                    onChange={(e) => setDepartingTo(e.target.value)}
                  />
                  <Input
                    label={t("departure.flightTrainNo")}
                    value={departureFlightTrainNo}
                    onChange={(e) => setDepartureFlightTrainNo(e.target.value)}
                  />
                  <Input
                    type="number"
                    label={t("departure.noOfPeople")}
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                  />
                  <Dropdown
                    title={t("departure.car")}
                    options={allCars}
                    value={car}
                    onChange={setCar}
                    controlMinHeight="36px"
                    compact
                  />
                  <Dropdown
                    title="Car Allocation Type"
                    options={[dropOffOption]}
                    value={carAllocationType}
                    onChange={setCarAllocationType}
                    disabled
                    controlMinHeight="36px"
                    compact
                  />
                  <Input
                    type="datetime-local"
                    label={t("departure.fromDate")}
                    value={allocateFromDate}
                    error={allocateFromError}
                    min={weddingWindowStartValue}
                    max={weddingWindowEndValue}
                    onChange={(e) => {
                      setAllocateFromDate(e.target.value);
                      setAllocateFromError("");
                    }}
                    // disabled={!car}
                  />
                  <Input
                    type="datetime-local"
                    label={t("departure.toDate")}
                    value={allocateToDate}
                    error={allocateToError}
                    min={allocateFromDate || weddingWindowStartValue}
                    max={weddingWindowEndValue}
                    onChange={(e) => {
                      setAllocateToDate(e.target.value);
                      setAllocateToError("");
                    }}
                    // disabled={!car}
                  />

                  <div className="col-span-2">
                    <Input
                      label={t("headings.notes")}
                      textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hasDeparted"
                      name="hasDeparted"
                      checked={hasDeparted}
                      onChange={(e) => setHasDeparted(e.target.checked)}
                      className="!h-4 !w-4 rounded border-gray-300 text-secondary-color focus:ring-secondary-color"
                    />
                    <label htmlFor="hasDeparted" className="text-sm font-medium text-primary-color">
                      {t("departure.hasDeparted")}
                    </label>
                  </div>

                  {serverError && <span className="col-span-2 text-xs text-red-500">{serverError}</span>}
                </form>
              </div>

              <div className="flex justify-center gap-4 border-t px-5 py-4">
                <Button
                  loading={btnLoading}
                  icon={<CheckIcon />}
                  title={data ? t("departure.updateDeparture") : t("departure.addDeparture")}
                  type="button"
                  onClick={handleSubmit}
                />
                <Button
                  icon={<XMarkIcon />}
                  title={t("buttons.cancel")}
                  type="button"
                  buttonColor="bg-red-500"
                  onClick={closeModal}
                />
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>

      <QuickImportArrivalModal
        openQuickImport={openQuickImport}
        setOpenQuickImport={setOpenQuickImport}
        refreshData={refreshData}
        onSend={handleChildData}
      />
    </>
  );
};

export default AddDepartureModal;
