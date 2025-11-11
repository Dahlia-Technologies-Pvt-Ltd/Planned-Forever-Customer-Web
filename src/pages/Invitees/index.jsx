import moment from "moment";
import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import ApiServices from "../../api/services";
import React, { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import { INVITEES_PRINT } from "../../routes/Names";
import Dropdown from "../../components/common/Dropdown";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { ArrowLeftIcon, ChevronDownIcon, ClockIcon, MapIcon } from "@heroicons/react/24/outline";
import { baseUrl, mediaUrl } from "../../utilities/config";
import { Images } from "../../assets/Assets";
import { useTranslation } from "react-i18next";

const Invitees = () => {
  // Translation
  const { t } = useTranslation("common");
  // Context
  const { eventSelect, allEvents, allEventsList, setLoading, setBtnLoading, btnLoading, openSuccessModal, closeSuccessModel, getEventList } =
    useThemeContext();

  // useStates
  const [event, setEvent] = useState("");
  const [statsCount, setStatsCount] = useState(null);
  const [allContactGroup, setAllContactGroup] = useState([]);
  const [childCheckboxState, setChildCheckboxState] = useState([]);
  const [parentCheckboxState, setParentCheckboxState] = useState({});

  // Filter the eventDetails based on the selected event
  let selectedEventDetails = {};
  selectedEventDetails = allEventsList.find((item) => item?.id === event.value) || {};

  // Event selection handler
  // const handleEventChange = (selectedEvent) => {
  //   setEvent(selectedEvent);
  //   getEventStatsById(selectedEvent?.value);
  // };

  // Get Event Stats by id
  const getEventStatsById = async (givenId) => {
    try {
      const payload = {};
      const response = await ApiServices?.events?.getEventStatsById(eventSelect ? eventSelect : selectedEventDetails?.id, payload);
      //

      if (response.data.code === 200) {
        setStatsCount(response.data.data);
      } else {
        setLoading(false);
      }
    } catch (err) {}
  };

  // Get Contact by group
  const getContactsByGroup = async () => {
    try {
      const payload = {
        event_id: eventSelect,
      };
      const response = await ApiServices.invites.getContactsByGroup(payload);
      //

      if (response.data.code === 200) {
        setAllContactGroup(response.data.data);
      } else {
        setLoading(false);
      }
    } catch (err) {}
  };

  // Handle parent checkbox
  const handleParentCheckboxChange = (parentId) => {
    const parentChecked = !parentCheckboxState[parentId];
    setParentCheckboxState((prevState) => ({
      ...prevState,
      [parentId]: parentChecked,
    }));

    const childrenUuids = allContactGroup?.find((group) => group._id === parentId)?.members?.map((member) => member.uuid) || [];
    const unselectedChildrenUuids = childrenUuids.filter((uuid) => !childCheckboxState.includes(uuid));

    if (parentChecked) {
      setChildCheckboxState((prevState) => [...prevState, ...unselectedChildrenUuids]);
    } else {
      setChildCheckboxState((prevState) => prevState.filter((uuid) => !childrenUuids.includes(uuid)));
    }
  };

  // Handle child checkbox
  const handleChildCheckboxChange = (uuid) => {
    const updatedChildCheckboxState = childCheckboxState.includes(uuid)
      ? childCheckboxState.filter((id) => id !== uuid)
      : [...childCheckboxState, uuid];

    setChildCheckboxState(updatedChildCheckboxState);

    // Update parent checkbox state if all child checkboxes are checked
    setParentCheckboxState((prevState) => {
      const newState = { ...prevState };
      allContactGroup?.forEach((group) => {
        const allChildrenChecked = group?.members?.every((member) => updatedChildCheckboxState.includes(member.uuid));
        newState[group._id] = allChildrenChecked;
      });
      return newState;
    });
  };

  // Handle submit for checkboxes
  const handleSubmit = async () => {
    try {
      setBtnLoading(true);
      const payload = {
        event_id: eventSelect,
        user_id: childCheckboxState,
      };

      const response = await ApiServices.invites.addInvitee(payload);
      //

      if (response.data.code === 200) {
        setBtnLoading(false);
        getEventStatsById();
        getContactsByGroup();
        openSuccessModal({
          title: "Success!",
          message: "Invitee status has been updated successfully!",
          onClickDone: (close) => {
            closeSuccessModel();
            getContactsByGroup();
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

  // useEffect(() => {
  //   const uuidsToAdd = [];
  //   const parentIdsToCheck = [];
  //   allContactGroup?.forEach((group) => {
  //     group?.members?.forEach((member) => {
  //       const hasMatchingEventId = member?.invitees?.some((invitee) => invitee.event_id === selectedEventDetails.id);
  //       if (hasMatchingEventId) {
  //         uuidsToAdd.push(member.uuid);
  //         parentIdsToCheck.push(group._id);
  //       }
  //     });
  //   });
  //   setChildCheckboxState(uuidsToAdd);

  //   setParentCheckboxState((prevState) => {
  //     const newState = { ...prevState };
  //     parentIdsToCheck.forEach((parentId) => {
  //       const allChildrenChecked = allContactGroup
  //         ?.find((group) => group._id === parentId)
  //         ?.members?.every((member) => uuidsToAdd.includes(member.uuid));

  //       newState[parentId] = allChildrenChecked;
  //     });
  //     return newState;
  //   });
  // }, [allContactGroup, selectedEventDetails.id]);

  useEffect(() => {
    const uuidsToAdd = [];
    const parentIdsToCheck = [];

    allContactGroup?.forEach((group) => {
      group?.members?.forEach((member) => {
        const hasInviteeData = member?.invitees?.length > 0; // Check if invitee array has data

        if (hasInviteeData) {
          uuidsToAdd.push(member.uuid); // Add member UUID if invitee array is not empty
          parentIdsToCheck.push(group._id); // Add parent group ID to check later
        }
      });
    });

    // Update child checkbox state with the uuids of the members that have invitee data
    setChildCheckboxState(uuidsToAdd);

    // Update parent checkbox state based on whether all members in a group have invitee data
    setParentCheckboxState((prevState) => {
      const newState = { ...prevState };

      parentIdsToCheck.forEach((parentId) => {
        const allChildrenChecked = allContactGroup
          ?.find((group) => group._id === parentId)
          ?.members?.every((member) => uuidsToAdd.includes(member.uuid)); // Check if all members in the group have invitee data

        newState[parentId] = allChildrenChecked; // Set true if all children are checked
      });

      return newState;
    });
  }, [allContactGroup]);

  console.log({ allContactGroup });

  useEffect(() => {
    getContactsByGroup();
    getEventStatsById();
  }, []);

  console.log({ allContactGroup });

  return (
    <>
      <div className="card h-full space-y-8 xl:h-[83vh]">
        {/* <h3 onClick={() => setEvent("")} className="text-base text-gray-700 underline cursor-pointer underline-offset-4">
            <ArrowLeftIcon className="inline-block w-4 h-4" /> Back to Event
          </h3> */}
        {/* <Link to={INVITEES_PRINT}>
                <Button title={commonT('buttons.print')} buttonColor="border-primary  bg-primary " />
              </Link> */}

        <h2 className="heading">{t("title")}</h2>

        {/* dropdown */}
        <div>
          {/* <div className="grid gap-6 xl:grid-cols-3">
              <Dropdown withoutTitle options={allEvents} placeholder="-- Select an Event --" value={event} onChange={handleEventChange} />

              <div className="flex gap-x-3 items-center">
                <MapIcon className="w-8 h-8 text-blue-500 shrink-0" />
                <div className="space-y-1">
                  <h2 className="font-medium">{selectedEventDetails?.venue?.name || "-"}</h2>
                  <p className="text-sm">{selectedEventDetails?.venue?.address || "-"}</p>
                </div>
              </div>

              <div className="flex gap-x-3 items-center">
                <ClockIcon className="w-8 h-8 text-green-600 shrink-0" />
                <div className="space-y-1">
                  <h2 className="font-medium">Start Date & Time</h2>
                  <p className="text-sm">{moment?.unix(selectedEventDetails?.start_date)?.format("D MMM YYYY h:mm A") || "-"}</p>
                </div>
              </div>

              <div className="flex gap-x-3 items-center">
                <ClockIcon className="w-8 h-8 text-red-500 shrink-0" />
                <div className="space-y-1">
                  <h2 className="font-medium">End Date & Time</h2>
                  <p className="text-sm">{moment?.unix(selectedEventDetails?.end_date)?.format("D MMM YYYY h:mm A") || "-"}</p>
                </div>
              </div>
            </div> */}

          <div className="my-8 grid divide-gray-400 rounded-lg border-2 border-gray-400 text-gray-700 lg:grid-cols-5 lg:divide-x-2 xl:grid-cols-5 3xl:w-2/3">
            <div className="flex flex-col items-center justify-center gap-y-3 p-2 3xl:p-4">
              <p className="text-base font-semibold 3xl:text-lg">{t("invitee.invitees")}</p>
              <p className="text-lg font-medium text-green-500 3xl:text-xl">{statsCount?.total_invited}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-y-3 p-2 3xl:p-4">
              <p className="text-base font-semibold 3xl:text-lg">
                {t("invitee.rsvp")} {t("invitee.pending")}
              </p>
              <p className="text-lg font-medium text-green-500 3xl:text-xl">{statsCount?.rsvp_pending}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-y-3 p-2 3xl:p-4">
              <p className="text-base font-semibold 3xl:text-lg">
                {t("invitee.rsvp")} {t("invitee.yes")}
              </p>
              <p className="text-lg font-medium text-green-500 3xl:text-xl">{statsCount?.rsvp_yes}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-y-3 p-2 3xl:p-4">
              <p className="text-base font-semibold 3xl:text-lg">
                {t("invitee.rsvp")} {t("invitee.no")}
              </p>
              <p className="text-lg font-medium text-green-500 3xl:text-xl">{statsCount?.rsvp_no}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-y-3 p-2 3xl:p-4">
              <p className="text-base font-semibold 3xl:text-lg">
                {t("invitee.rsvp")} {t("invitee.mayAttend")}
              </p>
              <p className="text-lg font-medium text-green-500 3xl:text-xl">{statsCount?.rsvp_may_attend}</p>
            </div>
            <div></div>
          </div>

          {/* <div className="overflow-y-auto pr-6 pb-5 -mr-6 mb-8 space-y-4 h-24 xl:h-48 2xl:h-48 3xl:h-84"> */}
          <div className="-mr-6 mb-8 h-80 space-y-4 overflow-y-auto pb-5 pr-6 lg:h-[57vh] xl:h-[55vh]">
            {/* <Accordian
                  data={allContactGroup}
                  inviteeCheckbox
                  eventId={selectedEventDetails?.id}
                  onSuccess={getContactsByGroup}
                  setStatsCount={setStatsCount}
                /> */}

            {/* Group contact selection */}
            <div className="space-y-4">
              {allContactGroup?.map((item) => (
                <details key={item._id} className="group space-y-1 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg border-2 p-4 text-gray-900">
                    <div className="flex gap-x-4">
                      <div className="ms-4">
                        <input
                          type="checkbox"
                          id={item._id}
                          name={item.name}
                          checked={!!parentCheckboxState[item._id]}
                          onChange={() => handleParentCheckboxChange(item._id)}
                        />
                      </div>
                      <h2 className="font-medium">{item.name}</h2>
                    </div>
                    <ChevronDownIcon className="size-5 shrink-0 transition duration-300 group-open:-rotate-180" />
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
                        {item.members.map((row, index) => (
                          <tr key={index} className="rounded-lg even:bg-gray-100">
                            <td className="p-4">
                              <input
                                type="checkbox"
                                id={`child-checkbox-${item._id}-${row.uuid}`}
                                name={`child-checkbox-${item._id}-${row.uuid}`}
                                checked={childCheckboxState.includes(row.uuid)}
                                onChange={() => handleChildCheckboxChange(row.uuid)}
                              />
                            </td>
                            <td className="flex items-center gap-x-3 p-4">
                              <img
                                className="h-9 w-9 rounded-full object-cover"
                                src={row?.profile_image ? mediaUrl + row?.profile_image : Images.PLACEHOLDER}
                                alt="profile_img"
                              />
                              {`${row.first_name} ${row.last_name}`}
                            </td>
                            <td className="p-4">{row.city}</td>
                            <td className="p-4">{row.no_of_members}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="absolute bottom-0 left-0 flex w-full justify-end rounded-bl-20 rounded-br-20 bg-white p-4 shadow-card">
          <Button title={t("invitee.done")} onClick={handleSubmit} loading={btnLoading} />
        </div>
      </div>
    </>
  );
};

export default Invitees;
