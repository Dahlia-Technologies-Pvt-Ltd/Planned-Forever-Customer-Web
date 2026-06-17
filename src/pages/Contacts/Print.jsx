import Lottie from "react-lottie";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import { CONTACTS } from "../../routes/Names";
import Skeleton from "react-loading-skeleton";
import { useReactToPrint } from "react-to-print";
import React, { useEffect, useState, useRef } from "react";
import { ArrowLeftIcon, PrinterIcon, ClipboardIcon } from "@heroicons/react/24/outline";

import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";
import moment from "moment";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ContactPrint = () => {
  const { t } = useTranslation("common");
  const { eventSelect, userData } = useThemeContext();



  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allContactList, setAllContactList] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);


  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  

  const getContactListToPrint = async () => {
    let payload = {
      event_id: eventSelect,
    };
    try {
      setLoading(true);
      const result = await ApiServices.contact.getContactReport(payload);

     
      if (result.data.code === 200) {
        setAllContactList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getContactListToPrint();
  }, []);

     const PrintableContactList = React.forwardRef(({ allContactList, loading }, ref) => {
     // Compute dynamic counts
     const maxChildren = Math.max(0, ...(allContactList || []).map(c => (c?.children?.length || 0)));
     const maxPhones = Math.max(0, ...(allContactList || []).map(c => (c?.contact_numbers?.length || 0)));
     const maxEmails = Math.max(0, ...(allContactList || []).map(c => (c?.emails?.length || 0)));

     // Helpers
     const getSpouse = (item) => (item?.children || []).find((c) => c?.type === "spouse");
     const stripCode = (val) => (typeof val === "string" ? val.split(" ")[0] : val || "-");
     const parseChildContact = (child) => {
       try {
         if (!child?.contact_number) return { number: "-", countryCode: "-" };
         const parsed = JSON.parse(child.contact_number);
         return {
           number: parsed?.number ?? "-",
           countryCode: stripCode(parsed?.countryCode ?? "-")
         };
       } catch {
         return { number: "-", countryCode: "-" };
       }
     };

     // Base headers
     const baseHeaders = [
      "Salutation",
      "First Name",
      "Middle Name",
      "Last Name",
      "Nick Name",
      "Salutation In Message",
      "Gender",
      "DOB",
      "No Of Member",
      "Marital Status",
      "Anniversery Date",
      "Address",
      "City",
      "State",
      "Pin",
      "Country",
      "Company Name",
      "Work Address",
      "Work City",
      "Work State",
      "Work Pin",
      "Work Country",
      "Preferences",
      "Special Need",
      "Identity Image",
      "Profile Image",
      "description",
      "Spouse Name",
      "Spouse Middle Name",
      "Spouse Salutation",
      "Spouse last Name",
      "Spouse Contact",
      "Spouse Country Code",
      "Spouse Gender",
      "Spouse Profile",
    ];

    // Dynamic child headers
    const childHeaders = [];
    for (let i = 1; i <= maxChildren; i++) {
      childHeaders.push(
        `Child ${i} Name`,
        `Child ${i} middle`,
        `Child ${i} salutation`,
        `Child ${i} last name`,
        `Child ${i} gender`,
        `Child ${i} contact`,
        `Child ${i} country code`,
        `Child ${i} type`,
        `Child ${i} is_adult`,
        `Child ${i} profile`
      );
    }

    // Dynamic phone headers
    const phoneHeaders = [];
    for (let i = 1; i <= maxPhones; i++) {
      phoneHeaders.push(`Phone ${i} type`, `Phone ${i} number`, `Phone ${i} Country Code`);
    }

    // Dynamic email headers
    const emailHeaders = [];
    for (let i = 1; i <= maxEmails; i++) {
      emailHeaders.push(`Email ${i} type`, `Email ${i} address`);
    }

    const allColumns = [...baseHeaders, ...childHeaders, ...phoneHeaders, ...emailHeaders];

    console.log("allColumns-------------",allColumns);

    const getColumnWidthClass = (head) => {
      if (["DOB", "Anniversery Date"].includes(head)) return "min-w-[150px]";
      if (head === "Preferences") return "min-w-[280px]";
      if (["Address", "Work Address", "Special Need", "description"].includes(head)) return "min-w-[240px]";
      if (head.includes("Name") || head.includes("address")) return "min-w-[160px]";
      return "min-w-[120px]";
    };

    const renderCell = (item, header) => {
      // Base field mappings (best-effort to typical API fields)
      switch (header) {
        case "Salutation": return item?.salutation || "-";
        case "First Name": return item?.first_name || "-";
        case "Middle Name": return item?.middle_name || "-";
        case "Last Name": return item?.last_name || "-";
        case "Nick Name": return item?.nick_name || "-";
        case "Salutation In Message": return item?.salutation_in_email || "-";
        case "Gender": return item?.gender || "-";
        case "DOB": return item?.DOB ? moment.unix(item?.DOB).format("DD MMM, YYYY") : "-";
        case "No Of Member": return item?.no_of_members || "-";
        case "Marital Status": return item?.marital_status || "-";
        case "Anniversery Date": return item?.anniversery_date ? moment.unix(item?.anniversery_date).format("DD MMM, YYYY") : "-";
        case "Address": return item?.address || "-";
        case "City": return item?.city || "-";
        case "State": return item?.state || "-";
        case "Pin": return item?.pin || "-";
        case "Country": return item?.country || "-";
        case "Company Name": return item?.company_name || "-";
        case "Work Address": return item?.work_address || "-";
        case "Work City": return item?.work_city || "-";
        case "Work State": return item?.work_state || "-";
        case "Work Pin": return item?.work_pin || "-";
        case "Work Country": return item?.work_country || "-";
        case "Preferences": {
          const mealPrefs = Array.isArray(item?.meal_preference) ? item?.meal_preference.map(pref => pref.name).join(", ") : "";
          const beveragePrefs = Array.isArray(item?.beverage_preference) ? item?.beverage_preference.map(pref => pref.name).join(", ") : "";
          const allPrefs = [mealPrefs, beveragePrefs].filter(Boolean).join("; ");
          return allPrefs || "-";
        }
        case "Special Need": return item?.special_need || "-";
        case "Identity Image": return Array.isArray(item?.identity_image) ? item?.identity_image.join(", ") : item?.identity_image || "-";
        case "Profile Image": return item?.profile_image || "-";
        case "description": return item?.description || "-";
        case "Spouse Name": return getSpouse(item)?.name || "-";
        case "Spouse Middle Name": return getSpouse(item)?.middle_name || "-";
        case "Spouse Salutation": return getSpouse(item)?.salutation || "-";
        case "Spouse last Name": return getSpouse(item)?.last_name || "-";
        case "Spouse Contact": return parseChildContact(getSpouse(item)).number;
        case "Spouse Country Code": return parseChildContact(getSpouse(item)).countryCode;
        case "Spouse Gender": return getSpouse(item)?.gender || "-";
        case "Spouse Profile": return getSpouse(item)?.profile_image || "-";
        default:
          break;
      }

      // Dynamic child mapping
      if (header.startsWith("Child ")) {
        // Parse index and field
        const match = header.match(/^Child (\d+) (.+)$/);
        if (match) {
          const idx = parseInt(match[1], 10) - 1;
          const field = match[2];
          const child = item?.children?.[idx];
          if (!child) return "-";
          switch (field) {
            case "Name": return child?.name || "-";
            case "middle": return child?.middle_name || "-";
            case "salutation": return child?.salutation || "-";
            case "last name": return child?.last_name || "-";
            case "gender": return child?.gender || "-";
            case "contact": return parseChildContact(child).number;
            case "country code": return parseChildContact(child).countryCode;
            case "type": return child?.type || "-";
            case "is_adult": return child?.isAdult === 1 ? "Yes" : child?.isAdult === 0 ? "No" : "-";
            case "profile": return child?.profile_image || "-";
            default: return "-";
          }
        }
      }

      // Dynamic phone mapping
      if (header.startsWith("Phone ")) {
        const match = header.match(/^Phone (\d+) (type|number|Country Code)$/);
        if (match) {
          const idx = parseInt(match[1], 10) - 1;
          const field = match[2];
          const phone = item?.contact_numbers?.[idx];
          if (!phone) return "-";
          if (field === "type") return phone?.type || "-";
          if (field === "number") return phone?.contact_number || "-";
          if (field === "Country Code") return phone?.country_code || "-";
          return "-";
        }
      }

      // Dynamic email mapping
      if (header.startsWith("Email ")) {
        const match = header.match(/^Email (\d+) (type|address)$/);
        if (match) {
          const idx = parseInt(match[1], 10) - 1;
          const field = match[2];
          const email = item?.emails?.[idx];
          if (!email) return "-";
          if (field === "type") return email?.type || "-";
          if (field === "address") return email?.contact_email || "-";
          return "-";
        }
      }

      return "-";
    };


    return (
      <div ref={ref} className="pr-2 printableContactList">
        <table className="w-full text-left">
          <thead>
            <tr>
              {allColumns.map((head) => (
                <th key={head} className={`p-4 bg-white border-b border-gray-100 first:pl-6 ${getColumnWidthClass(head)}`}>
                  <p className="text-sm font-semibold leading-5 whitespace-nowrap cursor-pointer font-inter 3xl:text-sm">{head}</p>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={allColumns.length}>
                  <Skeleton count={5} height={50} />
                </td>
              </tr>
            ) : allContactList?.length > 0 ? (
              allContactList?.map((item) => (
                <tr key={item?.id}>
                  {allColumns.map((head) => (
                    <td key={head} className={`py-3 pr-3 pl-4 align-middle first:pl-6 3xl:px-4 ${getColumnWidthClass(head)}`}>
                      <p className="text-md whitespace-nowrap font-normal text-primary-color-200 3xl:text-sm">{renderCell(item, head)}</p>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="h-[400px]">
                <td colSpan={allColumns.length}>
                  <Lottie options={emptyFolderAnimation} width={200} height={200} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  });

const handleExport = async () => {
  try {
    setExportLoading(true);

    // Delay small time for UI smoothness
    await new Promise(resolve => setTimeout(resolve, 300));

    await exportExcel();  // We'll create this below

  } catch (err) {
    console.error(err);
  } finally {
    setExportLoading(false);
  }
};
  
    const exportExcel = async() => {
      
    // Compute dynamic counts
    const maxChildren = Math.max(0, ...(allContactList || []).map(c => (c?.children?.length || 0)));
    const maxPhones = Math.max(0, ...(allContactList || []).map(c => (c?.contact_numbers?.length || 0)));
    const maxEmails = Math.max(0, ...(allContactList || []).map(c => (c?.emails?.length || 0)));

    const getSpouse = (item) => (item?.children || []).find((c) => c?.type === "spouse");
    const stripCode = (val) => (typeof val === "string" ? val.split(" ")[0] : val || "-");
    const parseChildContact = (child) => {
      try {
        if (!child?.contact_number) return { number: "-", countryCode: "-" };
        const parsed = JSON.parse(child.contact_number);
        return {
          number: parsed?.number ?? "-",
          countryCode: stripCode(parsed?.countryCode ?? "-")
        };
      } catch {
        return { number: "-", countryCode: "-" };
      }
    };

    // Headers
    const baseHeaders = [
      "Salutation", "First Name", "Middle Name", "Last Name", "Nick Name",
      "Salutation In Message", "Gender", "DOB", "No Of Member", "Marital Status",
      "Anniversery Date", "Address", "City", "State", "Pin", "Country",
      "Company Name", "Work Address", "Work City", "Work State", "Work Pin",
      "Work Country", "Preferences", "Special Need", "Identity Image",
      "Profile Image", "description", "Spouse Name", "Spouse Middle Name",
      "Spouse Salutation", "Spouse last Name", "Spouse Contact", "Spouse Country Code",
      "Spouse Gender", "Spouse Profile",
    ];

    const childHeaders = [];
    for (let i = 1; i <= maxChildren; i++) {
      childHeaders.push(
        `Child ${i} Name`, `Child ${i} middle`, `Child ${i} salutation`, `Child ${i} last name`,
        `Child ${i} gender`, `Child ${i} contact`, `Child ${i} country code`,
        `Child ${i} type`, `Child ${i} is_adult`, `Child ${i} profile`
      );
    }

    const phoneHeaders = [];
    for (let i = 1; i <= maxPhones; i++) {
      phoneHeaders.push(`Phone ${i} type`, `Phone ${i} number`, `Phone ${i} Country Code`);
    }

    const emailHeaders = [];
    for (let i = 1; i <= maxEmails; i++) {
      emailHeaders.push(`Email ${i} type`, `Email ${i} address`);
    }

    const allColumns = [...baseHeaders, ...childHeaders, ...phoneHeaders, ...emailHeaders];

    const renderCell = (item, header) => {
      switch (header) {
        case "Salutation": return item?.salutation || "-";
        case "First Name": return item?.first_name || "-";
        case "Middle Name": return item?.middle_name || "-";
        case "Last Name": return item?.last_name || "-";
        case "Nick Name": return item?.nick_name || "-";
        case "Salutation In Message": return item?.salutation_in_email || "-";
        case "Gender": return item?.gender || "-";
        case "DOB": return item?.DOB ? moment.unix(item?.DOB).format("DD MMM, YYYY") : "-";
        case "No Of Member": return item?.no_of_members || "-";
        case "Marital Status": return item?.marital_status || "-";
        case "Anniversery Date": return item?.anniversery_date ? moment.unix(item?.anniversery_date).format("DD MMM, YYYY") : "-";
        case "Address": return item?.address || "-";
        case "City": return item?.city || "-";
        case "State": return item?.state || "-";
        case "Pin": return item?.pin || "-";
        case "Country": return item?.country || "-";
        case "Company Name": return item?.company_name || "-";
        case "Work Address": return item?.work_address || "-";
        case "Work City": return item?.work_city || "-";
        case "Work State": return item?.work_state || "-";
        case "Work Pin": return item?.work_pin || "-";
        case "Work Country": return item?.work_country || "-";
        case "Preferences": {
          const mealPrefs = Array.isArray(item?.meal_preference) ? item?.meal_preference.map(p => p.name).join(", ") : "";
          const beveragePrefs = Array.isArray(item?.beverage_preference) ? item?.beverage_preference.map(p => p.name).join(", ") : "";
          return [mealPrefs, beveragePrefs].filter(Boolean).join("; ") || "-";
        }
        case "Special Need": return item?.special_need || "-";
        case "Identity Image": return Array.isArray(item?.identity_image) ? item?.identity_image.join(", ") : item?.identity_image || "-";
        case "Profile Image": return item?.profile_image || "-";
        case "description": return item?.description || "-";
        case "Spouse Name": return getSpouse(item)?.name || "-";
        case "Spouse Middle Name": return getSpouse(item)?.middle_name || "-";
        case "Spouse Salutation": return getSpouse(item)?.salutation || "-";
        case "Spouse last Name": return getSpouse(item)?.last_name || "-";
        case "Spouse Contact": return parseChildContact(getSpouse(item)).number;
        case "Spouse Country Code": return parseChildContact(getSpouse(item)).countryCode;
        case "Spouse Gender": return getSpouse(item)?.gender || "-";
        case "Spouse Profile": return getSpouse(item)?.profile_image || "-";
        default:
          break;
      }

      // Dynamic children
      if (header.startsWith("Child ")) {
        const match = header.match(/^Child (\d+) (.+)$/);
        if (match) {
          const idx = parseInt(match[1], 10) - 1;
          const field = match[2];
          const child = item?.children?.[idx];
          if (!child) return "-";
          switch (field) {
            case "Name": return child?.name || "-";
            case "middle": return child?.middle_name || "-";
            case "salutation": return child?.salutation || "-";
            case "last name": return child?.last_name || "-";
            case "gender": return child?.gender || "-";
            case "contact": return parseChildContact(child).number;
            case "country code": return parseChildContact(child).countryCode;
            case "type": return child?.type || "-";
            case "is_adult": return child?.isAdult === 1 ? "Yes" : child?.isAdult === 0 ? "No" : "-";
            case "profile": return child?.profile_image || "-";
            default: return "-";
          }
        }
      }

      // Dynamic phones
      if (header.startsWith("Phone ")) {
        const match = header.match(/^Phone (\d+) (type|number|Country Code)$/);
        if (match) {
          const idx = parseInt(match[1], 10) - 1;
          const field = match[2];
          const phone = item?.contact_numbers?.[idx];
          if (!phone) return "-";
          if (field === "type") return phone?.type || "-";
          if (field === "number") return phone?.contact_number || "-";
          if (field === "Country Code") return phone?.country_code || "-";
        }
      }

      // Dynamic emails
      if (header.startsWith("Email ")) {
        const match = header.match(/^Email (\d+) (type|address)$/);
        if (match) {
          const idx = parseInt(match[1], 10) - 1;
          const field = match[2];
          const email = item?.emails?.[idx];
          if (!email) return "-";
          if (field === "type") return email?.type || "-";
          if (field === "address") return email?.contact_email || "-";
        }
      }

      return "-";
    };

    // Build rows
    const excelRows = allContactList.map(item => {
      const row = {};
      allColumns.forEach(header => {
        row[header] = renderCell(item, header);
      });
      return row;
    });

    // Create worksheet & workbook
    const worksheet = XLSX.utils.json_to_sheet(excelRows, { header: allColumns });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

    // Save
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "Contacts_Report.xlsx");
  };
  return (
    <>
      <div className="card flex min-h-[72vh] flex-col shadow-[0_12px_34px_rgba(15,23,42,0.14)]">
        <div className="flex w-full flex-col items-start gap-3">
          <h3 className="text-xl font-semibold text-black">{t("contacts.printContacts")}</h3>

          <button
            type="button"
            onClick={() => navigate(CONTACTS)}
            className="inline-flex items-center text-base font-medium text-secondary hover:underline"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-4 text-secondary" />
            <span>{t("contacts.backToContactList")}</span>
          </button>
        </div>

        {/* <div className="flex gap-x-4 mt-5">
          <h3 className="text-base font-medium">{t("contacts.include")}:</h3>
          <div className="flex gap-x-2 items-center pl-2">
            <input
              onChange={(e) => handleCheckboxChange(e, "Address")}
              type="checkbox"
              id="addressCheckbox"
              name="addressCheckbox"
              className="rounded"
            />
            <label htmlFor="addressCheckbox" className="label">
              {t("contacts.address")}
            </label>
          </div>

          <div className="flex gap-x-2 items-center pl-2">
            <input
              onChange={(e) => handleCheckboxChange(e, "Preference")}
              type="checkbox"
              id="preferenceCheckbox"
              name="preferenceCheckbox"
              className="rounded"
            />
            <label htmlFor="preferenceCheckbox" className="label">
              {t("contacts.preferences")}
            </label>
          </div>

          <div className="flex gap-x-2 items-center pl-2">
            <input
              onChange={(e) => handleCheckboxChange(e, "Spouse/Children")}
              type="checkbox"
              id="spouseCheckbox"
              name="spouseCheckbox"
              className="rounded"
            />
            <label htmlFor="spouseCheckbox" className="label">
              {t("contacts.spouseChildren")}
            </label>
          </div>
        </div> */}

        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <div className="-mx-6 mb-8 flex-1 overflow-auto">
            <PrintableContactList ref={componentRef} allContactList={allContactList} loading={loading} />
          </div>

          {allContactList?.length > 0 && (
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={handleExport}
                disabled={exportLoading}
                className="inline-flex h-10 items-center justify-center rounded-10 border border-secondary bg-transparent px-6 text-sm font-medium text-secondary transition hover:bg-secondary/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exportLoading ? (
                  "Exporting..."
                ) : (
                  <>
                    <ClipboardIcon className="mr-2 h-5 w-5" />
                    Export
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex h-10 items-center justify-center rounded-10 border border-primary bg-transparent px-6 text-sm font-medium text-primary transition hover:bg-primary/5"
              >
                <PrinterIcon className="mr-2 h-5 w-5" />
                {t("buttons.print")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContactPrint;
