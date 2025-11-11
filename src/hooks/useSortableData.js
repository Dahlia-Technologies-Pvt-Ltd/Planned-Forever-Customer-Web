import { useState, useMemo } from "react";

const defaultComparator = (fieldA, fieldB, sortOrder) => {
  if (sortOrder === "asc") {
    return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
  } else {
    return fieldB < fieldA ? -1 : fieldB > fieldA ? 1 : 0;
  }
};

const sortArray = (array, field, sortOrder, comparator) => {
  // Check if the array is undefined or null
  if (!Array.isArray(array)) {
    return [];
  }

  return [...array].sort((a, b) => {
    let fieldA, fieldB;

    if (field === "employee.name") {
      fieldA = a.employee && a.employee[0]?.name?.toLowerCase();
      fieldB = b.employee && b.employee[0]?.name?.toLowerCase();
      if (!fieldA || !fieldB) {
        fieldA = a.user?.employee && a.user.employee[0]?.name?.toLowerCase();
        fieldB = b.user?.employee && b.user.employee[0]?.name?.toLowerCase();
      }
    } else if (field === "contactNumbers") {
      fieldA = a.contact_numbers[0]?.mobile || a.contact_numbers[0]?.land_line_number;
      fieldB = b.contact_numbers[0]?.mobile || b.contact_numbers[0]?.land_line_number;
    } else if (field === "emails") {
      fieldA = a.emails[0]?.work || a.emails[0]?.personal;
      fieldB = b.emails[0]?.work || b.emails[0]?.personal;
    } else if (field === "venue.name") {
      fieldA = a.venue?.name?.toLowerCase();
      fieldB = b.venue?.name?.toLowerCase();
    } else if (field === "held_at.name") {
      fieldA = a.held_at?.name?.toLowerCase();
      fieldB = b.held_at?.name?.toLowerCase();
    } else if (field === "event.name") {
      fieldA = a.event?.name?.toLowerCase();
      fieldB = b.event?.name?.toLowerCase();
    } else if (field === "event.venue.name") {
      fieldA = a.event?.venue?.name?.toLowerCase();
      fieldB = b.event?.venue?.name?.toLowerCase();
    } else if (field === "card.name") {
      fieldA = a.card.name?.toLowerCase();
      fieldB = b.card.name?.toLowerCase();
    } else if (field === "hotel.name") {
      fieldA = a.hotel.name?.toLowerCase();
      fieldB = b.hotel.name?.toLowerCase();
    } else if (field === "ceremony.name") {
      fieldA = a.ceremony_allocation.map((item) => item.name.toLowerCase());
      fieldB = b.ceremony_allocation.map((item) => item.name.toLowerCase());
    } else if (field === "contact.first_name") {
      fieldA = a.contact?.first_name?.toLowerCase();
      fieldB = b.contact?.first_name?.toLowerCase();
    } else if (field === "car.make_and_model") {
      fieldA = a.car?.make_and_model?.toLowerCase();
      fieldB = b.car?.make_and_model?.toLowerCase();
    } else if (field === "car.number") {
      fieldA = a.car?.number?.toLowerCase();
      fieldB = b.car?.number?.toLowerCase();
    } else if (field === "event.end_date") {
      fieldA = a?.event?.end_date?.toString().toLowerCase();
      fieldB = b?.event?.end_date?.toString().toLowerCase();
    } else if (field === "car.available_from") {
      fieldA = a?.car?.available_from.toString().toLowerCase();
      fieldB = b?.car?.available_from.toString().toLowerCase();
    } else if (field === "car.available_till") {
      fieldA = a?.car?.available_till.toString().toLowerCase();
      fieldB = b?.car?.available_till.toString().toLowerCase();
    } else if (field === "pivot.quantity") {
      fieldA = a?.pivot?.quantity.toString().toLowerCase();
      fieldB = b?.pivot?.quantity.toString().toLowerCase();
    } else if (field === "event.start_date") {
      fieldA = a?.event?.start_date.toString().toLowerCase();
      fieldB = b?.event?.start_date.toString().toLowerCase();
    } else if (field === "car.driver_name") {
      fieldA = a.car?.driver_name?.toLowerCase();
      fieldB = b.car?.driver_name?.toLowerCase();
    } else if (field === "car.driver_contact") {
      fieldA = a.car?.driver_contact?.toLowerCase();
      fieldB = b.car?.driver_contact?.toLowerCase();
    } else if (field === "category.name") {
      fieldA = a.category.name?.toLowerCase();
      fieldB = b.category.name?.toLowerCase();
    } else if (field === "sub_category.name") {
      fieldA = a.sub_category.name?.toLowerCase();
      fieldB = b.sub_category.name?.toLowerCase();
    } else if (field === "classification.name") {
      fieldA = a.classification.name?.toLowerCase();
      fieldB = b.classification.name?.toLowerCase();
    } else if (field === "created_by.first_name") {
      fieldA = a.created_by.first_name?.toLowerCase();
      fieldB = b.created_by.first_name?.toLowerCase();
    } else if (field === "tags[0].tag_details.name") {
      fieldA = a.tags[0].tag_details.name?.toLowerCase();
      fieldB = b.tags[0].tag_details.name?.toLowerCase();
    } else if (field === "role.name") {
      fieldA = a.role?.name?.toLowerCase();
      fieldB = b.role?.name?.toLowerCase();
    } else if (field === "hotel") {
      fieldA = a.hotel?.name?.toLowerCase();
      fieldB = b.hotel?.name?.toLowerCase();
    } else if (field === "hotel.room_type") {
      fieldA = a.hotel?.room_type?.toLowerCase();
      fieldB = b.hotel?.room_type?.toLowerCase();
    } else if (field === "hotel.room_no") {
      fieldA = a.hotel?.room_no?.toLowerCase();
      fieldB = b.hotel?.room_no?.toLowerCase();
    } else if (field === "contact.name") {
      fieldA = a.contact?.first_name?.toLowerCase();
      fieldB = b.contact?.first_name?.toLowerCase();
    } else if (field === "assign_by") {
      fieldA = a.assign_by?.first_name?.toLowerCase();
      fieldB = b.assign_by?.first_name?.toLowerCase();
    } else if (field === "assign_to") {
      fieldA = a.assign_to?.first_name?.toLowerCase();
      fieldB = b.assign_to?.first_name?.toLowerCase();
    } else if (field === "occupants") {
      fieldA = a.occupants ? a.occupants[0] : null;
      fieldB = b.occupants ? b.occupants[0] : null;
      return occupantsComparator(fieldA, fieldB, sortOrder);
    } else if (field === "contactNumbersContact") {
      fieldA = a.contact_numbers[0]?.contact_number;
      fieldB = b.contact_numbers[0]?.contact_number;
    } else if (field === "emailsContact") {
      fieldA = a.emails[0]?.contact_email;
      fieldB = b.emails[0]?.contact_email;
    } else if (field === "group.name") {
      fieldA = a.family?.name?.toLowerCase();
      fieldB = b.family?.name?.toLowerCase();
    } else if (field === "family.name") {
      fieldA = a.group?.name?.toLowerCase();
      fieldB = b.group?.name?.toLowerCase();
    } else if (field === "gift.name") {
      fieldA = a.gift?.name?.toLowerCase();
      fieldB = b.gift?.name?.toLowerCase();
    } else {
      fieldA = a[field];
      fieldB = b[field];
    }

    if (comparator) {
      return comparator(fieldA, fieldB, sortOrder);
    }

    return defaultComparator(fieldA, fieldB, sortOrder);
  });
};

export const useSortableData = (items, defaultField = null) => {
  const [sortConfig, setSortConfig] = useState({
    key: defaultField,
    direction: "asc",
  });

  const sortedItems = useMemo(() => {
    return sortArray(items, sortConfig.key, sortConfig.direction);
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};
