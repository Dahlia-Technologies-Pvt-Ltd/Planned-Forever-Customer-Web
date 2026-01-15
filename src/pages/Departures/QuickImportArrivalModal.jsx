import React, { Fragment, useState, useEffect, useCallback } from "react";
import ApiServices from "../../api/services";
import { mediaUrl } from "../../utilities/config";
import Button from "../../components/common/Button";
import { Dialog, Transition } from "@headlessui/react";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import Tesseract from "tesseract.js";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { pdfjs } from "react-pdf";
import moment from 'moment';

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const QuickImportArrivalModal = ({ openQuickImport, setOpenQuickImport, refreshData, onSend }) => {
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedFilePath, setSelectedFilePath] = useState(null);
  const [selectedFilePathError, setSelectedFilePathError] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [arrivalDateAndTime, setArrivalDateAndTime] = useState("");
  const [arrivingFrom, setArrivingFrom] = useState("");
  const [arrivingAt, setArrivingAt] = useState("");
  const [arrivalFlightTrainNo, setArrivalFlightTrainNo] = useState("");

  const {
    eventSelect,
    setBtnLoading,
    openSuccessModal,
    closeSuccessModel,
    getGroupNames,
    getFamilyNames,
  } = useThemeContext();

  const sendToParent = () => {
    onSend(arrivingFrom, arrivingAt, arrivalDateAndTime, arrivalFlightTrainNo); // 👈 separate values
    handleClose();
  };

  /* ================= FILE HANDLER ================= */
  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true);
    const ext = file.name.split(".").pop().toLowerCase();
    try {
      if (["jpg", "jpeg", "png"].includes(ext)) {
        const result = await Tesseract.recognize(file, "eng");
        if (result?.data?.text) {
          const pdfData = readTicketText(result.data.text);
          setArrivingFrom(pdfData[0].from);
          setArrivalFlightTrainNo(pdfData[0].flightNumber);
          setArrivingAt(pdfData[0].to);
          const date = pdfData?.[0]?.date?.trim();
          const time = pdfData?.[0]?.departureTime?.trim() || "00:00";
          if (date) {
            const dateTimeStr = `${date} ${time}`;
            const m = moment(dateTimeStr, "DD MMM YYYY HH:mm", true);
            if (m.isValid()) {
              setArrivalDateAndTime(m.format("YYYY-MM-DD HH:mm"));
            } else {
              console.error("Invalid date:", dateTimeStr);
            }
          } else {
            console.error("Date not available");
          }
        }
      } else if (ext === "pdf") {
        const pdf = await pdfjs
          .getDocument({ data: await file.arrayBuffer() })
          .promise;
        let pdfText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          pdfText += content.items.map((i) => i.str).join(" ") + "\n";
        }
        console.log(pdfText);
        const pdfData = readTicketText(pdfText);
        console.log(pdfData);
        setArrivingFrom(pdfData[0].from);
        setArrivalFlightTrainNo( pdfData[0].flightNumber);
        setArrivingAt(pdfData[0].to);
        const date = pdfData?.[0]?.date?.trim();
        const time = pdfData?.[0]?.departureTime?.trim() || "00:00";
        if (date) {
          const dateTimeStr = `${date} ${time}`;
          const m = moment(dateTimeStr, "DD MMM YYYY HH:mm", true);
          if (m.isValid()) {
            setArrivalDateAndTime(m.format("YYYY-MM-DD HH:mm"));
          } else {
            console.error("Invalid date:", dateTimeStr);
          }
        } else {
          console.error("Date not available");
        }
      }  else {
        alert("Unsupported file type");
      }
    } catch (err) {
      alert("Failed to read file");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DROPZONE ================= */
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) {
      setSelectedFilePath(acceptedFiles[0]);
      setSelectedFilePathError(null);
      handleFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  // ✅ FIX: remove invalid DOM props
  const { isRequired, ...inputProps } = getInputProps();

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFilePath) {
      setSelectedFilePathError("Required");
      return;
    }

    try {
      setBtnLoading(true);

      const formData = new FormData();
      formData.append("file", selectedFilePath);
      formData.append("event_id", eventSelect);

      const response = await ApiServices.contact.ImportExcel(formData);

      if (response?.code === 200) {
        setOpenQuickImport(false);
        refreshData();
        openSuccessModal({
          title: "Success!",
          message: "Contact imported successfully",
          onClickDone: closeSuccessModel,
        });
      }
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFilePath(null);
    setErrorMessage("");
    setOpenQuickImport(false);
  };

  useEffect(() => {
    if (openQuickImport) {
      getGroupNames();
      getFamilyNames();
    }
  }, [openQuickImport]);

  const downloadFile = () => {
    window.location.href = `${mediaUrl}1759750584.sample_contact_import.xls`;
  };

  /* ================= TEXT → JSON ================= */
