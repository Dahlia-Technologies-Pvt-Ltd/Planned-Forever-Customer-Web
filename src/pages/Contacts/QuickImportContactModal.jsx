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
  const normalizeCountryCode = (value, defaultCountry = "+91") => {
    if (!value) return defaultCountry;

    const stringValue = String(value).trim();
    if (!stringValue) return defaultCountry;

    return stringValue.startsWith("+") ? stringValue : `+${stringValue}`;
  };

  const normalizeSalutation = (value = "") => {
    const cleaned = String(value).replace(/[^a-z]/gi, "").toLowerCase();

    if (["mr", "mister"].includes(cleaned)) return "Mr.";
    if (["ms", "miss"].includes(cleaned)) return "Ms.";
    if (["mrs", "misses"].includes(cleaned)) return "Mrs.";
    if (["dr", "doctor", "de", "di"].includes(cleaned)) return "Dr.";

    return value ? String(value).trim() : "";
  };

  const splitNameParts = (rawName = "") => {
    const tokens = String(rawName)
      .replace(/\bji\b/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean);

    let salutation = "";
    if (tokens.length) {
      const maybeSalutation = normalizeSalutation(tokens[0]);
      if (["Mr.", "Ms.", "Mrs.", "Dr."].includes(maybeSalutation)) {
        salutation = maybeSalutation;
        tokens.shift();
      }
    }

    let first_name = "";
    let middle_name = "";
    let last_name = "";

    if (tokens.length === 1) {
      first_name = tokens[0];
    } else if (tokens.length === 2) {
      [first_name, last_name] = tokens;
    } else if (tokens.length > 2) {
      first_name = tokens[0];
      last_name = tokens[tokens.length - 1];
      middle_name = tokens.slice(1, -1).join(" ");
    }

    return { salutation, first_name, middle_name, last_name };
  };

  const buildContact = ({
    salutation = "",
    first_name = "",
    middle_name = "",
    last_name = "",
    country = "+91",
    number = "",
    email = "",
  }) => {
    const cleanNumber = String(number).replace(/[^\d]/g, "").slice(-10);
    const cleanEmail = String(email || "").trim();
    const normalizedSalutation = normalizeSalutation(salutation);

    if (!cleanNumber && !first_name && !last_name) {
      return null;
    }

    return {
      salutation: normalizedSalutation,
      first_name: first_name?.trim?.() || "",
      middle_name: middle_name?.trim?.() || "",
      last_name: last_name?.trim?.() || "",
      country: normalizeCountryCode(country),
      number: cleanNumber,
      email: cleanEmail,
    };
  };

  const normalizeContactRow = (row, defaultCountry = "+91") => {
    if (!row || typeof row !== "object") return null;

    const name = row.name || row.full_name || row.fullName || row.contact_name || "";
    const nameParts = name
      ? splitNameParts(name)
      : {
          salutation: normalizeSalutation(row.salutation || row.title || row.prefix || ""),
          first_name: row.first_name || row.firstName || row.firstname || "",
          middle_name: row.middle_name || row.middleName || row.middlename || "",
          last_name: row.last_name || row.lastName || row.lastname || row.surname || "",
        };

    return buildContact({
      ...nameParts,
      country: row.country || row.country_code || row.countryCode || defaultCountry,
      number: row.number || row.mobile || row.phone || row.phone_number || row.contact_no || "",
      email: row.email || row.mail || "",
    });
  };

  const parseLineToContact = (line, defaultCountry = "+91") => {
    const cleanedLine = String(line).replace(/\s+/g, " ").trim();
    if (!cleanedLine) return null;

    const emailMatch = cleanedLine.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
    const email = emailMatch?.[0] || "";
    const phoneMatch = cleanedLine.match(/(\+?\d[\d\s-]{8,}\d)/);

    if (!phoneMatch) return null;

    const rawNumber = phoneMatch[1];
    const digits = rawNumber.replace(/[^\d]/g, "");
    if (digits.length < 10) return null;

    const number = digits.slice(-10);
    const countryDigits = digits.slice(0, -10);
    const country = countryDigits ? `+${countryDigits}` : defaultCountry;

    let namePart = cleanedLine
      .replace(rawNumber, " ")
      .replace(email, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (email) {
      namePart = namePart.replace(email, "").trim();
    }

    const nameParts = splitNameParts(namePart);
    return buildContact({ ...nameParts, country, number, email });
  };

  const parseTextContacts = (rawText, defaultCountry = "+91") => {
    const lines = String(rawText)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const lineContacts = lines.map((line) => parseLineToContact(line, defaultCountry)).filter(Boolean);
    if (lineContacts.length) return lineContacts;

    const flattened = lines.join(" ").replace(/\s+/g, " ").trim();
    const blocks = flattened.match(/.*?(?:\+?\d[\d\s-]{8,}\d)(?:\s+[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})?/gi) || [];

    return blocks.map((block) => parseLineToContact(block, defaultCountry)).filter(Boolean);
  };

  const parsePdfContacts = (rawText, defaultCountry = "+91") => {
    const parsedLines = parseTextContacts(rawText, defaultCountry);
    if (parsedLines.length) return parsedLines;

    let cleaned = String(rawText)
      .replace(/\s+/g, " ")
      .replace(
        /^contacts\s+list\s+salutation\s+first\s+name\s+middle\s+name\s+last\s+name\s+country\s+number\s+email/i,
        "",
      )
      .trim();

    const chunks = cleaned.match(/.*?(?:\+?\d[\d\s-]{8,}\d)(?:\s+[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})?/gi) || [];
    return chunks.map((chunk) => parseLineToContact(chunk, defaultCountry)).filter(Boolean);
  };

  const loadImageElement = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = reader.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const drawSourceToCanvas = (source, width, height) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create OCR canvas");
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(source, 0, 0, width, height);

    return canvas;
  };

  const preprocessCanvas = (sourceCanvas, crop = null, options = {}) => {
    const targetWidth = crop ? crop.width : sourceCanvas.width;
    const targetHeight = crop ? crop.height : sourceCanvas.height;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      throw new Error("Unable to prepare OCR image");
    }

    const scale = options.scale || 2;
    canvas.width = Math.round(targetWidth * scale);
    canvas.height = Math.round(targetHeight * scale);

    const sourceX = crop ? crop.x : 0;
    const sourceY = crop ? crop.y : 0;

    context.drawImage(
      sourceCanvas,
      sourceX,
      sourceY,
      targetWidth,
      targetHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    const lightThreshold = options.lightThreshold ?? 190;
    const darkThreshold = options.darkThreshold ?? 150;
    const contrastBoost = options.contrastBoost ?? 1;

    for (let index = 0; index < data.length; index += 4) {
      const grayscale = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
      const contrasted = Math.max(0, Math.min(255, (grayscale - 128) * contrastBoost + 128));
      const boosted = contrasted > lightThreshold ? 255 : contrasted < darkThreshold ? 0 : contrasted;

      data[index] = boosted;
      data[index + 1] = boosted;
      data[index + 2] = boosted;
    }

    context.putImageData(imageData, 0, 0);
    return canvas;
  };

  const normalizeOcrLine = (value = "") =>
    String(value)
      .replace(/[|]/g, "I")
      .replace(/[“”"]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const normalizePhoneDigits = (value = "") => {
    const digits = String(value).replace(/[^\d]/g, "");
    return digits.length >= 10 ? digits.slice(-10) : "";
  };

  const parseColumnContacts = (namesText, numbersText, defaultCountry = "+91") => {
    const nameLines = String(namesText)
      .split(/\r?\n/)
      .map(normalizeOcrLine)
      .filter(Boolean)
      .filter((line) => !/^\d+$/.test(line));

    const numberLines = String(numbersText)
      .split(/\r?\n/)
      .map(normalizeOcrLine)
      .map((line) => normalizePhoneDigits(line))
      .filter(Boolean);

    if (!nameLines.length || !numberLines.length) {
      return [];
    }

    const pairCount = Math.min(nameLines.length, numberLines.length);

    return Array.from({ length: pairCount }, (_, index) => {
      const nameParts = splitNameParts(nameLines[index]);
      return buildContact({
        ...nameParts,
        country: defaultCountry,
        number: numberLines[index],
        email: "",
      });
    }).filter((contact) => contact?.number && (contact?.first_name || contact?.last_name));
  };

  const scoreColumnResult = (contacts, namesText = "", numbersText = "") => {
    const nameLines = String(namesText)
      .split(/\r?\n/)
      .map(normalizeOcrLine)
      .filter(Boolean);

    const numberLines = String(numbersText)
      .split(/\r?\n/)
      .map(normalizePhoneDigits)
      .filter(Boolean);

    return contacts.reduce((score, contact) => {
      let total = score;

      if (contact?.number?.length === 10) total += 4;
      if (contact?.first_name) total += 2;
      if (contact?.last_name) total += 1;
      if (contact?.salutation) total += 1;

      return total;
    }, 0) + Math.min(nameLines.length, numberLines.length);
  };

  const recognizeCanvas = async (canvas, parameters = {}) => {
    const result = await Tesseract.recognize(canvas, "eng", {
      ...parameters,
    });

    return result.data.text || "";
  };

  const readHandwrittenCanvasContacts = async (sourceCanvas, defaultCountry = "+91") => {
    const leftCrop = {
      x: 0,
      y: 0,
      width: Math.floor(sourceCanvas.width * 0.64),
      height: sourceCanvas.height,
    };

    const rightCrop = {
      x: Math.floor(sourceCanvas.width * 0.62),
      y: 0,
      width: Math.ceil(sourceCanvas.width * 0.38),
      height: sourceCanvas.height,
    };

    const variants = [
      { key: "balanced", scale: 2, darkThreshold: 150, lightThreshold: 190, contrastBoost: 1.15 },
      { key: "strong", scale: 2.4, darkThreshold: 135, lightThreshold: 200, contrastBoost: 1.3 },
      { key: "soft", scale: 2.2, darkThreshold: 160, lightThreshold: 185, contrastBoost: 1.05 },
    ];

    const results = [];

    for (const variant of variants) {
      const namesCanvas = preprocessCanvas(sourceCanvas, leftCrop, variant);
      const numbersCanvas = preprocessCanvas(sourceCanvas, rightCrop, variant);

      const [namesText, numbersText] = await Promise.all([
        recognizeCanvas(namesCanvas, {
          tessedit_pageseg_mode: 6,
          preserve_interword_spaces: "1",
        }),
        recognizeCanvas(numbersCanvas, {
          tessedit_pageseg_mode: 6,
          tessedit_char_whitelist: "0123456789+ -",
        }),
      ]);

      const contacts = parseColumnContacts(namesText, numbersText, defaultCountry);

      results.push({
        variant: variant.key,
        namesText,
        numbersText,
        contacts,
        score: scoreColumnResult(contacts, namesText, numbersText),
      });
    }

    const bestResult = [...results].sort((left, right) => right.score - left.score)[0] || {
      variant: "none",
      namesText: "",
      numbersText: "",
      contacts: [],
      score: 0,
    };

    return {
      variant: bestResult.variant,
      namesText: bestResult.namesText,
      numbersText: bestResult.numbersText,
      contacts: bestResult.contacts,
      candidates: results,
    };
  };

  const readImageText = async (file) => {
    const image = await loadImageElement(file);
    const sourceCanvas = drawSourceToCanvas(image, image.width, image.height);
    const handwrittenResult = await readHandwrittenCanvasContacts(sourceCanvas);

    if (handwrittenResult.contacts.length >= 3) {
      return {
        rawText: `${handwrittenResult.namesText}\n${handwrittenResult.numbersText}`.trim(),
        contacts: handwrittenResult.contacts,
        debug: handwrittenResult,
      };
    }

    const processedCanvas = preprocessCanvas(sourceCanvas);
    const rawText = await recognizeCanvas(processedCanvas, {
      tessedit_pageseg_mode: 6,
      preserve_interword_spaces: "1",
    });

    return {
      rawText,
      contacts: parseTextContacts(rawText),
      debug: handwrittenResult,
    };
  };

  const readPdfText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let pdfText = "";
    let contacts = [];
    const debugPages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ").replace(/\s+/g, " ").trim();

      if (pageText) {
        pdfText += `${pageText}\n`;
        continue;
      }

      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to process PDF page");
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;
      const handwrittenResult = await readHandwrittenCanvasContacts(canvas);

      debugPages.push({
        pageNumber,
        variant: handwrittenResult.variant,
        namesText: handwrittenResult.namesText,
        numbersText: handwrittenResult.numbersText,
        candidates: handwrittenResult.candidates,
      });

      if (handwrittenResult.contacts.length) {
        contacts = contacts.concat(handwrittenResult.contacts);
        pdfText += `${handwrittenResult.namesText}\n${handwrittenResult.numbersText}\n`;
        continue;
      }

      const processedCanvas = preprocessCanvas(canvas);
      const imageText = await recognizeCanvas(processedCanvas, {
        tessedit_pageseg_mode: 6,
        preserve_interword_spaces: "1",
      });

      pdfText += `${imageText}\n`;
    }

    return {
      rawText: pdfText.trim(),
      contacts,
      debugPages,
    };
  };

  const readExcelContacts = async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    return rows.map((row) => normalizeContactRow(row)).filter(Boolean);
  };

  const readDocxText = async (file) => {
    const data = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: data });
    return result.value || "";
  };

  const readApiOcrContacts = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://127.0.0.1:8000/v1/ocr/upload", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    const responseData = await response.json();
    console.log("Quick import OCR API response:", responseData);

    if (!response.ok || responseData?.status !== true) {
      throw new Error(responseData?.message || "OCR API failed");
    }

    const contacts = Array.isArray(responseData?.data)
      ? responseData.data.map((row) => normalizeContactRow(row)).filter(Boolean)
      : [];

    return {
      rawText: responseData?.text || "",
      contacts,
    };
  };

  const handleFile = async (file) => {
    if (!file) return;

    setLoading(true);
    setText("");
    setErrorMessage("");

    const ext = file.name.split(".").pop().toLowerCase();

    try {
      let rawOutput = "";
      let extractedContacts = [];

      if (["jpg", "jpeg", "png"].includes(ext)) {
        try {
          const apiResult = await readApiOcrContacts(file);
          rawOutput = apiResult.rawText;
          extractedContacts = apiResult.contacts;
          console.log("Quick import image api contacts:", extractedContacts);
        } catch (apiError) {
          console.warn("Quick import image API fallback:", apiError);
          const imageResult = await readImageText(file);
          rawOutput = imageResult.rawText;
          extractedContacts = imageResult.contacts;
          console.log("Quick import image OCR variant:", imageResult.debug?.variant || "");
          console.log("Quick import image OCR candidates:", imageResult.debug?.candidates || []);
          console.log("Quick import image names OCR:", imageResult.debug?.namesText || "");
          console.log("Quick import image numbers OCR:", imageResult.debug?.numbersText || "");
        }
        console.log("Quick import image raw text:", rawOutput);
        console.log("Quick import image contacts:", extractedContacts);
      } else if (ext === "pdf") {
        try {
          const apiResult = await readApiOcrContacts(file);
          rawOutput = apiResult.rawText;
          extractedContacts = apiResult.contacts;
          console.log("Quick import pdf api contacts:", extractedContacts);
        } catch (apiError) {
          console.warn("Quick import pdf API fallback:", apiError);
          const pdfResult = await readPdfText(file);
          rawOutput = pdfResult.rawText;
          extractedContacts = pdfResult.contacts.length ? pdfResult.contacts : parsePdfContacts(rawOutput);
          console.log("Quick import pdf column OCR:", pdfResult.debugPages);
        }
        console.log("Quick import pdf raw text:", rawOutput);
        console.log("Quick import pdf contacts:", extractedContacts);
      } else if (["doc", "docx"].includes(ext)) {
        rawOutput = await readDocxText(file);
        extractedContacts = parseTextContacts(rawOutput);
        console.log("Quick import doc contacts:", extractedContacts);
      } else if (["xls", "xlsx"].includes(ext)) {
        extractedContacts = await readExcelContacts(file);
        rawOutput = JSON.stringify(extractedContacts, null, 2);
        console.log("Quick import excel contacts:", extractedContacts);
      } else {
        throw new Error("Unsupported file type");
      }

      if (!extractedContacts.length) {
        throw new Error("No contacts could be extracted from the selected file");
      }

      setText(rawOutput || JSON.stringify(extractedContacts, null, 2));
      setContacts(extractedContacts);
      setOpenQuickImportDisplayText(true);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMessage(err?.message || "File upload failed");
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
      formData.append("no_of_members", 1);

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
    const fileId = "1759755585.sample_quickcontact.xlsx";
      window.location.href = `${mediaUrl + fileId}`;
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
        <QuickImportText isOpen={openQuickImport} setIsOpen={setOpenQuickImport} refreshData={refreshData} />
         <QuickImportDisplayText isOpen={openQuickImportDisplayText} setOpenQuickImportDisplayText={setOpenQuickImportDisplayText} refreshData={refreshData} contacts={contacts} setContacts={setContacts} setIsOpen={setIsOpen}/>
    </>
  );
};

export default QuickImportContactModal;
