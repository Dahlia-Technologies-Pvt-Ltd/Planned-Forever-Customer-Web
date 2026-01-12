import React from "react";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "../../components/common/Dropdown";
import { useThemeContext } from "../../context/GlobalContext";
import DateAndTime from "../../components/common/DateAndTime";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import { XMarkIcon, CheckIcon, ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import { PlusCircleIcon, MinusCircleIcon, PencilIcon } from "@heroicons/react/24/solid";
import { Switch } from "@headlessui/react";
import moment from "moment";
import { mediaUrl } from "../../utilities/config";
import { SAMAGRI } from "../../routes/Names";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { t } from "i18next";



import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import { useDropzone } from "react-dropzone";
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const AddSamagriModal = ({ isOpen, setIsOpen, data, setModalData, refreshData, rData }) => {
  const { t: commonT } = useTranslation("common");
  const [itemFile, setItemFile] = useState(null);

  // Context
  const {
    eventSelect,
    getCeremonies,
    allCeremonies,
    setBtnLoading,
    btnLoading,
    openSuccessModal,
    closeSuccessModel,
    allEvents,
    getEventList,
    allUsers,
    getUsers,
  } = useThemeContext();

  // Use States
  const [event, setEvent] = useState(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [samagri, setSamagri] = useState("");
  const [ceremonyName, setCeremonyName] = useState(null);
  const [ceremonyDate, setCeremonyDate] = useState(null);
  const [handoverDate, setHandoverDate] = useState("");
  const [items, setItems] = useState([{ item: "", quantity: "", unit: "", img: "", purchase: false }]);
  const [user, setUser] = useState(null);
  // const [currentItem, setCurrentItem] = useState({ item: "", quantity: "", unit: "" });

  // Validation States
  const [itemError, setItemError] = useState("");
  const [eventError, setEventError] = useState("");
  const [unitError, setUnitError] = useState("");
  const [notesError, setNotesError] = useState("");
  const [samagriError, setSamagriError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [ceremonyNameError, setCeremonyNameError] = useState("");
  const [ceremonyDateError, setCeremonyDateError] = useState("");
  const [addSamagriError, setAddSamagriError] = useState("");
  const [errors, setErrors] = useState([{ item: "", quantity: "", unit: "", purchase: "" }]);

  const downloadFile = () => {
      const fileId = "1736237561.SamagriItemsImport.xlsx";
      window.location.href = `${mediaUrl + fileId}`;
    };

  const navigate = useNavigate();

  const addNewFieldSet = (e) => {
    e.preventDefault();
    let isValid = true;

    const newErrors = items.map((currentItem) => {
      let itemError = { item: "", quantity: "", unit: "" };

      if (!currentItem.item) {
        itemError.item = "Required";
        isValid = false;
      }

      if (!currentItem.quantity) {
        itemError.quantity = "Required";
        isValid = false;
      }

      if (!currentItem.unit) {
        itemError.unit = "Required";
        isValid = false;
      }

      return itemError;
    });

    setErrors(newErrors);

    if (isValid) {
      setItems([...items, { item: "", quantity: "", unit: "", purchase: false }]);
      setErrors([...errors, { item: "", quantity: "", unit: "" }]);
    }
  };

  // const handleInputChange = (e, index, field) => {
  //   const value = field === "purchase" ? e : e.target.value;
  //   console.log({ value });
  //   const updatedItems = items.map((item, idx) => {
  //     if (idx === index) {
  //       return { ...item, [field]: value };
  //     }
  //     return item;
  //   });
  //   setItems(updatedItems);

  //   const updatedErrors = errors.map((error, idx) => {
  //     if (idx === index) {
  //       return { ...error, [field]: "" };
  //     }
  //     return error;
  //   });
  //   setErrors(updatedErrors);
  // };

  // console.log({ items });

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    const updatedErrors = errors.filter((_, idx) => idx !== index);
    setItems(updatedItems);
    setErrors(updatedErrors);
  };

  // console.log({ rData });

  // Handle form validation
  const isValidForm = () => {
    let isValidData = true;
    if (rData === null ? samagri === "" : samagri === rData?.ceremony?.name) {
      setSamagriError(" Required");
      isValidData = false;
    } else {
      setSamagriError("");
    }
    // if (event === null) {
    //   setEventError("Required");
    //   isValidData = false;
    // } else {
    //   setEventError("");
    // }
    if (!ceremonyName) {
      setCeremonyNameError(" Required");
      isValidData = false;
    } else {
      setCeremonyNameError("");
    }
    // if (!notes) {
    //   setNotesError("Required");
    //   isValidData = false;
    // } else {
    //   setNotesError("");
    // }
    // if (!items.length) {
    //   if (!currentItem.item) {
    //     setItemError("Required");
    //     isValidData = false;
    //   } else {
    //     setItemError("");
    //   }
    //   if (!currentItem.quantity) {
    //     setQuantityError("Required");
    //     isValidData = false;
    //   } else {
    //     setQuantityError("");
    //   }
    //   if (!currentItem.unit) {
    //     setUnitError("Required");
    //     isValidData = false;
    //   } else {
    //     setUnitError("");
    //   }
    //   setAddSamagriError("Please Click on Add Button.");
    // } else {
    //   setAddSamagriError("");
    // }

    const newErrors = errors.map((error, index) => {
      const currentItem = items[index];
      let itemError = { item: "", quantity: "", unit: "" };

      if (!currentItem.item) {
        itemError.item = "Required";
        isValidData = false;
      }

      if (!currentItem.quantity) {
        itemError.quantity = "Required";
        isValidData = false;
      }

      if (!currentItem.unit) {
        itemError.unit = "Required";
        isValidData = false;
      }

      return itemError;
    });
    setErrors(newErrors);

    return isValidData;
  };

  // console.log("nnnmmmmbbb", { rData });

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        const formData = new FormData();

        formData.append("title", rData === null ? samagri : rData?.ceremony?.name);
        formData.append("event_id", eventSelect);
        formData.append("ceremony_id", ceremonyName?.value);
        // formData.append("date", toUTCUnixTimestamp(ceremonyDate));

        formData.append("description", notes);

        if (user) {
          formData.append("user_id", user?.value);
        }
        if (handoverDate) {
          formData.append("hand_over_date", toUTCUnixTimestamp(handoverDate));
        }

        // Append each item individually, including the img file if it exists
        items.forEach((item, index) => {
          formData.append(`items[${index}][name]`, item.item);
          formData.append(`items[${index}][qty]`, item.quantity);
          formData.append(`items[${index}][unit]`, item.unit);

          // Add status if updating (when data is not null)
          if (data !== null) {
            formData.append(`items[${index}][status]`, item.purchase === true ? 1 : 0);
          }

          // Add img file if available
          if (item.img) {
            formData.append(`items[${index}][image]`, item.img);
          }
        });
        if (rData !== null) {
          formData.append("recommended_trending_type", "recommended");
          formData.append("recommended_trending_id", rData?.id);
        }

        // Now `formData` is ready to send in your API request

        const response = data === null ? await ApiServices.samagri.addSamagri(formData) : await ApiServices.samagri.updateSamagri(data?.id, formData);

        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          setModalData(null);
          clearAllData();
          rData !== null ? navigate(SAMAGRI) : "";
          refreshData();
          openSuccessModal({
            title: t("message.success"),
            message: data === null ? t("samagri.samagriAddedSuccess") : t("samagri.samagriUpdatedSucess"),
            onClickDone: closeSuccessModel,
          });
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setMessage(err?.response?.data?.message);
        setBtnLoading(false);
      }
    } else {
    }
  };

  // Clear States
  const clearAllData = () => {
    setNotes("");
    // setItems([]);
    setSamagri("");
    // setItemError("");
    setEventError("");
    // setUnitError("");
    setMessage("");
    setCeremonyDate();
    setNotesError("");
    setCeremonyName(null);
    setSamagriError("");
    // setQuantityError("");
    setEvent(null);
    setCeremonyDateError("");
    setCeremonyNameError("");
    // setCurrentItem({ item: "", quantity: "", unit: "" });
    setItems([{ item: "", type: "", quantity: "", description: "", purchase: "" }]);
    setErrors([{ item: "", type: "", quantity: "", description: "" }]);
    setUser("");
    setAddSamagriError("");
    setHandoverDate("");
  };

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setModalData(null);
    setBtnLoading(false);
  };

  // console.log({ data });

  // Use Effects
  useEffect(() => {
    if (data !== null) {
      setSamagri(data?.title);
      setEvent({ label: data?.event?.name, value: data?.event?.id });
      setCeremonyName({ label: data?.ceremony?.name, value: data?.ceremony?.id });
      setCeremonyDate(new Date(data?.created_at_unix * 1000));
      setNotes(data?.description);
      const items = data?.items || [];
      const currentItem = items.map((item) => ({
        item: item.name,
        quantity: item.qty,
        unit: item.unit,
        img: item.image,
        purchase: item.status,
      }));
      setItems(currentItem);
      setUser(data?.contact?.first_name ? { label: data?.contact?.first_name + " " + data?.contact?.last_name, value: data?.contact?.uuid } : "");
      setHandoverDate(data?.hand_over_date ? moment.unix(data?.hand_over_date).format("YYYY-MM-DD HH:mm") : "");
    }
  }, [isOpen]);

  useEffect(() => {
    if (rData !== null) {
      const items = rData?.items || [];
      const currentItem = items.map((item) => ({
        item: item.name,
        quantity: item.qty,
        unit: item.unit,
        img: item.image,
        purchase: item.status,
      }));
      setItems(currentItem);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      getUsers();
      getCeremonies();
    }
  }, [isOpen]);

  // Function to handle file input change
  const handleInputChange = (e, index, field) => {
    const value = field === "purchase" ? e : e.target.value;
    const updatedItems = items.map((item, idx) => (idx === index ? { ...item, [field]: value } : item));
    setItems(updatedItems);

    const updatedErrors = errors.map((error, idx) => (idx === index ? { ...error, [field]: "" } : error));
    setErrors(updatedErrors);
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const updatedItems = items.map((item, idx) => (idx === index ? { ...item, img: file, imgPreview: URL.createObjectURL(file) } : item));
      setItems(updatedItems);
    }
  };

  // console.log({ samagri, a: user?.value, handoverDate });


