import Input from "./common/Input";
import Button from "./common/Button";
import Dropdown from "./common/Dropdown";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon, EnvelopeIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import ApiServices from "../api/services";
import React, { Fragment, useEffect, useState } from "react";
import { useThemeContext } from "../context/GlobalContext";

// const statusOption = [
//   { label: "Pending", value: "pending" },
//   { label: "Done", value: "done" },
//   { label: "Not Connected", value: "not_connected" },
//   { label: "Not Needed", value: "not_needed" },

// ];
export default function RsvpModal({ label, isOpen, setIsOpen, handleSubmit, allocateData, eventId, onSuccess, refresh }) {
  const { eventSelect, btnLoading, setBtnLoading, openSuccessModal, closeSuccessModel } = useThemeContext();

  const [totalInvitee, setTotalInvitee] = useState(0);
  const [yesValue, setYesValue] = useState(0);
  const [noValue, setNoValue] = useState(0);
  const [mayAttend, setMayAttend] = useState(0);
  const [pending, setPending] = useState(0);
  // const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(false);
  const [error, setError] = useState("");

  const eventIdValue = eventId.value;

  useEffect(() => {
    if (allocateData) {
      const filteredInvitees = allocateData.invitees.filter((invitee) => invitee.event_id === eventIdValue);

      if (allocateData.invitees.length > 0) {
        const totalInvited = allocateData.invitees.reduce((acc, curr) => acc + curr.total_invited, 0);
        const rsvpYes = allocateData.invitees.reduce((acc, curr) => acc + curr.rsvp_yes, 0);
        const rsvpNo = allocateData.invitees.reduce((acc, curr) => acc + curr.rsvp_no, 0);
        const rsvpMayAttend = allocateData.invitees.reduce((acc, curr) => acc + curr.rsvp_may_attend, 0);
        const rsvpPending = allocateData.invitees.reduce((acc, curr) => acc + curr.rsvp_pending, 0);
        const rsvpStatus = allocateData.invitees.reduce((acc, curr) => acc + curr.rsvp_status, 0);


        setTotalInvitee(totalInvited);
        setYesValue(rsvpYes);
        setNoValue(rsvpNo);
        setMayAttend(rsvpMayAttend);
        setPending(rsvpPending);
        setStatus(rsvpStatus)
      } else {
        setTotalInvitee(0);
        setYesValue(0);
        setNoValue(0);
        setMayAttend(0);
        setPending(0);
      }
    }
  }, [allocateData, eventIdValue, isOpen]);

  // Close Modal
  function closeModal() {
    setIsOpen(false);
    setError("");
    setTotalInvitee("");
    setYesValue("");
    setNoValue("");
    setMayAttend("");
    setPending("");
  }

  // const getEventStatsById = async () => {
  //   try {
  //     const payload = {};
  //     const response = await ApiServices?.events?.getEventStatsById(eventId.value, payload);
  //

  //     if (response.data.code === 200) {
  //       // Update selectedEventDetails with the response data
  //       // selectedEventDetails = { ...selectedEventDetails, ...response.data.data };
  //       setStatsCount(response.data.data);
  //     } else {
  //       // setLoading(false);
  //     }
  //   } catch (err) {
  //
  //   }
  // };

  const handleSaveRsvp = () => {
    const parsedYesValue = parseInt(yesValue, 10);
    const parsedNoValue = parseInt(noValue, 10);
    const parsedMayAttend = parseInt(mayAttend, 10);

    // Calculate the total RSVP count including yes, no, and may attend responses
    const totalRsvpCount = parsedYesValue + parsedNoValue + parsedMayAttend;

    // Calculate the new "pending" value. It should be the totalInvitee minus the total RSVPs.
    // If the result is negative or zero, the pending value should be 0.
    const newPending = Math.max(totalInvitee - totalRsvpCount, 0);

    // Update the validation to check against total invitees instead
    if (totalRsvpCount > totalInvitee) {
      setError("The sum of Yes, No, and May Attend responses cannot exceed the total number of invitees.");
      return;
    }

    // Update the pending state to reflect the new calculation
    setPending(newPending);
    setError("");

    // Prepare the payload for the API call
    const payload = {
      user_id: allocateData?.uuid,
      event_id: eventSelect,
      rsvp_may_attend: parsedMayAttend,
      rsvp_no: parsedNoValue,
      rsvp_yes: parsedYesValue,
      rsvp_pending: newPending,
      rsvp_status: status
      // Updated to use the new calculated pending value
    };

    // Mark the RSVP as loading
    setBtnLoading(true);

    // Make the API call
    ApiServices.rsvp
      .markRsvp(payload)
      .then((res) => {
        const { data, message } = res;

        // On successful API response
        if (data.code === 200) {
          closeModal();
          setBtnLoading(false);
          refresh();
          openSuccessModal({
            title: "Success!",
            message: "RSVP Added Successfully!!",
            onClickDone: (close) => {
              closeSuccessModel();
              onSuccess();
            },
          });
        }
      })
      .catch((err) => {
        setBtnLoading(false);
      });
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-75"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-75"
              >
                <Dialog.Panel className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-4 align-middle shadow-xl transition-all xl:max-w-4xl xl:p-6 3xl:max-w-5xl 3xl:p-8">
                  <div className="flex items-center gap-x-4 rounded-10 border bg-blue-700 p-4 font-poppins text-20 font-semibold leading-7 text-white">
                    <EnvelopeIcon className="h-10 w-10 text-white" />
                    <h3>
                      Mark RSVP: {allocateData?.first_name} {allocateData?.middle_name} {allocateData?.last_name}
                    </h3>
                  </div>

                  {/* Contact */}
                  <div className="mt-8 grid grid-cols-2 divide-x divide-gray-700 rounded-lg border-2 border-gray-400 text-left">
                    <div className="space-y-1 p-4">
                      <h2 className="font-medium">Contact Numbers</h2>
                      <p>Mobile: {allocateData?.contact_numbers?.map((item) => item.contact_number) || "-"}</p>
                    </div>
                    <div className="p-4">
                      <h2 className="font-medium">
                        <h2 className="font-medium">Family</h2>
                        <p>Name: {allocateData?.family?.name || "-"}</p>
                      </h2>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="relative mt-8">
                    <div className="rounded-tl-lg rounded-tr-lg border-l-2 border-r-2 border-t-2 border-gray-400 px-4 py-6">
                      <h2 className="font-medium text-purple-500">
                        Mark {allocateData?.first_name} {allocateData?.last_name} RSVP status for the events:
                      </h2>
                    </div>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          {/* <th className="px-2 py-2 border-2 border-gray-400">Event</th> */}
                          <th className="border-2 border-gray-400 px-2 py-2">Total Invitee</th>
                          <th className="border-2 border-gray-400 px-2 py-2">Yes</th>
                          <th className="border-2 border-gray-400 px-2 py-2">No</th>
                          <th className="border-2 border-gray-400 px-2">May Attend</th>
                          <th className="border-2 border-gray-400 px-2">Pending</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {/* <td className="px-2 py-2 w-40 border-2 border-gray-400">{eventId?.label}</td> */}
                          <td className="w-32 border-2 border-gray-400 px-2 py-2">
                            <Input type="number" min labelOnTop value={totalInvitee} onChange={(e) => setTotalInvitee(e.target.value)} disabled />
                          </td>
                          <td className="w-32 border-2 border-gray-400 px-2 pb-3 pt-2">
                            <Input type="number" min labelOnTop value={yesValue} onChange={(e) => setYesValue(e.target.value)} />
                          </td>
                          <td className="w-32 border border-gray-400 px-2 pb-3 pt-2">
                            <Input type="number" min labelOnTop value={noValue} onChange={(e) => setNoValue(e.target.value)} />
                          </td>
                          <td className="w-32 border-2 border-gray-400 px-4 py-2">
                            <Input type="number" min labelOnTop value={mayAttend} onChange={(e) => setMayAttend(e.target.value)} />
                          </td>
                          <td className="w-32 border-2 border-gray-400 px-4 py-2">
                            <Input type="number" min labelOnTop value={pending} onChange={(e) => setPending(e.target.value)} disabled />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* dropdown */}
                  {/* <div className="mt-8 grid grid-cols-2 divide-x divide-gray-700 rounded-lg border-2 border-gray-400 text-left"> */}
                    <div className="space-y-1 p-4 flex items-center gap-x-3">
                    <input
                        type="checkbox"
                        checked={status}
                        onChange={() => setStatus(!status)}
                        className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                      />
                      <h2 className="font-medium">Invitation Call</h2>
                    </div>
                    <div className="p-4">
                      {/* <Dropdown
                        withoutTitle
                        value={status}
                        options={statusOption}
                        onChange={(e) => {
                          setStatus(e);
                        }}
                      /> */}

                   
                    </div>
                  {/* </div> */}

                  {error && <div className="p-2 text-center text-red-500">{error}</div>}

                  {/* buttons */}
                  <div className="mt-12 flex justify-end gap-x-6 px-8">
                    <Button loading={btnLoading} title="Save" icon={<CheckIcon />} onClick={handleSaveRsvp} />
                    <Button title="Cancel" icon={<XMarkIcon />} buttonColor="border-red-500 bg-red-500" onClick={closeModal} />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
