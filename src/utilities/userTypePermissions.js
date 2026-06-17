export const USER_TYPE_PERMISSION_MODULES = [
  { name: "Dashboard", base: "dashboard", permissions: ["view"] },
  { name: "Venues", base: "venues", permissions: ["view", "create", "edit", "delete"] },
  { name: "Ceremonies", base: "ceremonies", permissions: ["view", "create", "edit", "delete"] },
  { name: "Menu", base: "menu", permissions: ["view", "create", "edit", "delete"] },
  { name: "Contacts", base: "contacts", permissions: ["view", "create", "edit", "delete"] },
  { name: "QR Codes Overview", base: "qr-code-overview", permissions: ["view", "create", "edit", "delete"] },
  { name: "Double Tick", base: "double-tick", permissions: ["view", "create", "edit", "delete"] },
  { name: "Invitees", base: "invitees", permissions: ["view"] },
  { name: "Rsvp", base: "rsvp", permissions: ["view"] },
  { name: "Gifts", base: "gifts", permissions: ["view", "create", "edit", "delete"] },
  { name: "Gift Allocation", base: "gift-allocation", permissions: ["view"] },
  { name: "Received Gifts", base: "received-gifts", permissions: ["view", "create", "edit", "delete"] },
  { name: "Invitation Cards", base: "invitation-cards", permissions: ["view", "create", "edit", "delete"] },
  { name: "Card Allocation", base: "card-allocation", permissions: ["view"] },
  { name: "Send Invites", base: "card-schedule", permissions: ["view", "create", "edit", "delete"] },
  { name: "Samagri", base: "samagri", permissions: ["view", "create", "edit", "delete"] },
  { name: "Vendors", base: "vendors", permissions: ["view", "create", "edit", "delete"] },
  { name: "Arrivals", base: "arrivals", permissions: ["view", "create", "edit", "delete"] },
  { name: "Departures", base: "departures", permissions: ["view", "create", "edit", "delete"] },
  { name: "Hotels", base: "hotels", permissions: ["view", "create", "edit", "delete"] },
  { name: "Hotel Room", base: "hotel-rooms", permissions: ["view", "create", "edit", "delete"] },
  { name: "Allocated Rooms", base: "allocated-rooms", permissions: ["view", "create", "edit", "delete"] },
  { name: "Cars", base: "cars", permissions: ["view", "create", "edit", "delete"] },
  { name: "Car Allocation", base: "car-allocation", permissions: ["view", "create", "edit", "delete"] },
  { name: "Flights", base: "guest-flights", permissions: ["view", "create", "edit", "delete"] },
  { name: "Trains", base: "guest-trains", permissions: ["view", "create", "edit", "delete"] },
  { name: "Budget", base: "budget", permissions: ["view"] },
  { name: "Calendar", base: "calendar", permissions: ["view"] },
  { name: "Tasks", base: "tasks", permissions: ["view", "create", "edit", "delete"] },
  { name: "Quick Contact", base: "quick-contact", permissions: ["view", "create", "edit", "delete"] },
  { name: "User Type", base: "user-type", permissions: ["view", "create", "edit", "delete"] },
  { name: "Users", base: "users", permissions: ["view", "create", "edit", "delete"] },
  { name: "Profile", base: "my-profile", permissions: ["view"] },
  { name: "Reports", base: "reports", permissions: ["view"] },
  { name: "Live Event", base: "live-event", permissions: ["view"] },
  { name: "Panchang Calendar", base: "panchang-calendar", permissions: ["view"] },
  { name: "Ticket Custom Field", base: "ticket-custom-field", permissions: ["view", "create", "edit", "delete"] },
  { name: "Ticket Custom Field Library", base: "ticket-custom-field-library", permissions: ["view", "create", "edit", "delete"] },
  { name: "Ticket Category", base: "ticket-category", permissions: ["view", "create", "edit", "delete"] },
  { name: "Ticket Sub Category", base: "ticket-sub-category", permissions: ["view", "create", "edit", "delete"] },
  { name: "Ticket Classification", base: "ticket-classification", permissions: ["view", "create", "edit", "delete"] },
  { name: "Service Requests", base: "service-requests", permissions: ["view"] },
];

export const createUserTypePermissionState = () =>
  USER_TYPE_PERMISSION_MODULES.map((module) => ({
    ...module,
    permission: {
      View: false,
      ...(module.permissions.includes("edit") ? { Edit: false } : {}),
    },
  }));

export const getPermissionName = (permission) => (typeof permission === "string" ? permission : permission?.name);

export const mergePermissionsIntoState = (currentPermissions, backendPermissions = []) => {
  const grantedPermissions = new Set(backendPermissions.map(getPermissionName).filter(Boolean));

  return currentPermissions.map((module) => {
    const nextPermission = {
      View: grantedPermissions.has(`${module.base}-view`),
    };

    if (module.permissions.includes("edit")) {
      nextPermission.Edit =
        grantedPermissions.has(`${module.base}-edit`) ||
        grantedPermissions.has(`${module.base}-create`) ||
        grantedPermissions.has(`${module.base}-delete`);
    }

    return {
      ...module,
      permission: nextPermission,
    };
  });
};

export const buildUserTypePermissionPayload = (permissions) =>
  permissions.flatMap((module) => {
    const modulePermissions = [];

    if (module.permission.View || module.permission.Edit) {
      modulePermissions.push(`${module.base}-view`);
    }

    if (module.permission.Edit && module.permissions.includes("edit")) {
      ["create", "edit", "delete"].forEach((action) => {
        if (module.permissions.includes(action)) {
          modulePermissions.push(`${module.base}-${action}`);
        }
      });
    }

    return modulePermissions;
  });