const handleFile = async (file) => {
  if (!file) return;

  //setLoading(true);
  //setText("");

  const ext = file.name.split(".").pop().toLowerCase();
  //console.log(ext);
  try {
      if (["jpg", "jpeg", "png"].includes(ext)) {
        const result = await Tesseract.recognize(file, "eng");
        const jsonData = convertMenuPdfTextToJson(result.data.text);
        setItems(jsonData);
      } else if (ext === "pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({
          data: arrayBuffer,
        }).promise;
        let pdfText = "";
        
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          pdfText += content.items
            .map(item => item.str)
            .join(" ")
            .replace(/\s+/g, " ")
            + "\n";
        }
        const menuJson = convertMenuPdfTextToJson(pdfText);
        // console.log(menuJson);
        setItems(menuJson);
      } else if (["xls", "xlsx"].includes(ext)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Map the Excel data to your items structure
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        const newItems = jsonData.map((row, index) => {
          return {
            item: row.Item,
            quantity: row.Quantity,
            unit: row.Units,
            img: null,
            purchase: '',
          };
        });

        // Update state with the new items
        if (newItems.length > 0) {
          setItems(newItems);
          console.log("Imported items:", newItems);
        } else {
          console.warn("No valid data found in the Excel file");
        }

      } else if (["doc", "docx"].includes(ext)) {
        // console.log(ext);
        const data = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: data });
        // setText(result.value);
        const jsonData = convertMenuPdfTextToJson(result.value);
        setItems(jsonData);
      } else {
      alert("Unsupported file type");
      }
  } catch (err) {
      //console.error(err);
      alert("Failed to read file");
  } finally {
      //setLoading(false);
  }
};
const convertMenuPdfTextToJson = (text) => {
  if (!text) return [];

  // Normalize spacing
  const tokens = text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");

  // Remove header tokens
  const cleanTokens = tokens.filter(
    t => !/^(item|quantity|units)$/i.test(t)
  );

  const result = [];
  let i = 0;

  while (i < cleanTokens.length) {
    const item = cleanTokens[i]; // Item name
    const quantity = Number(cleanTokens[i + 1]); // Quantity
    const unit = cleanTokens[i + 2]; // Unit

    if (!item || isNaN(quantity) || !unit) break;

    result.push({
      item,
      quantity,
      unit,
      img: null,
      purchase: ""
    });

    i += 3; // move to next row
  }

  return result;
};



