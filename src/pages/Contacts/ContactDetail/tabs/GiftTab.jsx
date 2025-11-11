// src/pages/Contacts/components/GiftTab.jsx
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import { useThemeContext } from "../../../../context/GlobalContext";
import { useSortableData } from "../../../../hooks/useSortableData";
import { getLocalDateFromUnixTimestamp } from "../../../../utilities/HelperFunctions";
import { emptyFolderAnimation } from "../../../../utilities/lottieAnimations";

const GiftTab = ({ data, t }) => {
  const { allContactGroup } = useThemeContext();
  const [giftData, setGiftData] = useState([]);

  const { items: giftItems, requestSort: requestGiftSort, sortConfig: giftSortConfig } = useSortableData(giftData);
  const giftColumns = [t("contacts.dateTime"), t("contacts.ceremony"), t("contacts.gift"), t("contacts.quantity"), t("headings.notes")];

  useEffect(() => {
    if (data?.uuid && allContactGroup?.length > 0) {
      // Find the contact group and member with matching UUID
      let foundGiftData = [];

      for (const group of allContactGroup) {
        const member = group.members?.find((member) => member.uuid === data.uuid);
        if (member && member.gift) {
          foundGiftData = member.gift.map((gift) => {
            // Extract ceremony names from ceremony_allocation
            const ceremonyNames =
              gift.ceremony_allocation
                ?.map((ceremony) => ceremony.name)
                .filter((name) => name) // Remove any undefined/null names
                .join(", ") || "-";

            return {
              dateTime: gift?.created_at_unix || gift?.pivot?.created_at,
              ceremony: ceremonyNames,
              giftName: gift?.name || "-",
              quantity: gift?.pivot?.quantity || "-",
              notes: gift?.pivot?.description || gift?.description || "-",
              // Keep original data for sorting
              created_at_unix: gift?.created_at_unix || gift?.pivot?.created_at,
              name: gift?.name,
              pivot: gift?.pivot,
            };
          });
          break;
        }
      }

      setGiftData(foundGiftData);
    }
  }, [data?.uuid, allContactGroup]);

  return (
    <div>
      <table className="w-full text-left">
        <thead>
          <tr>
            {giftColumns?.map((head) => (
              <th
                key={head}
                className="border-b border-gray-100 bg-white p-4 first:pl-6"
                onClick={() => {
                  let sortKey;
                  if (head === "Date/Time" || head === t("contacts.dateTime")) {
                    sortKey = "created_at_unix";
                  } else if (head === "Ceremony" || head === t("contacts.ceremony")) {
                    sortKey = "ceremony";
                  } else if (head === "Gift" || head === t("contacts.gift")) {
                    sortKey = "giftName";
                  } else if (head === "Quantity" || head === t("contacts.quantity")) {
                    sortKey = "quantity";
                  } else if (head === "Note" || head === t("headings.notes")) {
                    sortKey = "notes";
                  } else {
                    sortKey = head.toLowerCase();
                  }
                  requestGiftSort(sortKey);
                }}
              >
                <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                  {head}
                  {giftSortConfig.key ===
                    (head === "Date/Time" || head === t("contacts.dateTime")
                      ? "created_at_unix"
                      : head === "Ceremony" || head === t("contacts.ceremony")
                        ? "ceremony"
                        : head === "Gift" || head === t("contacts.gift")
                          ? "giftName"
                          : head === "Quantity" || head === t("contacts.quantity")
                            ? "quantity"
                            : head === "Note" || head === t("headings.notes")
                              ? "notes"
                              : head.toLowerCase()) && giftSortConfig.direction === "asc" ? (
                    <ChevronUpIcon className="ml-1 inline-block h-4 w-3.5" />
                  ) : (
                    <ChevronDownIcon className="ml-1 inline-block h-4 w-3.5" />
                  )}
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {giftItems.length === 0 ? (
            <tr className="h-[550px] 2xl:h-[400px] 3xl:h-[550px]">
              <td colSpan="5">
                <Lottie options={emptyFolderAnimation} width={200} height={200} />
              </td>
            </tr>
          ) : (
            giftItems?.map((item, index) => (
              <tr key={index} className="cursor-pointer">
                <td className="cursor-pointer py-3 pl-6 pr-4">
                  <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                    {item?.dateTime ? getLocalDateFromUnixTimestamp(item.dateTime, "DD MMM, YYYY") : "-"}
                  </p>
                </td>
                <td className="cursor-pointer py-3 pl-6 pr-4">
                  <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.ceremony}</p>
                </td>
                <td className="cursor-pointer py-3 pl-6 pr-4">
                  <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.giftName}</p>
                </td>
                <td className="cursor-pointer py-3 pl-6 pr-4">
                  <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.quantity}</p>
                </td>
                <td className="cursor-pointer py-3 pl-6 pr-4">
                  <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.notes}</p>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GiftTab;
