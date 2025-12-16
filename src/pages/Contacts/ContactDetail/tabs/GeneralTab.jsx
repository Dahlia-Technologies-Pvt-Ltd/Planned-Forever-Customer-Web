// src/pages/Contacts/components/GeneralTab.jsx
import { DocumentIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { Images } from "../../../../assets/Assets";
import TitleValue from "../../../../components/common/TitleValue";
import { mediaUrl } from "../../../../utilities/config";

const GeneralTab = ({ data, userIdData, t }) => {
  const [qrCodeOptions, setQrCodeOptions] = useState([]);

  console.log("data", data);

  // Safe JSON parsing with error handling
  const parseIdentityImages = () => {
    if (!data?.identity_image) {
      return [];
    }

    try {
      // Log the raw data for debugging
      console.log("Raw identity_image data:", data.identity_image);

      const parsed = JSON.parse(data.identity_image);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error parsing identity_image JSON:", error);
      console.error("Raw data that failed to parse:", data.identity_image);

      // Try to handle common malformed JSON cases
      try {
        // Remove any trailing commas or incomplete entries
        let cleanedData = data.identity_image.trim();

        // If it looks like an incomplete array, try to fix it
        if (cleanedData.startsWith("[") && !cleanedData.endsWith("]")) {
          cleanedData = cleanedData + "]";
        }

        // Remove trailing commas before closing brackets
        cleanedData = cleanedData.replace(/,(\s*[}\]])/g, "$1");

        const reparsed = JSON.parse(cleanedData);
        return Array.isArray(reparsed) ? reparsed : [];
      } catch (secondError) {
        console.error("Could not recover from JSON parsing error:", secondError);
        return [];
      }
    }
  };

  const identityImages = parseIdentityImages();

  const isImage = (file) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
    const fileExtension = file.split(".").pop().toLowerCase();
    return imageExtensions.includes(fileExtension);
  };

  const isPdf = (fileName) => fileName.split(".").pop().toLowerCase() === "pdf";

  const isExcel = (fileName) => {
    const excelExtensions = ["xls", "xlsx"];
    return excelExtensions.includes(fileName.split(".").pop().toLowerCase());
  };

  const getPreferencesByType = (preferences, type) => {
    return (
      preferences
        .filter((item) => item.type === type)
        .map((item) => item.name)
        .join(", ") || "-"
    );
  };

  // Updated Get QR Code List function with AutoID filtering
  const getQrCodesList = () => {
    const userData = JSON.parse(localStorage.getItem("eventDetail"));
    const authToken = userData?.qr_token;
    if (!authToken) {
      console.error("No QR token found");
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Auth-Token", authToken);

    const raw = "";

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://web-sandbox.dahlia.tech/plannedforever-mybagtags/api/index.php/PfQrCodesController/getQrCodeList", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);

        const parsedData = JSON.parse(result);

        if (parsedData.status === 200 || parsedData.status === true) {
          const qrCodes = parsedData?.result || [];

          // Filter QR codes by AutoID if available
          let filteredQrCodes = [];

          const name = data?.first_name + (data?.middle_name ? ` ${data?.middle_name}` : "") + (data?.last_name ? ` ${data?.last_name}` : "");
          console.log("name", name);
          // Filter to show only QR codes allocated to this specific contact
          filteredQrCodes = qrCodes?.filter((item) => item?.alertedUserName === name);

          // Transform to dropdown options - only show available QR codes for this contact
          const availableQrCodes = filteredQrCodes?.map((item) => ({
            id: item.AutoID,
            value: item.QRCodeText,
            label: item.QRCodeText,
          }));

          setQrCodeOptions(availableQrCodes);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getQrCodesList();
  }, [data]);
  return (
    <div className="mt-6 space-y-20 mb-6">
      {/* Basic Info Section */}
      <div>
        <h2 className="sub-heading mb-5">{t("headings.basicInfo")}</h2>

        {/* Profile Image and Personal Details */}
        <div className="mb-5 flex gap-8">
          {/* Profile Image */}
          <div>
            <h3 className="mb-2 text-xs text-info-color">Profile Image</h3>
            <div className="h-full w-full">
              <img
                src={data?.profile_image ? mediaUrl + data?.profile_image : Images.PLACEHOLDER}
                alt="image"
                className="h-48 w-48 rounded-full object-cover"
              />
            </div>
          </div>

          {/* Personal Details Cards */}
          <div className="flex flex-col gap-4">
            <div className="card flex w-[600px] flex-wrap justify-between gap-y-6">
              <TitleValue title={t("contacts.salutation")} value={data?.salutation} />
              <TitleValue title={t("contacts.firstName")} value={data?.first_name} />
              <TitleValue title={t("contacts.middleName")} value={data?.middle_name || "-"} />
              <TitleValue title={t("contacts.lastName")} value={data?.last_name} />
            </div>
            <div className="card flex w-[600px] flex-wrap justify-between gap-y-6">
              <TitleValue title={t("contacts.nickName")} value={data?.nick_name || "-"} />
              <TitleValue title={t("contacts.salutation")} value={data?.salutation_in_email || "-"} />
              <TitleValue title={t("contacts.gender")} value={data?.gender || "-"} />
              <TitleValue title={t("contacts.birthDate")} value={data?.DOB ? moment.unix(data?.DOB).format("D MMM YYYY") : "-"} />
            </div>
          </div>
        </div>

        {/* Identity Proof Files */}
        <div className="mb-5 rounded-full">
          <div>
            <h3 className="mb-2 text-xs text-info-color">Identity Proof File</h3>
            <PhotoProvider>
              <div className="flex flex-wrap gap-2">
                {identityImages.length > 0 ? (
                  identityImages.map((image, index) => {
                    const fileUrl = mediaUrl + image;
                    return isImage(image) ? (
                      <PhotoView key={index} src={fileUrl}>
                        <img src={fileUrl} alt={`identity_image_${index}`} className="h-20 w-20 cursor-pointer rounded-md object-cover" />
                      </PhotoView>
                    ) : (
                      <a
                        key={index}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-20 w-20 flex-col items-center justify-center rounded-md bg-gray-200"
                      >
                        {isPdf(image) ? (
                          <>
                            <FaFilePdf className="h-10 w-10 text-red-500" />
                            <p className="mt-2 text-sm text-gray-700">PDF</p>
                          </>
                        ) : isExcel(image) ? (
                          <>
                            <FaFileExcel className="h-10 w-10 text-green-500" />
                            <p className="mt-2 text-sm text-gray-700">Excel</p>
                          </>
                        ) : (
                          <>
                            <DocumentIcon className="h-10 w-10 text-gray-500" />
                            <p className="mt-2 text-sm text-gray-700">View File</p>
                          </>
                        )}
                      </a>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500">No identity proof files available</div>
                )}
              </div>
            </PhotoProvider>
          </div>
        </div>
      </div>

      <div>
        <div className="my-2 ltr:text-left rtl:text-right">
          <div>
            <div className="label mb-2 text-secondary">{t("Wedding Hall Seat")}</div>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap">
          <span className="text-sm text-gray-500">{data?.wedding_hall_seat}</span>
        </div>
        <div className="mb-3 flex flex-wrap">
          {data?.wedding_hall_seat === "null" || data?.wedding_hall_seat === null || data?.wedding_hall_seat === "" && <span className="text-sm text-gray-500">No Wedding Hall Seat assigned</span>}
        </div>
      </div>

      <div>
        <div className="my-5 ltr:text-left rtl:text-right">
          <div>
            <div className="label mb-2 text-secondary">{t("QR Codes")}</div>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap">
          {qrCodeOptions.length === 0 && <span className="text-sm text-gray-500">No QR Codes assigned</span>}
          {qrCodeOptions.map((qr) => (
            <span key={qr.value} className="mb-2 mr-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
              {qr.label}
            </span>
          ))}
        </div>
      </div>

      {/* Contact Address Section */}
      <div>
        <h2 className="sub-heading mb-5">Contact Address</h2>
        <div className="grid grid-cols-2 gap-16">
          <div className="card flex flex-wrap gap-x-5 gap-y-4">
            {data?.contact_numbers?.length ? (
              data.contact_numbers.map((item, index) => (
                <React.Fragment key={index}>
                  <TitleValue title={t("contacts.contactType")} value={item?.type} />
                  <TitleValue title={t("contacts.contactNumber")} value={item?.contact_number} />
                </React.Fragment>
              ))
            ) : (
              <React.Fragment>
                <TitleValue title={t("contacts.contactType")} value="-" />
                <TitleValue title={t("contacts.contactNumber")} value="-" />
              </React.Fragment>
            )}
          </div>
          <div className="card flex flex-wrap gap-x-5 gap-y-4">
            {data?.emails?.length ? (
              data.emails.map((item, index) => (
                <React.Fragment key={index}>
                  <TitleValue title={t("contacts.emailType")} value={item?.type || "-"} />
                  <TitleValue title={t("contacts.email")} value={item?.contact_email || "-"} />
                </React.Fragment>
              ))
            ) : (
              <React.Fragment>
                <TitleValue title={t("contacts.emailType")} value="-" />
                <TitleValue title={t("contacts.email")} value="-" />
              </React.Fragment>
            )}
          </div>
        </div>
      </div>

      {/* Address and Other Info Section */}
      <div>
        <div className="grid grid-cols-2 gap-16">
          <div>
            <div className="mb-5 flex items-center gap-x-4">
              <h2 className="sub-heading">{t("headings.residenceAddress")}</h2>
            </div>
            <div className="card flex flex-wrap gap-x-5 gap-y-4">
              <TitleValue title={t("contacts.address")} value={data?.address || "-"} />
              <TitleValue title={t("contacts.city")} value={data?.city || "-"} />
              <TitleValue title={t("contacts.state")} value={data?.state || "-"} />
              <TitleValue title={t("contacts.pin")} value={data?.pin || "-"} />
              <TitleValue title={t("contacts.country")} value={data?.country || "-"} />
            </div>
          </div>
          <div>
            <div className="mb-5 flex items-center gap-x-4">
              <h2 className="sub-heading">{t("headings.otherInfo")}</h2>
            </div>
            <div className="card flex flex-wrap gap-x-5 gap-y-4">
              <TitleValue title={t("contacts.primaryMealPreference")} value={getPreferencesByType(userIdData?.preferences || [], "primary")} />
              <TitleValue title={t("contacts.secondaryMealPreference")} value={getPreferencesByType(userIdData?.preferences || [], "secondary")} />
              <TitleValue title={t("contacts.alcoholPreference")} value={getPreferencesByType(userIdData?.preferences || [], "alcoholic")} />
              <TitleValue title={t("contacts.specialNeeds")} value={data?.special_need || "-"} />

            </div>
          </div>
        </div>
      </div>

      {/* Work Address Section */}
      <div>
        <div className="mb-5 flex items-center gap-x-4">
          <h2 className="sub-heading">{t("headings.workAddress")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-16">
          <div className="card flex flex-wrap gap-x-5 gap-y-4">
            <TitleValue title={t("contacts.address")} value={data?.work_address || "-"} />
            <TitleValue title={t("contacts.city")} value={data?.work_city || "-"} />
            <TitleValue title={t("contacts.state")} value={data?.work_state || "-"} />
            <TitleValue title={t("contacts.pin")} value={data?.work_pin || "-"} />
            <TitleValue title={t("contacts.country")} value={data?.work_country || "-"} />
          </div>
        </div>
      </div>
      <div>
        <div className="mb-5 flex items-center gap-x-4">
          <h2 className="sub-heading">{t("Medicine")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-16">
          {data?.medicines?.map((medicine, index) => (
            <div className="card flex flex-wrap gap-x-5 gap-y-4">
              <TitleValue title={t("Medicine Name")} value={medicine?.name || "-"} />
              <TitleValue title={t("Problem/Ailment")} value={medicine?.ailment || "-"} />
              <TitleValue title={t("Medicine Type")} value={medicine?.type || "-"} />
              <TitleValue title={t("Medication Type")} value={medicine?.usage || "-"} />
              <TitleValue title={t("Special Instructions")} value={medicine?.special_instructions || "-"} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