/* ================= DROPZONE ================= */
const [selectedFilePath, setSelectedFilePath] = useState(null);
const [selectedFilePathError, setSelectedFilePathError] = useState(null);
const onDrop = useCallback((acceptedFiles) => {
  if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFilePath(file);
      setSelectedFilePathError(null);

      // 🔥 OCR / PDF / Excel / Word processing
      handleFile(file);
  }
}, []);
const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  },
  multiple: false,
});

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
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-75"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-75"
              >
                <Dialog.Panel className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="mb-10 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? t("samagri.addNewSamagri") : t("samagri.updateSamagri")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className=" h-[600px] overflow-y-auto p-2 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[610px]">
                      <div className="grid grid-cols-1 gap-5">
                        <Input
                          isRequired
                          label={t("samagri.samagriFor")}
                          placeholder="Ceremony for Occasion or Activity"
                          value={rData === null ? samagri : rData?.ceremony?.name}
                          error={samagriError}
                          onChange={(e) => {
                            setSamagri(e.target.value);
                            setSamagriError("");
                          }}
                          disabled={rData === null && data?.recommend_trending_ceremony === "recommended" ? true : false}
                        />
                      

                        <Dropdown
                          title={t("samagri.ceremonyName")}
                          placeholder="Select Ceremony"
                          value={ceremonyName}
                          withError={ceremonyNameError}
                          options={allCeremonies}
                          onChange={(e) => {
                            setCeremonyName(e);
                            setCeremonyNameError("");
                          }}
                          isRequired
                        />

                        <Dropdown
                          title={t("samagri.handoverName")}
                          placeholder={t("samagri.handoverName")}
                          options={allUsers}
                          value={user}
                          onChange={(e) => {
                            setUser(e);
                          }}
                        />

                       

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("samagri.handoverDate")}
                          placeholder="Select Start Date & Time"
                          value={handoverDate ? handoverDate : ""}
                          error={ceremonyDateError}
                          onChange={(e) => {
                            setHandoverDate(e.target.value);
                            setCeremonyDateError("");
                          }}
                         
                        />

                        <div className="ltr:text-left rtl:text-right">
                          <div className="label">Samagri Items</div>
                          <div className="w-full flex items-start gap-4">
                            {/* Upload box */}
                            <div
                              {...getRootProps()}
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer mt-5 max-w-xl flex-1"
                            >
                              <input {...getInputProps()} />

                              {isDragActive ? (
                                <p className="text-sm text-blue-500">Drop the file here...</p>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  Drag & drop file here, or click to browse
                                </p>
                              )}

                              {itemFile && (
                                <div className="flex justify-between items-center mt-2">
                                  <p className="text-xs text-green-600">
                                    Selected File: {itemFile.name}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setItemFile(null);
                                    }}
                                    className="text-red-500 text-xs ml-2"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Download button */}
                            <div className="mt-8 flex justify-end items-center">
                              <Button
                                type="button"
                                onClick={downloadFile}
                                title={t("menu.downloadSampleFile")}
                              />
                            </div>
                          </div>

                          <div>
                            {items.map((item, index) => (
                              <div key={index} className="mb-2 mt-3 flex w-full flex-wrap items-center gap-y-3 space-x-2">
                                <Input
                                  placeholder={t("samagri.item")}
                                  label={`${index === 0 ? t("samagri.item") : ""}`}
                                  error={errors[index]?.item}
                                  labelOnTop
                                  value={item?.item}
                                  onChange={(e) => handleInputChange(e, index, "item")}
                                  isRequired={index === 0 ? true : false}
                                />
                                <Input
                                  placeholder={t("samagri.quantity")}
                                  label={`${index === 0 ? t("samagri.quantity") : ""}`}
                                  labelOnTop
                                  type="number"
                                  error={errors[index]?.quantity}
                                  value={item?.quantity}
                                  onChange={(e) => handleInputChange(e, index, "quantity")}
                                  isRequired={index === 0 ? true : false}
                                />
                                <Input
                                  placeholder={t("samagri.units")}
                                  label={`${index === 0 ? t("samagri.units") : ""}`}
                                  labelOnTop
                                  error={errors[index]?.unit}
                                  value={item?.unit}
                                  onChange={(e) => handleInputChange(e, index, "unit")}
                                  isRequired={index === 0 ? true : false}
                                />

                                <div className="relative mt-8 flex h-12 items-center justify-between gap-x-1 rounded-10 border border-dashed p-2">
                                  <label
                                    for={`fileInput-${index}`}
                                    className="bg-secondary-color-400 text-8 w-20 cursor-pointer rounded-md border border-secondary p-2 text-center font-medium text-secondary md:text-10 lg:w-24"
                                  >
                                    Choose Image
                                  </label>
                                  <input type="file" onChange={(e) => handleFileChange(e, index)} hidden id={`fileInput-${index}`} />
                                </div>
                                <div>
                                  {(item.imgPreview || item.img) && (
                                    <img
                                      src={item?.imgPreview ? item?.imgPreview : mediaUrl + item?.img}
                                      alt="Preview"
                                      className="h-24 w-24 rounded-xl object-cover"
                                    />
                                  )}
                                </div>

                                {data !== null && (
                                  <div className="relative text-left">
                                    {/* <div className="mb-2">{index === 0 ? <p className="label">Purchase </p> : ""}</div> */}
                                    {/* <div className={`${index === 0 ? "mt-7" : ""}`}> */}
                                    <Switch
                                      checked={item?.purchase}
                                      onChange={(e) => handleInputChange(e, index, "purchase")}
                                      className={`group relative flex h-6 w-12 cursor-pointer rounded-full ${item?.purchase ? "bg-green-500" : "bg-black/30"} p-1 transition-colors duration-200 ease-in-out`}
                                    >
                                      <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${item?.purchase ? "translate-x-6" : "translate-x-0"}`}
                                      />
                                    </Switch>
                                  </div>
                                  // </div>
                                )}
                                {index > 0 && (
                                  <MinusCircleIcon
                                    className="ml-1.5 inline-block h-10 w-10 mt-7 cursor-pointer text-red-500"
                                    onClick={() => handleDeleteItem(index)}
                                  />
                                )}
                              </div>
                            ))}

                            <button className="mt-4 rounded-lg bg-secondary px-4 py-2 text-white" onClick={addNewFieldSet}>
                              Add another
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mb-5 mt-5 text-left ">
                        <div>
                          <h2 className="label mb-2 text-secondary">{t("headings.otherInfo")}</h2>
                          {/* <div className="rounded-full border-[1.5px] border-solid border-secondary"></div> */}
                        </div>
                      </div>
                      <div>
                        <Input
                          label="Notes"
                          placeholder="Notes"
                          error={notesError}
                          textarea
                          value={notes}
                          onChange={(e) => {
                            setNotes(e.target.value);
                            setNotesError("");
                          }}
                          // isRequired
                        />
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <p className="text-sm text-red-500">{message}</p>
                    </div>
                    <div className="mx-auto mt-10 grid w-8/12 grid-cols-2 gap-7">
                      <Button
                        icon={<CheckIcon />}
                        title={data === null ? t("samagri.addNewSamagri") : t("samagri.updateSamagri")}
                        loading={btnLoading}
                        type="submit"
                      />
                      <Button icon={<XMarkIcon />} title={t("buttons.cancel")} type="button" buttonColor="bg-red-500" onClick={closeModal} />
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

export default AddSamagriModal;
