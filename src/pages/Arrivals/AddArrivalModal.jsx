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

  const [car, setCar] = useState(null);
  const [carAllocationType, setCarAllocationType] = useState(null);
  const [allocateFromDate, setAllocateFromDate] = useState("");
  const [allocateToDate, setAllocateToDate] = useState("");

  const [serverError, setServerError] = useState("");
  const [openQuickImport, setOpenQuickImport] = useState(false);

  /* ================= VALIDATION ================= */
  const isValidForm = () => {
    if (
      !guest ||
      !arrivalDateAndTime ||
      !arrivingFrom ||
      !arrivingAt ||
      !arrivalFlightTrainNo ||
      !numberOfPeople
    ) {
      return false;
    }
    return true;
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
    }
  }, [data]);

  useEffect(() => {
    if (isOpen) {
      getContacts();
      getCarListing();
    }
  }, [isOpen]);

  /* ================= RENDER ================= */
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/25" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
              {/* HEADER */}
              <div className="flex items-center justify-between border-b p-6">
                <Dialog.Title className="text-lg font-semibold">
                  {data ? t("arrival.updateArrival") : t("arrival.addArrival")}
                </Dialog.Title>
                <div className="flex gap-3">
                  <Button
                    title="Quick Import"
                    type="button"
                    onClick={() => setOpenQuickImport(true)}
                  />
                  <XMarkIcon
                    className="h-6 w-6 cursor-pointer"
                    onClick={closeModal}
                  />
                </div>
              </div>
              {/* BODY */}
              <div className="flex-1 overflow-y-auto p-6">
                <form className="grid grid-cols-2 gap-6">
                  <Dropdown
                    title={t("arrival.guestName")}
                    options={allContact}
                    value={guest}
                    onChange={setGuest}
                  />
                  <Input
                    type="datetime-local"
                    label={t("arrival.arrivalDateTime")}
                    value={arrivalDateAndTime}
                    onChange={(e) => setArrivalDateAndTime(e.target.value)}
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
                  />
                  <Dropdown
                    title="Car Allocation Type"
                    options={[
                      { label: "Pick Up", value: "pick_up" },
                      { label: "Drop Off", value: "drop_off" },
                    ]}
                    value={carAllocationType}
                    onChange={setCarAllocationType}
                  />
                  <Input
                    type="datetime-local"
                    label={t("arrival.fromDate")}
                    value={allocateFromDate}
                    onChange={(e) => setAllocateFromDate(e.target.value)}
                  />
                  <Input
                    type="datetime-local"
                    label={t("arrival.toDate")}
                    value={allocateToDate}
                    onChange={(e) => setAllocateToDate(e.target.value)}
                  />
                  <div className="col-span-2">
                    <Input
                      textarea
                      label={t("headings.notes")}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasArrived}
                      onChange={(e) => setHasArrived(e.target.checked)}
                    />
                    <label>{t("arrival.hasArrived")}</label>
                  </div>
                  {serverError && (
                    <p className="col-span-2 text-sm text-red-500">
                      {serverError}
                    </p>
                  )}
                </form>
              </div>
              {/* FOOTER */}
              <div className="flex justify-center gap-6 border-t p-6">
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
      />
    </>
  );
};

export default AddArrivalModal;