function normalizeText(raw) {
  return raw
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/GE\s?/g, "6E ") // OCR: GE -> 6E
    .replace(/G(?=\d)/g, "6")
    .replace(/O(?=\d)/g, "0")
    .trim();
}

function extractFlightNumber(text) {
  const patterns = [
    /\b(6E\s?\d{3,4})\b/i, // IndiGo
    /\b(QP\s?\d{3,4})\b/i, // Akasa
    /Flight\s*[:\-]?\s*([A-Z0-9]{2}\s?\d{3,4})/i
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].replace(" ", "");
  }
  return "";
}

function extractPNR(text) {
  return text.match(/\bPNR\s*[:\-]?\s*([A-Z0-9]{5,6})\b/i)?.[1] || "";
}

function readTicketText(rawText) {
  if (!rawText || typeof rawText !== "string") return [];

  const text = normalizeText(rawText);
  const result = [];

  /* =====================================================
     TRAIN TICKET
  ====================================================== */
  if (
    text.includes("Electronic Reservation Slip") ||
    text.includes("Train No")
  ) {
    // Extract departure date & time separately
    const depMatch = text.match(
      /Departure\*\s*(\d{2}-[A-Za-z]{3}-\d{4})\s+(\d{2}:\d{2})/
    );
    // Extract arrival date & time separately (optional but recommended)
    const arrMatch = text.match(
      /Arrival\*\s*(\d{2}-[A-Za-z]{3}-\d{4})\s+(\d{2}:\d{2})/
    );
    result.push({
      type: "train",
      pnr: text.match(/PNR:\s*(\d+)/)?.[1] || "",
      // ONLY train number (5 digits)
      flightNumber:
        text.match(/Train No\.\/Name\s*(\d{5})/i)?.[1] || "",
      from:
        text.match(/Boarding From\s*(.*?)\s*Departure/)?.[1]?.trim() || "",
      to:
        text.match(/TO\s*(.*?)\s*Arrival/)?.[1]?.trim() || "",
      // Separate date & time (NO dash)
      date: depMatch ? depMatch[1].replace(/-/g, " ") : "",
      departureTime: depMatch ? depMatch[2] : "",
      // Optional: arrival separation
      arrivalDate: arrMatch ? arrMatch[1].replace(/-/g, " ") : "",
      arrivalTime: arrMatch ? arrMatch[2] : "",
      class:
        text.match(/Class\s*([A-Z0-9]+)/)?.[1] || "",
      passengers: extractTrainPassengers(text)
    });
    return result;
  }


  /* =====================================================
     WEB BOARDING PASS (NO PASSENGER NAME)
  ====================================================== */
  if (text.toLowerCase().includes("web boarding pass")) {
    result.push({
      type: "flight",
      passengerName: "",
      from:
        text.match(/From:\s*(.*?)\s*To:/)?.[1]?.trim() || "",
      to:
        text.match(/To:\s*(.*?)\s*Flight/)?.[1]?.trim() || "",
      flightNumber: extractFlightNumber(text),
      gate:
        text.match(/\bGate\b\s*([0-9A-Z]+)/)?.[1] || "",
      seat:
        text.match(/\bSeat\b\s*([A-Z0-9]+)/)?.[1] || "",
      boardingTime:
        text.match(/Boarding Time\s*([0-9:]+)/)?.[1] || "",
      boardingZone:
        text.match(/Zone\s*([0-9]+)/)?.[1] || "",
      date:
        text.match(/\b\d{1,2}\s[A-Za-z]{3}\s\d{4}\b/)?.[0] || "",
      departureTime:
        text.match(/Departure Time:\s*([0-9:]+)/)?.[1] || "",
      pnr: extractPNR(text),
      services:
        text.match(/Services\s*([A-Z, ]+)/)?.[1]?.trim() || ""
    });

    return result;
  }

  /* =====================================================
     STANDARD FLIGHT BOARDING PASS (WITH NAME)
  ====================================================== */
  if (text.includes("Flight") && text.includes("Seat")) {
    const passengers =
      text.match(/([A-Z]+\/[A-Z]+)\s+(MR|MRS|MS)/g) || [];

    passengers.forEach((p) => {
      result.push({
        type: "flight",
        passengerName: p.replace(/\s+(MR|MRS|MS)/, ""),
        from:
          text.match(/\b([A-Z ]+)\s+TO\s+([A-Z ]+)\b/)?.[1]?.trim() || "",
        to:
          text.match(/\b([A-Z ]+)\s+TO\s+([A-Z ]+)\b/)?.[2]?.trim() || "",
        flightNumber: extractFlightNumber(text),
        gate:
          text.match(/\bGate\s*([0-9A-Z]+)/)?.[1] || "",
        seat:
          text.match(/\bSeat\s*([A-Z0-9]+)/)?.[1] || "",
        boardingTime:
          text.match(/Boarding Time\s*([0-9:]+)/)?.[1] ||
          text.match(/\b(\d{4})\s*Hrs\b/)?.[1] ||
          "",
        boardingZone:
          text.match(/\bZone\s*([0-9]+)/)?.[1] || "",
        date:
          text.match(/\b\d{1,2}\s[A-Za-z]{3}\s\d{4}\b/)?.[0] || "",
        departureTime:
          text.match(/\bDeparture\s*([0-9:]{4,5})\b/i)?.[1] ||
          text.match(/\b([0-9]{2}:[0-9]{2})\b(?=.*AGSW|CPTR|Services)/i)?.[1] || "",
        pnr: extractPNR(text),
        services:
          text.match(/\bAGSW|CPTR\b/i)?.[0] || ""
      });
    });

    return result;
  }

  return result;
}

