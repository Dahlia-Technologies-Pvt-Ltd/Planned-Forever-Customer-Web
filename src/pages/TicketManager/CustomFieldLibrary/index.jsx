import React, { useState, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Lottie from "react-lottie";
import Dropdown from "../../../components/common/Dropdown";
import { emptyFolderAnimation } from "../../../utilities/lottieAnimations";
import { useNavigate } from "react-router-dom";
import { PlusCircleIcon, MinusCircleIcon, PencilIcon, ArrowUpCircleIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import ApiServices from "@api";
import { useThemeContext } from "@context";
import ConfirmationModal from "@components/common/ConfirmationModal";
import Skeleton from "react-loading-skeleton";
import ReactPaginate from "react-paginate";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";

const CustomFieldLibrary = () => {
  const { t } = useTranslation("common");

  const fieldTypes = [
    { type: "Text", label: t("customFieldLibrary.alphanumericInputBox") },
    { type: "Number", label: t("customFieldLibrary.numericInputBox") },
    { type: "Date", label: t("customFieldLibrary.datePicker") },
    { type: "Select", label: t("customFieldLibrary.selectBox") },
    { type: "Checkbox", label: t("customFieldLibrary.multipleCheckbox") },
    { type: "Radio", label: t("customFieldLibrary.radioButton") },
    { type: "Url", label: t("customFieldLibrary.googleLocation") },
    { type: "Time", label: t("customFieldLibrary.timePicker") },
  ];

  const navigate = useNavigate();

  const [fields, setFields] = useState([]);
  const [sendOption, setSendOption] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [editOptionId, setEditOptionId] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });
  const [nameError, setNameError] = useState("");
  const [optionError, setOptionError] = useState("");
  const [sendOptionError, setSendOptionError] = useState("");
  const [checkboxError, setCheckboxError] = useState("");
  const [fieldTypeError, setFieldTypeError] = useState("");

  const { eventSelect, btnLoading, setBtnLoading, loading, setLoading, openSuccessModal, closeSuccessModel, allType2CategoryList, setErrorMessage } =
    useThemeContext();

  // const addField = (type) => {
  //   const newField = {
  //     id: Date.now(),
  //     name: "",
  //     type,
  //     options: [],
  //     newOption: "",
  //     sendOption: "",
  //     update: "",
  //   };
  //   setFields([newField , ...fields, ]);
  // };

  const addField = (type) => {
    const newField = {
      id: Date.now(),
      name: "",
      type,
      options: [],
      dropdownOption: "",
      inputOption: "",
      sendOption: "",
      update: "",
    };
    setFields([newField, ...fields]);
  };

  // const handleFieldChange = (id, name, value) => {
  //   const updatedFields = fields.map((field) => (field.id === id ? { ...field, [name]: value } : field));
  //   setFields(updatedFields);
  //   if (name === "name") {
  //     setNameError("");
  //   } else if (name === "newOption") {
  //  // or set any other error handling logic for newOption here
  //   }
  //   setFieldTypeError("");
  // };

  const handleFieldChange = (id, name, value) => {
    const updatedFields = fields.map((field) => (field.id === id ? { ...field, [name]: value } : field));
    setFields(updatedFields);
    if (name === "name") {
      setNameError("");
    } else if (name === "inputOption") {
      // or set any other error handling logic for inputOption here
    } else if (name === "dropdownOption") {
      // or set any other error handling logic for dropdownOption here
    }
    setFieldTypeError("");
  };

  const toggleAccordion = (id) => {
    console.log({ toggle: id });
    setExpanded(expanded === id ? null : id);
    setNameError("");
    setCheckboxError("");
    setSendOptionError("");
  };

  // const handleSendOptionChange = (value) => {
  //   if (value === "custom") {
  //     setSendOption(value);
  //     // navigate("/ticket-custom-field");
  //   } else {
  //     setSendOption(value);
  //   }
  // };

  const handleSendOptionChange = (id, value) => {
    const updatedFields = fields.map((field) => (field.id === id ? { ...field, sendOption: value } : field));
    setFields(updatedFields);
    setCheckboxError("");
  };

  const isValidForm = (field) => {
    let isValidData = true;

    if (!field.name) {
      setNameError("Field name is required.");
      isValidData = false;
    } else {
      setNameError("");
    }
    if (field.options.length === 0 && ["Radio", "Checkbox"].includes(field.type)) {
      setSendOptionError("At least one option is required.");
      isValidData = false;
    } else {
      setSendOptionError("");
    }
    if (
      field.options.length === 0 &&
      ["Select"].includes(field.type) &&
      field.type === "Select" &&
      field.sendOption === "custom" &&
      field.options.length === 0
    ) {
      setOptionError("At least one option is required.");
      isValidData = false;
    } else {
      setOptionError("");
    }
    if (["Select"].includes(field.type) && field.type === "Select" && field.sendOption === "fromMaster" && field.newOption === "") {
      setFieldTypeError("Field Type is required.");
      isValidData = false;
    } else {
      setFieldTypeError("");
    }
    if (field.type === "Select" && field.sendOption === "") {
      setCheckboxError("At least one checkbox is required.");
      isValidData = false;
    } else {
      setCheckboxError("");
    }
    // if (field.type === "Select" && !field.sendOption) {
    //   setSendOptionError("Send option is required.");
    //   isValidData = false;
    // } else {
    //   setSendOptionError("");
    // }

    return isValidData;
  };

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 9 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  const handleCreateField = async (fieldId, update) => {
    console.log({ a: update });
    const field = fields.find((f) => f.id === fieldId);
    console.log("Field created:", field);

    // if (!field.name) {
    //   alert("Field name is required.");
    //   return;
    // }
    // // if (
    // //   (field.options.length === 0 && ["Radio", "Checkbox", "Select"].includes(field.type)) ||
    // //   (field.type === "Select" && !field.sendOption)
    // // ) {
    // //   alert("At least one option is required.");
    // //   return;
    // // }
    // if (
    //   (field.type === "Select" && !field.sendOption) ||
    //   (field.type === "Select" && field.sendOption === "custom" && field.options.length === 0) ||
    //   (field.type !== "Select" && field.options.length === 0 && ["Radio", "Checkbox"].includes(field.type))
    // ) {
    //   alert("At least one option is required.");
    //   return;
    // }
    // if (field.type === "Select" && field.sendOption === "fromMaster" && !field.newOption?.value) {
    //   alert("Field type is required when sending from master.");
    //   return;
    // }
    // Perform any actions with the field (e.g., send to API, update state, etc.)
    if (isValidForm(field)) {
      try {
        setBtnLoading(true);

        let payload = {
          name: field?.name,
          event_id: eventSelect,
          type: field.type === "Select" && field.sendOption === "fromMaster" ? "master" : "custom",
          field_type: field?.type,
          master_field: field.type === "Select" && field.sendOption === "fromMaster" ? field?.dropdownOption?.value : "",
          custom_field:
            (field.type === "Select" && field.sendOption === "custom") || field.type === "Radio" || field.type === "Checkbox"
              ? field.options.map((item) => ({
                  id: item.id,
                  name: item.value,
                }))
              : [],
        };

        const response = field.update
          ? await ApiServices.Custom_Field_Library.updateCustomFieldLibrary(fieldId, payload)
          : await ApiServices.Custom_Field_Library.addCustomFieldLibrary(payload);

        if (response.data.code === 200) {
          setBtnLoading(false);
          getCustomFieldLibrary();
          toggleAccordion();
          // setIsOpen(false);
          // refreshData();
          // openSuccessModal({
          //   title: "Success!",
          //   message: data === null ? "Detail name has been added successfully" : "Detail name has been updated successfully",
          //   onClickDone: closeSuccessModel,
          // });
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

  // const handleAddOrUpdateOption = (fieldId) => {
  //   const field = fields.find((f) => f.id === fieldId);
  //   if (field.newOption.trim() === "") {
  //     return;
  //   }
  //   if (!editOptionId) {
  //     handleAddOption(fieldId);
  //     setOptionError("");
  //     setSendOptionError("");
  //   } else {
  //     handleUpdateOption(fieldId);
  //   }
  // };

  // const handleAddOption = (fieldId) => {
  //   const updatedFields = fields.map((field) => {
  //     if (field.id === fieldId) {
  //       return { ...field, options: [...field.options, { id: Date.now(), value: field.newOption }], newOption: "" };
  //     }
  //     return field;
  //   });
  //   setFields(updatedFields);
  //   setEditOptionId(null);
  // };

  // const handleEditOption = (fieldId, optionId) => {
  //   const field = fields.find((f) => f.id === fieldId);
  //   const option = field.options.find((opt) => opt.id === optionId);
  //   setFields(fields.map((f) => (f.id === fieldId ? { ...f, newOption: option.value } : f)));
  //   setEditOptionId(optionId);
  // };

  // const handleUpdateOption = (fieldId) => {
  //   const updatedFields = fields.map((field) => {
  //     if (field.id === fieldId) {
  //       const updatedOptions = field.options.map((option) => (option.id === editOptionId ? { ...option, value: field.newOption } : option));
  //       return { ...field, options: updatedOptions, newOption: "" };
  //     }
  //     return field;
  //   });
  //   setFields(updatedFields);
  //   setEditOptionId(null);
  // };

  const handleAddOrUpdateOption = (fieldId) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field.inputOption.trim() === "") {
      return;
    }
    if (!editOptionId) {
      handleAddOption(fieldId);
      setOptionError("");
      setSendOptionError("");
    } else {
      handleUpdateOption(fieldId);
    }
  };

  const handleAddOption = (fieldId) => {
    const updatedFields = fields.map((field) => {
      if (field.id === fieldId) {
        return { ...field, options: [...field.options, { id: Date.now(), value: field.inputOption }], inputOption: "" };
      }
      return field;
    });
    setFields(updatedFields);
    setEditOptionId(null);
  };

  const handleEditOption = (fieldId, optionId) => {
    const field = fields.find((f) => f.id === fieldId);
    const option = field.options.find((opt) => opt.id === optionId);
    setFields(fields.map((f) => (f.id === fieldId ? { ...f, inputOption: option.value } : f)));
    setEditOptionId(optionId);
  };

  const handleUpdateOption = (fieldId) => {
    const updatedFields = fields.map((field) => {
      if (field.id === fieldId) {
        const updatedOptions = field.options.map((option) => (option.id === editOptionId ? { ...option, value: field.inputOption } : option));
        return { ...field, options: updatedOptions, inputOption: "" };
      }
      return field;
    });
    setFields(updatedFields);
    setEditOptionId(null);
  };

  const handleDeleteOption = (fieldId, optionId) => {
    const updatedFields = fields.map((field) => {
      if (field.id === fieldId) {
        const updatedOptions = field.options.filter((option) => option.id !== optionId);
        return { ...field, options: updatedOptions };
      }
      return field;
    });
    setFields(updatedFields);
  };

  const [allCustomFieldDetail, setAllCustomFieldDetail] = useState([]);

  const getCustomFieldDetail = async () => {
    let payload = {
      event_id: eventSelect,
    };
    // setLoading(true);
    try {
      const response = await ApiServices.Custom_Field_Type.getCustomFieldType(payload);

      if (response.data.code === 200) {
        // setLoading(false);
        const formattedVenues = response.data.data.data.map((venue) => ({
          value: venue.id,
          label: venue.name,
        }));

        setAllCustomFieldDetail(formattedVenues);
      } else {
      }
    } catch (err) {
      // setLoading(false);
    }
  };

  const getCustomFieldLibrary = async () => {
    setLoading(true);
    let payload = {
      page: currentPage,
      records_no: itemsPerPage,
      event_id: eventSelect,
    };
    const res = await ApiServices.Custom_Field_Library.getCustomFieldLibrary(payload)
      .then((res) => {
        const { data, message } = res;

        if (data?.code === 200) {
          setLoading(false);
          // id: 1716464225580;
          // name: "fasdf";
          // newOption: "";
          // options: [];
          // type: "Text";

          // const formattedData = data.data.data.map((item) => ({
          //   id: item?.id,
          //   name: item?.name,
          //   type: item?.field_type,
          //   newOption: {
          //     label: item?.master_field_type?.name,
          //     value: item?.master_field_type?.id,
          //   },
          //   created_at: item.created_at,
          //   options:
          //     item?.custom_field?.map((customField) => ({
          //       id: customField?.id,
          //       value: customField?.name,
          //     })) || [],
          // }));

          console.log({ aaaaaaaa: data.data.data });
          setCurrentPage(data?.data?.current_page);
          setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
          const formattedData = data.data.data.map((item) => {
            // const hasMasterFieldTypeName = !!item?.master_field_type?.name;
            // const setSendoptionValue = hasMasterFieldTypeName ? 'fromMaster' : 'custom';

            let sendOption = "";

            if (item?.field_type === "Select") {
              sendOption = item?.master_field_type ? "fromMaster" : "custom";
            }

            return {
              id: item?.id,
              name: item?.name,
              type: item?.field_type,
              dropdownOption: {
                label: item?.master_field_type?.name,
                value: item?.master_field_type?.id,
              },
              inputOption: "",
              update: true,
              // newOption: "",
              // sendOption: (item?.field_type === "Select" && item?.master_field_type) ? 'fromMaster' : 'custom',
              sendOption: sendOption,
              created_at: item.created_at,
              options:
                item?.custom_field?.map((customField) => ({
                  id: customField?.id,
                  value: customField?.name,
                })) || [],
            };
          });

          // Update the state based on the mapping result
          // setSendOption(formattedData.some(item => item.setSendoption === 'fromMaster') ? 'fromMaster' : 'custom');

          setFields(formattedData);

          console.log({ formattedData });
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const handleDeleteCustomField = async () => {
    try {
      setBtnLoading(true);

      const response = await ApiServices.Custom_Field_Library.deleteCustomFiledLibrary(openDeleteModal?.data);
      if (response.data.code === 200) {
        setBtnLoading(false);
        getCustomFieldDetail();
        setOpenDeleteModal({ open: false, data: null });
        getCustomFieldLibrary();
        openSuccessModal({
          title: "Success!",
          message: "Detail has been deleted successfully",
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      } else {
        setBtnLoading(false);
      }
    } catch (err) {
      setErrorMessage(err?.response?.data?.message);
      setBtnLoading(false);
    }
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  useEffect(() => {
    getCustomFieldLibrary();
  }, [currentPage]);

  useEffect(() => {
    getCustomFieldDetail();
    getCustomFieldLibrary();
  }, []);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7">
          <div className="card min-h-[82vh] overflow-auto p-5 shadow-lg">
            <div className="flex justify-between">
              <h3 className="heading">Custom Field Library</h3>
            </div>
            <div className="mt-5 h-[67vh] overflow-y-auto">
              {loading ? (
                <Skeleton count={itemsPerPage} height={50} />
              ) : fields.length > 0 ? (
                fields.map((field) => (
                  <>
                    <div key={field.id} className="mb-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                      <div className="grid cursor-pointer grid-cols-12 p-3" onClick={() => toggleAccordion(field.id)}>
                        <div className="col-span-7">{field.name || t("customFieldLibrary.enterFieldText")}</div>
                        <div className="col-span-4">{field.type}</div>
                        <div className="col-span-1">
                          <ChevronDownIcon className={`h-4 w-3.5 transform ${expanded === field.id ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                      {expanded === field.id && (
                        <div className="p-3">
                          <Input
                            placeholder="Field Name"
                            error={nameError}
                            value={field.name}
                            onChange={(e) => handleFieldChange(field.id, "name", e.target.value)}
                          />

                          {field.type === "Select" && (
                            <>
                              {checkboxError && <div className="mt-3 text-red-500">{checkboxError}</div>}

                              <div className="mt-4">
                                <input
                                  id={`fromMaster-${field.id}`}
                                  type="radio"
                                  value="fromMaster"
                                  name={`send-radio-${field.id}`}
                                  checked={field.sendOption === "fromMaster"}
                                  onChange={() => handleSendOptionChange(field.id, "fromMaster")}
                                />
                                <label htmlFor={`fromMaster-${field.id}`} className="ms-2 text-sm font-medium text-gray-900">
                                  From Master
                                </label>
                              </div>
                              <div className="mt-2">
                                <input
                                  id={`custom-${field.id}`}
                                  type="radio"
                                  value="custom"
                                  name={`send-radio-${field.id}`}
                                  checked={field.sendOption === "custom"}
                                  onChange={() => handleSendOptionChange(field.id, "custom")}
                                />
                                <label htmlFor={`custom-${field.id}`} className="ms-2 text-sm font-medium text-gray-900">
                                  Custom
                                </label>
                              </div>
                              {field.sendOption === "fromMaster" && (
                                <div className="mt-4 grid grid-cols-3">
                                  {/* <Dropdown
                                  isSearchable
                                  options={allCustomFieldDetail}
                                  placeholder="Select"
                                  value={field.newOption}
                                  onChange={(e) => handleFieldChange(field.id, "newOption", e)}
                                  title="Choose Field Type"
                                  withError={fieldTypeError}
                                /> */}
                                  <Dropdown
                                    isSearchable
                                    options={allCustomFieldDetail}
                                    placeholder="Select"
                                    value={field.dropdownOption}
                                    onChange={(e) => handleFieldChange(field.id, "dropdownOption", e)}
                                    title="Choose Field Type"
                                    withError={fieldTypeError}
                                  />
                                </div>
                              )}
                            </>
                          )}

                          {(field.type === "Radio" || field.type === "Checkbox" || field.sendOption === "custom") && (
                            <>
                              <div className="mt-4">
                                {optionError && <div className="mt-3 text-red-500">{optionError}</div>}
                                {sendOptionError && <div className="mt-3 text-red-500">{sendOptionError}</div>}

                                <div className="flex items-center">
                                  <Input
                                    placeholder="Option Value"
                                    value={field.inputOption || ""}
                                    onChange={(e) => handleFieldChange(field.id, "inputOption", e.target.value)}
                                  />
                                  {editOptionId ? (
                                    <ArrowUpCircleIcon
                                      className="ml-1.5 mt-2 inline-block h-10 w-10 cursor-pointer text-blue-500"
                                      onClick={() => handleAddOrUpdateOption(field.id)}
                                    />
                                  ) : (
                                    <PlusCircleIcon
                                      className="ml-1.5 mt-2 inline-block h-10 w-10 cursor-pointer text-green-500"
                                      onClick={() => handleAddOrUpdateOption(field.id)}
                                    />
                                  )}
                                </div>
                                <div className="mt-2">
                                  {field.options.map((option) => (
                                    <ul key={option.id} className="ml-4 mt-2 flex list-disc items-center space-y-2">
                                      <Input value={option.value} onChange={(e) => handleEditOption(field.id, option.id, e.target.value)} disabled />
                                      <PencilIcon
                                        className="ml-1.5 mt-2 inline-block h-7 w-7 cursor-pointer text-blue-500"
                                        onClick={() => handleEditOption(field.id, option.id)}
                                      />
                                      <MinusCircleIcon
                                        className="ml-1.5 mt-2 inline-block h-10 w-10 cursor-pointer text-red-500"
                                        onClick={() => handleDeleteOption(field.id, option.id)}
                                      />
                                    </ul>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                          <div className="mt-4 flex justify-end space-x-4">
                            {field?.created_at ? (
                              <>
                                <Button
                                  title={t("customFieldLibrary.update")}
                                  loading={btnLoading}
                                  onClick={() => handleCreateField(field.id, field.created_at)}
                                />
                                <Button
                                  title={t("customFieldLibrary.remove")}
                                  buttonColor="bg-red-500"
                                  onClick={() => setOpenDeleteModal({ open: true, data: field.id })}
                                />
                              </>
                            ) : (
                              <>
                                <Button title={t("customFieldLibrary.create")} loading={btnLoading} onClick={() => handleCreateField(field.id)} />
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-2">
                      <ReactPaginate
                        breakLabel="..."
                        pageRangeDisplayed={5}
                        marginPagesDisplayed={2}
                        activeClassName="active"
                        nextClassName="item next"
                        renderOnZeroPageCount={null}
                        breakClassName="item break-me "
                        containerClassName="pagination"
                        previousClassName="item previous"
                        pageCount={totalPages}
                        pageClassName="item pagination-page"
                        forcePage={currentPage - 1}
                        onPageChange={handlePageChange}
                        nextLabel={<ChevronRightIcon className="h-5 w-5" />}
                        previousLabel={<ChevronLeftIcon className="h-5 w-5" />}
                      />
                    </div>
                  </>
                ))
              ) : (
                <div className="flex h-[650px] items-center">
                  <Lottie options={emptyFolderAnimation} width={200} height={200} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="card min-h-[82vh] p-5 shadow-lg">
            <div className="inline-flex flex-wrap gap-3">
              {fieldTypes.map((fieldType) => (
                <div
                  key={fieldType.type}
                  onClick={() => addField(fieldType.type)}
                  className="flex h-[90px] w-[130px] cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
                >
                  {fieldType.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteCustomField}
        message="Are you sure you want to delete this custom field?"
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default CustomFieldLibrary;
