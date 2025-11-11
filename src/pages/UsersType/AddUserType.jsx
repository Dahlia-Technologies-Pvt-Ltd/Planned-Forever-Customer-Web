import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import React, { useState, useEffect } from "react";
import Button from "../../components/common/Button";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useThemeContext } from "../../context/GlobalContext";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const AddUserType = (props) => {
  const { t } = useTranslation("common");

  const location = useLocation();
  const data = location.state?.data;

  // useContext
  const { eventSelect, setBtnLoading, btnLoading, openSuccessModal, closeSuccessModel, setErrorMessage } = useThemeContext();

  // React Router Dom Hooks
  const navigate = useNavigate();

  // useState for user type and errors
  const [userType, setUserType] = useState("");
  const [userTypeError, setUserTypeError] = useState("");
  const [accessRightsError, setAccessRightsError] = useState("");

  const [permissions, setPermissions] = useState([
    {
      name: "Dashboard",
      permission: { View: false },
    },
    {
      name: "Venues",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Ceremonies",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Menu",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Contacts",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Invitees",
      permission: { View: false },
    },
    {
      name: "Rsvp",
      permission: { View: false },
    },
    {
      name: "Gifts",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Gift Allocation",
      permission: { View: false },
    },
    {
      name: "Received Gifts",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Invitation Cards",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Card Allocation",
      permission: { View: false },
    },
    {
      name: "Card Schedule",
      permission: { View: false },
    },
    {
      name: "Samagri",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Vendors",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Arrivals",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Departures",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Hotels",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Hotel Rooms",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Allocated Rooms",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Cars",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Car Allocation",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Guest Flights",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Guest Trains",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Send SMS",
      permission: { View: false },
    },
    {
      name: "Schedule/Send SMS",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Send Email",
      permission: { View: false },
    },
    {
      name: "Greetings",
      permission: { View: false },
    },
    {
      name: "Budget",
      permission: { View: false },
    },
    {
      name: "Calendar",
      permission: { View: false },
    },
    {
      name: "Tasks",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Quick Contact",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "User Type",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Users",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "My Profile",
      permission: { View: false },
    },
    {
      name: "Reports",
      permission: { View: false },
    },
    {
      name: "Export Data",
      permission: { View: false },
    },
    {
      name: "Service Requests",
      permission: { View: false },
    },
    // {
    //   name: "Nearby Attractions",
    //   permission: { View: false, Create: false, Edit: false, Delete: false },
    // },

    {
      name: "Live Event",
      permission: { View: false },
    },
    {
      name: "Panchang Caldendar",
      permission: { View: false },
    },

    {
      name: "Ticket Manager",
      permission: { View: false },
    },

  ]);

  // Handle form validation
  const isValidForm = () => {
    let isValidData = true;

    // Check if userType is entered
    if (!userType) {
      setUserTypeError("Required");
      isValidData = false;
    } else {
      setUserTypeError("");
    }

    // Check if at least one permission is true
    const hasAtLeastOnePermission = permissions.some((module) => Object.values(module.permission).some((value) => value === true));

    if (!hasAtLeastOnePermission) {
      setAccessRightsError("At least one access right must be selected");
      isValidData = false;
    } else {
      setAccessRightsError("");
    }

    return isValidData;
  };

  // Handle Checkbox Change
  const handleCheckboxChange = (moduleName, permission) => {
    setPermissions((prevPermissions) =>
      prevPermissions.map((module) => {
        if (module.name === moduleName) {
          const updatedPermissions = { ...module.permission };

          // Toggle the clicked permission
          updatedPermissions[permission] = !updatedPermissions[permission];

          // If Create, Update, or Delete is checked, ensure View is checked
          if (["Create", "Update", "Edit", "Delete"].includes(permission) && updatedPermissions[permission]) {
            updatedPermissions["View"] = true;
          }

          // If View is unchecked, uncheck all permissions
          if (permission === "View" && !updatedPermissions["View"]) {
            Object.keys(updatedPermissions).forEach((key) => {
              updatedPermissions[key] = false;
            });
          }

          return {
            ...module,
            permission: updatedPermissions,
          };
        }
        return module;
      }),
    );
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        // Prepare permissions payload
        const permissionArray = permissions.flatMap((module) =>
          Object.entries(module.permission)
            .filter(([_, value]) => value) // Only include checked permissions
            .map(([key]) => `${module.name.toLowerCase().replace(/\s+/g, "-")}-${key.toLowerCase()}`),
        );

        let payload = {
          name: userType,
          permissions: permissionArray,
          event_id: eventSelect,
        };

        console.log("Payload:", payload);

        let response;
        if (data === undefined) {
          response = await ApiServices.userType.AddUserType(payload);
        } else {
          const userId = data?.id;
          response = await ApiServices.userType.UpdateUserType(userId, payload);
        }

        console.log({ response });
        if (response.status === 200) {
          openSuccessModal({
            title: t("messages.success"),
            message: data === undefined ? t("userType.userTypeAddSuccess") : t("userType.userTypeUpdateSuccess"),
            onClickDone: () => {
              navigate("/user-type");
              closeSuccessModel();
            },
          });
          setBtnLoading(false);
        } else {
          console.error("Error response:", response);
          setBtnLoading(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setBtnLoading(false);
      } finally {
        setBtnLoading(false);
      }
    }
  };

  // Clear Form Data
  const clearAllData = () => {
    setUserType("");
    setUserTypeError("");
    setAccessRightsError("");
    navigate("/user-type");
  };

  useEffect(() => {
    if (data?.permissions) {
      setUserType(data?.display_name);

      // Transform backend permissions into a structured object
      const transformedPermissions = data.permissions.reduce((acc, item) => {
        const parts = item.name.split("-"); // Split all parts
        const action = parts.pop(); // Get last part as action
        const module = parts // Join remaining parts with space and capitalize each word
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        const actionKey = action.charAt(0).toUpperCase() + action.slice(1); // Capitalize action

        if (!acc[module]) {
          acc[module] = {};
        }
        acc[module][actionKey] = true; // Set permission to true

        return acc;
      }, {});

      // Update state while preserving existing permissions structure
      setPermissions((prevPermissions) =>
        prevPermissions.map((module) => ({
          ...module,
          permission: {
            ...module.permission, // Keep existing structure
            ...(transformedPermissions[module.name] || {}), // Merge backend data (set to true)
          },
        })),
      );
    }
  }, [data]);

  return (
    <div className="card min-h-[82vh]">
      <h3 onClick={() => navigate("/user-type")} className="cursor-pointer pb-8 text-base text-gray-700 underline underline-offset-4">
        <ArrowLeftIcon className="inline-block h-4 w-4" /> {t("userType.backToUserType")}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-6 xl:w-1/2">
          <h2 className="heading">{data === undefined ? "Add New User Type" : "Edit User Type"}</h2>
          <h2 className="label text-secondary">{t("headings.basicInfo")}</h2>
          <Input
            isRequired
            value={userType}
            label={t("userType.userType")}
            error={userTypeError}
            placeholder={t("userType.userType")}
            onChange={(e) => {
              setUserType(e.target.value);
              setUserTypeError("");
            }}
          />
        </div>
        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="label text-secondary">
              {t("userType.accessRights")} {accessRightsError && <span className="text-xs text-red-500">{accessRightsError}</span>}
            </h2>

            <div className="grid gap-5 md:grid-cols-1 xl:grid-cols-1">
              <div className="w-full space-y-4">
                {permissions.map((module, index) => (
                  <div key={index} className={`p-4 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-1/3">
                        <span className="text-sm font-medium text-gray-700">{module.name}</span>
                      </div>
                      <div className="flex flex-1 space-x-8">
                        {Object.keys(module.permission).map((perm, permIndex) => (
                          <label key={permIndex} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={module.permission[perm] || false}
                              onChange={() => handleCheckboxChange(module.name, perm)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">{perm}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mx-auto mt-20 grid w-6/12 grid-cols-2 gap-7 xl:w-6/12 3xl:w-4/12">
            <Button
              icon={<CheckIcon />}
              title={data === undefined ? t("userType.addUserType") : t("userType.updateUserType")}
              type="submit"
              loading={btnLoading}
            />
            <Button icon={<XMarkIcon />} title={t("buttons.cancel")} type="button" buttonColor="bg-red-500" onClick={clearAllData} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUserType;
