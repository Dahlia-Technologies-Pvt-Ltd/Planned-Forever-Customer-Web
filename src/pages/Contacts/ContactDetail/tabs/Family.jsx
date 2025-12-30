// src/pages/ContactDetail/tabs/FamilyTab.jsx
import moment from "moment";
import React from "react";
import { Images } from "../../../../assets/Assets";
import TitleValue from "../../../../components/common/TitleValue";
import { mediaUrl } from "../../../../utilities/config";

const FamilyTab = ({ data, userIdData, t }) => {
  // Separate spouse and children from the children array
  const spouseData = data?.children?.filter((child) => child.type === "spouse") || [];
  const childrenData = data?.children?.filter((child) => child.type === "children") || [];

  console.log(spouseData, childrenData);
  // Helper function to parse contact number
  const parseContactNumber = (contactNumber) => {
    if (!contactNumber) return { number: "-", countryCode: "-" };

    // If it's already an object, return it
    if (typeof contactNumber === "object" && contactNumber !== null) {
      return {
        number: contactNumber.number || "-",
        countryCode: contactNumber.countryCode || "-",
      };
    }

    // If it's a string, try to parse it as JSON
    if (typeof contactNumber === "string") {
      try {
        const parsed = JSON.parse(contactNumber);
        return {
          number: parsed.number || "-",
          countryCode: parsed.countryCode || "-",
        };
      } catch (error) {
        // If parsing fails, treat it as a plain number
        return {
          number: contactNumber,
          countryCode: "-",
        };
      }
    }

    return { number: "-", countryCode: "-" };
  };

  const renderPersonCard = (person, isSpouse = false) => {
    const contactInfo = parseContactNumber(person?.contact_number);

    return (
      <>
        <div key={person.id} className="card mb-4 p-6">
          <div className="flex items-start gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={person?.profile_image ? mediaUrl + person.profile_image : Images.PLACEHOLDER}
                alt={person.name}
                className="h-20 w-20 rounded-full border-2 border-gray-200 object-cover"
              />
            </div>

            {/* Person Details */}
            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <TitleValue title={t("contacts.name")} value={person?.name || "-"} />
              <TitleValue title={t("contacts.gender")} value={person?.gender || "-"} />
              <TitleValue title={t("contacts.relationship")} value={isSpouse ? t("contacts.spouse") : t("contacts.child")} />
              <TitleValue title={t("contacts.contactNumber")} value={contactInfo.number} />
              <TitleValue title={t("contacts.countryCode")} value={contactInfo.countryCode} />
              <TitleValue title={t("contacts.adultStatus")} value={person?.isAdult ? t("contacts.adult") : t("contacts.minor")} />
              <TitleValue title="Wedding Hall Seat" value={person?.wedding_hall_seat || "-"} />

              <TitleValue
                title={t("contacts.createdDate")}
                value={person?.created_at_unix ? moment.unix(person.created_at_unix).format("DD MMM, YYYY") : "-"}
              />
              <TitleValue
                title={t("contacts.updatedDate")}
                value={person?.updated_at_unix ? moment.unix(person.updated_at_unix).format("DD MMM, YYYY") : "-"}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="mb-5 flex items-center gap-x-4">
            <h2 className="sub-heading">{t("Medicine")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-16">
            {person?.medicines?.map((medicine, index) => (
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
      </>
    );
  };

  return (
    <div className="mt-6 space-y-8">
      {/* Family Overview */}
       {data?.no_of_members != '' && data?.no_of_members != null || 
        data?.marital_status != '' && data?.marital_status != null ||
        data.anniversery_date != '' && data.anniversery_date != null ||
        data?.family?.name != '' && data?.family?.name != null
        && (
      <div className="card p-6">
        <h2 className="sub-heading mb-4">{t("contacts.familyOverview")}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
           {data?.no_of_members != '' && data?.no_of_members != null && (<TitleValue title={t("contacts.totalMembers")} value={data?.no_of_members || 0} />)}
           {data?.marital_status != '' && data?.marital_status != null && (<TitleValue title={t("contacts.maritalStatus")} value={data?.marital_status || "-"} />)}
          {data?.family?.name != '' && data?.family?.name != null && (<TitleValue title={t("contacts.familyGroup")} value={data?.family?.name || "-"} />)}
          {data.anniversery_date != '' && data.anniversery_date != null && (<TitleValue
            title={t("contacts.anniversaryDate")}
            value={data?.anniversery_date ? moment.unix(data.anniversery_date).format("DD MMM, YYYY") : "-"}
          />
          )}
        </div>
      </div>
        )}

      {/* Spouse Section */}
      {spouseData.length > 0 && (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="sub-heading">{t("contacts.spouseDetails")}</h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
            {spouseData.length} {spouseData.length === 1 ? t("contacts.spouse") : t("contacts.spouses")}
          </span>
        </div>

        {spouseData.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500">{t("contacts.noSpouseInformation")}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">{spouseData.map((spouse) => renderPersonCard(spouse, true))}</div>
        )}
      </div>
      )}

      {/* Children Section */}
      {childrenData.length > 0 && (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="sub-heading">{t("contacts.childrenDetails")}</h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
            {childrenData.length} {childrenData.length === 1 ? t("contacts.child") : t("contacts.children")}
          </span>
        </div>

        {childrenData.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500">{t("contacts.noChildrenInformation")}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">{childrenData.map((child) => renderPersonCard(child, false))}</div>
        )}
      </div>
      )}
    </div>
  );
};

export default FamilyTab;
