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

  const sendToParent = () => {
    onSend(arrivingFrom, arrivingAt, arrivalDateAndTime, arrivalFlightTrainNo); // 👈 separate values
    handleClose();
  };

  const {
    eventSelect,
    setBtnLoading,
    openSuccessModal,
    closeSuccessModel,
    getGroupNames,
    getFamilyNames,
  } = useThemeContext();

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
          setArrivalFlightTrainNo( pdfData[0].flightNumber);
          setArrivingAt(pdfData[0].to);
          const dateTimeStr = `${pdfData[0].date.trim()} ${pdfData[0].departureTime.trim()}`;
          const m = moment(dateTimeStr, 'DD MMM YYYY HH:mm', true);
          if (m.isValid()) {
            setArrivalDateAndTime(m.format('YYYY-MM-DD HH:mm'));
          } else {
            console.error('Invalid date:', dateTimeStr);
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
        const pdfData = readTicketText(pdfText);
        setArrivingFrom(pdfData[0].from);
        setArrivalFlightTrainNo( pdfData[0].flightNumber);
        setArrivingAt(pdfData[0].to);
        const dateTimeStr = `${pdfData[0].date.trim()} ${pdfData[0].departureTime.trim()}`;
        const m = moment(dateTimeStr, 'DD MMM YYYY HH:mm', true);
        if (m.isValid()) {
          setArrivalDateAndTime(m.format('YYYY-MM-DD HH:mm'));
        } else {
          console.error('Invalid date:', dateTimeStr);
        }

      } else {
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
function readTicketText(rawText) {
  if (!rawText || typeof rawText !== "string") return [];

  const text = rawText.replace(/\s+/g, " ").trim();
  const result = [];

  /* =====================================================
     TRAIN TICKET
  ====================================================== */
  if (
    text.includes("Electronic Reservation Slip") ||
    text.includes("Train No")
  ) {
    result.push({
      type: "train",
      pnr: text.match(/PNR:\s*(\d+)/)?.[1] || "",
      flightNumber: text.match(/Train No\.\/Name\s*([\w\/ ]+)/)?.[1] || "",
      from: text.match(/Boarding From\s*(.*?)\s*Departure/)?.[1] || "",
      to: text.match(/TO\s*(.*?)\s*Arrival/)?.[1] || "",
      departure: text.match(/Departure\*\s*([\d\-A-Za-z: ]+)/)?.[1] || "",
      arrival: text.match(/Arrival\*\s*([\d\-A-Za-z: ]+)/)?.[1] || "",
      class: text.match(/Class\s*([A-Z0-9]+)/)?.[1] || "",
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
      passengerName: "", // not available in web boarding
      departureTerminal:
        text.match(/Departure Terminal:\s*(\d+)/)?.[1] || "",
      from:
        text.match(/From:\s*(.*?)\s*To:/)?.[1] || "",
      to:
        text.match(/To:\s*(.*?)\s*Flight/)?.[1] || "",
      flightNumber:
        text.match(/\b([A-Z]{1,2}\d{3,4})\b/)?.[1] || "",
      gate:
        text.match(/\bGate\b\s*(\d+)/)?.[1] || "",
      seat:
        text.match(/\bSeat\b\s*([A-Z0-9]+)/)?.[1] || "",
      boardingTime:
        text.match(/\bBoarding Time\b\s*([\d:]+)/)?.[1] || "",
      boardingZone:
        text.match(/\bBoarding Zone\b\s*(\d+)/)?.[1] || "",
      date:
        text.match(/Date:\s*([\d]{1,2}\s\w+\s\d{4})/)?.[1] || "",
      departureTime:
        text.match(/Departure Time:\s*([\d:]+)/)?.[1] || "",
      services:
        text.match(/Services:\s*([A-Z]+)/)?.[1] || ""
    });

    return result;
  }

  /* =====================================================
     STANDARD FLIGHT BOARDING PASS (WITH NAME)
  ====================================================== */
  if (text.includes("Flight") && text.includes("Seat")) {
    const passengers =
      text.match(/([A-Z]+\/[A-Z]+)\s+(MR|MRS|MS)/g) || [];

    if (passengers.length) {
      passengers.forEach((p) => {
        result.push({
          type: "flight",
          passengerName: p.replace(/\s+(MR|MRS|MS)/, ""),
          from:
            text.match(/([A-Z ]+)\s+TO\s+([A-Z ]+)/)?.[1] || "",
          to:
            text.match(/([A-Z ]+)\s+TO\s+([A-Z ]+)/)?.[2] || "",
          flightNumber:
            text.match(/\b([A-Z]{1,2}\s?\d{3,4})\b/)?.[1] || "",
          gate: text.match(/Gate\s*(\d+)/)?.[1] || "",
          seat: text.match(/Seat\s*([A-Z0-9]+)/)?.[1] || "",
          boardingTime:
            text.match(/Boarding Time\s*([\d:]+)/)?.[1] ||
            text.match(/\b(\d{4})\s*Hrs\b/)?.[1] ||
            "",
          boardingZone:
            text.match(/Boarding Zone\s*(\d+)/)?.[1] || "",
          date:
            text.match(/(\d{1,2}\s\w+\s\d{4})/)?.[1] || "",
          departureTime:
            text.match(/Departure\s*([\d:]+)/)?.[1] || "",
          pnr:
            text.match(/PNR\s*([A-Z0-9]+)/)?.[1] || "",
          services:
            text.match(/Services\s*([A-Z, ]+)/)?.[1] || ""
        });
      });

      return result;
    }
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
                  {t("Import Arrivals")}
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
