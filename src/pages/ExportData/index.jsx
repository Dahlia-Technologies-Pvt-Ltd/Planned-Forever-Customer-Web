import React, { useEffect, useState } from "react";
import Dropdown from "../../components/common/Dropdown";
import ApiServices from "../../api/services";
import RadioInput from "../../components/common/RadioInput";
import Button from "../../components/common/Button";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useThemeContext } from "../../context/GlobalContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getLocalDateFromUnixTimestamp } from "../../utilities/HelperFunctions";
import { mediaUrl } from "../../utilities/config";
import { useTranslation } from "react-i18next";

const ExportData = () => {
  const { t } = useTranslation("common");
  const { eventSelect } = useThemeContext();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const [selectedData, setSelectedData] = useState(null);
  const [exportAllOptions, setExportAllOptions] = useState([]);

  const [selectedDataErr, setSelectedDataErr] = useState("");
  const [type, setType] = useState("Download");

  const [serverErr, setServerErr] = useState("");

  const [dataToExport, setDataToExport] = useState([]);

  // Create PDF
  const createPDFWithTables = (data) => {
    const doc = new jsPDF();

    data?.forEach((section) => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(section.name, 14, doc.lastAutoTable.finalY + 10 || 10);

      const head = [];
      const body = [];

      console.log({ a: section.name });

      switch (section.name) {
        case "ArrivalDeparture":
          head.push(["From", "To", "Persons"]);
          section.data.forEach((item) => {
            body.push([item.from, item.to, item.no_of_person.toString()]);
          });
          break;
        case "Hotel":
          head.push(["Hotel Name", "Room No", "Type"]);
          section.data.forEach((item) => {
            body.push([item.name, item.room_no, item.room_type]);
          });
          break;
        case "Gift":
          head.push(["Gift Name", "Value"]);
          section.data.forEach((item) => {
            body.push([item.name, item.value ? item.value.toString() : ""]);
          });
          break;
        case "Car":
          head.push(["Make and Model", "Number", "Driver Name", "Driver Contact", "Owner Name", "Notes"]);
          section.data.forEach((item) => {
            body.push([item.make_and_model, item.number, item.driver_name, item.driver_contact, item.owner_name, item.notes]);
          });
          break;
        case "CarAllocation":
          head.push(["Make and Model", "Number", "Driver Name", "From", "Till", "Notes"]);
          section.data.forEach((item) => {
            const fromDate = getLocalDateFromUnixTimestamp(item.from, "DD MMM, YYYY");
            const tillDate = getLocalDateFromUnixTimestamp(item.till, "DD MMM, YYYY");
            body.push([item.car.make_and_model, item.car.number, item.car.driver_name, fromDate, tillDate, item.notes]);
          });
          break;
        case "Ceremony":
          head.push(["Name", "Incharge Name", "Incharge Contact", "Asst. Incharge Name", "Asst. Incharge Contact", "Description"]);
          section.data.forEach((item) => {
            body.push([
              item.name,
              item.incharge_name,
              item.incharge_contact_number,
              item.asst_incharge_name,
              item.asst_incharge_contact_number,
              item.description,
            ]);
          });
          break;
        case "CheckList":
          head.push(["Title", "Description", "Created At"]);
          section.data.forEach((item) => {
            const createdAt = getLocalDateFromUnixTimestamp(item.created_at_unix, "DD MMM, YYYY");
            body.push([item.title, item.description, createdAt]);
          });
          break;
        case "Vendor":
          head.push(["Name", "Address", "1st Person", "2nd Person", "Tags", "Notes"]);
          section.data.forEach((item) => {
            const tags = item.tags.join(", ");
            body.push([item.name, item.address, item.first_contact_person_name, item.second_contact_person_name, tags, item.notes]);
          });
          break;

        case "Samagri":
          head.push(["Title", "Description", "Date"]);
          section.data.forEach((item) => {
            const date = getLocalDateFromUnixTimestamp(item.date, "DD MMM, YYYY");
            body.push([item.title, item.description, date]);
          });
          break;

        case "Menu":
          head.push(["Date", "Session", "Start Time", "End Time", "Notes"]);
          section.data.forEach((item) => {
            const date = getLocalDateFromUnixTimestamp(item.date, "DD MMM, YYYY");
            body.push([date, item.session, item.start_time, item.end_time, item.notes]);
          });
          break;
        case "Event":
          head.push(["Name", "Venue Name", "Start Date", "End Date", "Start Time", "End Time", "Description"]);
          section.data.forEach((item) => {
            const startDate = getLocalDateFromUnixTimestamp(item.start_date, "DD MMM, YYYY");
            const endDate = getLocalDateFromUnixTimestamp(item.end_date, "DD MMM, YYYY");
            body.push([
              item.name,
              item.venue.name,
              startDate,
              endDate,
              item.start_time ? item.start_time : "-",
              item.end_time ? item.end_time : "-",
              item.description,
            ]);
          });
          break;
        case "Venue":
          head.push(["Name", "City", "State", "PIN", "Contact Person", "Contact Numbers", "Emails"]);
          section.data.forEach((item) => {
            const contactNumbers = item.contact_numbers.map((num) => (num.mobile ? `M: ${num.mobile}` : `L: ${num.land_line_number}`)).join(", ");
            const emails = item.emails.map((email) => (email.personal ? `P: ${email.personal}` : `W: ${email.work}`)).join(", ");
            body.push([item.name, item.city, item.state, item.pin, item.contact_person_name, contactNumbers, emails]);
          });
          break;
        case "User":
          head.push(["Name or Email", "Role", "City", "State", "Country"]);
          section.data.forEach((item) => {
            const nameOrEmail = item.name || item.email;
            body.push([nameOrEmail, item.role, item.city || "-", item.state || "-", item.country || "-"]);
          });
          break;
        case "InvitationCard":
          head.push(["ID", "Name", "Description", "Invitation Card"]);
          section.data.forEach((item) => {
            body.push([
              item.id,
              item.name,
              item.description,
              item.invitation_card, // Assuming it's the name of the image file
            ]);
          });
          break;
        case "GiftReceived":
          head.push(["Received Gift", "Received Gift From", "Received On", "Thank You Note Sent To", "Thank You Note Sent On"]);
          section.data.forEach((item) => {
            const startDate = getLocalDateFromUnixTimestamp(item.received_on, "DD MMM, YYYY");
            const endDate = getLocalDateFromUnixTimestamp(item.note_send_at, "DD MMM, YYYY");
            body.push([
              item.gift_received,
              item.contact.first_name + " " + item.contact.last_name,
              startDate,
              item.contact.first_name + " " + item.contact.last_name,
              endDate,
              item.invitation_card,
            ]);
          });
          break;
      }

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15 || 15,
        head: head,
        body: body,
        theme: "striped",
        headStyles: { fillColor: [22, 160, 133] },
        styles: { fontSize: 10, cellPadding: 2 },
      });
    });

    const uploadFile = async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await ApiServices.contact.contactProfileUpload(formData);

        if (res.code === 200) {
          const emailBody = `File URL: ${mediaUrl + res?.data}`;
          window.location.href = `mailto:?body=${encodeURIComponent(emailBody)}`;
          setSelectedData([]);
          setType("Download");
        }
      } catch (err) {
        console.error("Error uploading file:", err);
      }
    };

    if (type === "Download") {
      doc.save("exportedDataTables.pdf");
      setSelectedData([]);
      setType("Download");
    } else if (type === "Send by email") {
      const blob = doc.output("blob");
      const file = new File([blob], "exportedDataTables.pdf", { type: "application/pdf" });
      uploadFile(file);
    }
  };

  // Get Export Data List
  const getExportDataList = async () => {
    try {
      let payload = {
        event_id: eventSelect,
      };

      setLoading(true);
      const result = await ApiServices.exportData.getExportDataList(payload);

      if (result.data.code === 200) {
        setExportAllOptions(result.data.data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error", error);
    }
  };

  // Handle Proceed
  const handleProceed = async () => {
    if (selectedData === null) {
      setSelectedDataErr("Required");
      return;
    }

    try {
      let payload = {
        models: selectedData.map((item) => item.value),
        event_id: eventSelect,
      };

      setBtnLoading(true);
      const result = await ApiServices.exportData.getDataForExport(payload);

      if (result.status === 200) {
        setBtnLoading(false);
        setDataToExport(result.data.data);
        createPDFWithTables(result?.data?.data);
      }
    } catch (error) {
      setBtnLoading(false);
    }
  };

  // Use Effects
  useEffect(() => {
    getExportDataList();
  }, []);

  return (
    <>
      <div className="flex h-[70vh] flex-col items-center justify-center gap-y-8">
        <div className="card w-[40vw]">
          <h3 className="heading">Export Data</h3>

          <div className="mt-5">
            <Dropdown
              isRequired
              title={t("exportData.exportLabel")}
              placeholder="Select"
              isMulti
              withError={selectedDataErr}
              options={exportAllOptions}
              value={selectedData}
              onChange={(e) => {
                setSelectedData(e);
                setSelectedDataErr("");
              }}
              isSearchable
            />
          </div>
          <div className="mt-5">
            <RadioInput
              name="options"
              options={[
                { id: "Download", value: "Download", label: t("exportData.download") },
                { id: "Send by email", value: "Send by email", label: t("exportData.sendByEmail") },
              ]}
              value={type}
              onChange={(value) => {
                setType(value);
              }}
              checked={type}
            />
          </div>

          {serverErr && <p className="text-center text-red-500">{serverErr}</p>}

          <div className="mt-8 flex justify-center">
            <Button icon={<CheckIcon />} title={t("exportData.proceed")} type="submit" loading={btnLoading} onClick={handleProceed} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ExportData;
