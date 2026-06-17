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

const AddArrivalModal = ({
  isOpen,
  setIsOpen,
  data,
  refreshData,
  setModalData,
}) => {
  const { t } = useTranslation("common");

  /* ================= CONTEXT ================= */
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

  /* ================= STATE ================= */
  const [guest, setGuest] = useState(null);
  const [arrivalDateAndTime, setArrivalDateAndTime] = useState("");
  const [arrivingFrom, setArrivingFrom] = useState("");
  const [arrivingAt, setArrivingAt] = useState("");
  const [arrivalFlightTrainNo, setArrivalFlightTrainNo] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [notes, setNotes] = useState("");
  const [hasArrived, setHasArrived] = useState(false);
  // arrivalDateAndTime,arrivingFrom,arrivingAt,arrivalFlightTrainNo
  
  const [car, setCar] = useState(null);
  const [carAllocationType, setCarAllocationType] = useState(null);
  const [allocateFromDate, setAllocateFromDate] = useState("");
  const [allocateToDate, setAllocateToDate] = useState("");

  const [serverError, setServerError] = useState("");
  const [openQuickImport, setOpenQuickImport] = useState(false);
  const [arrivalDateError, setArrivalDateError] = useState("");
  const [allocateFromError, setAllocateFromError] = useState("");
  const [allocateToError, setAllocateToError] = useState("");

  const pickUpOption = { label: "Pick Up", value: "pick_up" };
  const weddingWindowStart = eventDetail?.start_date ? moment.unix(eventDetail.start_date).subtract(72, "hours") : null;
  const weddingWindowEnd = eventDetail?.end_date ? moment.unix(eventDetail.end_date).add(72, "hours") : null;
  const weddingWindowStartValue = weddingWindowStart ? weddingWindowStart.format("YYYY-MM-DDTHH:mm") : "";
  const weddingWindowEndValue = weddingWindowEnd ? weddingWindowEnd.format("YYYY-MM-DDTHH:mm") : "";

  const isWithinWeddingWindow = (value) => {
    if (!value || !weddingWindowStart || !weddingWindowEnd) return true;
    const current = moment(value);
    return current.isBetween(weddingWindowStart, weddingWindowEnd, undefined, "[]");
  };

  /* ================= VALIDATION ================= */
  const isValidForm = () => {
    let isValid = true;

    if (
      !guest ||
      !arrivalDateAndTime ||
      !arrivingFrom ||
      !arrivingAt ||
      !arrivalFlightTrainNo ||
      !numberOfPeople
    ) {
      isValid = false;
    }

    if (!isWithinWeddingWindow(arrivalDateAndTime)) {
      setArrivalDateError(" Must be within 72 hours before wedding start and 72 hours after wedding end");
      isValid = false;
    } else {
      setArrivalDateError("");
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

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidForm()) return;

    try {
      setBtnLoading(true);

      const payload = {
        event_id: eventSelect,
        user_id: guest?.value,
        date: toUTCUnixTimestamp(arrivalDateAndTime),
        from: arrivingFrom,
        to: arrivingAt,
        no_of_person: numberOfPeople,
        fligh_train_no: arrivalFlightTrainNo,
        notes,
        status: hasArrived,
        type: "arrival",
        car_id: car?.value,
        car_allocation_type: carAllocationType?.value,
        ...(allocateFromDate &&
          allocateToDate && {
            car_from: toUTCUnixTimestamp(allocateFromDate),
            car_to: toUTCUnixTimestamp(allocateToDate),
          }),
      };

      const response = data
        ? await ApiServices.arrivalDeparture.updateArrivalDeparture(
            data.id,
            payload
          )
        : await ApiServices.arrivalDeparture.addArrivalDeparture(payload);

      if (response?.data?.code === 200) {
        closeModal();
        refreshData();
        openSuccessModal({
          title: t("message.success"),
          message: data
            ? t("arrival.arrivalUpdatedSucess")
            : t("arrival.arrivalAddedSuccess"),
          onClickDone: closeSuccessModel,
        });
      }
    } catch (err) {
      setServerError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBtnLoading(false);
    }
  };

  /* ================= CLOSE ================= */
  const closeModal = () => {
    if (openQuickImport) return;
    setIsOpen(false);
    setModalData(null);
    setServerError("");
  };

  /* ================= EDIT DATA ================= */
  useEffect(() => {
    if (data) {
      setGuest({
        label: `${data?.contact?.first_name} ${data?.contact?.last_name}`,
        value: data?.contact?.uuid,
      });
      setArrivingFrom(data.from);
      setArrivingAt(data.to);
      setNumberOfPeople(data.no_of_person);
      setArrivalDateAndTime(moment.unix(data.date).format("YYYY-MM-DDTHH:mm"));
      setArrivalFlightTrainNo(data.fligh_train_no);
      setNotes(data.notes || "");
      setHasArrived(data.status === 1);
      setCar(
        data?.car
          ? { label: data.car.make_and_model, value: data.car.id }
          : null
      );
      setCarAllocationType(
        data?.car_allocation_type
          ? {
              label:
                data.car_allocation_type === "pick_up"
                  ? "Pick Up"
                  : "Drop Off",
              value: data.car_allocation_type,
            }
          : null
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
      setArrivalDateError("");
      setAllocateFromError("");
      setAllocateToError("");
      if (!data) {
        setCarAllocationType(pickUpOption);
      }
    }
  }, [isOpen, data]);

  const handleChildData = (form, to, deparaturedate,fligh_train_no) => {
    setArrivingFrom(form);
    setArrivingAt(to);
    setArrivalDateAndTime(moment(deparaturedate, "YYYY-MM-DD HH:mm").format("YYYY-MM-DDTHH:mm"));
    setArrivalFlightTrainNo(fligh_train_no);
  };

  /* ================= RENDER ================= */
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/25" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="flex max-h-[90vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
              {/* HEADER */}
              <div className="flex items-center justify-between border-b px-5 py-4">
                <Dialog.Title className="text-base font-semibold">
                  {data ? t("arrival.updateArrival") : t("arrival.addArrival")}
                </Dialog.Title>
                <div className="flex gap-3">
                  <Button
                    title="Quick Import"
                    type="button"
                    onClick={() => setOpenQuickImport(true)}
                    className="h-9 px-4 text-xs"
                  />
                  <XMarkIcon
                    className="h-5 w-5 cursor-pointer"
                    onClick={closeModal}
                  />
                </div>
              </div>
              {/* BODY */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <form className="grid grid-cols-2 gap-4 [&_.label]:text-xs [&_.label]:font-medium [&_.css-b62m3t-container]:text-sm [&_.css-13cymwt-control]:min-h-[36px] [&_.css-13cymwt-control]:text-sm [&_.css-13cymwt-control]:py-0 [&_.css-t3ipsp-control]:min-h-[36px] [&_.css-t3ipsp-control]:text-sm [&_.css-t3ipsp-control]:py-0 [&_.css-hlgwow]:min-h-[34px] [&_.css-hlgwow]:py-0 [&_.css-19bb58m]:my-0 [&_.css-1dimb5e-singleValue]:text-sm [&_.css-1dimb5e-singleValue]:leading-5 [&_.css-1jqq78o-placeholder]:text-sm [&_.css-1jqq78o-placeholder]:leading-5 [&_input]:h-9 [&_input]:text-sm [&_textarea]:text-sm">
                  <Dropdown
                    title={t("arrival.guestName")}
                    options={allContact}
                    value={guest}
                    onChange={setGuest}
                    controlMinHeight="36px"
                    compact
                  />
                  <Input
                    type="datetime-local"
                    label={t("arrival.arrivalDateTime")}
                    value={arrivalDateAndTime}
                    error={arrivalDateError}
                    min={weddingWindowStartValue}
                    max={weddingWindowEndValue}
                    onChange={(e) => {
                      setArrivalDateAndTime(e.target.value);
                      setArrivalDateError("");
                    }}
                  />
                  <Input
                    label={t("arrival.arrivingFrom")}
                    value={arrivingFrom}
                    onChange={(e) => setArrivingFrom(e.target.value)}
                  />
                  <Input
                    label={t("arrival.arrivingAt")}
                    value={arrivingAt}
                    onChange={(e) => setArrivingAt(e.target.value)}
                  />
                  <Input
                    label={t("arrival.flightTrainNo")}
                    value={arrivalFlightTrainNo}
                    onChange={(e) =>
                      setArrivalFlightTrainNo(e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    label={t("arrival.noOfPeople")}
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                  />
                  <Dropdown
                    title={t("arrival.car")}
                    options={allCars}
                    value={car}
                    onChange={setCar}
                    controlMinHeight="36px"
                    compact
                  />
                  <Dropdown
                    title="Car Allocation Type"
                    options={[pickUpOption]}
                    value={carAllocationType}
                    onChange={setCarAllocationType}
                    disabled
                    controlMinHeight="36px"
                    compact
                  />
                  <Input
                    type="datetime-local"
                    label={t("arrival.fromDate")}
                    value={allocateFromDate}
                    error={allocateFromError}
                    min={weddingWindowStartValue}
                    max={weddingWindowEndValue}
                    onChange={(e) => {
                      setAllocateFromDate(e.target.value);
                      setAllocateFromError("");
                      if (allocateToError === " To date must be after From date") {
                        setAllocateToError("");
                      }
                    }}
                  />
                  <Input
                    type="datetime-local"
                    label={t("arrival.toDate")}
                    value={allocateToDate}
                    error={allocateToError}
                    min={weddingWindowStartValue}
                    max={weddingWindowEndValue}
                    onChange={(e) => {
                      setAllocateToDate(e.target.value);
                      setAllocateToError("");
                      if (allocateFromError === " From date must be before To date") {
                        setAllocateFromError("");
                      }
                    }}
                  />
                  <div className="col-span-2">
                    <Input
                      textarea
                      label={t("headings.notes")}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      checked={hasArrived}
                      onChange={(e) => setHasArrived(e.target.checked)}
                      className="!h-4 !w-4 rounded border-gray-300 text-secondary-color focus:ring-secondary-color"
                    />
                    <label className="text-sm font-medium text-primary-color">
                      {t("arrival.hasArrived")}
                    </label>
                  </div>
                  {serverError && (
                    <p className="col-span-2 text-xs text-red-500">
                      {serverError}
                    </p>
                  )}
                </form>
              </div>
              {/* FOOTER */}
              <div className="flex justify-center gap-4 border-t px-5 py-4 [&_button]:h-10 [&_button]:text-sm">
                <Button
                  loading={btnLoading}
                  icon={<CheckIcon />}
                  title={
                    data
                      ? t("arrival.updateArrival")
                      : t("arrival.addArrival")
                  }
                  type="submit"
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
      {/* QUICK IMPORT MODAL */}
      <QuickImportArrivalModal
        openQuickImport={openQuickImport}
        setOpenQuickImport={setOpenQuickImport}
        refreshData={refreshData}
        onSend={handleChildData}
      />
    </>
  );
};

export default AddArrivalModal;