function extractTrainPassengers(text) {
  const passengers = [];
  const regex =
    /\d+\s+([A-Za-z]+)\s+(\d+)\s+(M|F)\s+([A-Z\/0-9]+)/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    passengers.push({
      name: match[1],
      age: match[2],
      gender: match[3],
      status: match[4]
    });
  }
  return passengers;
}



  return (
    <Transition appear show={openQuickImport} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl">
              <div className="flex justify-between mb-4">
                <Dialog.Title className="text-lg font-semibold">
                  {t("Import Departure")}
                </Dialog.Title>
                <XMarkIcon
                  className="w-6 h-6 cursor-pointer"
                  onClick={handleClose}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div
                  {...getRootProps()}
                  className="mt-5 cursor-pointer rounded-lg border-2 border-dashed p-6 text-center"
                >
                  <input {...inputProps} />

                  <p className="text-sm text-gray-500">
                    {isDragActive
                      ? "Drop the file here..."
                      : "Drag & drop or click to browse"}
                  </p>

                  {selectedFilePath && (
                    <p className="mt-2 text-xs text-green-600">
                      {selectedFilePath.name}
                    </p>
                  )}

                  {selectedFilePathError && (
                    <p className="mt-1 text-xs text-red-500">
                      {selectedFilePathError}
                    </p>
                  )}
                </div>

                {errorMessage && (
                  <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
                )}

                <div className="mt-8 grid grid-cols-1 gap-2 ">
                  {/* <Button
                    type="button"
                    onClick={downloadFile}
                    title="Download Sample"
                  /> */}
                  <Button
                    type="submit"
                    title="Quick Import"
                    buttonColor="bg-blue-500"
                    loading={loading}
                    onClick={sendToParent}
                  />
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default QuickImportArrivalModal;
