import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import DateAndTime from "../../components/common/DateAndTime";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import ChooseFile from "../../components/common/ChooseFile";
import Dropdown from "../../components/common/Dropdown";
import InputTags from "../../components/common/InputTags";
import { mediaUrl } from "../../utilities/config";
import moment from "moment";
import { useTranslation } from "react-i18next";

// priority options
const priorityOptions = [
  { label: "High", value: "high" },
  { label: "Low", value: "low" },
];

const AddTaskModal = ({ isOpen, setIsOpen, refreshData, data, setModalData }) => {
  const { t } = useTranslation("common");

  // Context
  const { eventSelect, setBtnLoading, btnLoading, openSuccessModal, closeSuccessModel, allUsers, getUsers , userData} = useThemeContext();
 console.log("userData",userData)
  // useStates
  const [tags, setTags] = useState([]);
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [assignTo, setAssignTo] = useState(null);
  const [priority, setPriority] = useState(null);
  const [taskFile, setTaskFile] = useState(null);
  const [description, setDescription] = useState("");
  const [collabrators, setCollabrators] = useState(null);

  // Errors
  const [tagsError, setTagsError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [dueDateError, setDueDateError] = useState("");
  const [taskFileError, setTaskFileError] = useState("");
  // const [assignToError, setAssignToError] = useState("");
  const [priorityError, setPriorityError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  // const [collabratorsError, setCollabratorsError] = useState("");

  // Handle Image Change
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    setTaskFile(file);

    const uploadFile = async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await ApiServices.contact.contactProfileUpload(formData);
        const { data, message } = res;

        if (res.code === 200) {
          setTaskFile(file);
          setFiles((prevFiles) => [...prevFiles, data]);
          event.target.value = null;
        }
      } catch (err) {}
    };

    await uploadFile(file);
  };

  // Handle cancel selected image
  const handleCrossClick = () => {
    setTaskFile(null);
  };

  // Vaidations
  const isValidForm = () => {
    let isValidData = true;
    if (title === "") {
      setTitleError(" Required");
      isValidData = false;
    }
    // if (assignTo === null) {
    //   setAssignToError(" Required");
    //   isValidData = false;
    // }
    // if (collabrators === null) {
    //   setCollabratorsError("Required");
    //   isValidData = false;
    // }
    if (startDate === "") {
      setStartDateError(" Required");
      isValidData = false;
    }
    if (dueDate === "") {
      setDueDateError("Required");
      isValidData = false;
    }
    if (priority === null) {
      setPriorityError("Required");
      isValidData = false;
    }

    return isValidData;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        let payload = {
          title: title,
          description: description,
          assign_to: assignTo?.value,
          assign_by: userData?.uuid,
          start_date: toUTCUnixTimestamp(startDate),
          end_date: toUTCUnixTimestamp(dueDate),
          priority: priority?.label,
          tags: tags,
          attachments: files,
          event_id: eventSelect,
        };

        const response = data === null ? await ApiServices.tasks.addTask(payload) : await ApiServices.tasks.updateTask(data?.id, payload);

        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          setModalData(null);
          clearAllData();
          refreshData();
          openSuccessModal({
            title: t("messages.success"),
            message: data === null ? t("tasks.taskAddedSuccess") : t("tasks.taskUpdatedSucess"),
            onClickDone: closeSuccessModel,
          });
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setBtnLoading(false);
      }
    } else {
    }
  };

  // Clear States
  const clearAllData = () => {
    setTags([]);
    setFiles([]);
    setTitle("");
    setDueDate("");
    setTagsError("");
    setStartDate("");
    setPriority(null);
    setTitleError("");
    setDescription("");
    setTaskFile(null);
    setCollabrators("");
    setDueDateError("");
    // setAssignToError("");
    setTaskFileError("");
    setPriorityError("");
    // setAssignToError("");
    setStartDateError("");
    setDescriptionError("");
    // setCollabratorsError("");
  };

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setModalData(null);
    setBtnLoading(false);
  };

  // Use Effects
  useEffect(() => {
    if (data !== null) {
      setTags(data?.tags);
      setTitle(data?.title);
      setDescription(data?.description);
      setTaskFile(data?.attachments[0]);
      setDueDate(moment.unix(data?.end_date).format("YYYY-MM-DD HH:mm"));
      setStartDate(moment.unix(data?.start_date).format("YYYY-MM-DD HH:mm"));
      setPriority({ label: data?.priority, value: data?.priority ? data.priority.toLowerCase() : "" });
      setAssignTo({ label: data?.assign_to?.first_name + " " + data?.assign_to?.last_name, value: data?.assign_to?.uuid });
      setCollabrators({ label: data?.assign_by?.first_name + " " + data?.assign_by?.last_name, value: data?.assign_by?.uuid });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      getUsers();
    }
  }, [isOpen]);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
                <Dialog.Panel className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="mb-5 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? t("tasks.addTask") : t("tasks.updateTask")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="h-[600px] space-y-7 overflow-y-auto p-2 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[600px]">
                      <h2 className="label text-secondary">{t("headings.basicInfo")}</h2>

                      <Input
                        isRequired
                        label={t("tasks.title")}
                        placeholder={t("tasks.title")}
                        value={title}
                        error={titleError}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setTitleError("");
                        }}
                      />

                      <div className="grid grid-cols-2 gap-7">
                        <Dropdown
                          // isRequired
                          title={t("tasks.assignTo")}
                          placeholder={t("tasks.assignTo")}
                          options={allUsers}
                          // withError={assignToError}
                          value={assignTo}
                          onChange={(e) => {
                            setAssignTo(e);
                            // setAssignToError("");
                          }}
                        />
{/* 
                        <Dropdown
                          // isRequired
                          title={t("tasks.collaborators")}
                          placeholder={t("tasks.collaborators")}
                          options={allUsers}
                          // withError={collabratorsError}
                          value={collabrators}
                          onChange={(e) => {
                            setCollabrators(e);
                            // setCollabratorsError("");
                          }}
                        /> */}

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("tasks.startDate")}
                          placeholder="Select Start Date"
                          value={startDate}
                          error={startDateError}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setStartDateError("");
                          }}
                        />

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("tasks.dueDate")}
                          placeholder="Select Due Date"
                          value={dueDate}
                          error={dueDateError}
                          onChange={(e) => {
                            setDueDate(e.target.value);
                            setDueDateError("");
                          }}
                        />
                      </div>

                      <Dropdown
                        isRequired
                        title={t("tasks.priority")}
                        placeholder={t("tasks.priority")}
                        options={priorityOptions}
                        withError={priorityError}
                        value={priority}
                        onChange={(e) => {
                          setPriority(e);
                          setPriorityError("");
                        }}
                      />

                      <InputTags label="Tags" selected={tags} setSelected={setTags} name="tags" />

                      <Input
                        // isRequired
                        label={t("tasks.description")}
                        placeholder={t("tasks.description")}
                        textarea
                        value={description}
                        error={descriptionError}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          setDescriptionError("");
                        }}
                      />

                      <div className="space-y-2">
                        <label className={`label ${taskFile ? "self-start" : "self-center"} `}>
                          {t("tasks.attachments")} {taskFileError && <span className="text-xs text-red-500"> {taskFileError}</span>}{" "}
                        </label>
                        <div className="w-3/12">
                          <ChooseFile
                            onClickCross={handleCrossClick}
                            placeholder
                            selectedFile={taskFile}
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleImageChange}
                          />
                        </div>
                      </div>

                      <div className="mx-auto mt-10 grid w-8/12 grid-cols-2 gap-7">
                        <Button
                          icon={<CheckIcon />}
                          title={data === null ? t("tasks.addTask") : t("tasks.updateTask")}
                          type="submit"
                          loading={btnLoading}
                        />
                        <Button icon={<XMarkIcon />} title={t("buttons.cancel")} type="button" buttonColor="bg-red-500" onClick={closeModal} />
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AddTaskModal;
