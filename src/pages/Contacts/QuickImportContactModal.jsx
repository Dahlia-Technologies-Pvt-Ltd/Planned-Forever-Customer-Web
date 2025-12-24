import React, { Fragment, useState, useEffect, useCallback } from "react";
import ApiServices from "../../api/services";
import { mediaUrl } from "../../utilities/config";
import Button from "../../components/common/Button";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "../../components/common/Dropdown";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import QuickImportText from "./QuickImportText";
import Tesseract from "tesseract.js";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import QuickImportDisplayText from "./QuickImportDisplayText";
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";


const QuickImportContactModal = ({ isOpen, setIsOpen, refreshData }) => {
  const { t } = useTranslation("common");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [openQuickImportDisplayText, setOpenQuickImportDisplayText] = useState(false);
  const [contacts, setContacts] = useState([]);
  const handleFile = async (file) => {
    if (!file) return;

    setLoading(true);
    setText("");

    const ext = file.name.split(".").pop().toLowerCase();
    //console.log(ext);
    try {
        if (["jpg", "jpeg", "png"].includes(ext)) {
          const result = await Tesseract.recognize(file, "eng");
          setText(result.data.text);
          //console.log(result.data.text);
          const jsonData = convertTextToJson(result.data.text);
          setContacts(jsonData);
          setOpenQuickImportDisplayText(true);
          setIsOpen(false);
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

          setText(pdfText);
          const jsonData = convertTextToJson(pdfText);
          setContacts(jsonData);
          setOpenQuickImportDisplayText(true);
          setIsOpen(false);
        } else if (["xls", "xlsx"].includes(ext)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        setText(XLSX.utils.sheet_to_json(sheet));
        //console.log(XLSX.utils.sheet_to_json(sheet));return false;
        setOpenQuickImportDisplayText(true); 
        setIsOpen(false);
        setContacts(XLSX.utils.sheet_to_json(sheet));

        } else if (["doc", "docx"].includes(ext)) {
          const data = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer: data });
          setText(result.value);
          const jsonData = convertTextToJson(result.value);
          
          setContacts(jsonData);
          setOpenQuickImportDisplayText(true);
          setIsOpen(false);

        } else {
        alert("Unsupported file type");
        }
    } catch (err) {
        //console.error(err);
        alert("Failed to read file");
    } finally {
        setLoading(false);
    }
    };


  const {
    eventSelect,
    allGroups,
    btnLoading,
    setBtnLoading,
    openSuccessModal,
    closeSuccessModel,
    getGroupNames,
    getFamilyNames,
    allFamily,
  } = useThemeContext();

  const [family, setFamily] = useState("");
  const [groupUnder, setGroupUnder] = useState("");
  const [familyError, setFamilyError] = useState(null);
  const [groupUnderError, setGroupUnderError] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState(null);
  const [selectedFilePathError, setSelectedFilePathError] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [openQuickImport, setOpenQuickImport] = useState(false);
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
  /* ============================================ */

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;

    if (!selectedFilePath) {
      setSelectedFilePathError("Required");
      isValid = false;
    }

    if (!groupUnder) {
      setGroupUnderError("Required");
      isValid = false;
    }

    if (!family) {
      setFamilyError("Required");
      isValid = false;
    }

    if (!isValid) return;

    try {
      setBtnLoading(true);

      const formData = new FormData();
      formData.append("file", selectedFilePath);
      formData.append("event_id", eventSelect);
      formData.append("group_id", groupUnder?.value);
      formData.append("family_id", family?.value);

      const response = await ApiServices.contact.ImportExcel(formData);

      if (response?.code === 200) {
        setBtnLoading(false);
        setIsOpen(false);
        refreshData();
        handleClose();
        openSuccessModal({
          title: "Success!",
          message: "Contact imported successfully",
          onClickDone: closeSuccessModel,
        });
      } else {
        setBtnLoading(false);
      }
    } catch (err) {
      setBtnLoading(false);
      setErrorMessage(err.response?.data?.message);
    }
  };

  const handleClose = () => {
    setSelectedFilePath(null);
    setFamily("");
    setGroupUnder("");
    setErrorMessage("");
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      getGroupNames();
      getFamilyNames();
    }
  }, [isOpen]);

  const downloadFile = () => {
    const fileId = "1759750584.sample_contact_import.xls";
      window.location.href = `${mediaUrl + fileId}`;
    };

  const convertTextToJson = (text, defaultCountry = "+91") => {
  const cleanedText = text.replace(/\s+/g, " ").trim();

  // Match blocks ending with a 10-digit number (with optional +country)
  const matches = cleanedText.match(/(.+?)(\+?\d{1,3}\s?)?\d{10}/g) || [];

  return matches.map(block => {
    const numberMatch = block.match(/(\+?\d{1,3}\s?)?(\d{10})$/);

    const country = numberMatch?.[1]
      ? numberMatch[1].trim()
      : defaultCountry;

    const number = numberMatch?.[2] || "";

    // Remove country + number from block
    let namePart = block
      .replace(/(\+?\d{1,3}\s?)?\d{10}$/, "")
      .trim();

    let tokens = namePart.split(" ");

    // Salutation
    let salutation = "";
    if (/^(Mr\.|Ms\.|Mrs\.|Dr\.)$/.test(tokens[0])) {
      salutation = tokens.shift();
    }

    // Remove trailing "Ji"
    if (tokens[tokens.length - 1] === "Ji") {
      tokens.pop();
    }

    let first_name = "";
    let middle_name = "";
    let last_name = "";

    if (tokens.length === 1) {
      first_name = tokens[0];
    } else if (tokens.length === 2) {
      first_name = tokens[0];
      last_name = tokens[1];
    } else if (tokens.length > 2) {
      first_name = tokens[0];
      last_name = tokens[tokens.length - 1];
      middle_name = tokens.slice(1, -1).join(" ");
    }

    return {
      salutation,
      first_name,
      middle_name,
      last_name,
      country,
      number,
      email: ""
    };
  });
};





  return (
    <>
        <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
            <div className="fixed inset-0 bg-black bg-opacity-25" />

            <div className="overflow-y-auto fixed inset-0">
            <div className="flex justify-center items-center p-4 min-h-full text-center">
                <Dialog.Panel className="p-8 w-full max-w-xl bg-white rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-5">
                    <Dialog.Title className="text-lg font-semibold">
                    {t("contacts.importContacts")}
                    </Dialog.Title>
                    <XMarkIcon onClick={handleClose} className="w-8 h-8 cursor-pointer" />
                </div>

                <hr />

                <form onSubmit={handleSubmit}>
                    <div className="p-2">

                    {/* ================= DROP ZONE ================= */}
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

                        {selectedFilePath && (
                            <p className="text-xs mt-2 text-green-600">
                            Selected File: {selectedFilePath.name}
                            </p>
                        )}

                        {selectedFilePathError && (
                            <p className="text-xs text-red-500 mt-1">
                            {selectedFilePathError}
                            </p>
                        )}
                        </div>
                    {/* ============================================== */}

                    <div className="grid grid-cols-1 gap-7 mx-auto mt-10 w-12/12">
                        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                        <hr style={{ flex: 1 }} />
                        <span style={{ margin: "0 10px", fontSize: "12px" }}>OR</span>
                        <hr style={{ flex: 1 }} />
                        </div>
                    </div>

                    {errorMessage && (
                        <span className="text-sm font-medium text-red-500">
                        {errorMessage}
                        </span>
                    )}

                    <div className="grid grid-cols-2 gap-1 mx-auto mt-10 w-12/12">
                        <Button type="button" onClick={downloadFile} title={t("contacts.downloadSampleFile")} />
                        <Button title={t("buttons.quickImport")} type="submit" buttonColor="bg-blue-500" onClick={() => {setOpenQuickImport(true); setIsOpen(false);}} />
                    </div>

                    </div>
                </form>
                </Dialog.Panel>
            </div>
            </div>
        </Dialog>
        </Transition>
        <QuickImportText isOpen={openQuickImport} setIsOpen={setOpenQuickImport} />
         <QuickImportDisplayText isOpen={openQuickImportDisplayText} setOpenQuickImportDisplayText={setOpenQuickImportDisplayText} contacts={contacts} setContacts={setContacts} setIsOpen={setIsOpen}/>
    </>
  );
};

export default QuickImportContactModal;
