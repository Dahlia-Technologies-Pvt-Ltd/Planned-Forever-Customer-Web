import React from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ApiServices from "../../api/services";
import { Fragment, useState, useEffect, useCallback} from "react";
import { Dialog, Transition } from "@headlessui/react";
import DateAndTime from "../../components/common/DateAndTime";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { ArrowUpCircleIcon, MinusCircleIcon, PencilIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import ChooseFile from "../../components/common/ChooseFile";
import { useThemeContext } from "../../context/GlobalContext";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import moment from "moment";
import { mediaUrl } from "../../utilities/config";
import Dropdown from "../../components/common/Dropdown";
import Spinner from "../../components/common/Spinner";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import { useDropzone } from "react-dropzone";
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const AddMenuModal = ({ label, isOpen, setIsOpen, refreshData, data, setModalData, preselectedItems }) => {
  const { t } = useTranslation("common");

  // Context
  const {
    eventDetail,
    eventSelect,
    setBtnLoading,
    btnLoading,
    openSuccessModal,
    closeSuccessModel,
    allCeremonies,
    allEvents,
    getEventList,
    selectedEventRights,
  } = useThemeContext();

  const [date, setDate] = useState(null);
  const [file, setFile] = useState(null);
  const [event, setEvent] = useState(null);
  const [menuNote, setMenuNote] = useState("");
  const [endTime, setEndTime] = useState(null);
  const [menuFile, setMenuFile] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [sessionName, setSessionName] = useState("");
  const [items, setItems] = useState([{ item: "", type: "", quantity: "", description: "", img: null, id: "" }]);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");
  const [eventError, setEventError] = useState("");
  const [endTimeError, setEndTimeError] = useState("");
  const [menuFileError, setMenuFileError] = useState("");
  const [menuNoteError, setMenuNoteError] = useState("");
  const [startTimeError, setStartTimeError] = useState("");
  const [sessionNameError, setSessionNameError] = useState("");
  const [errors, setErrors] = useState([{ item: "", type: "", quantity: "", description: "", id: "", img: null }]);
  const [itemFile, setItemFile] = useState(null);

  // States for Suggested Menu
  const [allRecCeremonies, setAllRecCeremonies] = useState([]);
  const [recCeremony, setRecCeremony] = useState("");
  const [recCeremonyError, setRecCeremonyError] = useState("");
  const [suggestedMenu, setSuggestedMenu] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);

  // State for Trending Menu
  const [trendingMenu, setTrendingMenu] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  const [selectedFilePath, setSelectedFilePath] = useState(null);
  const [selectedFilePathError, setSelectedFilePathError] = useState(null);

  const handleInputChange = (e, index, field) => {
    setItems((prevItems) => {
      return prevItems.map((item, idx) => {
        if (idx === index) {
          return { ...item, [field]: e.target.value };
        }
        return item;
      });
    });

    setErrors((prevErrors) => {
      return prevErrors.map((error, idx) => {
        if (idx === index) {
          return { ...error, [field]: "" };
        }
        return error;
      });
    });
  };

  const addNewFieldSet = (e) => {
    e.preventDefault();
    let isValid = true;

    const newErrors = items.map((currentItem) => {
      let itemError = { item: "", type: "", quantity: "", description: "", id: "", img: null };

      if (!currentItem.item) {
        itemError.item = "Required";
        isValid = false;
      }

      if (!currentItem.type) {
        itemError.type = "Required";
        isValid = false;
      }

      if (!currentItem.quantity) {
        itemError.quantity = "Required";
        isValid = false;
      }

      if (!currentItem.description) {
        itemError.description = "Required";
        isValid = false;
      }

      return itemError;
    });

    setErrors(newErrors);

    if (isValid) {
      setItems([...items, { item: "", type: "", quantity: "", description: "", img: null, id: "" }]);
      setErrors([...errors, { item: "", type: "", quantity: "", description: "" }]);
    }
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    const updatedErrors = errors.filter((_, idx) => idx !== index);
    setItems(updatedItems);
    setErrors(updatedErrors);
  };

  const [fileError, setFileError] = useState("");

  const isValidForm = () => {
    let isValidData = true;

    // Check date field
    if (!date) {
      setDateError("Required");
      isValidData = false;
    } else {
      setDateError("");
    }

    // Check end time field
    if (!endTime) {
      setEndTimeError("Required");
      isValidData = false;
    } else {
      setEndTimeError("");
    }

    // Check start time field
    if (!startTime) {
      setStartTimeError("Required");
      isValidData = false;
    } else {
      setStartTimeError("");
    }

    // Check session name field
    if (!sessionName) {
      setSessionNameError("Required");
      isValidData = false;
    } else {
      setSessionNameError("");
    }

    if (itemFile) {
      // If itemFile exists, clear errors or skip validation
      setErrors([]); // Clear previous errors (optional based on your use case)
    } else {
      const newErrors = items.map((currentItem, index) => {
        let itemError = { item: "", type: "", quantity: "", description: "", id: "", img: null };

        if (!currentItem?.item) {
          itemError.item = "Required";
          isValidData = false;
        }

        if (!currentItem?.type) {
          itemError.type = "Required";
          isValidData = false;
        }

        if (!currentItem?.quantity) {
          itemError.quantity = "Required";
          isValidData = false;
        }

        if (!currentItem?.description) {
          itemError.description = "Required";
          isValidData = false;
        }

        return itemError;
      });

      // Update the errors state with the new errors for each item
      setErrors(newErrors);
    }

    return isValidData;
  };

  const handleImageChange = (e) => {
    // Get the new files from the input
    const newFiles = Array.from(e.target.files);

    // Use the setMenuFile function to update the state
    setMenuFile((prevFiles) => [...(prevFiles || []), ...newFiles]);
  };

  const handleFileChangeMenu = (e) => {
    const file = e.target.files[0];
    setItemFile(file);
    if (file) {
      processExcelFile(file);
    }
  };

  const processExcelFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Assuming the first sheet contains the data
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Map the Excel data to your items structure
      const newItems = jsonData.map((row, index) => {
        return {
          item: row.name || row.item || "",
          type: row.type || "",
          quantity: row.qty || row.quantity || "",
          description: row.notes || row.description || "",
          img: null,
          id: "",
        };
      });

      // Update state with the new items
      if (newItems.length > 0) {
        setItems(newItems);
        console.log("Imported items:", newItems);
      } else {
        console.warn("No valid data found in the Excel file");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        let payload = {
          date: toUTCUnixTimestamp(date),
          session: sessionName,
          start_time: startTime,
          end_time: endTime,
          notes: menuNote,
          event_id: event?.value,
          menu_items_file: itemFile,

          menu_items: items.map((item) => ({
            name: item.item,
            type: item.type,
            qty: item.quantity,
            notes: item.description,
            image: item?.img,
            id: item?.id,
          })),
        };

        let formData = new FormData();
        formData.append("date", payload.date);
        formData.append("session", payload.session);
        formData.append("start_time", payload.start_time);
        formData.append("end_time", payload.end_time);
        formData.append("notes", payload.notes);
        formData.append("event_id", eventSelect);

        if (payload.menu_items_file) {
          formData.append("menu_items_file", payload.menu_items_file);
        }

        payload.menu_items.forEach((item, index) => {
          formData.append(`menu_items[${index}][name]`, item.name);
          formData.append(`menu_items[${index}][type]`, item.type);
          formData.append(`menu_items[${index}][qty]`, item.qty);
          formData.append(`menu_items[${index}][notes]`, item.notes);
          if (item?.image) {
            formData.append(`menu_items[${index}][image]`, item?.image);
          }
          if (item?.id !== "") {
            formData.append(`menu_items[${index}][menu_item_id]`, item?.id);
            
            // Determine if it's from suggested menu or trending menu
            const isSuggestedItem = suggestedMenu.some(sugItem => sugItem.id === item.id);
            const isTrendingItem = trendingMenu.some(trendItem => trendItem.id === item.id);
            
            const type = isSuggestedItem ? "recommended" : isTrendingItem ? "trending" : "trending";
            formData.append(`menu_items[${index}][recommended_trending_type]`, type);
          }
        });

        const response = data === null ? await ApiServices.menu.addMenu(formData) : await ApiServices.menu.updateMenu(data?.id, formData);

        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          setModalData(null);
          clearAllData();
          refreshData();
          openSuccessModal({
            title: t("message.success"),
            message: data === null ? t("menu.menuAddedSuccess") : t("menu.menuUpdatedSuccess"),
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
      // Handle form validation error
    }
  };

  // Clear States
  const clearAllData = () => {
    setFile(null);
    setDate(null);
    setMenuNote("");
    setEndTime(null);
    setMenuFile(null);
    setStartTime(null);
    setSessionName("");
    setItems([{ item: "", type: "", quantity: "", description: "", id: "", img: null }]);
    setErrors([{ item: "", type: "", quantity: "", description: "" }]);
    setItemFile(null);
    setFileError("");
    setRecCeremony(null);
    setSuggestedMenu([]);
    setTrendingMenu([]);
    setDateError("");
    setEndTimeError("");
    setMenuFileError("");
    setMenuNoteError("");
    setStartTimeError("");
    setSessionNameError("");
  };

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setModalData(null);
    setBtnLoading(false);
  };

  // Get trending menu items
  const getTrendingMenuItems = async () => {
    setTrendingLoading(true);
    try {
      // Call API to get all trending menu items
      const res = await ApiServices.menu.getTrendingMenus({
        records_no: 100, // Get a large number of records to ensure we have all items
        status: "trending",
      });
      
      if (res.data.code === 200) {
        setTrendingMenu(res.data.data.data);
      }
    } catch (err) {
      console.error("Error fetching trending menu items:", err);
    } finally {
      setTrendingLoading(false);
    }
  };

  // Use Effects
  useEffect(() => {
    if (isOpen) {
      // Get trending menu items whenever modal opens
      getTrendingMenuItems();
      getRecCeremonies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (data !== null) {
      setDate(moment.unix(data?.date).format("YYYY-MM-DD"));
      setEvent({ label: data?.event?.name, value: data?.event?.id });
      setSessionName(data?.session);
      setStartTime(data?.start_time || null);
      setEndTime(data?.end_time || null);
      setMenuFile(data?.image);
      setFile(data?.image);
      setMenuNote(data?.notes);
      const items = data?.menu_items || [];
      const currentItem = items.map((item) => ({
        item: item.name,
        type: item.type,
        quantity: item.qty,
        description: item.notes,
        img: item?.image,
        id: item?.menu_item_id ? item?.menu_item_id : "",
      }));
      setItems(currentItem);
    }
  }, [isOpen, data]);

  // Effect to handle preselected items from trending menu
  useEffect(() => {
    if (isOpen && preselectedItems && preselectedItems.length > 0) {
      setItems(preselectedItems);
      setErrors(Array(preselectedItems.length).fill({ item: "", type: "", quantity: "", description: "", id: "", img: null }));
    }
  }, [isOpen, preselectedItems]);

  const handleFileChange = (e, index) => {
    const newFile = e.target.files[0];
    const updatedItems = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, img: newFile };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleRemoveFile = (index) => {
    const updatedItems = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, img: null };
      }
      return item;
    });
    setItems(updatedItems);
  };

  // Suggested Menu Functions
  const getRecCeremonies = async () => {
    const payload = {
      status: "recommended",
        wedding_type_id: eventDetail?.wedding_types?.map((item) => item?.id),
    };
    try {
      const res = await ApiServices.ceremonies.getCeremonies(payload);
      const { data, message } = res;
      if (data.code === 200) {
        const formattedCeremonies = data?.data?.map((ceremony) => ({
          value: ceremony.id,
          label: ceremony.name,
        }));
        setAllRecCeremonies(formattedCeremonies);
      }
    } catch (err) {}
  };

  const getCeremonyMenuItem = async (recCeremony) => {
    const payload = {
      ceremony_id: recCeremony?.value,
    };
    setSuggestedLoading(true);
    try {
      const res = await ApiServices.menu.getCeremonyMenus(payload);
      const { data, message } = res;
      if (data.code === 200) {
        setSuggestedMenu(data?.data?.data);
        setSuggestedLoading(false);
      }
    } catch (err) {
      setSuggestedLoading(false);
    } finally {
      setSuggestedLoading(false);
    }
  };

  useEffect(() => {
    if (recCeremony) {
      getCeremonyMenuItem(recCeremony);
    }
  }, [recCeremony]);

  // Handle checkbox click for suggested or trending items
  const handleCheckboxClick = (item, source) => {
    // Check if this item is already in the menu items
    const existingItemIndex = items.findIndex(menuItem => menuItem.id === item.id);
    
    if (existingItemIndex !== -1) {
      // Item exists, remove it
      const updatedItems = items.filter(menuItem => menuItem.id !== item.id);
      setItems(updatedItems);
      
      // If we've removed all items, add an empty one
      if (updatedItems.length === 0) {
        setItems([{ item: "", type: "", quantity: "", description: "", img: null, id: "" }]);
      }
      
      // Update errors array to match items length
      setErrors(Array(Math.max(updatedItems.length, 1)).fill({ 
        item: "", type: "", quantity: "", description: "", id: "", img: null 
      }));
    } else {
      // Item doesn't exist, add it
      const newItem = {
        item: item.name,
        type: source === "trending" ? item.menu_type?.name || "" : "",
        quantity: "",
        description: item.notes || "",
        img: item.image,
        id: item.id
      };
      
      // Check if there's an empty item we can replace
      const emptyItemIndex = items.findIndex(
        menuItem => menuItem.item === "" && menuItem.type === "" && menuItem.quantity === "" && 
               menuItem.description === "" && menuItem.id === "" && menuItem.img === null
      );
      
      if (emptyItemIndex !== -1 && items.length === 1) {
        // Replace the empty item
        const updatedItems = [...items];
        updatedItems[emptyItemIndex] = newItem;
        setItems(updatedItems);
      } else {
        // Add as a new item
        setItems([...items, newItem]);
      }
      
      // Update errors array
      setErrors(Array(items.length + (emptyItemIndex === -1 ? 1 : 0)).fill({
        item: "", type: "", quantity: "", description: "", id: "", img: null
      }));
    }
  };

  const downloadFile = () => {
    const fileId = "1736237139.MenuItemsImport.xlsx";
    window.location.href = `${mediaUrl + fileId}`;
  };
  /* ================= DROPZONE ================= */
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

  const handleFile = async (file) => {
      if (!file) return;
  
      //setLoading(true);
      //setText("");
  
      const ext = file.name.split(".").pop().toLowerCase();
      //console.log(ext);
      try {
          if (["jpg", "jpeg", "png"].includes(ext)) {
            const result = await Tesseract.recognize(file, "eng");
            // console.log(result.data.text);
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
            console.log(menuJson);
            setItems(menuJson);
          } else if (["xls", "xlsx"].includes(ext)) {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Map the Excel data to your items structure
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            // console.log(jsonData);
            const newItems = jsonData.map((row, index) => {
              return {
                item: row.name || row.item || "",
                type: row.type || "",
                quantity: row.qty || row.quantity || "",
                description: row.notes || row.description || "",
                img: null,
                id: "",
              };
            });
            // console.log(newItems);

            // Update state with the new items
            if (newItems.length > 0) {
              setItems(newItems);
              console.log("Imported items:", newItems);
            } else {
              console.warn("No valid data found in the Excel file");
            }
  
          } else if (["doc", "docx"].includes(ext)) {
            console.log(ext);
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
  // Normalize spacing
  const tokens = text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");

  const result = [];
  let i = 0;

  while (i < tokens.length) {
    let nameTokens = [];
    let notesTokens = [];
    let qty = null;
    let type = "";
    let img = null;
    let id = "";

    // 1️⃣ NAME (until we hit a number)
    while (i < tokens.length && !/^\d+$/.test(tokens[i])) {
      nameTokens.push(tokens[i]);
      i++;
    }

    // Fix broken name (P izza → Pizza)
    let name = nameTokens.join("").replace(/([a-z])([A-Z])/g, "$1 $2");

    // 2️⃣ QUANTITY
    if (i < tokens.length && /^\d+$/.test(tokens[i])) {
      qty = Number(tokens[i]);
      i++;
    }

    // 3️⃣ NOTES (until Food / Drink)
    while (i < tokens.length && !/^(Food|Drink)$/i.test(tokens[i])) {
      notesTokens.push(tokens[i]);
      i++;
    }

    // Fix broken notes (Chee se → Cheese, Cold D rink → Cold Drink)
    let notes = notesTokens.join(" ").replace(/\s+/g, " ");

    // 4️⃣ TYPE
    if (i < tokens.length && /^(Food|Drink)$/i.test(tokens[i])) {
      type = tokens[i];
      i++;
    }
    //  item: row.name || row.item || "",
    // type: row.type || "",
    // quantity: row.qty || row.quantity || "",
    // description: row.notes || row.description || "",
    // img: null,
    // id: "",
    result.push({
      item: name.charAt(0).toUpperCase() + name.slice(1),
      quantity: qty,
      description: notes,
      type: type,
      img: null,
      id: ""
    });
  }

  return result;
};
const gridCols = "grid grid-cols-[2fr_1fr_1fr_2fr_2fr_40px] gap-3 items-center";
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
                <Dialog.Panel className="w-full overflow-hidden rounded-xxl bg-white p-8 shadow-xl transition-all md:max-w-7xl xl:max-w-9xl">
                  <div className="mb-5 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? t("menu.addMenu") : t("menu.updateMenu")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form>
                    <div className="h-[750px] overflow-y-auto p-2 md:h-[550px] lg:h-[550px] xl:h-[650px] 2xl:h-[750px]">
                      <div className="mb-5 ltr:text-left rtl:text-right">
                        <div>
                          <div className="label mb-2 text-secondary">{t("headings.basicInfo")}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-7">
                        <Input
                          isRequired
                          type="date"
                          label={t("menu.date")}
                          error={dateError}
                          placeholder="Date"
                          value={date}
                          onChange={(e) => {
                            setDate(e.target.value);
                            setDateError("");
                          }}
                          min={moment.unix(eventDetail?.start_date).format("YYYY-MM-DD")}
                          max={moment.unix(eventDetail?.end_date).format("YYYY-MM-DD")}
                        />

                        <Input
                          isRequired
                          label={t("menu.session_name")}
                          error={sessionNameError}
                          placeholder="Session"
                          value={sessionName}
                          onChange={(e) => {
                            setSessionName(e.target.value);
                            setSessionNameError("");
                          }}
                        />
                        <Input
                          isRequired
                          type="time"
                          label={t("menu.start_time")}
                          placeholder="Start Time"
                          value={startTime}
                          error={startTimeError}
                          onChange={(e) => {
                            setStartTime(e.target.value);
                            setStartTimeError("");
                          }}
                        />
                        <Input
                          isRequired
                          type="time"
                          label={t("menu.end_time")}
                          placeholder="End Time"
                          value={endTime}
                          error={endTimeError}
                          onChange={(e) => {
                            setEndTime(e.target.value);
                            setEndTimeError("");
                          }}
                        />
                      </div>

                      {/* Trending Menu Section */}
                      {/* {selectedEventRights?.rights?.includes("Trending Menu Items") && (
                        <div className="mt-3 text-left">
                          <p className="label mt-4 text-green-800 ltr:text-left rtl:text-right">{t("menu.trending_menu")}</p>
                          
                          <p className="label my-4 text-green-800 ltr:text-left rtl:text-right">
                            {t("menu.trendingMenuItems")} <span className="text-xs text-gray-600">(Select to add to menu)</span>
                          </p>

                          {trendingLoading ? (
                            <div className="flex items-center justify-center">
                              <Spinner />
                            </div>
                          ) : (
                            <>
                              {trendingMenu.length > 0 ? (
                                trendingMenu.map((item, index) => (
                                  <div key={index} className="mb-2 flex w-full items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      onChange={() => handleCheckboxClick(item, "trending")}
                                      checked={items.some(i => i.id === item.id)}
                                    />
                                    <Input placeholder="Item" labelOnTop value={item.name} disabled />
                                    {item.image ? (
                                      <img src={`${mediaUrl}${item.image}`} alt="image" className="h-24 w-24 rounded-10 object-cover" />
                                    ) : (
                                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">-</p>
                                    )}{" "}
                                    <div className="w-full">
                                      <Input textarea rows={3} className="w-full" value={item?.notes} disabled />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="flex justify-center text-gray-400">No Trending Items Found</p>
                              )}
                            </>
                          )}
                        </div>
                      )} */}

                      {/* Suggested Menu Section */}
                      {selectedEventRights?.rights?.includes("Suggested Menu") && (
                        <div className="mt-3 text-left">
                          <p className="label mt-4 text-green-800 ltr:text-left rtl:text-right">{t("menu.suggestedMenu")}</p>
                          <div className="mt-4">
                            <Dropdown
                              isRequired
                              title={t("menu.recommendedCeremony")}
                              placeholder="Ceremony for Occasion or Activity"
                              options={allRecCeremonies}
                              withError={recCeremonyError}
                              value={recCeremony}
                              onChange={(e) => {
                                setRecCeremony(e);
                                setRecCeremonyError("");
                              }}
                            />
                            <p className="label my-4 text-green-800 ltr:text-left rtl:text-right">
                              {t("menu.suggestedMenuItems")} <span className="text-xs text-gray-600">(Select to add to menu)</span>
                            </p>

                            {suggestedLoading ? (
                              <div className="flex items-center justify-center">
                                <Spinner />
                              </div>
                            ) : (
                              <>
                                {suggestedMenu.length > 0 ? (
                                  suggestedMenu.map((item, index) => (
                                    <div key={index} className="mb-2 flex w-full items-center space-x-3">
                                      <input
                                        type="checkbox"
                                        onChange={() => handleCheckboxClick(item, "suggested")}
                                        checked={items.some(i => i.id === item.id)}
                                      />
                                      <Input placeholder="Item" labelOnTop value={item.name} disabled />
                                      {item.image ? (
                                        <img src={`${mediaUrl}${item.image}`} alt="image" className="h-24 w-24 rounded-10 object-cover" />
                                      ) : (
                                        <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">-</p>
                                      )}{" "}
                                      <div className="w-full">
                                        <Input textarea rows={3} className="w-full " value={item?.notes} disabled />
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="flex justify-center text-gray-400">No Item Found</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="my-5 ltr:text-left rtl:text-right">
                        <div className="label mb-2">{t("menu.menuItemsFile")}</div>
                        <div className="w-6/12">
                          {/* <ChooseFile
                            label="Menu File"
                            placeholderText="Choose File"
                            accept=".xlsx,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            uni="imageInput3"
                            onChange={handleFileChangeMenu}
                            selectedFile={itemFile}
                            onClickCross={() => setItemFile(null)}
                          /> */}
                          <div
                              {...getRootProps()}
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer mt-5"
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

                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Button type="button" onClick={downloadFile} title={t("menu.downloadSampleFile")}></Button>
                      </div>

                      {fileError && <span className="mt-5 block text-xs text-red-500"> {fileError}</span>}

                      <div className="mt-3 ltr:text-left rtl:text-right">
                        <div className="label ">{t("menu.menuItems")}</div>

                        <div>
                          <div className={`${gridCols} mb-2 mt-3 font-semibold text-sm text-gray-700`}>
                              <div>Item<span className="text-red-500">*</span></div>
                              <div>Type</div>
                              <div>Quantity<span className="text-red-500">*</span></div>
                              <div>Description</div>
                              <div>Image</div>
                          </div>
                          {items.map((item, index) => (
                            <div key={index} className={`${gridCols} mb-2`}>
                              <Input
                                placeholder="Item"
                                error={!!item.id ? "" : itemFile ? false : errors[index]?.item}
                                labelOnTop
                                value={item?.item}
                                onChange={(e) => handleInputChange(e, index, "item")}
                                disabled={!!item.id}
                              />
                              <Input
                                placeholder="Type"
                                error={itemFile ? false : errors[index]?.type}
                                labelOnTop
                                value={item?.type}
                                onChange={(e) => handleInputChange(e, index, "type")}
                              />
                              <Input
                                placeholder="Quantity"
                                labelOnTop
                                type="text"
                                error={itemFile ? false : errors[index]?.quantity}
                                value={item?.quantity}
                                onChange={(e) => handleInputChange(e, index, "quantity")}
                              />
                              <Input
                                placeholder="Description"
                                labelOnTop
                                error={itemFile ? false : errors[index]?.description}
                                value={item?.description}
                                onChange={(e) => handleInputChange(e, index, "description")}
                                textarea
                                rows="1"
                                
                              />
                              {item?.id === "" ? (
                                <>
                                  <ChooseFile
                                    placeholderText="Choose Image"
                                    selectedFile={item?.img}
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={(e) => handleFileChange(e, index)}
                                    onClickCross={() => handleRemoveFile(index)}
                                    uni={`fileInput-${index}`}
                                    noText
                                    style
                                    width = "w-40"
                                  />
                                </>
                              ) : (
                                <>
                                  {item?.img ? (
                                    <img src={mediaUrl + item?.img} alt="image" className="h-24 w-24 rounded-10 object-cover" />
                                  ) : (
                                    <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">-</p>
                                  )}
                                </>
                              )}

                              {index > 0 && (
                                <MinusCircleIcon
                                  className="ml-1.5 inline-block h-10 w-10 cursor-pointer text-red-500"
                                  onClick={() => handleDeleteItem(index)}
                                />
                              )}
                            </div>
                          ))}

                          <button className="mt-4 rounded-lg bg-secondary px-4 py-2 text-white" onClick={addNewFieldSet}>
                            {t("menu.addNewFieldSet")}
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 ltr:text-left rtl:text-right">
                        <div>
                          <div className="label mb-2 text-secondary">{t("headings.otherInfo")}</div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <Input
                          label={t("headings.notes")}
                          placeholder="Menu Note"
                          textarea
                          value={menuNote}
                          error={menuNoteError}
                          onChange={(e) => {
                            setMenuNote(e.target.value);
                            setMenuNoteError("");
                          }}
                        />
                      </div>

                      <div className="mx-auto mt-10 grid w-8/12 grid-cols-2 gap-7">
                        <Button
                          icon={<CheckIcon />}
                          title={data === null ? t("menu.addMenu") : t("menu.updateMenu")}
                          type="submit"
                          onClick={handleSubmit}
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

export default AddMenuModal;