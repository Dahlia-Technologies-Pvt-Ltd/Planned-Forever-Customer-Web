import Spinner from "./Spinner";
import RsvpModal from "../RsvpModal";
import ApiServices from "../../api/services";
import React, { useEffect, useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import GiftAllocationModal from "../GiftAllocationModal";
import CardAllocationModal from "../CardAllocationModal";
import { useThemeContext } from "../../context/GlobalContext";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const Accordian = ({ data, rsvpModal, inviteeCheckbox, eventId, onSuccess, cardAllocate, setStatsCount }) => {
  //
  //
  const { t } = useTranslation("common");

  const { eventSelect, setBtnLoading, openSuccessModal, closeSuccessModel } = useThemeContext();

  // States
  const [openAllocateModal, setOpenAllocateModal] = useState({
    open: false,
    data: null,
  });

  const [openCardAllocateModal, setOpenCardAllocateModal] = useState({
    open: false,
    data: null,
  });

  const [openRsvpModal, setOpenRsvpModal] = useState({
    open: false,
    data: null,
    id: "",
  });

  const [openConfirmationModal, setOpenConfirmationModal] = useState({
    open: false,
    data: null,
  });

  // Get Event Stats by id
  const getEventStatsById = async () => {
    try {
      const payload = {};
      const response = await ApiServices?.events?.getEventStatsById(eventSelect, payload);

      if (response.data.code === 200) {
        // Update selectedEventDetails with the response data
        // selectedEventDetails = { ...selectedEventDetails, ...response.data.data };
        setStatsCount(response.data.data);
      } else {
        // setLoading(false);
      }
    } catch (err) {}
  };

  // Initialize child checkbox states based on matching event_id
  const initializeChildCheckboxStates = (data) => {
    return data?.map((item) => item?.members?.map((row) => row?.invitees?.some((invitee) => invitee?.event_id === eventId)));
  };

  // Checkbox state for parent checkboxes
  const [checkedStates, setCheckedStates] = useState(data?.map(() => false));

  // Checkbox state for child checkboxes (initialized as an array of empty arrays)
  const [childCheckedStates, setChildCheckedStates] = useState(initializeChildCheckboxStates(data));

  const initializeChildLoadingStates = (data) => {
    return data?.map((item) => Array(item?.members?.length).fill(false));
  };

  const [childLoadingStates, setChildLoadingStates] = useState(initializeChildLoadingStates(data));

  // Parent checkbox
  // const handleParentCheckboxChange = async (index) => {
  //   // Store previous child checkbox states before opening modal

  //   const updatedCheckedStates = [...checkedStates];
  //   updatedCheckedStates[index] = !updatedCheckedStates[index];

  //   setCheckedStates(updatedCheckedStates);

  //   // If the parent checkbox is checked, check all child checkboxes
  //   if (updatedCheckedStates[index]) {
  //     const updatedChildStates = [...childCheckedStates];
  //     updatedChildStates[index] = data[index].members?.map(() => true);
  //     setChildCheckedStates(updatedChildStates);

  //     // Log IDs of all child checkboxes
  //     const childIds = data[index].members.map((row) => row.uuid);
  //     //

  //     // Open the confirmation modal with previous child checkbox states
  //     setOpenConfirmationModal({
  //       open: true,
  //       data: childIds,
  //     });
  //   } else {
  //     // If the parent checkbox is unchecked, uncheck all child checkboxes
  //     const updatedChildStates = [...childCheckedStates];
  //     updatedChildStates[index] = data[index]?.members?.map(() => false);
  //     setChildCheckedStates(updatedChildStates);

  //     // If no checkbox is checked, send an empty payload
  //     const response = await ApiServices.invites.addInvitee({ event_id: eventId, user_id: [] });
  //

  //     if (response.data.code === 200) {
  //       setBtnLoading(false);
  //       setOpenConfirmationModal({ open: false, data: null });
  //       openSuccessModal({
  //         title: "Success!",
  //         message: "Invitee has been removed successfully",
  //         onClickDone: (close) => {
  //           closeSuccessModel();
  //         },
  //       });
  //     } else {
  //       alert("Not Removed");
  //       setBtnLoading(false);
  //     }
  //   }

  //     // Log all accordion checkbox states
  //
  // };

  // const handleParentCheckboxChange = async (index) => {
  //   try {
  //     const updatedCheckedStates = [...checkedStates];
  //     updatedCheckedStates[index] = !updatedCheckedStates[index];
  //     setCheckedStates(updatedCheckedStates);

  //     // If the parent checkbox is checked, check all child checkboxes
  //     if (updatedCheckedStates[index]) {
  //       const updatedChildStates = [...childCheckedStates];
  //       updatedChildStates[index] = data[index].members?.map(() => true);
  //       setChildCheckedStates(updatedChildStates);

  //       // Log IDs of all child checkboxes
  //       const childIds = data[index].members.map((row) => row.uuid);
  //

  //       // Open the confirmation modal with previous child checkbox states
  //       setOpenConfirmationModal({
  //         open: true,
  //         data: childIds,
  //       });
  //     }
  //     // here is the removing part
  //     else {
  //       // If the parent checkbox is unchecked, uncheck all child checkboxes
  //       const updatedChildStates = [...childCheckedStates];
  //       updatedChildStates[index] = data[index]?.members?.map(() => false);
  //       setChildCheckedStates(updatedChildStates);

  //       // Remove all child items associated with the unchecked parent
  //       const childUserIds = data[index].members.map((row) => row.uuid);

  //

  //       const payload = {
  //         event_id: eventId,
  //         user_id: childUserIds,
  //       };
  //
  //       const response = await ApiServices.invites.addInvitee(payload);
  //

  //       if (response.data.code === 200) {
  //         setBtnLoading(false);
  //         setOpenConfirmationModal({ open: false, data: null });
  //         openSuccessModal({
  //           title: "Success!",
  //           message: "Invitee has been removed successfully",
  //           onClickDone: (close) => {
  //             closeSuccessModel();
  //           },
  //         });
  //       } else {
  //         alert("Not Removed");
  //         setBtnLoading(false);
  //       }
  //     }

  //     // Log all accordion checkbox states
  //
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleParentCheckboxChange = async (index) => {
    try {
      const updatedCheckedStates = [...checkedStates];
      updatedCheckedStates[index] = !updatedCheckedStates[index];
      setCheckedStates(updatedCheckedStates);

      // If the parent checkbox is checked
      if (updatedCheckedStates[index]) {
        const updatedChildStates = [...childCheckedStates];
        updatedChildStates[index] = data[index]?.members?.map(() => true);
        setChildCheckedStates(updatedChildStates);

        // Log IDs of all child checkboxes for the checked parent
        const childIds = data[index]?.members?.map((row) => row.uuid);

        // Open the confirmation modal with previous child checkbox states
        // setOpenConfirmationModal({
        //   open: true,
        //   data: childIds,
        // });
      } else {
        // If the parent checkbox is unchecked
        const updatedChildStates = [...childCheckedStates];
        updatedChildStates[index] = data[index]?.members?.map(() => false); // Uncheck all child checkboxes associated with the unchecked parent
        setChildCheckedStates(updatedChildStates);

        const childIdsForCheckedParents = childCheckedStates
          .flatMap((states, idx) =>
            updatedCheckedStates[idx] ? states.map((isChecked, childIdx) => (isChecked ? data[idx].members[childIdx].uuid : null)) : [],
          )
          .filter((childId) => childId !== null);

        // Construct payload for removing child items associated with the unchecked parent
        const payload = {
          event_id: eventId,
          user_id: childIdsForCheckedParents,
        };

        const response = await ApiServices.invites.addInvitee(payload);

        if (response.data.code === 200) {
          setBtnLoading(false);
          onSuccess();
          getEventStatsById();
          setOpenConfirmationModal({ open: false, data: null });
          openSuccessModal({
            title: "Success!",
            message: "Invitee has been removed successfully",
            onClickDone: (close) => {
              onSuccess();
              closeSuccessModel();
              getEventStatsById();
            },
          });
        } else {
          alert("Not Removed");
          setBtnLoading(false);
        }
      }

      // Log all parent checkbox states
    } catch (err) {
      console.error(err);
    }
  };

  // Child checkbox
  // const handleChildCheckboxChange = async (parentIndex, childIndex, rowId) => {
  //   try {
  //     const updatedChildStates = [...childCheckedStates];
  //     updatedChildStates[parentIndex][childIndex] = !updatedChildStates[parentIndex][childIndex];
  //     setChildCheckedStates(updatedChildStates);

  //     // Construct the array of user_ids based on matching event_id
  //     const selectedUserIds = updatedChildStates[parentIndex]
  //       .map((isChecked, index) => (isChecked ? data[parentIndex].members[index].uuid : null))
  //       .filter((id) => id !== null);

  //     // Set loading state to true only for the clicked checkbox
  //     setChildLoadingStates((prev) => {
  //       const newState = [...prev];
  //       newState[parentIndex][childIndex] = true;
  //       return newState;
  //     });

  //     if (!updatedChildStates[parentIndex][childIndex]) {
  //       // If the checkbox is unchecked, remove its user ID from selectedUserIds
  //       const remainingUserIds = selectedUserIds.filter((id) => id !== data[parentIndex].members[childIndex].uuid);
  //       const payload = {
  //         event_id: eventId,
  //         user_id: remainingUserIds,
  //       };
  //       // If the checkbox is unchecked, send an empty payload
  //       const response = await ApiServices.invites.addInvitee(payload);
  //

  //       if (response.data.code === 200) {
  //         setChildLoadingStates((prev) => {
  //           const newState = [...prev];
  //           newState[parentIndex][childIndex] = false;
  //           return newState;
  //         });
  //         onSuccess();
  //       } else {
  //         alert("Not Removed");
  //       }
  //     } else {
  //       const payload = {
  //         event_id: eventId,
  //         user_id: selectedUserIds,
  //       };
  //       // If the checkbox is checked, send the payload with user_ids
  //       const response = await ApiServices.invites.addInvitee(payload);
  //

  //       if (response.data.code === 200) {
  //         setChildLoadingStates((prev) => {
  //           const newState = [...prev];
  //           newState[parentIndex][childIndex] = false;
  //           return newState;
  //         });
  //         onSuccess();
  //       } else {
  //         alert("Not Added");
  //       }
  //     }

  //     // Check if all child checkboxes are checked
  //     const allChildChecked = updatedChildStates[parentIndex]?.every((isChecked) => isChecked);
  //     const updatedCheckedStates = [...checkedStates];
  //     updatedCheckedStates[parentIndex] = allChildChecked;
  //     setCheckedStates(updatedCheckedStates);

  //

  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // Child no 2 working
  // const handleChildCheckboxChange = async (parentIndex, childIndex, rowId) => {
  //   try {
  //     const updatedChildStates = [...childCheckedStates];
  //     updatedChildStates[parentIndex][childIndex] = !updatedChildStates[parentIndex][childIndex];
  //     setChildCheckedStates(updatedChildStates);

  //     // Construct the array of user_ids based on all selected child checkboxes
  //     const selectedUserIds = [];
  //     updatedChildStates.forEach((parentCheckedState, parentIndex) => {
  //       parentCheckedState.forEach((isChecked, childIndex) => {
  //         if (isChecked) {
  //           selectedUserIds.push(data[parentIndex].members[childIndex].uuid);
  //         }
  //       });
  //     });

  //     // Set loading state to true only for the clicked checkbox
  //     setChildLoadingStates((prev) => {
  //       const newState = [...prev];
  //       newState[parentIndex][childIndex] = true;
  //       return newState;
  //     });

  //     // Determine whether to add or remove the selected child
  //     const isSelected = updatedChildStates[parentIndex][childIndex];
  //     const payload = {
  //       event_id: eventId,
  //       user_id: selectedUserIds,
  //     };

  //     const response = await ApiServices.invites.addInvitee(payload);
  //

  //     if (response.data.code === 200) {
  //       setChildLoadingStates((prev) => {
  //         const newState = [...prev];
  //         newState[parentIndex][childIndex] = false;
  //         return newState;
  //       });
  //       onSuccess();
  //       getEventStatsById()
  //     } else {
  //       alert(isSelected ? "Not Added" : "Not Removed");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleChildCheckboxChange = async (parentIndex, childIndex) => {
    // try {
    const updatedChildStates = [...childCheckedStates];
    updatedChildStates[parentIndex][childIndex] = !updatedChildStates[parentIndex][childIndex];
    setChildCheckedStates(updatedChildStates);

    // Construct the array of user_ids based on all selected child checkboxes
    const selectedUserIds = [];
    updatedChildStates.forEach((parentCheckedState, parentIndex) => {
      parentCheckedState.forEach((isChecked, childIndex) => {
        if (isChecked) {
          selectedUserIds.push(data[parentIndex].members[childIndex].uuid);
        }
      });
    });

    // Set loading state to true only for the clicked checkbox
    // setChildLoadingStates((prev) => {
    //   const newState = [...prev];
    //   newState[parentIndex][childIndex] = true;
    //   return newState;
    // });

    // Determine whether to add or remove the selected child
    const isSelected = updatedChildStates[parentIndex][childIndex];
    //   const payload = {
    //     event_id: eventId,
    //     user_id: selectedUserIds,
    //   };

    //   const response = await ApiServices.invites.addInvitee(payload);
    //

    //   if (response.data.code === 200) {
    //     setChildLoadingStates((prev) => {
    //       const newState = [...prev];
    //       newState[parentIndex][childIndex] = false;
    //       return newState;
    //     });
    //     onSuccess();
    //     getEventStatsById()
    //   } else {
    //     alert(isSelected ? "Not Added" : "Not Removed");
    //   }
    // } catch (err) {
    //   console.error(err);
    // }
  };

  // Handle all checkbox
  // const handleSendAll = async () => {
  //   try {
  //     setBtnLoading(true);

  //     const payload = {
  //       event_id: eventId,
  //       user_id: openConfirmationModal?.data,
  //     };http://localhost:5000/gift-allocation

  //     const response = await ApiServices.invites.addInvitee(payload);
  //

  //     if (response.data.code === 200) {
  //       setBtnLoading(false);
  //       onSuccess();
  //       setOpenConfirmationModal({ open: false, data: null });
  //       openSuccessModal({
  //         title: "Success!",
  //         message: "Invitee has been added successfully",
  //         onClickDone: (close) => {
  //           closeSuccessModel();
  //         },
  //       });
  //     } else {
  //       alert("Not Added");
  //       setBtnLoading(false);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setBtnLoading(false);
  //   }
  // };

  const handleSendAll = async () => {
    try {
      setBtnLoading(true);

      // Collect all selected child IDs across all parents
      const allSelectedChildIds = [];
      childCheckedStates.forEach((parentCheckedState, parentIndex) => {
        parentCheckedState.forEach((isChecked, childIndex) => {
          if (isChecked) {
            allSelectedChildIds.push(data[parentIndex].members[childIndex].uuid);
          }
        });
      });

      const payload = {
        event_id: eventId,
        user_id: allSelectedChildIds,
      };

      const response = await ApiServices.invites.addInvitee(payload);

      if (response.data.code === 200) {
        setBtnLoading(false);
        onSuccess();
        getEventStatsById();
        setOpenConfirmationModal({ open: false, data: null });
        openSuccessModal({
          title: "Success!",
          message: "Invitee has been added successfully",
          onClickDone: (close) => {
            closeSuccessModel();
            onSuccess();
            getEventStatsById();
          },
        });
      } else {
        alert("Not Added");
        setBtnLoading(false);
      }
    } catch (err) {
      console.error(err);
      setBtnLoading(false);
    }
  };

  // Function to handle cancellation of confirmation modal
  const handleCancelConfirmation = () => {
    const defaultChildStates = initializeChildCheckboxStates(data);
    setChildCheckedStates(defaultChildStates);
    setOpenConfirmationModal({ open: false, data: null });
    setCheckedStates(Array(data.length).fill(false));
  };

  // Initialize parent checkbox states based on the child checkbox states
  const initializeParentCheckboxStates = (childStates) => {
    return childStates?.map((childState) => childState?.every((isChecked) => isChecked));
  };

  // Initialize parent checkbox states on component mount
  useEffect(() => {
    if (childCheckedStates) {
      const parentCheckboxStates = initializeParentCheckboxStates(childCheckedStates);
      setCheckedStates(parentCheckboxStates);
    }
  }, [childCheckedStates]);

  return (
    <>
      <div className="space-y-4">
        {inviteeCheckbox
          ? data?.map((item, parentIndex) => (
              <details key={parentIndex} className="group space-y-1 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg border-2 p-4 text-gray-900">
                  <div className="flex gap-x-4">
                    <div className="ms-4">
                      <input
                        type="checkbox"
                        id={item.id}
                        name={item.name}
                        checked={checkedStates[parentIndex]}
                        onChange={() => handleParentCheckboxChange(parentIndex)}
                      />
                    </div>
                    <h2 className="font-medium">{item.name}</h2>
                  </div>
                  <svg
                    className="size-5 shrink-0 transition duration-300 group-open:-rotate-180"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="ml-12">
                  <table className="table w-full table-auto rounded-lg text-left">
                    <thead>
                      <tr className="border">
                        <th className="p-4 font-medium">{t("invitee.sr")}</th>
                        <th className="w-1/3 p-4 font-medium">{t("invitee.friendName")}</th>
                        <th className="w-1/3 p-4 font-medium">{t("invitee.city")}</th>
                        <th className="p-4 font-medium">{t("invitee.totalGuests")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item?.members?.map((row, index) => (
                        <tr key={index} className="rounded-lg even:bg-gray-100">
                          {/* child checkbox of the parent checkbox */}
                          <td className="p-4">
                            {childLoadingStates[parentIndex][index] ? (
                              <Spinner />
                            ) : (
                              <input
                                type="checkbox"
                                id={`child-checkbox-${parentIndex}-${index}`}
                                name={`child-checkbox-${parentIndex}-${index}`}
                                checked={childCheckedStates[parentIndex][index]}
                                onChange={() => handleChildCheckboxChange(parentIndex, index, row?.uuid)}
                              />
                            )}
                          </td>
                          <td className="w-1/3 p-4">{row?.first_name + " " + row?.last_name || ""}</td>
                          <td className="w-1/3 p-4">{row?.city || ""}</td>
                          <td className="p-4">{row?.no_of_members}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))
          : data?.map((item, parentIndex) => (
              <details key={parentIndex} className="group space-y-1 [&_summary::-webkit-details-marker]:hidden" open={true}>
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg border-2 p-4 text-gray-900">
                  <h2 className="font-medium">{item.name}</h2>
                  <div className="flex items-center gap-x-2">
                    {!rsvpModal && (
                      <button
                        onClick={() => {
                          if (cardAllocate) {
                            setOpenCardAllocateModal({
                              open: true,
                              data: item?.memberData,
                            });
                          } else {
                            setOpenAllocateModal({
                              open: true,
                              data: item?.memberData,
                            });
                          }
                        }}
                        className="flex items-center justify-center gap-x-2 rounded-full border-2 border-gray-400 px-6 py-2 text-sm text-blue-400"
                        type="button"
                      >
                        <MagnifyingGlassIcon className="h-4 w-4 text-blue-400" />
                        {cardAllocate ? "allocate card to all group" : "allocate gift to all group"}
                      </button>
                    )}
                    <svg
                      className="size-5 shrink-0 transition duration-300 group-open:-rotate-180"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                {/* <div className="flex gap-x-4 items-center p-2 ml-6 rounded-lg border-2">
                  <div className="flex gap-x-4 items-center">
                    <UserGroupIcon className="w-5 h-5 text-purple-500" />
                    <p className="leading-relaxed text-purple-500">{item.subtitle}</p>
                  </div>
                </div> */}
                <div className="ml-12">
                  <table className="table w-full table-auto rounded-lg text-left">
                    {rsvpModal ? (
                      <tbody>
                        {item?.members?.map((member, childIndex) => (
                          <tr key={childIndex} className="divide-x-2 divide-gray-200 border-2">
                            <td className="w-[12%] p-4">
                              <button
                                onClick={() => {
                                  setOpenRsvpModal({
                                    open: true,
                                    data: member,
                                    id: eventId,
                                  });
                                }}
                                className="flex items-center justify-center gap-x-2 rounded-full border-2 border-gray-400 px-6 py-2 text-sm text-blue-400"
                                type="button"
                              >
                                {t("invitee.mark")}
                              </button>
                            </td>
                            <td className="w-[21%] p-4">{member?.first_name + " " + member?.last_name || ""}</td>
                            {/* <td className="w-[21%] p-4">{member?.event || member?.city}</td> */}
                            <td className="w-[40%]3 p-4">
                              {member?.invitees?.map((item, index) => {
                                return (
                                  <div className="flex flex-wrap gap-x-5 gap-y-1">
                                    <span className="font-medium">{t("invitee.totalInvited")} : </span>
                                    <span className="-ml-4  text-green-500">{item?.total_invited}</span>
                                    <span className="font-medium">{t("invitee.pending")} : </span>
                                    <span className="-ml-4  text-green-500">{item?.rsvp_pending}</span>
                                    <span className="font-medium">{t("invitee.yes")} : </span>
                                    <span className="-ml-4  text-green-500">{item?.rsvp_yes}</span>
                                    <span className="font-medium">{t("invitee.no")} : </span>
                                    <span className="-ml-4  text-green-500">{item?.rsvp_no}</span>
                                    <span className="font-medium">{t("invitee.mayAttend")} : </span>
                                    <span className="-ml-4  text-green-500">{item?.rsvp_may_attend}</span>
                                    <span className="font-medium">Invitiation Call : </span>
                                    <span className="-ml-4  text-green-500">{item?.rsvp_status === 1 ? "Completed" : "Pending"}</span>
                                  </div>
                                );
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    ) : cardAllocate ? (
                      <tbody>
                        {item?.memberData?.map((member, childIndex) => (
                          <tr key={childIndex} className="divide-x-2 divide-gray-200 border-2">
                            <td className="w-1/3 p-4">
                              <button
                                onClick={() => {
                                  setOpenCardAllocateModal({
                                    open: true,
                                    data: member,
                                  });
                                }}
                                className="flex items-center justify-center gap-x-2 rounded-full border-2 border-gray-400 px-6 py-2 text-sm text-blue-400"
                                type="button"
                              >
                                <MagnifyingGlassIcon className="h-4 w-4 text-blue-400" /> {t("invitee.allocateCard")}
                              </button>
                            </td>
                            <td className="w-1/3 p-4">{`${member?.salutation} ${member?.first_name} ${member?.last_name}` || ""}</td>
                            <td className="w-1/3 p-4">{member?.card_allocation?.map((card) => card?.card.name).join(", ") || ""}</td>{" "}
                          </tr>
                        ))}
                      </tbody>
                    ) : (
                      <tbody>
                        {item?.memberData?.map((member, childIndex) => (
                          <tr key={childIndex} className="divide-x-2 divide-gray-200 border-2">
                            <td className="w-1/3 p-4">
                              <button
                                onClick={() => {
                                  setOpenAllocateModal({
                                    open: true,
                                    data: member,
                                  });
                                }}
                                className="flex items-center justify-center gap-x-2 rounded-full border-2 border-gray-400 px-6 py-2 text-sm text-blue-400"
                                type="button"
                              >
                                <MagnifyingGlassIcon className="h-4 w-4 text-blue-400" /> {t("invitee.allocateGift")}
                              </button>
                            </td>
                            <td className="w-1/3 p-4">{`${member?.salutation} ${member?.first_name} ${member?.last_name}` || ""}</td>
                            <td className="w-1/3 p-4">
                              {member?.gift?.map((gift) => `${gift.pivot?.quantity || 1} x ${gift.name}`).join(", ") || ""}
                            </td>{" "}
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>
                </div>
              </details>
            ))}
      </div>

      {rsvpModal ? (
        <RsvpModal
          onSuccess={onSuccess}
          isOpen={openRsvpModal.open}
          allocateData={openRsvpModal.data}
          eventId={openRsvpModal.id}
          setIsOpen={(open) => setOpenRsvpModal((prev) => ({ ...prev, open }))}
          refresh={getEventStatsById}
        />
      ) : cardAllocate ? (
        <CardAllocationModal
          onSuccess={onSuccess}
          eventId={eventId}
          isOpen={openCardAllocateModal.open}
          allocateData={openCardAllocateModal.data}
          isBulkAllocation={openCardAllocateModal?.data?.length > 0 ? true : false}
          setIsOpen={(open) => setOpenCardAllocateModal((prev) => ({ ...prev, open }))}
        />
      ) : (
        <GiftAllocationModal
          onSuccess={onSuccess}
          eventId={eventId}
          isOpen={openAllocateModal.open}
          allocateData={openAllocateModal.data}
          isBulkAllocation={openAllocateModal?.data?.length > 0 ? true : false}
          setIsOpen={(open) => setOpenAllocateModal((prev) => ({ ...prev, open }))}
        />
      )}

      {/* Confirm */}
      <ConfirmationModal
        data={openConfirmationModal.data}
        isOpen={openConfirmationModal.open}
        handleSubmit={handleSendAll}
        handleCancel={handleCancelConfirmation}
        message="Are you sure you want to invite all?"
        setIsOpen={(open) => setOpenConfirmationModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Accordian;
