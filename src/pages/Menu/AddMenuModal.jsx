import React from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ApiServices from "../../api/services";
import { Fragment, useState, useEffect, useCallback} from "react";
import { Dialog, Transition } from "@headlessui/react";
import DateAndTime from "../../components/common/DateAndTime";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import {
  ArrowUpCircleIcon,
  CloudArrowUpIcon,
  FolderIcon,
  LightBulbIcon,
  MinusCircleIcon,
  PencilIcon,
  PlusCircleIcon,
  PlusIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
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

const SESSION_OPTIONS = [
  "Welcome Dinner",
  "Breakfast",
  "Lunch",
  "Hi Tea",
  "Cocktail",
  "Dinner",
  "Midnight Buffet",
].map((label) => ({ label, value: label }));

const MENU_ITEM_TYPE_OPTIONS = [
  "Starter",
  "Main Course",
  "Dessert",
  "Live Counter",
  "Served Hot",
  "Floating",
].map((label) => ({ label, value: label }));

const ITEM_ENTRY_OPTIONS = [
  {
    value: "upload",
    titleKey: "menu.bulkUpload",
    descriptionKey: "menu.bulkUploadDescription",
    icon: FolderIcon,
  },
  {
    value: "curated",
    titleKey: "menu.curatedRecommendations",
    descriptionKey: "menu.curatedRecommendationsDescription",
    icon: LightBulbIcon,
  },
  {
    value: "manual",
    titleKey: "menu.manualEntry",
    descriptionKey: "menu.manualEntryDescription",
    icon: PlusIcon,
  },
];

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
  const [itemEntryMode, setItemEntryMode] = useState(null);
  const [itemEntryModeError, setItemEntryModeError] = useState("");

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
  const [isFileReading, setIsFileReading] = useState(false);

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

  const handleItemTypeChange = (selectedOption, index) => {
    setItems((prevItems) =>
      prevItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, type: selectedOption?.value || "" } : item
      )
    );
    setErrors((prevErrors) =>
      prevErrors.map((itemError, errorIndex) =>
        errorIndex === index ? { ...itemError, type: "" } : itemError
      )
    );
  };

  const handleItemEntryModeChange = (value) => {
    if (itemEntryMode === value) return;

    setItemEntryMode(value);
    setItemEntryModeError("");
    setFileError("");
    setError("");
    setRecCeremony(null);
    setRecCeremonyError("");
    setSuggestedMenu([]);
    setItemFile(null);
    setSelectedFilePath(null);
    setSelectedFilePathError(null);
    setItems([{ item: "", type: "", quantity: "", description: "", img: null, id: "" }]);
    setErrors([{ item: "", type: "", quantity: "", description: "", id: "", img: null }]);
  };

  const addNewFieldSet = (e) => {
    e.preventDefault();
    let isValid = true;
    const requiredMessage = t("message.required");

    const newErrors = items.map((currentItem) => {
      let itemError = { item: "", type: "", quantity: "", description: "", id: "", img: null };

      if (!currentItem.item) {
        itemError.item = requiredMessage;
        isValid = false;
      }

      if (!currentItem.type) {
        itemError.type = requiredMessage;
        isValid = false;
      }

      if (!currentItem.quantity) {
        itemError.quantity = requiredMessage;
        isValid = false;
      }

      if (!currentItem.description) {
        itemError.description = requiredMessage;
        isValid = false;
      }

      return itemError;
    });

    setErrors(newErrors);

    if (isValid) {
      setItems([...items, { item: "", type: "", quantity: "", description: "", img: null, id: "" }]);
      setErrors([...newErrors, { item: "", type: "", quantity: "", description: "", id: "", img: null }]);
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
    const requiredMessage = t("message.required");

    // Check date field
    if (!date) {
      setDateError(requiredMessage);
      isValidData = false;
    } else {
      setDateError("");
    }

    // Check end time field
    if (!endTime) {
      setEndTimeError(requiredMessage);
      isValidData = false;
    } else {
      setEndTimeError("");
    }

    // Check start time field
    if (!startTime) {
      setStartTimeError(requiredMessage);
      isValidData = false;
    } else {
      setStartTimeError("");
    }

    // Check session name field
    if (!sessionName) {
      setSessionNameError(requiredMessage);
      isValidData = false;
    } else {
      setSessionNameError("");
    }

    if (startTime && endTime && startTime >= endTime) {
      setStartTimeError(t("menu.startTimeBeforeEndTime"));
      setEndTimeError(t("menu.endTimeAfterStartTime"));
      isValidData = false;
    }

    if (!itemEntryMode) {
      setItemEntryModeError(t("menu.chooseItemEntryMethodError"));
      setFileError("");
      setRecCeremonyError("");
      setError("");
      setErrors([]);
      isValidData = false;
    } else if (itemEntryMode === "upload") {
      setItemEntryModeError("");
      setRecCeremonyError("");
      setError("");
      if (!itemFile) {
        setFileError(requiredMessage);
        isValidData = false;
      } else if (isFileReading) {
        setFileError(t("menu.readingFile"));
        isValidData = false;
      } else if (items.length === 0) {
        setFileError(t("menu.noItemsExtracted"));
        isValidData = false;
      } else {
        setFileError("");
      }

      const newErrors = items.map((currentItem) => {
        const itemError = { item: "", type: "", quantity: "", description: "", id: "", img: null };

        if (!currentItem?.item) {
          itemError.item = requiredMessage;
          isValidData = false;
        }
        if (!currentItem?.type) {
          itemError.type = requiredMessage;
          isValidData = false;
        }
        if (!currentItem?.quantity) {
          itemError.quantity = requiredMessage;
          isValidData = false;
        }
        if (!currentItem?.description) {
          itemError.description = requiredMessage;
          isValidData = false;
        }

        return itemError;
      });
      setErrors(newErrors);
    } else if (itemEntryMode === "curated") {
      setItemEntryModeError("");
      setFileError("");
      setErrors([]);

      if (!recCeremony?.value) {
        setRecCeremonyError(requiredMessage);
        isValidData = false;
      } else {
        setRecCeremonyError("");
      }

      const selectedCuratedItems = items.filter(
        (item) => item?.id && item?.source === "recommended"
      );
      if (selectedCuratedItems.length === 0) {
        setError(t("menu.selectAtLeastOneMenuItem"));
        isValidData = false;
      } else {
        setError("");
      }
    } else {
      setItemEntryModeError("");
      setFileError("");
      setRecCeremonyError("");
      setError("");
      const newErrors = items.map((currentItem, index) => {
        let itemError = { item: "", type: "", quantity: "", description: "", id: "", img: null };

        if (!currentItem?.item) {
          itemError.item = requiredMessage;
          isValidData = false;
        }

        if (!currentItem?.type) {
          itemError.type = requiredMessage;
          isValidData = false;
        }

        if (!currentItem?.quantity) {
          itemError.quantity = requiredMessage;
          isValidData = false;
        }

        if (!currentItem?.description) {
          itemError.description = requiredMessage;
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
          if (item?.id) {
            formData.append(`menu_items[${index}][menu_item_id]`, item?.id);

            const catalogueType =
              item?.source ||
              (suggestedMenu.some((suggestedItem) => suggestedItem.id === item.id)
                ? "recommended"
                : trendingMenu.some((trendingItem) => trendingItem.id === item.id)
                  ? "trending"
                  : null);

            if (catalogueType) {
              formData.append(`menu_items[${index}][recommended_trending_type]`, catalogueType);
            }
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
    setEvent(null);
    setError("");
    setEventError("");
    setItems([{ item: "", type: "", quantity: "", description: "", id: "", img: null }]);
    setErrors([{ item: "", type: "", quantity: "", description: "", id: "", img: null }]);
    setItemFile(null);
    setItemEntryMode(null);
    setItemEntryModeError("");
    setSelectedFilePath(null);
    setSelectedFilePathError(null);
    setIsFileReading(false);
    setFileError("");
    setRecCeremony(null);
    setRecCeremonyError("");
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
      setItemEntryMode("manual");
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
      setItemEntryMode("manual");
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
    setError("");

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
        id: item.id,
        source: source === "suggested" ? "recommended" : source,
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
      setItemFile(file);
      setSelectedFilePath(file);
      setSelectedFilePathError(null);
      setFileError("");
      setItems([]);
      setErrors([]);

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
  setIsFileReading(true);

  const updateExtractedItems = (extractedItems) => {
    const normalizedItems = (Array.isArray(extractedItems) ? extractedItems : [])
      .map((item) => ({
        item: String(item?.item || item?.name || "").trim(),
        type: String(item?.type || "").trim(),
        quantity: item?.quantity ?? item?.qty ?? "",
        description: String(item?.description || item?.notes || "").trim(),
        img: item?.img || item?.image || null,
        id: item?.id || "",
      }))
      .filter((item) => item.item || item.type || item.quantity || item.description);

    setItems(normalizedItems);
    setErrors(
      normalizedItems.map(() => ({
        item: "",
        type: "",
        quantity: "",
        description: "",
        id: "",
        img: null,
      }))
    );
    setFileError(normalizedItems.length > 0 ? "" : t("menu.noItemsExtracted"));
  };

  try {
      if (["jpg", "jpeg", "png"].includes(ext)) {
        const result = await Tesseract.recognize(file, "eng");
        // console.log(result.data.text);
        const jsonData = convertMenuPdfTextToJson(result.data.text);
        updateExtractedItems(jsonData);
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
        updateExtractedItems(menuJson);
      } else if (["xls", "xlsx"].includes(ext)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Map the Excel data to your items structure
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        // console.log(jsonData);
        const newItems = jsonData.map((row) => {
          return {
            item: row.name || row.item || "",
            type: row.type || "",
            quantity: row.qty || row.quantity || "",
            description: row.notes || row.description || "",
            img: null,
            id: "",
          };
        });
        updateExtractedItems(newItems);

      } else if (["doc", "docx"].includes(ext)) {
        const data = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: data });
        const jsonData = convertMenuPdfTextToJson(result.value);
        updateExtractedItems(jsonData);
      } else {
        setItems([]);
        setErrors([]);
        setFileError(t("menu.unsupportedFileType"));
      }
  } catch (err) {
      console.error("Menu file reading failed:", err);
      setItems([]);
      setErrors([]);
      setFileError(t("menu.failedToReadFile"));
  } finally {
      setIsFileReading(false);
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
                <Dialog.Panel className="menu-modal w-full max-w-4xl bg-white rounded-2xl  p-6 shadow-xl transition-all">
                  <div className="mb-2 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? t("menu.addMenu") : t("menu.updateMenu")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form className="[&_.label]:text-xs [&_.label]:font-medium [&_input]:h-9 [&_input]:min-h-[36px] [&_input]:text-sm [&_input]:py-1 [&_input[type='datetime-local']]:h-9 [&_textarea]:text-sm [&_.css-b62m3t-container]:text-sm [&_.css-13cymwt-control]:h-9 [&_.css-13cymwt-control]:min-h-[36px] [&_.css-13cymwt-control]:py-0 [&_.css-t3ipsp-control]:h-9 [&_.css-t3ipsp-control]:min-h-[36px] [&_.css-t3ipsp-control]:py-0 [&_.css-hlgwow]:h-9 [&_.css-hlgwow]:min-h-[36px] [&_.css-hlgwow]:py-0 [&_.css-hlgwow]:px- [&_.css-1jqq78o-placeholder]:text-sm [&_.css-1jqq78o-placeholder]:leading-none [&_.css-1dimb5e-singleValue]:text-sm [&_.css-1dimb5e-singleValue]:leading-none [&_.css-1wy0on6]:h-9 [&_.css-19bb58m]:my-0 [&_textarea]:text-sm [&_textarea]:leading-6 [&_textarea::placeholder]:text-gray-200 [&_textarea::placeholder]:leading-6 [&_textarea]:resize-none [&_textarea]:overflow-hidden [&_textarea]:leading-5">
                    <div className="venue-details-scroll h-[600px] overflow-y-auto p-1 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[600px]">
                      <div className="mb-5 ltr:text-left rtl:text-right">
                        <div>
                          <div className="label mb-2 text-black">{t("headings.basicInfo")}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Input
                          isRequired
                          type="date"
                          label={t("menu.date")}
                          error={dateError}
                          placeholder={t("menu.date")}
                          value={date}
                          onChange={(e) => {
                            setDate(e.target.value);
                            setDateError("");
                          }}
                          min={moment.unix(eventDetail?.start_date).format("YYYY-MM-DD")}
                          max={moment.unix(eventDetail?.end_date).format("YYYY-MM-DD")}
                        />

                        <Dropdown
                          isRequired
                          title={t("menu.session_name")}
                          placeholder={t("menu.session")}
                          options={SESSION_OPTIONS}
                          value={SESSION_OPTIONS.find((option) => option.value === sessionName) || null}
                          withError={sessionNameError}
                          onChange={(option) => {
                            setSessionName(option?.value || "");
                            setSessionNameError("");
                          }}
                        />
                        <Input
                          isRequired
                          type="time"
                          label={t("menu.start_time")}
                          placeholder={t("menu.start_time")}
                          value={startTime}
                          error={startTimeError}
                          onChange={(e) => {
                          const value = e.target.value;
                            setStartTime(value);
                            setStartTimeError("");

                            if (endTime && value >= endTime) {
                              setStartTimeError("Start time must be smaller than end time");
                            }
                          }}
                        />
                        <Input
                          isRequired
                          type="time"
                          label={t("menu.end_time")}
                          placeholder={t("menu.end_time")}
                          value={endTime}
                          error={endTimeError}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEndTime(value);
                            setEndTimeError("");

                            if (startTime && value <= startTime) {
                              setEndTimeError("End time must be greater than start time");
                            }
                          }}
                        />
                      </div>

                      <div className="relative mt-12 text-left before:absolute before:-top-7 before:left-0 before:right-0 before:h-px before:bg-gray-200">
                        <div className="label mb-4 text-black">{t("menu.chooseItemEntryMethod")}</div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          {ITEM_ENTRY_OPTIONS.map(({ value, titleKey, descriptionKey, icon: Icon }) => {
                            const isSelected = itemEntryMode === value;

                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => handleItemEntryModeChange(value)}
                                className={`flex min-h-[110px] items-center gap-4 rounded-xl border px-5 py-4 text-left transition ${
                                  isSelected
                                    ? "border-secondary bg-secondary/5 shadow-sm"
                                    : "border-gray-300 bg-white hover:border-secondary/60 hover:bg-gray-50"
                                }`}
                              >
                                <Icon className={`h-8 w-8 shrink-0 ${isSelected ? "text-secondary" : "text-gray-700"}`} />
                                <span>
                                  <span className="block text-sm font-semibold text-gray-900">{t(titleKey)}</span>
                                  <span className="mt-1 block text-xs leading-5 text-gray-500">{t(descriptionKey)}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {itemEntryModeError && (
                          <p className="mt-2 text-xs text-red-500">{itemEntryModeError}</p>
                        )}
                      </div>

                      {/* Trending Menu Section */}
                      {/* {selectedEventRights?.rights?.includes("Trending Menu Items") && (
                        <div className="mt-3 text-left">
                          <p className="label mt-4 text-green-800 ltr:text-left rtl:text-right">{t("menu.trending_menu")}</p>
                          
                          <p className="label my-4 text-green-800 ltr:text-left rtl:text-right">
                            {t("menu.trendingMenuItems")}{" "}
                            <span className="text-xs text-gray-600">({t("menu.selectToAddToMenu")})</span>
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
                                    <Input placeholder={t("menu.menu_item")} labelOnTop value={item.name} disabled />
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
                                <p className="flex justify-center text-gray-400">{t("menu.noTrendingItems")}</p>
                              )}
                            </>
                          )}
                        </div>
                      )} */}

                      {/* Curated Recommendations */}
                      {itemEntryMode === "curated" && (
                        <div className="relative mt-12 text-left before:absolute before:-top-7 before:left-0 before:right-0 before:h-px before:bg-gray-200">
                          <div className="mt-4">
                            <Dropdown
                              isRequired
                              title={t("menu.recommendedCeremony")}
                              placeholder={t("menu.ceremonyForOccasion")}
                              options={allRecCeremonies}
                              withError={recCeremonyError}
                              value={recCeremony}
                              onChange={(e) => {
                                setRecCeremony(e);
                                setRecCeremonyError("");
                                setError("");
                                setItems([{ item: "", type: "", quantity: "", description: "", img: null, id: "" }]);
                              }}
                            />
                            <p className="label my-4 text-black ltr:text-left rtl:text-right">
                              {t("menu.curatedMenuItems")}{" "}
                              <span className="text-xs text-gray-600">({t("menu.selectToAddToMenu")})</span>
                            </p>

                            {suggestedLoading ? (
                              <div className="flex items-center justify-center">
                                <Spinner />
                              </div>
                            ) : (
                              <>
                                {suggestedMenu.length > 0 ? (
                                  suggestedMenu.map((item, index) => (
                                    <div
                                      key={item?.id || index}
                                      className="mb-3 grid grid-cols-[22px_minmax(150px,1fr)_64px_minmax(220px,2fr)] items-center gap-4 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-secondary/40 hover:bg-secondary/[0.02]"
                                    >
                                      <input
                                        type="checkbox"
                                        aria-label={item?.name || t("menu.menu_item")}
                                        onChange={() => handleCheckboxClick(item, "suggested")}
                                        checked={items.some(i => i.id === item.id)}
                                        className="!m-0 !h-5 !min-h-[20px] !w-5 shrink-0 cursor-pointer rounded border-gray-300 !p-0 accent-secondary"
                                      />
                                      <span className="text-sm font-medium text-gray-800">{item?.name || "-"}</span>
                                      {item.image ? (
                                        <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                          <img
                                            src={`${mediaUrl}${item.image}`}
                                            alt={item?.name || t("menu.image")}
                                            className="h-full w-full object-cover"
                                            onError={(event) => {
                                              event.currentTarget.style.display = "none";
                                              event.currentTarget.nextElementSibling.classList.remove("hidden");
                                            }}
                                          />
                                          <PhotoIcon className="hidden h-6 w-6 text-gray-300" />
                                        </div>
                                      ) : (
                                        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                                          <PhotoIcon className="h-6 w-6 text-gray-300" />
                                        </div>
                                      )}
                                      <span className="text-sm leading-5 text-gray-600">{item?.notes || "-"}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="flex justify-center text-gray-400">{t("menu.noItemFound")}</p>
                                )}
                                {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {itemEntryMode === "upload" && (
                        <>
                          <div className="relative mt-12 ltr:text-left rtl:text-right before:absolute before:-top-7 before:left-0 before:right-0 before:h-px before:bg-gray-200">
                            <div className="mb-3 flex items-center justify-between gap-4">
                              <div className="label">{t("menu.menuItemsFile")}</div>
                              <button
                                type="button"
                                onClick={downloadFile}
                                className="flex h-8 shrink-0 items-center rounded-lg border border-secondary/50 px-3 text-sm font-medium text-secondary transition hover:border-secondary hover:bg-secondary/5"
                              >
                                {t("menu.downloadSampleFile")}
                              </button>
                            </div>
                            <div className="w-full">
                          {/* <ChooseFile
                            label={t("menu.menuFile")}
                            placeholderText="Choose File"
                            accept=".xlsx,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            uni="imageInput3"
                            onChange={handleFileChangeMenu}
                            selectedFile={itemFile}
                            onClickCross={() => setItemFile(null)}
                          /> */}
                              <div
                              {...getRootProps()}
                              className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-7 text-center transition ${
                                isDragActive
                                  ? "border-secondary bg-secondary/5"
                                  : "border-gray-300 bg-gray-50/60 hover:border-secondary/60 hover:bg-secondary/[0.03]"
                              }`}
                            >
                              <input {...getInputProps()} />
                              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                                <CloudArrowUpIcon className="h-7 w-7 text-secondary" />
                              </span>

                              {isDragActive ? (
                                <p className="text-sm font-medium text-secondary">{t("menu.dropFileHere")}</p>
                              ) : (
                                <p className="text-sm font-medium text-gray-700">
                                  {t("menu.dragDropBrowse")}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-gray-400">{t("menu.supportedFileTypes")}</p>

                              {itemFile && (
                                <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2">
                                  <p className="max-w-[420px] truncate text-xs font-medium text-green-700">
                                    {itemFile.name}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setItemFile(null);
                                      setSelectedFilePath(null);
                                      setItems([]);
                                      setErrors([]);
                                      setFileError("");
                                    }}
                                    aria-label={t("menu.removeSelectedFile")}
                                    className="text-[0] text-red-500 transition hover:text-red-600"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                              </div>
                            </div>
                          </div>

                          {fileError && <span className="mt-5 block text-xs text-red-500"> {fileError}</span>}

                          {isFileReading && (
                            <div className="mt-6 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-8">
                              <Spinner />
                              <span className="ml-3 text-sm font-medium text-gray-600">{t("menu.readingFile")}</span>
                            </div>
                          )}

                          {!isFileReading && items.length > 0 && (
                            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white text-left">
                              <div className="grid grid-cols-1 bg-secondary/[0.06] text-xs font-semibold uppercase tracking-wide text-secondary md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_180px]">
                                <div className="px-4 py-3">{t("menu.itemAndDescription")}</div>
                                <div className="border-gray-200 px-4 py-3 md:border-l">{t("menu.typeAndQuantity")}</div>
                                <div className="border-gray-200 px-4 py-3 md:border-l">{t("menu.image")}</div>
                              </div>

                              {items.map((item, index) => (
                                <div
                                  key={`uploaded-menu-item-${index}`}
                                  className="grid grid-cols-1 gap-4 border-t border-gray-200 p-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_180px] md:gap-0 md:p-0"
                                >
                                  <div className="space-y-4 md:p-4">
                                    <Input
                                      isRequired
                                      label={t("menu.menu_item")}
                                      placeholder={t("menu.menu_item")}
                                      error={errors[index]?.item}
                                      value={item?.item}
                                      onChange={(event) => handleInputChange(event, index, "item")}
                                    />
                                    <Input
                                      isRequired
                                      label={t("menu.description")}
                                      placeholder={t("menu.description")}
                                      error={errors[index]?.description}
                                      value={item?.description}
                                      onChange={(event) => handleInputChange(event, index, "description")}
                                    />
                                  </div>

                                  <div className="space-y-4 border-gray-200 md:border-l md:p-4">
                                    <Dropdown
                                      isRequired
                                      title={t("menu.itemType")}
                                      placeholder={t("menu.itemType")}
                                      options={MENU_ITEM_TYPE_OPTIONS}
                                      value={
                                        MENU_ITEM_TYPE_OPTIONS.find((option) => option.value === item?.type) ||
                                        (item?.type ? { label: item.type, value: item.type } : null)
                                      }
                                      withError={errors[index]?.type}
                                      onChange={(option) => handleItemTypeChange(option, index)}
                                    />
                                    <Input
                                      isRequired
                                      type="number"
                                      min="1"
                                      label={t("menu.quantity")}
                                      placeholder={t("menu.quantity")}
                                      error={errors[index]?.quantity}
                                      value={item?.quantity}
                                      onChange={(event) => handleInputChange(event, index, "quantity")}
                                    />
                                  </div>

                                  <div className="flex items-center gap-3 border-gray-200 md:border-l md:p-4">
                                    <div className="flex h-28 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2 [&_.h-40]:!h-20 [&_.w-40]:!w-20 [&_label]:!mt-0">
                                      <ChooseFile
                                        placeholderText={t("menu.chooseImage")}
                                        selectedFile={item?.img}
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={(event) => handleFileChange(event, index)}
                                        onClickCross={() => handleRemoveFile(index)}
                                        uni={`uploaded-file-input-${index}`}
                                        noText
                                        style
                                        width="w-full"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      aria-label={t("menu.removeMenuItem")}
                                      onClick={() => handleDeleteItem(index)}
                                      className="flex h-7 w-7 shrink-0 items-center justify-center text-red-500 transition hover:text-red-600"
                                    >
                                      <MinusCircleIcon className="h-7 w-7" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {itemEntryMode === "manual" && (
                        <div className="relative mt-12 ltr:text-left rtl:text-right before:absolute before:-top-7 before:left-0 before:right-0 before:h-px before:bg-gray-200">
                        <div className="label text-black">{t("menu.menuItems")}</div>

                        <div className="pb-2">
                          <div className="mt-4 space-y-4">
                            {items.map((item, index) => (
                              <div key={index} className="relative rounded-xl bg-gray-50/40 p-4">
                                {items.length > 1 && (
                                  <button
                                    type="button"
                                    aria-label={t("menu.removeMenuItem")}
                                    className="absolute right-3 top-3 z-10 text-red-500 transition hover:text-red-600"
                                    onClick={() => handleDeleteItem(index)}
                                  >
                                    <MinusCircleIcon className="h-6 w-6" />
                                  </button>
                                )}

                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-8 lg:col-span-8">
                                    <div className="sm:col-span-5">
                                      <Input
                                        isRequired
                                        label={t("menu.menu_item")}
                                        placeholder={t("menu.menu_item")}
                                        labelOnTop
                                        error={errors[index]?.item}
                                        value={item?.item}
                                        onChange={(e) => handleInputChange(e, index, "item")}
                                      />
                                    </div>

                                    <div className="sm:col-span-3">
                                      <Dropdown
                                        isRequired
                                        title={t("menu.itemType")}
                                        placeholder={t("menu.itemType")}
                                        options={MENU_ITEM_TYPE_OPTIONS}
                                        value={MENU_ITEM_TYPE_OPTIONS.find((option) => option.value === item?.type) || null}
                                        withError={errors[index]?.type}
                                        onChange={(option) => handleItemTypeChange(option, index)}
                                      />
                                    </div>

                                    <div className="sm:col-span-5">
                                      <Input
                                        isRequired
                                        label={t("menu.description")}
                                        placeholder={t("menu.description")}
                                        labelOnTop
                                        error={errors[index]?.description}
                                        value={item?.description}
                                        onChange={(e) => handleInputChange(e, index, "description")}
                                      />
                                    </div>

                                    <div className="sm:col-span-3">
                                      <Input
                                        isRequired
                                        label={t("menu.quantity")}
                                        placeholder={t("menu.quantity")}
                                        labelOnTop
                                        type="number"
                                        min="1"
                                        error={errors[index]?.quantity}
                                        value={item?.quantity}
                                        onChange={(e) => handleInputChange(e, index, "quantity")}
                                      />
                                    </div>
                                  </div>

                                  <div className="flex h-full flex-col lg:col-span-4">
                                    <label className="mb-2 block text-xs font-medium text-black">
                                      {t("menu.image")}
                                    </label>
                                    <div className="flex min-h-0 flex-1 mt-2 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-3 [&_.h-40]:!h-24 [&_.w-40]:!w-24 [&_label]:!mt-0">
                                      <ChooseFile
                                        placeholderText={t("menu.chooseImage")}
                                        selectedFile={item?.img}
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={(e) => handleFileChange(e, index)}
                                        onClickCross={() => handleRemoveFile(index)}
                                        uni={`fileInput-${index}`}
                                        noText
                                        style
                                        width="w-full"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            className="mt-4 flex h-8 w-fit items-center gap-2 rounded-lg border border-secondary/50 px-3 text-sm font-medium text-secondary transition hover:border-secondary hover:bg-secondary/5"
                            onClick={addNewFieldSet}
                          >
                            <PlusIcon className="h-4 w-4" />
                            {t("menu.addNewFieldSet")}
                          </button>
                        </div>
                        </div>
                      )}

                      <div className="relative mt-12 ltr:text-left rtl:text-right before:absolute before:-top-7 before:left-0 before:right-0 before:h-px before:bg-gray-200">
                        <div>
                          <div className="label mb-2 text-black">{t("headings.otherInfo")}</div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <Input
                          label={t("headings.notes")}
                          placeholder={t("menu.menuNote")}
                          textarea
                          value={menuNote}
                          error={menuNoteError}
                          onChange={(e) => {
                            setMenuNote(e.target.value);
                            setMenuNoteError("");
                          }}
                        />
                      </div>

                      <div className="mx-auto mt-10 grid w-full max-w-lg grid-cols-2 gap-4">
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
