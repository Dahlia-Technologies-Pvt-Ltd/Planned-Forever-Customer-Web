// src/pages/Contacts/components/CardTab.jsx
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import { useThemeContext } from "../../../../context/GlobalContext";
import { useSortableData } from "../../../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../../../utilities/lottieAnimations";

const CardTab = ({ data, t }) => {
  console.log("data: ", data);

  const { allContactGroup } = useThemeContext();
  console.log("all contact group: ", allContactGroup);

  const [cardData, setCardData] = useState([]);

  const { items: cardItems, requestSort: requestCardSort, sortConfig: cardSortConfig } = useSortableData(cardData);
  const cardColumns = [t("contacts.card"), "Name on Card", "Description"];

  useEffect(() => {
    if (data?.uuid && allContactGroup?.length > 0) {
      // Find the contact group and member with matching UUID
      let foundCardData = [];

      for (const group of allContactGroup) {
        const member = group.members?.find((member) => member.uuid === data.uuid);
        if (member && member.card_allocation) {
          foundCardData = member.card_allocation.map((cardAllocation) => ({
            cardName: cardAllocation?.card?.name || "-",
            nameOnCard: cardAllocation?.name_on_card || "-",
            description: cardAllocation?.card?.description || "-",
            // Keep original data for sorting
            card: cardAllocation?.card,
            name_on_card: cardAllocation?.name_on_card,
          }));
          break;
        }
      }

      setCardData(foundCardData);
    }
  }, [data?.uuid, allContactGroup]);

  return (
    <div>
      <table className="w-full text-left">
        <thead>
          <tr>
            {cardColumns?.map((head) => (
              <th
                key={head}
                className="border-b border-gray-100 bg-white p-4 first:pl-6"
                onClick={() => {
                  let sortKey;
                  if (head === "Card" || head === t("contacts.card")) {
                    sortKey = "cardName";
                  } else if (head === "Name on Card") {
                    sortKey = "nameOnCard";
                  } else if (head === "Description") {
                    sortKey = "description";
                  } else {
                    sortKey = head.toLowerCase();
                  }
                  requestCardSort(sortKey);
                }}
              >
                <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                  {head}
                  {cardSortConfig.key ===
                    (head === "Card" || head === t("contacts.card")
                      ? "cardName"
                      : head === "Name on Card"
                        ? "nameOnCard"
                        : head === "Description"
                          ? "description"
                          : head.toLowerCase()) && cardSortConfig.direction === "asc" ? (
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
          {cardItems.length === 0 ? (
            <tr className="h-[550px] 2xl:h-[400px] 3xl:h-[550px]">
              <td colSpan="3">
                <Lottie options={emptyFolderAnimation} width={200} height={200} />
              </td>
            </tr>
          ) : (
            cardItems?.map((item, index) => (
              <tr key={index} className="cursor-pointer">
                <td className="cursor-pointer py-3 pl-6 pr-4">
                  <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.cardName}</p>
                </td>
                <td className="cursor-pointer py-3 pl-6 pr-4">
                  <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.nameOnCard}</p>
                </td>
                <td className="cursor-pointer py-3 pl-6 pr-4">
                  <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.description}</p>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CardTab;
