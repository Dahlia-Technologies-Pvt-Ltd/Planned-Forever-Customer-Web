import moment from "moment";
import ApiServices from "../../api/services";
import { CONTACTS } from "../../routes/Names";
import Input from "../../components/common/Input";
import React, { useState, useEffect, useRef } from "react";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import Dropdown from "../../components/common/Dropdown";
import countriesData from "../../utilities/country.json";
import ChooseFile from "../../components/common/ChooseFile";
import { useNavigate, useLocation } from "react-router-dom";
import RadioInput from "../../components/common/RadioInput";
import { useThemeContext } from "../../context/GlobalContext";
import countriesCodeData from "../../utilities/countryCode.json";
import AddGroupModal from "../../components/common/AddGroupModal";
import AddFamilyModal from "../../components/common/AddFamilyModal";
import AddColorModal from "../../components/common/AddColorModal";
import { registerSubscriber, assignBulkQrCodes } from "../../api/services/qr_codes";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { Switch } from "@headlessui/react";

const AddContact = () => {
    const { t } = useTranslation("common");

    // React Router Dom
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state?.data;

    // Global States
    const {
        eventSelect,
        openSuccessModal,
        setBtnLoading,
        setErrorMessage,
        closeSuccessModel,
        btnLoading,
        eventDetail,
    } = useThemeContext();

    // Use States
    const [pin, setPin] = useState("");
    const [city, setCity] = useState("");
    const [note, setNote] = useState("");
    const [meal, setMeal] = useState("");
    const [state, setState] = useState("");
    const [file, setFile] = useState([]);
    const [family, setFamily] = useState("");
    const [groups, setGroups] = useState("");
    const [gender, setGender] = useState(null);
    const [country, setCountry] = useState("");
    const [workPin, setWorkPin] = useState("");
    const [options, setOptions] = useState([]);
    const [address, setAddress] = useState("");
    const [lastName, setLastName] = useState("");
    const [nickName, setNickName] = useState("");
    const [children, setChildren] = useState([]);
    const [beverage, setBeverage] = useState("");
    const [workCity, setWorkCity] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [firstName, setFirstName] = useState("");
    const [workState, setWorkState] = useState("");
    const [salutation, setSalutation] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [memberCount, setMemberCount] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [workCountry, setWorkCountry] = useState("");
    const [workAddress, setWorkAddress] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [groupOptions, setGroupOptions] = useState([]);
    const [errorMessageServer, setErrorMessageServer] = useState("");
    const [fileLoading, setFileLoading] = useState(false);
    const [isSubmitted, setISSubmitted] = useState(false);
    const [specialNeed, setSpecialNeed] = useState(false);
    const [martialStatus, setMartialStatus] = useState("");
    const [newFamilyName, setNewFamilyName] = useState("");
    const [identityFile, setIndentityFile] = useState([]);
    const [ProfileImage, setProfileImage] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [salutationEmail, setSalutationEmail] = useState("");
    const [anniversaryDate, setAnniversaryDate] = useState("");
    const [openGroupModal, setOpenGroupModal] = useState(false);
    const [openFamilyModal, setOpenFamilyModal] = useState(false);
    const [weddingHallSeat, setWeddingHallSeat] = useState("");
    // Registration states
    const [currentSubscriberData, setCurrentSubscriberData] = useState({
        AutoID: null,
        Token: null,
    });
    const [registrationLoading, setRegistrationLoading] = useState(false);
    const [registrationError, setRegistrationError] = useState("");

    // QR Code states
    const [qrCodeOptions, setQrCodeOptions] = useState([]);
    const [selectedQrCode, setSelectedQrCode] = useState(null);
    const [qrCodeLoading, setQrCodeLoading] = useState(false);
    const [showAllotQRModal, setShowAllotQRModal] = useState(false);
    const [newQRCodes, setNewQRCodes] = useState("");
    const [newQRCodesError, setNewQRCodesError] = useState("");
    const [qrCodeCounts, setQrCodeCounts] = useState({
        totalAvailable: 0,
        allocated: 0,
        used: 0,
    });
    const [qrCountsLoading, setQrCountsLoading] = useState(false);

    // UPDATED: Enhanced spouse state with all required fields including middleName and meal preferences
    const [spouse, setSpouse] = useState({
        salutation: "",
        name: "",
        middleName: "",
        lastName: "",
        gender: "",
        countryCode: "",
        contactNumber: "",
        profileImage: null,
        profileFile: null,
        meal_preference: [[], [], []], // [primary, secondary, alcoholic]
        medicines: [], // Medicine array for spouse
        weddingHallSeat: "",
    });

    const [message, setMessage] = useState({ text: "", color: "" });
    const [selectedColorCode, setSelectedColorCode] = useState(null);

    // New states for profile image loading
    const [spouseProfileLoading, setSpouseProfileLoading] = useState(false);
    const [spouseProfileError, setSpouseProfileError] = useState("");
    const [childrenProfileLoading, setChildrenProfileLoading] = useState({});
    const [childrenProfileErrors, setChildrenProfileErrors] = useState({});

    // UPDATED: Enhanced newChild state with all required fields including middleName and meal preferences
    const [newChild, setNewChild] = useState({
        salutation: "",
        name: "",
        middleName: "",
        lastName: "",
        gender: "null",
        countryCode: "",
        countryCode: "",
        contactNumber: "",
        isAdult: false,
        profileImage: null,
        profileFile: null,
        meal_preference: [[], [], []], // [primary, secondary, alcoholic]
        medicines: [], // Medicine array for new child
        weddingHallSeat: "",
    });

    // NEW: State to control when to show new child form
    const [showNewChildForm, setShowNewChildForm] = useState(false);

    const [correspondenceAddress, setCorresdondenceAddress] = useState("");
    const [emails, setEmails] = useState([{ id: Date.now(), emailType: "", emailAddress: "" }]);
    const [contacts, setContacts] = useState([{ id: Date.now(), contactType: "", countryCode: "", contactNumber: "" }]);
    const [profileFile, setProfileFile] = useState(null);
    const [errors, setErrors] = useState({
        salutation: "",
        name: "",
        lastName: "",
        gender: "",
        countryCode: "",
        contactNumber: "",
    });

    // States for color code
    const [openDeleteModalColorCode, setOpenDeleteModalColorCode] = useState({ open: false, data: null });
    const [openColorCodeModal, setOpenColorCodeModal] = useState(false);
    const [newColorCodeName, setNewColorCodeName] = useState("");
    const [colorCodeOptions, setColorCodeOptions] = useState([]);
    const [colorBtnLoading, setColorBtnLoading] = useState(false);
    const [showSpouseIndicator, setShowSpouseIndicator] = useState(false);
    // Medicine states - start empty, show fields only after clicking Add Medicine
    const [medicines, setMedicines] = useState([]);

    // Add a state to track deleted medicine IDs
    const [deletedMedicineIds, setDeletedMedicineIds] = useState([]);

    // Add validation state for medicines
    const [medicineValidationErrors, setMedicineValidationErrors] = useState({});

    // Medicine validation error states for spouse and children
    const [spouseMedicineValidationErrors, setSpouseMedicineValidationErrors] = useState({});
    const [childrenMedicineValidationErrors, setChildrenMedicineValidationErrors] = useState({});
    const [newChildMedicineValidationErrors, setNewChildMedicineValidationErrors] = useState({});

    // Medicine deletion tracking states
    const [deletedSpouseMedicineIds, setDeletedSpouseMedicineIds] = useState([]);
    const [deletedChildrenMedicineIds, setDeletedChildrenMedicineIds] = useState({});
    const [deletedNewChildMedicineIds, setDeletedNewChildMedicineIds] = useState([]);
    // Get QR Code List
    // Updated Get QR Code List function with AutoID filtering
    const getQrCodesList = () => {
        setQrCodeLoading(true);
        console.log("currentSubscriberData", currentSubscriberData);

        const userData = JSON.parse(localStorage.getItem("eventDetail"));
        const authToken = userData?.qr_token;
        if (!authToken) {
            console.error("No QR token found");
            setQrCodeLoading(false);
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

        fetch(
            "https://web-sandbox.dahlia.tech/plannedforever-mybagtags/api/index.php/PfQrCodesController/getQrCodeList",
            requestOptions
        )
            .then((response) => response.text())
            .then((result) => {
                console.log(result);

                const parsedData = JSON.parse(result);

                if (parsedData.status === 200 || parsedData.status === true) {
                    const qrCodes = parsedData?.result || [];

                    // Filter QR codes by AutoID if available
                    let filteredQrCodes = [];

                    const name =
                        data?.first_name +
                        (data?.middle_name ? ` ${data?.middle_name}` : "") +
                        (data?.last_name ? ` ${data?.last_name}` : "");
                    console.log("name", name);
                    // Filter to show only QR codes allocated to this specific contact
                    filteredQrCodes = qrCodes?.filter((item) => item?.alertedUserName === name);

                    console.log("filteredQrCodes", filteredQrCodes);
                    // Transform to dropdown options - only show available QR codes for this contact
                    const availableQrCodes = filteredQrCodes?.map((item) => ({
                        id: item.AutoID,
                        value: item.QRCodeText,
                        label: item.QRCodeText,
                    }));

                    setQrCodeOptions(availableQrCodes);
                }

                setQrCodeLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setQrCodeLoading(false);
            });
    };

    // Get User QR Code Counts
    const getUserQrCodeCounts = () => {
        setQrCountsLoading(true);
        console.log("Fetching user QR code counts...");

        const userData = JSON.parse(localStorage.getItem("eventDetail"));
        const authToken = userData?.qr_token;

        if (!authToken) {
            console.error("No QR token found");
            setQrCountsLoading(false);
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

        fetch(
            "https://web-sandbox.dahlia.tech/plannedforever-mybagtags/api/index.php/PfQrCodesController/getUserQrCodeCounts",
            requestOptions
        )
            .then((response) => response.text())
            .then((result) => {
                console.log(result);

                const parsedData = JSON.parse(result);

                if (parsedData.status === 200 || parsedData.status === true) {
                    const messageData = parsedData?.message || {};
                    setQrCodeCounts({
                        totalAvailable: (messageData.allotted_qr_codes || 0) + (messageData.used_qr_codes || 0),
                        allocated: messageData.allotted_qr_codes || 0,
                        used: messageData.used_qr_codes || 0,
                    });
                }

                setQrCountsLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setQrCodeCounts({
                    totalAvailable: 0,
                    allocated: 0,
                    used: 0,
                });
                setQrCountsLoading(false);
            });
    };

    // Handle QR Code Allocation
    const handleAllotQRCodes = async () => {
        // Validate input
        if (!newQRCodes) {
            setNewQRCodesError("Required");
            return;
        }

        if (isNaN(newQRCodes) || parseInt(newQRCodes) <= 0) {
            setNewQRCodesError("Please enter a valid positive number");
            return;
        }

        if (!currentSubscriberData?.AutoID) {
            setNewQRCodesError("No contact auto_id found");
            return;
        }

        try {
            setBtnLoading(true);

            // Create payload for bulk assignment using contact's auto_id
            const bulkAssignPayload = {
                [currentSubscriberData.AutoID]: parseInt(newQRCodes),
            };

            console.log("Bulk assign payload:", bulkAssignPayload);

            // Call the bulk assign QR codes API
            const response = await ApiServices.qr_codes.assignBulkQrCodes(bulkAssignPayload);

            if (response.data.code === 200 || response.data.status === true || response.data.status === 200) {
                // Refresh QR code counts and list
                await getUserQrCodeCounts();
                await getQrCodesList();

                // Close modal and reset
                setShowAllotQRModal(false);
                setNewQRCodes("");
                setNewQRCodesError("");

                openSuccessModal({
                    title: "Success!",
                    message: `${newQRCodes} QR codes have been allocated successfully to this contact`,
                    onClickDone: closeSuccessModel,
                });
            } else {
                setNewQRCodesError(response.data.message || "Failed to allocate QR codes");
            }
        } catch (err) {
            console.error("Error allocating QR codes:", err);
            setNewQRCodesError(
                err.response?.data?.message || err.message || "An error occurred during QR code allocation"
            );
        } finally {
            setBtnLoading(false);
        }
    };

    // Add function to handle registration API call
    const handleRegisterSubscriber = async () => {
        try {
            setRegistrationLoading(true);
            setRegistrationError("");

            // Validate required fields before making API call
            if (!firstName || !contacts[0]?.contactNumber || !emails[0]?.emailAddress) {
                setRegistrationError("First name, contact number, and email are required for registration");
                setRegistrationLoading(false);
                return null;
            }

            const registrationPayload = {
                users: [
                    {
                        Name: firstName + (middleName ? ` ${middleName}` : "") + (lastName ? ` ${lastName}` : ""),
                        Email: emails[0]?.emailAddress || "",
                        Mobile: contacts[0]?.contactNumber || "",
                        CountryCode: contacts[0]?.countryCode?.value?.split(" ")[0] || "",
                        Suffix: salutation || "",
                        Address: address || "",
                        WhatsAppCountryCode: contacts[0]?.countryCode?.value?.split(" ")[0] || "",
                        WhatsappNumber: contacts[0]?.contactNumber || "",
                        AdressTwo: state || "",
                        City: city || "",
                        Country: country?.Value || country?.label || "",
                    },
                ],
            };

            // Call the register API
            const registerResponse = await registerSubscriber(registrationPayload);

            // Handle the API response structure
            if (registerResponse.data.status === 200) {
                // The API returns result object with inserted and duplicates arrays
                const result = registerResponse.data.result;
                let registeredUser = null;

                // Check if user was inserted (new user)
                if (result.inserted && result.inserted.length > 0) {
                    registeredUser = result.inserted[0];
                }
                // Check if user already exists (duplicate)
                else if (result.duplicates && result.duplicates.length > 0) {
                    registeredUser = result.duplicates[0];
                }

                if (registeredUser) {
                    // Extract AutoID and Token from the user data
                    const AutoID = registeredUser.AutoID;
                    const Token = registeredUser.Token;

                    // Update currentSubscriberData state
                    setCurrentSubscriberData({
                        AutoID: AutoID,
                        Token: Token,
                    });

                    setRegistrationLoading(false);
                    return { AutoID, Token };
                } else {
                    setRegistrationError("Registration failed: No user data returned");
                    setRegistrationLoading(false);
                    return null;
                }
            } else {
                setRegistrationError("Registration failed: " + (registerResponse.data.message || "Unknown error"));
                setRegistrationLoading(false);
                return null;
            }
        } catch (err) {
            console.error("Error in registration:", err);
            setRegistrationError("Registration failed: " + (err.message || "Unknown error"));
            setRegistrationLoading(false);
            return null;
        }
    };

    // Add function to handle color code change
    const handleColorCodeChange = (selectedOption) => {
        if (selectedOption.value === "add_color_code") {
            setOpenColorCodeModal(true);
        } else {
            setSelectedColorCode(selectedOption);
        }
    };

    // Add function to add new color code
    const addNewColorCode = () => {
        const requestData = {
            name: newColorCodeName,
        };

        ApiServices.contact
            .AddColorCode(requestData)
            .then((res) => {
                const { data, message } = res;
                console.log("Add Color Code", data);
                if (res?.status === true) {
                    const newOption = {
                        id: Date.now(),
                        value: newColorCodeName.toLowerCase(),
                        label: newColorCodeName,
                    };
                    setColorCodeOptions([...colorCodeOptions, newOption]);
                    setSelectedColorCode(newOption);
                    setOpenColorCodeModal(false);
                    getColorCodes();
                    setNewColorCodeName("");
                }
            })
            .catch((err) => {
                setErrorMessageServer(err.response?.data?.message);
            });
    };

    // Add function to get color codes
    const getColorCodes = () => {
        const requestData = {};
        ApiServices.contact
            .getColorCodes(requestData)
            .then((res) => {
                const { data, message } = res;
                console.log("Color Codes", data);
                if (data.status === true) {
                    const colorCodes = data?.data?.map((color) => ({
                        id: color.id,
                        value: color.id,
                        label: color.name,
                    }));
                    setColorCodeOptions(colorCodes);
                }
            })
            .catch((err) => {});
    };

    // Add function to delete color code
    const deleteColorCode = () => {
        setBtnLoading(true);
        ApiServices.contact
            .deleteContactColorCode(openDeleteModalColorCode?.data)
            .then((res) => {
                const { data, message } = res;
                if (data?.status === true) {
                    setBtnLoading(false);
                    setSelectedColorCode(null);
                    getColorCodes();
                    setOpenDeleteModalColorCode({ open: false, data: null });
                    openSuccessModal({
                        title: "Success!",
                        message: "Contact color code has been deleted successfully!",
                        onClickDone: (close) => {
                            closeSuccessModel();
                        },
                    });
                }
            })
            .catch((err) => {
                setErrorMessage(err?.response?.data?.message);
                setBtnLoading(false);
                setSelectedColorCode(null);
            });
    };

    // Handle Submit
    const handleSubmit = (e) => {
        e.preventDefault();
    };

    // UPDATED: Check if child form is complete
    const isChildFormComplete = (childData = newChild) => {
        return (
            childData.salutation.trim() !== "" &&
            childData.name.trim() !== "" &&
            childData.lastName.trim() !== "" &&
            childData.gender !== "null" &&
            childData.gender !== "" &&
            childData.countryCode !== "" &&
            childData.contactNumber.trim() !== ""
        );
    };

    // Check if spouse form is complete
    const isSpouseFormComplete = (spouseData = spouse) => {
        return (
            spouseData.salutation.trim() !== "" &&
            spouseData.name.trim() !== "" &&
            spouseData.lastName.trim() !== "" &&
            spouseData.gender !== "null" &&
            spouseData.gender !== "" &&
            spouseData.countryCode !== "" &&
            spouseData.contactNumber.trim() !== "" &&
            spouseData.meal_preference
        );
    };

    // UPDATED: Validation function for child data
    const validateChildFormData = (childData) => {
        return (
            childData.salutation.trim() !== "" &&
            childData.name.trim() !== "" &&
            childData.lastName.trim() !== "" &&
            childData.gender !== "null" &&
            childData.gender !== "" &&
            childData.countryCode !== "" &&
            childData.contactNumber.trim() !== ""
        );
    };

    // UPDATED: Validation function
    const validateChildForm = () => {
        let isValid = true;
        const newErrors = {
            salutation: "",
            name: "",
            lastName: "",
            gender: "",
            countryCode: "",
            contactNumber: "",
        };

        if (!newChild.salutation.trim()) {
            newErrors.salutation = "Salutation is required";
            isValid = false;
        }

        if (!newChild.name.trim()) {
            newErrors.name = "First name is required";
            isValid = false;
        }

        if (!newChild.lastName.trim()) {
            newErrors.lastName = "Last name is required";
            isValid = false;
        }

        if (!newChild.gender || newChild.gender === "null") {
            newErrors.gender = "Please select a gender";
            isValid = false;
        }

        if (!newChild.countryCode) {
            newErrors.countryCode = "Country code is required";
            isValid = false;
        }

        if (!newChild.contactNumber.trim()) {
            newErrors.contactNumber = "Contact number is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleAdultToggle = () => {
        setNewChild((prev) => ({
            ...prev,
            isAdult: !prev.isAdult,
        }));

        // Clear any errors for adult-specific fields when toggling off
        if (newChild.isAdult) {
            setErrors((prev) => ({
                ...prev,
                lastName: "",
                salutation: "",
            }));
        }
    };

    const handleChildAdultToggle = (childId) => {
        setChildren((prevChildren) =>
            prevChildren.map((child) => (child.id === childId ? { ...child, isAdult: !child.isAdult } : child))
        );
    };

    // UPDATED: Auto-add child when form is complete
    const handleAutoAddChild = (childData) => {
        if (validateChildFormData(childData)) {
            setChildren((prevChildren) => [...prevChildren, { id: Date.now(), ...childData }]);

            // Reset the form for next child
            setNewChild({
                salutation: "",
                name: "",
                middleName: "",
                lastName: "",
                gender: "null",
                countryCode: "",
                contactNumber: "",
                isAdult: false,
                profileImage: null,
                profileFile: null,
                medicines: [],
            });
            // Clear any validation errors
            setErrors({
                salutation: "",
                name: "",
                lastName: "",
                gender: "",
                countryCode: "",
                contactNumber: "",
            });

            // Hide the new child form after auto-adding
            setShowNewChildForm(false);
        }
    };

    // NEW: Plus button now only shows new child form block
    const handleAddNewChildForm = () => {
        setShowNewChildForm(true);
        setNewChild({
            salutation: "",
            name: "",
            middleName: "",
            lastName: "",
            gender: "null",
            countryCode: "",
            contactNumber: "",
            isAdult: false,
            profileImage: null,
            profileFile: null,
            medicines: [],
        });
        setErrors({
            salutation: "",
            name: "",
            lastName: "",
            gender: "",
            countryCode: "",
            contactNumber: "",
        });
    };

    const handleRemoveChild = (childId) => {
        setChildren((prevChildren) => prevChildren.filter((child) => child.id !== childId));
        // Clean up loading and error states for removed child
        setChildrenProfileLoading((prev) => {
            const newState = { ...prev };
            delete newState[childId];
            return newState;
        });
        setChildrenProfileErrors((prev) => {
            const newState = { ...prev };
            delete newState[childId];
            return newState;
        });
    };

    // Function to handle updating adult fields for existing children
    const handleChildAdultFieldChange = (childId, field, value) => {
        setChildren((prevChildren) =>
            prevChildren.map((child) => (child.id === childId ? { ...child, [field]: value } : child))
        );
    };

    // UPDATED: Auto-add child when user stops typing and form is complete
    const handleInputChange = (field, value) => {
        const updatedChild = {
            ...newChild,
            [field]: value,
        };

        setNewChild(updatedChild);

        // Clear error when field is filled
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }

        // Auto-add child when all required fields are filled
        setTimeout(() => {
            if (isChildFormComplete(updatedChild)) {
                handleAutoAddChild(updatedChild);
            }
        }, 500); // 500ms delay after user stops typing
    };

    // Add Contact Funtionality
    const handleAddContactField = () => {
        setContacts((prevContacts) => [
            ...prevContacts,
            { id: Date.now(), contactType: "", countryCode: "", contactNumber: "" },
        ]);
        setISSubmitted(false);
    };

    const handleInputChangePhone = (id, field, value) => {
        setContacts((prevContacts) =>
            prevContacts.map((contact) => (contact.id === id ? { ...contact, [field]: value } : contact))
        );
    };

    const handleRemoveContact = (id) => {
        setContacts((prevContacts) => prevContacts.filter((contact) => contact.id !== id));
    };

    // Add Email Functionality
    const handleAddEmailField = () => {
        setEmails((prevEmails) => [...prevEmails, { id: Date.now(), emailType: "", emailAddress: "" }]);
    };

    const handleInputChangeEmail = (id, field, value) => {
        setEmails((prevEmails) => prevEmails.map((email) => (email.id === id ? { ...email, [field]: value } : email)));
    };

    const handleRemoveEmail = (id) => {
        setEmails((prevEmails) => prevEmails.filter((emailItem) => emailItem.id !== id));
    };

    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState("");

    // Profile Image Handler
    const handleProfileImage = (event) => {
        // Prevent event bubbling and ensure we're only handling main profile uploads
        event.stopPropagation();

        if (!event.target.files || event.target.files.length === 0) return;

        const file = event.target.files[0];
        console.log("Main contact profile image upload initiated");

        const formData = new FormData();
        formData.append("file", file);

        setProfileLoading(true);
        setProfileError("");

        ApiServices.contact
            .contactProfileUpload(formData)
            .then((res) => {
                const { data, message } = res;

                if (res.code === 200) {
                    setProfileImage(file);
                    setProfileFile(data);
                    setProfileLoading(false);
                    // Clear input value to ensure onChange triggers on selecting same file
                    event.target.value = "";
                }
            })
            .catch((err) => {
                setProfileLoading(false);
                setProfileError(err?.response?.data?.message || "Upload failed");
                // Clear input value
                event.target.value = "";
            });
    };

    // Spouse Profile Image Handler
    // const handleSpouseProfileImage = (event) => {
    //   // Prevent event bubbling and ensure we're only handling spouse uploads
    //   event.stopPropagation();

    //   if (!event.target.files || event.target.files.length === 0) return;

    //   const file = event.target.files[0];
    //   console.log("Spouse profile image upload initiated");

    //   const formData = new FormData();
    //   formData.append("file", file);

    //   setSpouseProfileLoading(true);
    //   setSpouseProfileError("");

    //   ApiServices.contact
    //     .contactProfileUpload(formData)
    //     .then((res) => {
    //       const { data, message } = res;

    //       if (res.code === 200) {
    //         setSpouse({
    //           salutation: spouse?.salutation || "",
    //           name: spouse?.name || "",
    //           middleName: spouse?.middleName || "",
    //           lastName: spouse?.lastName || "",
    //           gender: spouse?.gender || "",
    //           countryCode: spouse?.countryCode || "",
    //           contactNumber: spouse?.contactNumber || "",
    //           profileImage: spouse?.profile_image || null,
    //           profileFile: spouse?.profile_image || null,
    //           meal_preference: spouse?.meal_preference?.flatMap((category) => category?.map((item) => item.value)) || [], // [primary, secondary, alcoholic]
    //         });
    //         setSpouseProfileLoading(false);
    //         // Clear the input to allow re-selection of the same file
    //         event.target.value = "";
    //       }
    //     })
    //     .catch((err) => {
    //       setSpouseProfileLoading(false);
    //       setSpouseProfileError(err?.response?.data?.message || "Upload failed");
    //       // Clear the input
    //       event.target.value = "";
    //     });
    // };

    // ===============================
    // FULL WORKING SPOUSE IMAGE UPLOAD FUNCTION
    // ===============================
    const handleSpouseProfileImage = (event) => {
        event.stopPropagation();

        if (!event.target.files || event.target.files.length === 0) {
            console.log("No spouse image selected");
            return;
        }

        const file = event.target.files[0];
        console.log("Spouse image selected:", file);

        const formData = new FormData();
        formData.append("file", file);

        console.log("Uploading spouse profile image to server...");

        setSpouseProfileLoading(true);
        setSpouseProfileError("");

        ApiServices.contact
            .contactProfileUpload(formData)
            .then((res) => {
                console.log("Image upload response:", res);

                if (res.code === 200) {
                    console.log("Spouse image uploaded successfully:", res.data);

                    // Update spouse state properly
                    setSpouse((prev) => {
                        const updatedSpouse = {
                            ...prev,
                            profileImage: file, // for preview
                            profileFile: res.data, // uploaded image URL/path from backend
                        };

                        console.log("Updated spouse object:", updatedSpouse);
                        return updatedSpouse;
                    });

                    setSpouseProfileLoading(false);

                    // Reset input so user can select same image again
                    event.target.value = "";
                } else {
                    console.error("Image upload failed:", res.message);
                    setSpouseProfileError(res.message || "Upload failed");
                    setSpouseProfileLoading(false);
                    event.target.value = "";
                }
            })
            .catch((err) => {
                console.error("Error uploading spouse image:", err);
                setSpouseProfileError(err?.response?.data?.message || "Upload failed");
                setSpouseProfileLoading(false);
                event.target.value = "";
            });
    };

    // Child Profile Image Handler
    const handleChildProfileImage = (event, childId, isNewChild = false) => {
        // Prevent event bubbling and ensure we're only handling child uploads
        event.stopPropagation();

        if (!event.target.files || event.target.files.length === 0) return;

        const file = event.target.files[0];
        const uniqueIdentifier = isNewChild ? "newChild" : childId;

        console.log(`Child profile image upload initiated for ${isNewChild ? "new child" : "child " + childId}`);

        const formData = new FormData();
        formData.append("file", file);

        if (isNewChild) {
            // Handle new child image upload
            setChildrenProfileLoading((prev) => ({ ...prev, newChild: true }));
            setChildrenProfileErrors((prev) => ({ ...prev, newChild: "" }));
        } else {
            // Handle existing child image upload
            setChildrenProfileLoading((prev) => ({ ...prev, [childId]: true }));
            setChildrenProfileErrors((prev) => ({ ...prev, [childId]: "" }));
        }

        ApiServices.contact
            .contactProfileUpload(formData)
            .then((res) => {
                const { data, message } = res;

                if (res.code === 200) {
                    if (isNewChild) {
                        setNewChild((prev) => ({
                            ...prev,
                            profileImage: file,
                            profileFile: data,
                        }));
                        setChildrenProfileLoading((prev) => ({ ...prev, newChild: false }));
                    } else {
                        // FIXED: Use functional update to ensure we're updating the correct child
                        setChildren((prevChildren) =>
                            prevChildren.map((child) =>
                                child.id === childId ? { ...child, profileImage: file, profileFile: data } : child
                            )
                        );
                        setChildrenProfileLoading((prev) => ({ ...prev, [childId]: false }));
                    }

                    // Clear the input to allow re-selection of the same file
                    // IMPORTANT: Clear using the specific event target
                    if (event.target) {
                        event.target.value = "";
                    }
                }
            })
            .catch((err) => {
                const errorMessage = err?.response?.data?.message || "Upload failed";
                if (isNewChild) {
                    setChildrenProfileLoading((prev) => ({ ...prev, newChild: false }));
                    setChildrenProfileErrors((prev) => ({ ...prev, newChild: errorMessage }));
                } else {
                    setChildrenProfileLoading((prev) => ({ ...prev, [childId]: false }));
                    setChildrenProfileErrors((prev) => ({ ...prev, [childId]: errorMessage }));
                }

                // Clear the input
                if (event.target) {
                    event.target.value = "";
                }
            });
    };

    // Remove profile image handlers
    const handleRemoveSpouseProfileImage = () => {
        setSpouse((prev) => ({
            ...prev,
            profileImage: null,
            profileFile: null,
        }));
    };

    const handleRemoveChildProfileImage = (childId, isNewChild = false) => {
        if (isNewChild) {
            setNewChild((prev) => ({
                ...prev,
                profileImage: null,
                profileFile: null,
            }));
            // Clear any errors for new child
            setChildrenProfileErrors((prev) => ({ ...prev, newChild: "" }));
        } else {
            setChildren((prevChildren) =>
                prevChildren.map((child) =>
                    child.id === childId ? { ...child, profileImage: null, profileFile: null } : child
                )
            );
            // Clear any errors for this specific child
            setChildrenProfileErrors((prev) => ({ ...prev, [childId]: "" }));
        }
    };

    // Identity File Upload Handler
    const handleFileChangeIdentify = (event) => {
        if (!event.target.files || event.target.files.length === 0) return;

        console.log("Identity file upload initiated");
        setFileLoading(true);

        const files = Array.from(event.target.files); // Convert FileList to Array

        const uploadFile = (file) => {
            const formData = new FormData();
            formData.append("file", file);

            return ApiServices.contact.contactProfileUpload(formData).then((res) => {
                if (res.code === 200) {
                    return res.data; // Return uploaded file data
                }
                throw new Error(res.message || "Upload failed");
            });
        };

        Promise.all(files.map(uploadFile))
            .then((uploadedFiles) => {
                setIndentityFile((prevFiles) => [...prevFiles, ...files]); // Store selected files
                setFile((uploadedFile) => [...uploadedFile, ...uploadedFiles]); // Store uploaded file data
                setFileLoading(false);
                event.target.value = null; // Clear input for re-selection
            })
            .catch((err) => {
                console.error("Identity file upload failed:", err);
                setFileLoading(false);
                event.target.value = null;
            });
    };

    // Handle File Removal
    const handleCrossClick = (indexToRemove) => {
        setIndentityFile((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
        setFile((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    // Add Family Functionality & API
    const handleFamilyChange = (selectedOption) => {
        if (selectedOption.value === "add_family") {
            setOpenFamilyModal(true);
        } else {
            setFamily(selectedOption);
        }
    };

    const addNewFamily = () => {
        const requestData = {
            name: newFamilyName,
            event_id: eventSelect,
        };

        ApiServices.contact
            .AddFamily(requestData)
            .then((res) => {
                const { data, message } = res;
                if (res?.code === 200) {
                    const newOption = { value: newFamilyName.toLowerCase(), label: newFamilyName };
                    setOptions([...options, newOption]);
                    setFamily(newFamilyName);
                    setOpenFamilyModal(false);
                    getFamilyNames();
                    setNewFamilyName("");
                }
            })
            .catch((err) => {
                setErrorMessageServer(err.response?.data?.message);
            });
    };

    // console.log("emails----------", emails);

    const getFamilyNames = () => {
        const requestData = {
            event_id: eventSelect,
        };
        ApiServices.contact
            .getFamily(requestData)
            .then((res) => {
                const { data, message } = res;
                if (data.code === 200) {
                    const familyNames = data?.data?.data?.map((name) => ({ value: name?.id, label: name?.name }));
                    setOptions(familyNames);
                }
            })
            .catch((err) => {});
    };

    // Add Group Functionality & API
    const handleGroupChange = (selectedOption) => {
        if (selectedOption.value === "add_group") {
            setOpenGroupModal(true);
        } else {
            setGroups(selectedOption);
        }
    };

    const addNewGroup = () => {
        const requestData = {
            name: newGroupName,
            event_id: eventSelect,
        };

        ApiServices.contact
            .AddGroup(requestData)
            .then((res) => {
                const { data, message } = res;
                if (res?.code === 200) {
                    const newOption = { value: newGroupName.toLowerCase(), label: newGroupName };
                    setGroupOptions([...options, newOption]);
                    getGroupNames();
                    setGroups(newGroupName);
                    setOpenGroupModal(false);
                    setNewGroupName("");
                }
            })
            .catch((err) => {
                setErrorMessageServer(err.response?.data?.message);
            });
    };

    const getGroupNames = () => {
        const requestData = {
            event_id: eventSelect,
        };
        ApiServices.contact
            .getGroup(requestData)
            .then((res) => {
                const { data, message } = res;
                if (data.code === 200) {
                    const groupNames = data?.data?.data?.map((name) => ({ value: name.id, label: name.name }));
                    setGroupOptions(groupNames);
                }
            })
            .catch((err) => {});
    };

    const fieldRefs = {
        city: useRef(null),
        state: useRef(null),
        country: useRef(null),
        lastName: useRef(null),
        birthDate: useRef(null),
        firstName: useRef(null),
        salutation: useRef(null),
        memberCount: useRef(null),
        contacts: useRef(null),
    };

    useEffect(() => {
        if (isSubmitted) {
            validateForm();
        }
    }, [isSubmitted]);

    const validateForm = () => {
        let firstInvalidField = null;
        let isValid = true; // Assume valid until proven otherwise

        // Check each field and log the results
        if (!salutation) {
            console.log("Salutation is missing");
            firstInvalidField = fieldRefs.salutation.current;
            isValid = false;
        } else if (!firstName) {
            console.log("First Name is missing");
            firstInvalidField = fieldRefs.firstName.current;
            isValid = false;
        } else if (!lastName) {
            console.log("Last Name is missing");
            firstInvalidField = fieldRefs.lastName.current;
            isValid = false;
        }
        // else if (!memberCount) {
        //   console.log("Member Count is missing");
        //   firstInvalidField = fieldRefs.memberCount.current;
        //   isValid = false;
        // }
        else if (
            contacts.some(
                (contact) => !contact?.contactType?.value || !contact?.countryCode?.value || !contact.contactNumber
            )
        ) {
            console.log("Invalid contact details");
            firstInvalidField = fieldRefs.contacts.current;
            isValid = false;
        }

        // Scroll to the first invalid field if any
        if (firstInvalidField) {
            firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        return isValid;
    };

    const [selectedMealIds, setSelectedMealIds] = useState([]);

    // Handler to update the array with selected values
    const handleMealChange = (value, index) => {
        // Copy current selected values
        const updatedSelectedMeals = [...selectedMealIds];
        // Replace the value at the correct index (primary = 0, secondary = 1, alcoholic = 2)
        updatedSelectedMeals[index] = value;
        // Update the state
        setSelectedMealIds(updatedSelectedMeals);
    };

    // Add Contact API - UPDATED with registration integration
    const AddNewContact = async () => {
        setISSubmitted(true);

        const isValid = validateForm();
        console.log({ isValid });
        if (!isValid) return;

        let AutoID, Token;

        // Check if we need to register the subscriber first
        // if (!currentSubscriberData?.AutoID) {
        //   // User is not registered, call register API
        //   const registrationResult = await handleRegisterSubscriber();

        //   if (!registrationResult) {
        //     // Registration failed, stop the process
        //     return;
        //   }

        //   AutoID = registrationResult.AutoID;
        //   Token = registrationResult.Token;
        // } else {
        //   // User is already registered, use existing data
        //   AutoID = currentSubscriberData.AutoID;
        //   Token = currentSubscriberData.Token;
        // }

        // Separate regular children and adult children
        const regularChildren = children?.filter((child) => !child.isAdult);
        const adultChildren = children?.filter((child) => child.isAdult);
        const identityImageString = Array.isArray(file) ? file.join(",") : file;

        let requestData = {
            salutation: salutation,
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            nick_name: nickName,
            salutation_in_email: salutationEmail,
            gender: gender,
            DOB: toUTCUnixTimestamp(birthDate),
            group_id: groups?.value,
            family_id: family?.value,
            color_code_id: selectedColorCode?.value,
            no_of_members: 1 + (children?.length || 0) + (spouse?.name ? 1 : 0),
            marital_status: martialStatus,
            anniversery_date: toUTCUnixTimestamp(anniversaryDate),
            address: address,
            city: city,
            state: state,
            pin: pin,
            country: country?.Value,
            company_name: companyName,
            work_address: workAddress,
            work_pin: workPin,
            work_country: workCountry?.Value,
            meal_preference: selectedMealIds?.flatMap((category) => category.map((item) => item.value)),
            special_need: specialNeed === true ? "yes" : "not",
            identity_image: identityImageString,
            profile_image: profileFile,
            description: note,
            event_id: eventSelect,
            wedding_hall_seat: weddingHallSeat,

            // Add medicines to the payload
            medicines: medicines
                .map((medicine) => ({
                    // Include ID for existing medicines (those with string IDs from the API)
                    ...(medicine.id && typeof medicine.id === "string" && medicine.id.length > 10
                        ? { id: medicine.id }
                        : {}),
                    name: medicine.name,
                    ailment: medicine.ailment,
                    special_instructions: medicine.special_instructions,
                    type: medicine.type,
                    usage: medicine.usage,
                }))
                .filter((medicine) => medicine.name && medicine.ailment), // Only include medicines with required fields

            // Add the registration data to the payload
            auto_id: AutoID,
            qr_token: Token,

            // Include profile images for spouse and children
            contact_children:
                martialStatus.toLowerCase() === "single"
                    ? []
                    : [
                          ...(Array.isArray(children)
                              ? children.map((item) => {
                                    return {
                                        name: item?.name,
                                        middle_name: item?.middleName || "",
                                        salutation: item?.salutation,
                                        last_name: item?.lastName,
                                        gender: item?.gender,
                                        contact_number: {
                                            number: item?.contactNumber,
                                            countryCode: item?.countryCode?.value,
                                        },
                                        type: "children",
                                        isAdult: item.isAdult,
                                        profile_image: item?.profileFile || null,
                                        wedding_hall_seat: item?.weddingHallSeat,

                                        meal_preference:
                                            item?.meal_preference?.flatMap((category) =>
                                                Array.isArray(category) ? category.map((item) => item.value) : []
                                            ) || [],
                                        medicines:
                                            item?.medicines?.map((medicine) => ({
                                                // Include ID for existing medicines (those with string IDs from the API)
                                                ...(medicine.id &&
                                                typeof medicine.id === "string" &&
                                                medicine.id.length > 10
                                                    ? { id: medicine.id }
                                                    : {}),
                                                name: medicine.name,
                                                ailment: medicine.ailment,
                                                special_instructions: medicine.special_instructions,
                                                type: medicine.type,
                                                usage: medicine.usage,
                                            })) || [],
                                    };
                                })
                              : []),
                          spouse?.name
                              ? {
                                    name: spouse?.name,
                                    middle_name: spouse?.middleName || "",
                                    salutation: spouse?.salutation,
                                    last_name: spouse?.lastName,
                                    contact_number: {
                                        number: spouse?.contactNumber,
                                        countryCode: spouse?.countryCode?.value,
                                    },
                                    gender: spouse?.gender,
                                    type: "spouse",
                                    profile_image: spouse?.profileFile || null,
                                    wedding_hall_seat: spouse?.weddingHallSeat,

                                    meal_preference:
                                        spouse?.meal_preference?.flatMap((category) =>
                                            Array.isArray(category) ? category.map((item) => item.value) : []
                                        ) || [],
                                    medicines:
                                        spouse?.medicines?.map((medicine) => ({
                                            // Include ID for existing medicines (those with string IDs from the API)
                                            ...(medicine.id &&
                                            typeof medicine.id === "string" &&
                                            medicine.id.length > 10
                                                ? { id: medicine.id }
                                                : {}),
                                            name: medicine.name,
                                            ailment: medicine.ailment,
                                            special_instructions: medicine.special_instructions,
                                            type: medicine.type,
                                            usage: medicine.usage,
                                        })) || [],
                                }
                              : null,
                      ].filter(Boolean),

            contact_numbers: contacts?.map((item) => {
                return {
                    type: item?.contactType?.value,
                    contact_number: item?.contactNumber,
                    country_code: item?.countryCode?.value || item?.countryCode,
                };
            }),

            contact_emails: emails.map((item) => {
                return { type: item?.emailType, contact_email: item?.emailAddress };
            }),
        };

        // console.log("requested data--------------", requestData); return false;

        setAddLoading(true);

        // First API call to add the main contact
        ApiServices.contact
            .AddContact(requestData)
            .then((res) => {
                const { data, message } = res;

                if (res?.code === 200) {
                    const mainContactId = res?.data?.id || res?.data?._id; // Assuming the API returns the new contact's ID

                    // If we have adult children, add them as separate contacts
                    if (adultChildren && adultChildren.length > 0) {
                        console.log("Adding adult children as separate contacts:", adultChildren);

                        // Create an array of promises for each adult child
                        const adultContactPromises = adultChildren?.map((adultChild) => {
                            // Create request data for each adult child
                            const adultContactData = {
                                salutation: adultChild.salutation || "",
                                first_name: adultChild.name || "",
                                middle_name: adultChild.middleName || "",
                                last_name: adultChild.lastName || "",
                                gender: adultChild.gender || "",
                                no_of_members: 1,
                                marital_status: "Single",
                                event_id: eventSelect,
                                color_code_id: selectedColorCode?.value,
                                group_id: groups?.value,
                                family_id: family?.value,
                                address: address,
                                city: city,
                                state: state,
                                pin: pin,
                                country: country?.Value,
                                company_name: companyName,
                                work_city: workCity,
                                work_state: workState,
                                work_address: workAddress,
                                work_pin: workPin,
                                work_country: workCountry?.Value,
                                wedding_hall_seat: weddingHallSeat,

                                meal_preference: selectedMealIds?.flatMap((category) =>
                                    category.map((item) => item.value)
                                ),
                                profile_image: adultChild.profileFile || null,
                                // Add any additional fields needed for adult contacts

                                // Add registration data for adult children too
                                auto_id: AutoID,
                                qr_token: Token,

                                contact_numbers: [
                                    {
                                        type: "mobile", // or whatever default type you prefer
                                        contact_number: adultChild.contactNumber || "",
                                        country_code: adultChild.countryCode?.value || adultChild.countryCode || "",
                                    },
                                ],
                            };

                            console.log("Adding adult child as contact:", adultContactData);
                            // Return the promise from the API call
                            return ApiServices.contact.AddContact(adultContactData);
                        });

                        // Wait for all adult contact additions to complete
                        return Promise.all(adultContactPromises)
                            .then((responses) => {
                                console.log("All adult children added successfully:", responses);
                                // All adult contacts added successfully
                                finishContactAddition(true);
                            })
                            .catch((err) => {
                                console.error("Error adding adult children as contacts:", err);
                                // Still consider the main operation successful
                                finishContactAddition(
                                    true,
                                    "Main contact added but some adult children could not be added"
                                );
                            });
                    } else {
                        console.log("No adult children to add");
                        // No adult children to add, complete the process
                        finishContactAddition(true);
                    }
                } else {
                    finishContactAddition(false, res?.message);
                }
            })
            .catch((err) => {
                console.error("Error adding main contact:", err);
                finishContactAddition(false, err?.response?.data?.message);
            });

        // Helper function to finish the contact addition process
        const finishContactAddition = (isSuccess, customMessage = null) => {
            setAddLoading(false);

            if (isSuccess) {
                navigate("/contacts");
                setMessage({ text: "", color: "" });
                openSuccessModal({
                    title: t("message.success"),
                    message: customMessage || t("contacts.contactAddedSuccess"),
                    onClickDone: closeSuccessModel,
                });
            } else {
                setMessage({ text: customMessage || "Failed to add contact", color: "" });
            }
        };
    };

    // Update Contact API
    const updateContact = () => {
        setISSubmitted(true);

        const isValid = validateForm();
        if (!isValid) return;

        let requestData = {
            salutation: salutation,
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            nick_name: nickName,
            salutation_in_email: salutationEmail,
            gender: gender,
            DOB: toUTCUnixTimestamp(birthDate),
            group_id: groups?.value,
            family_id: family?.value,
            color_code_id: selectedColorCode?.value,
            no_of_members: 1 + (children?.length || 0) + (spouse?.name ? 1 : 0),
            marital_status: martialStatus,
            anniversery_date: toUTCUnixTimestamp(anniversaryDate),
            address: address,
            city: city,
            state: state,
            pin: pin,
            country: country?.Value,
            company_name: companyName,
            work_city: workCity,
            work_state: workState,
            work_pin: workPin,
            work_country: workCountry?.Value,
            work_address: workAddress,
            special_need: specialNeed === true ? "yes" : "not",
            identity_image: file,
            profile_image: profileFile,
            description: note,
            event_id: eventSelect,
            wedding_hall_seat: weddingHallSeat,

            meal_preference: selectedMealIds?.flatMap((category) => category.map((item) => item.value)),
            // Add medicines to the payload
            medicines: medicines
                .map((medicine) => ({
                    // Include ID for existing medicines (those with string IDs from the API)
                    ...(medicine.id && typeof medicine.id === "string" && medicine.id.length > 10
                        ? { id: medicine.id }
                        : {}),
                    name: medicine.name,
                    ailment: medicine.ailment,
                    special_instructions: medicine.special_instructions,
                    type: medicine.type,
                    usage: medicine.usage,
                }))
                .filter((medicine) => medicine.name && medicine.ailment),
            // Conditionally set contact_children based on marital status
            contact_children:
                martialStatus?.toLowerCase() == "single"
                    ? []
                    : [
                          ...(Array.isArray(children)
                              ? children.map((item) => {
                                    return {
                                        name: item?.name,
                                        middle_name: item?.middleName || "",
                                        salutation: item?.salutation,
                                        last_name: item?.lastName,
                                        gender: item?.gender,
                                        contact_number: {
                                            number: item?.contactNumber,
                                            countryCode: item?.countryCode?.value,
                                        },
                                        type: "children",
                                        isAdult: item.isAdult,
                                        profile_image: item?.profileFile || null,
                                        wedding_hall_seat: item?.weddingHallSeat,

                                        meal_preference:
                                            item?.meal_preference?.flatMap((category) =>
                                                Array.isArray(category) ? category.map((item) => item.value) : []
                                            ) || [],
                                        medicines:
                                            item?.medicines?.map((medicine) => ({
                                                // Include ID for existing medicines (those with string IDs from the API)
                                                ...(medicine.id &&
                                                typeof medicine.id === "string" &&
                                                medicine.id.length > 10
                                                    ? { id: medicine.id }
                                                    : {}),
                                                name: medicine.name,
                                                ailment: medicine.ailment,
                                                special_instructions: medicine.special_instructions,
                                                type: medicine.type,
                                                usage: medicine.usage,
                                            })) || [],
                                    };
                                })
                              : []),
                          spouse?.name
                              ? {
                                    name: spouse?.name,
                                    middle_name: spouse?.middleName || "",
                                    salutation: spouse?.salutation,
                                    last_name: spouse?.lastName,
                                    contact_number: {
                                        number: spouse?.contactNumber,
                                        countryCode: spouse?.countryCode?.value,
                                    },
                                    gender: spouse?.gender,
                                    type: "spouse",
                                    profile_image: spouse?.profileFile || null,
                                    wedding_hall_seat: spouse?.weddingHallSeat,

                                    meal_preference:
                                        spouse?.meal_preference?.flatMap((category) =>
                                            Array.isArray(category) ? category.map((item) => item.value) : []
                                        ) || [],
                                    medicines:
                                        spouse?.medicines?.map((medicine) => ({
                                            // Include ID for existing medicines (those with string IDs from the API)
                                            ...(medicine.id &&
                                            typeof medicine.id === "string" &&
                                            medicine.id.length > 10
                                                ? { id: medicine.id }
                                                : {}),
                                            name: medicine.name,
                                            ailment: medicine.ailment,
                                            special_instructions: medicine.special_instructions,
                                            type: medicine.type,
                                            usage: medicine.usage,
                                        })) || [],
                                }
                              : null,
                      ].filter(Boolean),

            contact_numbers: Array.isArray(contacts)
                ? contacts.map((item) => {
                      return {
                          type: item?.contactType?.value,
                          contact_number: item?.contactNumber,
                          country_code: item?.countryCode?.value,
                      };
                  })
                : [],

            // contact_emails: Array.isArray(emails)
            //   ? emails.map((item) => {
            //       return {
            //         type: item?.emailType?.value,
            //         contact_email: item?.emailAddress,
            //       };
            //     })
            //   : [],
            contact_emails: Array.isArray(emails)
                ? emails.map((item) => ({
                      type: item.emailType, // <-- now simple string
                      contact_email: item.emailAddress,
                  }))
                : [],
        };
        setUpdateLoading(true);

        ApiServices.contact
            .updateContact(data?.uuid, requestData)
            .then((res) => {
                const { data, message } = res;

                if (data.code === 200) {
                    navigate("/contacts");
                    setUpdateLoading(false);
                    openSuccessModal({
                        title: t("message.success"),
                        message: t("contacts.contactUpdatedSucess"),
                        onClickDone: closeSuccessModel,
                    });
                } else {
                    setUpdateLoading(false);
                }
            })
            .catch((err) => {});
    };

    // Update the State useEffect
    useEffect(() => {
        if (data) {
            console.log("Data received in ContactForm:", data);

            // Set registration data if available
            setCurrentSubscriberData({
                AutoID: data.auto_id,
                Token: data.qr_token,
            });

            // Helper function to parse contact number (same as in FamilyTab)
            const parseContactNumber = (contactNumber) => {
                if (!contactNumber) return { number: "", countryCode: "" };

                // If it's already an object, return it
                if (typeof contactNumber === "object" && contactNumber !== null) {
                    return {
                        number: contactNumber.number || "",
                        countryCode: contactNumber.countryCode || "",
                    };
                }

                // If it's a string, try to parse it as JSON
                if (typeof contactNumber === "string") {
                    try {
                        const parsed = JSON.parse(contactNumber);
                        return {
                            number: parsed.number || "",
                            countryCode: parsed.countryCode || "",
                        };
                    } catch (error) {
                        // If parsing fails, treat it as a plain number
                        return {
                            number: contactNumber,
                            countryCode: "",
                        };
                    }
                }

                return { number: "", countryCode: "" };
            };

            let finalArray = [];
            if (Array.isArray(data.identity_image)) {
                // It's already an array, so use it directly
                finalArray = data?.identity_image;
            } else if (typeof data?.identity_image === "string") {
                try {
                    // First, try to parse it as JSON
                    try {
                        const parsedData = JSON.parse(data?.identity_image);
                        // If the parsed data is an array, use it
                        finalArray = Array.isArray(parsedData) ? parsedData : [];
                    } catch (jsonError) {
                        // If JSON parsing fails, it might be a comma-separated string
                        // Split by comma to convert to array
                        finalArray = data?.identity_image.split(",").filter((item) => item.trim() !== "");
                    }
                } catch (error) {
                    console.error("Error processing identity_image:", error);
                    finalArray = [];
                }
            }

            console.log("data----------------", data);
            // Update state with the processed array
            setIndentityFile(finalArray);
            setFile(finalArray);
            setPin(data?.pin);
            setCity(data?.city);
            setNote(data?.description);
            setMeal(data?.meal_preference);
            setState(data?.state);
            setFamily(data?.family?.id ? { value: data?.family?.id, label: data?.family?.name } : null);
            setGroups(data?.group?.id ? { value: data?.group?.id, label: data?.group?.name } : null);
            setSelectedColorCode(
                data?.color_code?.id ? { value: data?.color_code?.id, label: data?.color_code?.name } : null
            );
            setGender(data?.gender);
            setCountry({ value: data?.country, label: data?.country });
            setAddress(data?.address);
            setEmails(
                data.emails.map((email) => ({
                    id: email.id,
                    emailType: email.type,
                    emailAddress: email.contact_email,
                }))
            );
            setLastName(data?.last_name);
            setNickName(data?.nick_name);
            setBeverage(data?.beverage_preference);
            setBirthDate(moment.unix(data?.DOB).format("YYYY-MM-DD"));
            setProfileFile(data?.profile_image);
            setProfileImage(data?.profile_image);
            setFirstName(data?.first_name);
            setSalutation(data?.salutation);
            setMiddleName(data?.middle_name);
            setMemberCount(data?.no_of_members);
            setSpecialNeed(data?.special_need === "yes" ? true : false);
            setMartialStatus(data?.marital_status);
            setSalutationEmail(data?.salutation_in_email);
            setAnniversaryDate(moment.unix(data?.anniversery_date).format("YYYY-MM-DD"));
            setCorresdondenceAddress(data?.correspondence_address);
            setWeddingHallSeat(data?.wedding_hall_seat);
            // Convert meal_preference from API format to form format
            const convertMealPreferences = (apiPreferences) => {
                if (!apiPreferences || !Array.isArray(apiPreferences)) return [[], [], []];

                const primary = apiPreferences
                    .filter((item) => item.type === "primary")
                    .map((item) => ({ value: item.id, label: item.name }));
                const secondary = apiPreferences
                    .filter((item) => item.type === "secondary")
                    .map((item) => ({ value: item.id, label: item.name }));
                const alcoholic = apiPreferences
                    .filter((item) => item.type === "alcoholic")
                    .map((item) => ({ value: item.id, label: item.name }));

                return [primary, secondary, alcoholic];
            };

            // Separate spouse and children from the children array
            const spouse = data.children?.find((item) => item.type === "spouse");
            const actualChildren = data.children?.filter((item) => item.type === "children") || [];

            // Update spouse
            if (spouse) {
                const spouseContactInfo = parseContactNumber(spouse?.contact_number);
                setSpouse({
                    salutation: spouse?.salutation || "",
                    name: spouse?.name || "",
                    middleName: spouse?.middleName || "",
                    lastName: spouse?.lastName || "",
                    gender: spouse?.gender || "",
                    countryCode: {
                        label: spouseContactInfo.countryCode,
                        value: spouseContactInfo.countryCode,
                    },
                    contactNumber: spouseContactInfo.number,
                    profileImage: spouse?.profile_image || null,
                    profileFile: spouse?.profile_image || null,
                    meal_preference: convertMealPreferences(spouse?.meal_preference),
                    medicines:
                        spouse?.medicines?.map((medicine) => ({
                            id: medicine.id,
                            name: medicine.name || "",
                            ailment: medicine.ailment || "",
                            special_instructions: medicine.special_instructions || "",
                            type: medicine.type || "",
                            usage: medicine.usage || "",
                        })) || [],
                    weddingHallSeat: spouse?.wedding_hall_seat || "",
                });
            } else {
                // Reset spouse if not found
                setSpouse({
                    salutation: "",
                    name: "",
                    middleName: "",
                    lastName: "",
                    gender: "",
                    countryCode: "",
                    contactNumber: "",
                    profileImage: null,
                    profileFile: null,
                    meal_preference: [[], [], []],
                    medicines: [],
                    weddingHallSeat: "",
                });
            }

            // Update children (only actual children, not spouse)
            setChildren(
                actualChildren.map((item) => {
                    const contactInfo = parseContactNumber(item?.contact_number);
                    return {
                        id: item?.id || Date.now() + Math.random(),
                        salutation: item?.salutation || "",
                        name: item?.name || "",
                        middleName: item?.middleName || "",
                        lastName: item?.lastName || "",
                        gender: item?.gender || "",
                        countryCode: {
                            label: contactInfo.countryCode,
                            value: contactInfo.countryCode,
                        },
                        contactNumber: contactInfo.number,
                        isAdult: item?.isAdult || false,
                        profileImage: item?.profile_image || null,
                        profileFile: item?.profile_image || null,
                        meal_preference: convertMealPreferences(item?.meal_preference),
                        medicines:
                            item?.medicines?.map((medicine) => ({
                                id: medicine.id,
                                name: medicine.name || "",
                                ailment: medicine.ailment || "",
                                special_instructions: medicine.special_instructions || "",
                                type: medicine.type || "",
                                usage: medicine.usage || "",
                            })) || [],
                        weddingHallSeat: item?.wedding_hall_seat || "",
                    };
                })
            );

            // Update main contact meal preferences
            setSelectedMealIds(convertMealPreferences(data.meal_preference));

            // Map contact numbers from API data to contacts state
            let contactsData = [];
            if (data?.contact_numbers && data.contact_numbers.length > 0) {
                contactsData = data.contact_numbers.map((item) => ({
                    id: item?.id || Date.now() + Math.random(),
                    contactType: { label: item?.type || "Home", value: item?.type || "Home" },
                    contactNumber: item?.contact_number || "",
                    countryCode: { label: item?.country_code || "", value: item?.country_code || "" },
                }));
            }

            // Ensure we have at least one empty contact field if no data
            if (contactsData.length === 0) {
                contactsData = [{ id: Date.now(), contactType: "", countryCode: "", contactNumber: "" }];
            }

            setContacts(contactsData);

            // Load existing medicines when editing a contact

            // Load existing medicines when editing a contact
            loadExistingMedicines(data);
        }
    }, [data]);

    useEffect(() => {
        if (isSpouseFormComplete()) {
            setShowSpouseIndicator(true);
            const timer = setTimeout(() => {
                setShowSpouseIndicator(false);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setShowSpouseIndicator(false);
        }
    }, [spouse]);

    // Load existing medicines when editing a contact
    const loadExistingMedicines = (contactData) => {
        if (contactData?.medicines && Array.isArray(contactData.medicines)) {
            const mappedMedicines = contactData.medicines.map((medicine) => ({
                id: medicine.id, // Keep the existing ID for updates
                name: medicine.name || "",
                ailment: medicine.ailment || "",
                special_instructions: medicine.special_instructions || "",
                type: medicine.type || "",
                usage: medicine.usage || "",
            }));
            setMedicines(mappedMedicines);
        } else {
            setMedicines([]);
        }
    };

    // API call useEffect
    useEffect(() => {
        getFamilyNames();
        getGroupNames();
        getColorCodes();
        getQrCodesList();
        getUserQrCodeCounts();
    }, [data]);

    // Refresh QR codes when eventDetail changes
    // useEffect(() => {
    //   if (eventDetail) {
    //     getQrCodesList();
    //     getUserQrCodeCounts();
    //   }
    // }, [eventDetail, data]);

    const handleRemoveProfileImage = () => {
        setProfileImage(null);
        setProfileFile(null);
    };

    const [allCategories, setAllCategories] = useState([]);

    const getCategories = async (emptySearch) => {
        let payload = {
            event_id: eventSelect,
        };

        const res = await ApiServices.contact
            .getPreference(payload)
            .then((res) => {
                const { data, message } = res;

                if (data?.code === 200) {
                    setAllCategories(data?.data);
                } else {
                }
            })
            .catch((err) => {});
    };

    const filterByType = (type) => {
        return allCategories
            ?.filter((item) => item.type === type)
            ?.map((item) => ({
                label: item.name,
                value: item.id,
            }));
    };

    // Create arrays for each type
    const primaryArray = filterByType("primary");
    const secondaryArray = filterByType("secondary");
    const alcoholicArray = filterByType("alcoholic");

    useEffect(() => {
        getCategories();
    }, []);

    const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });

    const deleteGroup = () => {
        setBtnLoading(true);
        ApiServices.contact
            .deleteContactGroup(openDeleteModal?.data)
            .then((res) => {
                const { data, message } = res;

                console.log({ abbb: data, res });

                if (data?.code === 200) {
                    setBtnLoading(false);
                    setGroups("");
                    getGroupNames();
                    setOpenDeleteModal({ open: false, data: null });
                    openSuccessModal({
                        title: "Success!",
                        message: "Contact group has been deleted successfully!",
                        onClickDone: (close) => {
                            closeSuccessModel();
                            // onSuccess();
                        },
                    });
                }
            })
            .catch((err) => {
                setErrorMessage(err?.response?.data?.message);
                setBtnLoading(false);
                setGroups("");
            });
    };

    const [openDeleteModalFamily, setOpenDeleteModalFamily] = useState({ open: false, data: null });

    const deleteFamily = () => {
        setBtnLoading(true);
        ApiServices.contact
            .deleteContactFamily(openDeleteModalFamily?.data)
            .then((res) => {
                const { data, message } = res;

                if (data?.code === 200) {
                    setBtnLoading(false);
                    setFamily("");
                    getFamilyNames();
                    setOpenDeleteModalFamily({ open: false, data: null });
                    openSuccessModal({
                        title: "Success!",
                        message: "Contact family has been deleted successfully!",
                        onClickDone: (close) => {
                            closeSuccessModel();
                            // onSuccess();
                        },
                    });
                }
            })
            .catch((err) => {
                setErrorMessage(err?.response?.data?.message);
                setBtnLoading(false);
                setFamily("");
            });
    };

    // Medicine handlers
    const handleAddMedicine = () => {
        console.log("Current medicines:", medicines);

        // Check if there are existing medicines and if the last one is incomplete
        if (medicines.length > 0) {
            const lastMedicine = medicines[medicines.length - 1];
            console.log("Last medicine:", lastMedicine);

            // Check if the last medicine is missing required fields
            if (!lastMedicine.name || !lastMedicine.ailment) {
                console.log("Validation failed - setting error");

                // Set validation error for the incomplete medicine
                setMedicineValidationErrors((prev) => ({
                    ...prev,
                    [lastMedicine.id]:
                        "Please fill in Medicine Name and Problem/Ailment before adding another medicine",
                }));

                return; // Don't add new medicine
            }
        }

        console.log("Validation passed - adding new medicine");

        // Clear any previous messages and errors
        setMessage({ text: "", color: "" });
        setMedicineValidationErrors({});

        // Add new medicine if validation passes
        setMedicines((prev) => [
            ...prev,
            {
                id: Date.now(),
                name: "",
                ailment: "",
                special_instructions: "",
                type: "",
                usage: "",
            },
        ]);
    };

    // Update the handleRemoveMedicine function
    const handleRemoveMedicine = (medicineId) => {
        // If it's an existing medicine (has a string ID from API), track it as deleted
        if (typeof medicineId === "string" && medicineId.length > 10) {
            setDeletedMedicineIds((prev) => [...prev, medicineId]);
        }

        // Remove from medicines state
        setMedicines((prev) => prev.filter((medicine) => medicine.id !== medicineId));
    };

    // Update the handleMedicineChange function to include validation
    const handleMedicineChange = (medicineId, field, value) => {
        setMedicines((prev) =>
            prev.map((medicine) => (medicine.id === medicineId ? { ...medicine, [field]: value } : medicine))
        );

        // Clear validation error when user starts typing
        if (medicineValidationErrors[medicineId]) {
            setMedicineValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[medicineId];
                return newErrors;
            });
        }
    };

    // Medicine handlers for spouse
    const handleAddSpouseMedicine = () => {
        console.log("Current spouse medicines:", spouse.medicines);

        // Check if there are existing medicines and if the last one is incomplete
        if (spouse.medicines.length > 0) {
            const lastMedicine = spouse.medicines[spouse.medicines.length - 1];
            console.log("Last spouse medicine:", lastMedicine);

            // Check if the last medicine is missing required fields
            if (!lastMedicine.name || !lastMedicine.ailment) {
                console.log("Spouse medicine validation failed - setting error");

                // Set validation error for the incomplete medicine
                setSpouseMedicineValidationErrors((prev) => ({
                    ...prev,
                    [lastMedicine.id]:
                        "Please fill in Medicine Name and Problem/Ailment before adding another medicine",
                }));

                return; // Don't add new medicine
            }
        }

        console.log("Spouse medicine validation passed - adding new medicine");

        // Clear any previous messages and errors
        setMessage({ text: "", color: "" });
        setSpouseMedicineValidationErrors({});

        // Add new medicine if validation passes
        setSpouse((prev) => ({
            ...prev,
            medicines: [
                ...prev.medicines,
                {
                    id: Date.now(),
                    name: "",
                    ailment: "",
                    special_instructions: "",
                    type: "",
                    usage: "",
                },
            ],
        }));
    };

    const handleRemoveSpouseMedicine = (medicineId) => {
        // If it's an existing medicine (has a string ID from API), track it as deleted
        if (typeof medicineId === "string" && medicineId.length > 10) {
            setDeletedSpouseMedicineIds((prev) => [...prev, medicineId]);
        }

        // Remove from spouse medicines state
        setSpouse((prev) => ({
            ...prev,
            medicines: prev.medicines.filter((medicine) => medicine.id !== medicineId),
        }));
    };

    const handleSpouseMedicineChange = (medicineId, field, value) => {
        setSpouse((prev) => ({
            ...prev,
            medicines: prev.medicines.map((medicine) =>
                medicine.id === medicineId ? { ...medicine, [field]: value } : medicine
            ),
        }));

        // Clear validation error when user starts typing
        if (spouseMedicineValidationErrors[medicineId]) {
            setSpouseMedicineValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[medicineId];
                return newErrors;
            });
        }
    };

    // Medicine handlers for children
    const handleAddChildMedicine = (childId) => {
        const child = children.find((c) => c.id === childId);
        if (!child) return;

        console.log("Current child medicines:", child.medicines || []);

        // Check if there are existing medicines and if the last one is incomplete
        if (child.medicines && child.medicines.length > 0) {
            const lastMedicine = child.medicines[child.medicines.length - 1];
            console.log("Last child medicine:", lastMedicine);

            // Check if the last medicine is missing required fields
            if (!lastMedicine.name || !lastMedicine.ailment) {
                console.log("Child medicine validation failed - setting error");

                // Set validation error for the incomplete medicine
                setChildrenMedicineValidationErrors((prev) => ({
                    ...prev,
                    [childId]: {
                        ...prev[childId],
                        [lastMedicine.id]:
                            "Please fill in Medicine Name and Problem/Ailment before adding another medicine",
                    },
                }));

                return; // Don't add new medicine
            }
        }

        console.log("Child medicine validation passed - adding new medicine");

        // Clear any previous messages and errors
        setMessage({ text: "", color: "" });
        setChildrenMedicineValidationErrors((prev) => ({
            ...prev,
            [childId]: {},
        }));

        // Add new medicine if validation passes
        setChildren((prevChildren) =>
            prevChildren.map((child) =>
                child.id === childId
                    ? {
                          ...child,
                          medicines: [
                              ...(child.medicines || []),
                              {
                                  id: Date.now(),
                                  name: "",
                                  ailment: "",
                                  special_instructions: "",
                                  type: "",
                                  usage: "",
                              },
                          ],
                      }
                    : child
            )
        );
    };

    const handleRemoveChildMedicine = (childId, medicineId) => {
        // If it's an existing medicine (has a string ID from API), track it as deleted
        if (typeof medicineId === "string" && medicineId.length > 10) {
            setDeletedChildrenMedicineIds((prev) => ({
                ...prev,
                [childId]: [...(prev[childId] || []), medicineId],
            }));
        }

        // Remove from child medicines state
        setChildren((prevChildren) =>
            prevChildren.map((child) =>
                child.id === childId
                    ? {
                          ...child,
                          medicines: (child.medicines || []).filter((medicine) => medicine.id !== medicineId),
                      }
                    : child
            )
        );
    };

    const handleChildMedicineChange = (childId, medicineId, field, value) => {
        setChildren((prevChildren) =>
            prevChildren.map((child) =>
                child.id === childId
                    ? {
                          ...child,
                          medicines: (child.medicines || []).map((medicine) =>
                              medicine.id === medicineId ? { ...medicine, [field]: value } : medicine
                          ),
                      }
                    : child
            )
        );

        // Clear validation error when user starts typing
        if (childrenMedicineValidationErrors[childId]?.[medicineId]) {
            setChildrenMedicineValidationErrors((prev) => {
                const newErrors = { ...prev };
                if (newErrors[childId]) {
                    delete newErrors[childId][medicineId];
                }
                return newErrors;
            });
        }
    };

    // Medicine handlers for new child
    const handleAddNewChildMedicine = () => {
        console.log("Current new child medicines:", newChild.medicines);

        // Check if there are existing medicines and if the last one is incomplete
        if (newChild.medicines.length > 0) {
            const lastMedicine = newChild.medicines[newChild.medicines.length - 1];
            console.log("Last new child medicine:", lastMedicine);

            // Check if the last medicine is missing required fields
            if (!lastMedicine.name || !lastMedicine.ailment) {
                console.log("New child medicine validation failed - setting error");

                // Set validation error for the incomplete medicine
                setNewChildMedicineValidationErrors((prev) => ({
                    ...prev,
                    [lastMedicine.id]:
                        "Please fill in Medicine Name and Problem/Ailment before adding another medicine",
                }));

                return; // Don't add new medicine
            }
        }

        console.log("New child medicine validation passed - adding new medicine");

        // Clear any previous messages and errors
        setMessage({ text: "", color: "" });
        setNewChildMedicineValidationErrors({});

        // Add new medicine if validation passes
        setNewChild((prev) => ({
            ...prev,
            medicines: [
                ...prev.medicines,
                {
                    id: Date.now(),
                    name: "",
                    ailment: "",
                    special_instructions: "",
                    type: "",
                    usage: "",
                },
            ],
        }));
    };

    const handleRemoveNewChildMedicine = (medicineId) => {
        // If it's an existing medicine (has a string ID from API), track it as deleted
        if (typeof medicineId === "string" && medicineId.length > 10) {
            setDeletedNewChildMedicineIds((prev) => [...prev, medicineId]);
        }

        // Remove from new child medicines state
        setNewChild((prev) => ({
            ...prev,
            medicines: prev.medicines.filter((medicine) => medicine.id !== medicineId),
        }));
    };

    const handleNewChildMedicineChange = (medicineId, field, value) => {
        setNewChild((prev) => ({
            ...prev,
            medicines: prev.medicines.map((medicine) =>
                medicine.id === medicineId ? { ...medicine, [field]: value } : medicine
            ),
        }));

        // Clear validation error when user starts typing
        if (newChildMedicineValidationErrors[medicineId]) {
            setNewChildMedicineValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[medicineId];
                return newErrors;
            });
        }
    };

    // Add handlers for spouse preferences
    const handleSpouseMealChange = (value, index) => {
        const currentMeals = spouse.meal_preference || [[], [], []];
        const updatedSpouseMeals = [...currentMeals];
        updatedSpouseMeals[index] = value;
        setSpouse({ ...spouse, meal_preference: updatedSpouseMeals });
    };

    // Add handlers for child preferences
    const handleChildMealChange = (childId, value, index) => {
        setChildren((prevChildren) =>
            prevChildren.map((child) => {
                if (child.id === childId) {
                    const currentMeals = child.meal_preference || [[], [], []];
                    const updatedChildMeals = [...currentMeals];
                    updatedChildMeals[index] = value;
                    return { ...child, meal_preference: updatedChildMeals };
                }
                return child;
            })
        );
    };

    // Add handler for new child preferences
    const handleNewChildMealChange = (value, index) => {
        const currentMeals = newChild.meal_preference || [[], [], []];
        const updatedNewChildMeals = [...currentMeals];
        updatedNewChildMeals[index] = value;
        setNewChild({ ...newChild, meal_preference: updatedNewChildMeals });
    };

    const emailTypeOptions = [
        { label: "Main", value: "Main" },
        { label: "Personal", value: "Personal" },
        { label: "Work", value: "Work" },
        { label: "Other", value: "Other" },
    ];

    const [isOtherInfoOpen, setIsOtherInfoOpen] = useState(false);
    const [isPreferenceOpen, setIsPreferenceOpen] = useState(false);
    const [isAddressOpen, setIsAddressOpen] = useState(false);
    const [isMedicinesOpen, setIsMedicinesOpen] = useState(false);
    const [isMaritalStatusOpen, setIsMaritalStatusOpen] = useState(true);
    const [isQrCodesOpen, setIsQrCodesOpen] = useState(true);
    const [isContactInfoOpen, setIsContactInfoOpen] = useState(true);
    const [isProfileImgOpen, setIsProfileImgOpen] = useState(true);
    const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(true);
    const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(true);

    return (
        <>
            <div
                onClick={() => navigate(CONTACTS)}
                className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}
            >
                <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
                <span>{t("contacts.backToContactList")}</span>
            </div>

              <form onSubmit={handleSubmit}>
                <div className="card ">
                  <div className="mb-5 flex cursor-pointer items-center justify-between"  onClick={() => setIsBasicInfoOpen(!isBasicInfoOpen)}>
                    <div className="label text-secondary">{t("contacts.addContact")}</div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white hover:bg-secondary/90">
                    {isBasicInfoOpen ? "−" : "+"}
                    </span>
                  </div>
                  {/* Registration Status and Error Display */}
                  {registrationLoading && (
                      <div className="mb-5 rounded-lg bg-blue-50 p-4">
                          <div className="flex items-center">
                              <Spinner />
                              <span className="ml-2 text-blue-700">Registering user...</span>
                          </div>
                      </div>
                  )}
                  {registrationError && (
                      <div className="mb-5 rounded-lg bg-red-50 p-4">
                          <span className="text-sm text-red-700">{registrationError}</span>
                      </div>
                  )}
                  {isBasicInfoOpen && (
	                <>
                  <div className="mb-5 ltr:text-left rtl:text-right">
                      <div className="flex items-center justify-between">
                          <div className="label mb-2 text-secondary text-lg font-semibold text-gray-800">{t("headings.basicInfo")}</div>
                      </div>
                  </div>
                  <div className="grid grid-cols-4 gap-7 md:grid-cols-3 lg:grid-cols-4">
                      {/* Existing basic info fields */}
                      <div ref={fieldRefs?.salutation}>
                          <Input
                              label={t("contacts.salutation")}
                              placeholder="Salutation"
                              value={salutation}
                              onChange={(e) => setSalutation(e.target.value)}
                              isRequired
                              error={isSubmitted && !salutation ? "Required" : ""}
                          />
                      </div>
                      <div ref={fieldRefs?.firstName}>
                          <Input
                              label={t("contacts.firstName")}
                              placeholder="First Name"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              isRequired
                              error={isSubmitted && !firstName ? "Required" : ""}
                          />
                      </div>
                      <Input
                          label={t("contacts.middleName")}
                          placeholder="Middle Name"
                          value={middleName}
                          onChange={(e) => setMiddleName(e.target.value)}
                      />
                      <div ref={fieldRefs?.lastName}>
                          <Input
                              label={t("contacts.lastName")}
                              placeholder="Last Name"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              isRequired
                              error={isSubmitted && !lastName ? "Required" : ""}
                          />
                      </div>
                      <Input
                          label={t("contacts.nickName")}
                          placeholder="Nick Name"
                          value={nickName}
                          onChange={(e) => setNickName(e.target.value)}
                      />
                      <Input
                          label={"Salutation in Message"}
                          placeholder="Example, Dear Deepak, Hello Mr. & Mrs. Aggarwal"
                          value={salutationEmail}
                          onChange={(e) => setSalutationEmail(e.target.value)}
                          labelOnTop
                      />

                      {/* Color Code Dropdown */}
                      <Dropdown
                          isSearchable
                          options={colorCodeOptions.concat({ value: "add_color_code", label: "Add New Color Code" })}
                          title="Select Guest Colour Code"
                          placeholder="Select Color Code"
                          value={selectedColorCode}
                          onChange={handleColorCodeChange}
                          Delete
                          setOpenDeleteModal={setOpenDeleteModalColorCode}
                      />

                      <Input
                          label="Wedding Hall Seat"
                          placeholder="Wedding Hall Seat"
                          value={weddingHallSeat}
                          onChange={(e) => setWeddingHallSeat(e.target.value)}
                      />

                      {/* QR Code Dropdown with Allot Button */}
                      
                  </div>
                  </>
                  )}
                </div>
                <div className="card mt-6">
                  <div className="mb-5 flex cursor-pointer items-center justify-between"  onClick={() => setIsPersonalInfoOpen(!isPersonalInfoOpen)}>
                    <div className="label text-secondary">{t("Personal Information")}</div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white hover:bg-secondary/90">
                    {isPersonalInfoOpen ? "−" : "+"}
                    </span>
                  </div>
                  {isPersonalInfoOpen && (
	                <>
                  <div className="my-5">
                      <div className="label mb-2">{t("contacts.gender")}</div>

                      <RadioInput
                          name="Gender"
                          options={[
                              {
                                  id: "male",
                                  value: "Male",
                                  label: t("contacts.male"),
                              },
                              { id: "female", value: "Female", label: t("contacts.female") },
                              { id: "other", value: "Other", label: t("contacts.other") },
                              { id: "n/a", value: "N/A", label: "N/A" },
                          ]}
                          Classes="flex"
                          labelClasses="ml-3"
                          onChange={(value) => setGender(value)}
                          checked={gender}
                      />
                  </div>
                    <div className="grid grid-cols-4 gap-7 md:grid-cols-2 lg:grid-cols-4">
                      <div ref={fieldRefs.birthDate}>
                          <Input
                              type="date"
                              label={t("contacts.birthDate")}
                              placeholder="Date"
                              value={birthDate}
                              onChange={(e) => {
                                  setBirthDate(e.target.value);
                              }}
                              max={moment().format("YYYY-MM-DD")}
                          />
                      </div>
                      <Dropdown
                          options={groupOptions?.concat({ value: "add_group", label: "Add New Group" })}
                          title={t("contacts.groups")}
                          placeholder="Select groups"
                          value={groups}
                          onChange={handleGroupChange}
                          Delete
                          setOpenDeleteModal={setOpenDeleteModal}
                      />
                      <AddGroupModal
                          isOpen={openGroupModal}
                          setIsOpen={setOpenGroupModal}
                          handleSubmit={addNewGroup}
                          value={newGroupName}
                          handleChange={(e) => setNewGroupName(e.target.value)}
                          message={errorMessageServer}
                          setErrorMessageServer={setErrorMessageServer}
                          setNewGroupName={setNewGroupName}
                      />

                      <Dropdown
                          options={options?.concat({ value: "add_family", label: "Add New Family" })}
                          title={t("contacts.family")}
                          placeholder="Select family"
                          value={family}
                          onChange={handleFamilyChange}
                          Delete
                          setOpenDeleteModal={setOpenDeleteModal}
                          setOpenDeleteModalFamily={setOpenDeleteModalFamily}
                      />
                      <AddFamilyModal
                          isOpen={openFamilyModal}
                          setIsOpen={setOpenFamilyModal}
                          handleSubmit={addNewFamily}
                          value={newFamilyName}
                          handleChange={(e) => setNewFamilyName(e.target.value)}
                          message={errorMessageServer}
                          setErrorMessageServer={setErrorMessageServer}
                          setNewFamilyName={setNewFamilyName}
                      />
                  </div>
                  </>
                  )}
                </div>
                  
                <div className="card mt-6">
                  <div className="mb-5 flex cursor-pointer items-center justify-between"  onClick={() => setIsProfileImgOpen(!isProfileImgOpen)}>
                    <div className="label text-secondary">{t("contacts.profileImage")}</div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white hover:bg-secondary/90">
                    {isProfileImgOpen ? "−" : "+"}
                    </span>
                  </div>
                  {isProfileImgOpen && (
	                <>
                  <div className="my-5 flex items-center gap-x-4">
                      <div className="">
                          <ChooseFile
                              // label={t("contacts.profileImage")}
                              onClickCross={handleRemoveProfileImage}
                              placeholder
                              selectedFile={ProfileImage}
                              loading={profileLoading}
                              dir
                              onChange={handleProfileImage}
                          />
                      </div>
                  </div>

                  {profileError && <span className="mt-5 block text-xs text-red-500"> {profileError}</span>}
                  </>
                  )}
                </div>
                <div className="card mt-6">
                  <div className="mb-5 flex cursor-pointer items-center justify-between"  onClick={() => setIsContactInfoOpen(!isContactInfoOpen)}>
                    <div className="label text-secondary">{t("Contact Information")}</div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white hover:bg-secondary/90">
                    {isContactInfoOpen ? "−" : "+"}
                    </span>
                  </div>
                  {isContactInfoOpen && (
                  <>
                  <div ref={fieldRefs.contacts} className="space-y-4">

                    {contacts.map((contact, index) => (
                      <div
                        key={contact.id}
                        className="grid w-full grid-cols-[2fr_2fr_3fr_60px] items-end gap-3"
                      >
                        {/* CONTACT TYPE */}
                        <Dropdown
                          title={`Contact ${index + 1}`}
                          placeholder="Type"
                          value={contact.contactType}
                          onChange={(value) =>
                            handleInputChangePhone(contact.id, "contactType", value)
                          }
                          isRequired={isSubmitted && !contact.contactType}
                          withError={isSubmitted && !contact.contactType && "Required"}
                          options={[
                            { label: "Home", value: "Home" },
                            { label: "Mobile", value: "Mobile" },
                            { label: "Land line", value: "Land line" },
                            { label: "Work", value: "Work" },
                            { label: "Fax", value: "Fax" },
                            { label: "Other", value: "Other" },
                          ]}
                        />

                        {/* COUNTRY CODE */}
                        <Dropdown
                          isSearchable
                          placeholder="Country Code"
                          value={contact.countryCode}
                          onChange={(value) =>
                            handleInputChangePhone(contact.id, "countryCode", value)
                          }
                          isRequired={isSubmitted && !contact.countryCode}
                          withError={isSubmitted && !contact.countryCode}
                          options={countriesCodeData?.countries.map((country) => ({
                            label: `+${country.callingCodes[0]} ${country.name}`,
                            value: `+${country.callingCodes[0]}`,
                          }))}
                          invisible
                        />

                        {/* CONTACT NUMBER */}
                        <Input
                          type="tel"
                          placeholder="Contact Number"
                          value={contact.contactNumber}
                          onChange={(e) =>
                            handleInputChangePhone(contact.id, "contactNumber", e.target.value)
                          }
                          isRequired={isSubmitted && !contact.contactNumber}
                          error={isSubmitted && !contact.contactNumber ? "Required" : ""}
                          invisible
                        />

                        {/* ACTION BUTTON */}
                        <div className="flex justify-center pb-1">
                          {index === 0 ? (
                            <button
                              type="button"
                              onClick={handleAddContactField}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white hover:bg-secondary/90"
                              title="Add Contact"
                            >
                              +
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveContact(contact.id)}
                              title="Remove Contact"
                            >
                              <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                  </div>
                  <div className="space-y-4">
                    {emails.map((emailItem, index) => (
                      <div
                        key={emailItem.id}
                        className="grid w-full grid-cols-[2fr_4fr_60px] items-end gap-3"
                      >
                        {/* EMAIL TYPE */}
                        <Dropdown
                          title={`Email ${index + 1}`}
                          placeholder="Type"
                          value={emailTypeOptions.find(
                            (opt) => opt.value === emailItem.emailType
                          )}
                          onChange={(value) =>
                            handleInputChangeEmail(emailItem.id, "emailType", value.value)
                          }
                          options={emailTypeOptions}
                        />

                        {/* EMAIL ADDRESS */}
                        <Input
                          type="email"
                          placeholder="Email Address"
                          value={emailItem.emailAddress}
                          onChange={(e) =>
                            handleInputChangeEmail(emailItem.id, "emailAddress", e.target.value)
                          }
                          isRequired
                          invisible
                        />

                        {/* ACTION BUTTON */}
                        <div className="flex justify-center pb-1">
                          {index === 0 ? (
                            <button
                              type="button"
                              onClick={handleAddEmailField}
                              title="Add Email"
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white hover:bg-secondary/90"
                            >
                              +
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveEmail(emailItem.id)}
                              title="Remove Email"
                            >
                              <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                  </div>
                  </>
                  )}
                </div>
                <div className="card mt-6">
                  <div className="mb-5 flex cursor-pointer items-center justify-between"  onClick={() => setIsQrCodesOpen(!isQrCodesOpen)}>
                    <div className="label text-secondary">{t("QR Codes")}</div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white hover:bg-secondary/90">
                    {isQrCodesOpen ? "−" : "+"}
                    </span>
                  </div>
                  {isQrCodesOpen && (
                  <div className="flex flex-wrap items-center justify-between gap-4">

                    {/* LEFT: Label + QR tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      {qrCodeOptions.map((qr) => (
                        <span
                          key={qr.value}
                          className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
                        >
                          {qr.label}
                        </span>
                      ))}
                    </div>

                    {/* RIGHT: Button */}
                    <Button
                      title="Allot QR Codes"
                      type="button"
                      onClick={() => setShowAllotQRModal(true)}
                      buttonColor="bg-purple-600"
                      disabled={!currentSubscriberData?.AutoID}
                    />

                  </div>
                  )}
                </div>
                <div className="card mt-6">
                  <div className="mb-5 flex cursor-pointer items-center justify-between"  onClick={() => setIsMaritalStatusOpen(!isMaritalStatusOpen)}>
                    <div className="label text-secondary">{t("Marital Status")}</div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white hover:bg-secondary/90">
                    {isMaritalStatusOpen ? "−" : "+"}
                    </span>
                  </div>
                  {isMaritalStatusOpen && (
	                <>
                  <div className="my-5">
                      <div className="label mb-2">{t("contacts.maritalStatus")}</div>

                      <RadioInput
                          name="Marital"
                          options={[
                              {
                                  id: "Single",
                                  value: "Single",
                                  label: t("contacts.single"),
                              },
                              { id: "Married", value: "Married", label: t("contacts.married") },
                          ]}
                          Classes="flex"
                          labelClasses="ml-3"
                          onChange={(value) => setMartialStatus(value)}
                          checked={martialStatus}
                      />
                  </div>

                  {martialStatus === "Married" && (
                      <>
                          <div className="mb-3 w-3/12">
                              <Input
                                  type="date"
                                  label="Anniversary Date"
                                  placeholder="Date"
                                  value={anniversaryDate}
                                  onChange={(e) => {
                                      setAnniversaryDate(e.target.value);
                                  }}
                              />
                          </div>

                          {/* UPDATED: Enhanced Spouse Section with Middle Name */}
                          <div className="mb-5 grid grid-cols-12 gap-7">
                              <h2 className="label">Spouse</h2>
                              <div className="col-span-12 -mt-3 rounded-lg border border-dashed bg-yellow-50 p-4">
                                  <h3 className="pb-3 text-sm font-medium text-gray-700">Add Spouse</h3>

                                  <div className="grid grid-cols-12 gap-x-4">
                                      <div className="col-span-2">
                                          <Input
                                              label=" Salutation"
                                              placeholder="Mr./Mrs./Ms./Dr."
                                              value={spouse.salutation}
                                              onChange={(e) => setSpouse({ ...spouse, salutation: e.target.value })}
                                          />
                                      </div>

                                      <div className="col-span-2">
                                          <Input
                                              label=" First Name"
                                              placeholder="First Name"
                                              value={spouse.name}
                                              onChange={(e) => setSpouse({ ...spouse, name: e.target.value })}
                                          />
                                      </div>

                                      <div className="col-span-2">
                                          <Input
                                              label=" Middle Name"
                                              placeholder="Middle Name"
                                              value={spouse.middleName}
                                              onChange={(e) => setSpouse({ ...spouse, middleName: e.target.value })}
                                          />
                                      </div>

                                      <div className="col-span-2">
                                          <Input
                                              label=" Last Name"
                                              placeholder="Last Name"
                                              value={spouse.lastName}
                                              onChange={(e) => setSpouse({ ...spouse, lastName: e.target.value })}
                                          />
                                      </div>

                                      <div className="col-span-2 mt-6">
                                          <Dropdown
                                              isSearchable
                                              options={countriesCodeData?.countries.map((country) => ({
                                                  label: `+${country.callingCodes[0]} ${country.name}`,
                                                  value: `+${country.callingCodes[0]} ${country.name}`,
                                              }))}
                                              placeholder="Country Code"
                                              value={spouse.countryCode}
                                              onChange={(e) => setSpouse({ ...spouse, countryCode: e })}
                                              invisible
                                          />
                                      </div>

                                      <div className="col-span-2 mt-6">
                                          <Input
                                              type="tel"
                                              placeholder="Contact Number"
                                              value={spouse.contactNumber}
                                              onChange={(e) =>
                                                  setSpouse({ ...spouse, contactNumber: e.target.value })
                                              }
                                              invisible
                                          />
                                      </div>
                                  </div>

                                  {/* Spouse Gender Selection */}
                                  <div className="mt-4">
                                      <div className="label mb-2">Spouse Gender</div>
                                      <RadioInput
                                          name="SpouseGender"
                                          options={[
                                              { id: "spouse_male", value: "Male", label: "Male" },
                                              { id: "spouse_female", value: "Female", label: "Female" },
                                              { id: "spouse_other", value: "Other", label: "Other" },
                                              { id: "spouse_na", value: "N/A", label: "N/A" },
                                          ]}
                                          Classes="flex space-x-3"
                                          onChange={(value) => setSpouse({ ...spouse, gender: value })}
                                          checked={spouse?.gender}
                                      />
                                  </div>

                                  {/* Spouse Profile Image */}
                                  <div className="mt-4">
                                      <ChooseFile
                                          label=" Profile Image"
                                          onClickCross={handleRemoveSpouseProfileImage}
                                          placeholder
                                          selectedFile={spouse.profileImage}
                                          loading={spouseProfileLoading}
                                          dir
                                          onChange={(event) => handleSpouseProfileImage(event)}
                                          key={`spouse-profile-${spouse.profileImage ? "with-image" : "no-image"}`}
                                          uni="Spouse"
                                      />
                                      {spouseProfileError && (
                                          <span className="mt-2 block text-xs text-red-500">
                                              {spouseProfileError}
                                          </span>
                                      )}
                                  </div>
                                  <div className="w-3/12">
                                      <Input
                                          label="Wedding Hall Seat"
                                          placeholder="Wedding Hall Seat"
                                          value={spouse.weddingHallSeat}
                                          onChange={(e) => setSpouse({ ...spouse, weddingHallSeat: e.target.value })}
                                      />
                                  </div>
                                  {/* Spouse Preferences Section */}
                                  <div className="mt-6">
                                      <div className="mb-3">
                                          <div className="label text-secondary">Spouse Preferences</div>
                                      </div>
                                      <div className="grid grid-cols-3 gap-x-5">
                                          <Dropdown
                                              isSearchable
                                              options={primaryArray}
                                              title={t("contacts.primaryMealPreference")}
                                              placeholder="Select Primary Meal"
                                              value={spouse.meal_preference?.[0] || ""}
                                              onChange={(value) => handleSpouseMealChange(value, 0)}
                                              isMulti
                                          />

                                          <Dropdown
                                              isSearchable
                                              options={secondaryArray}
                                              title={t("contacts.secondaryMealPreference")}
                                              placeholder="Select Secondary Meal"
                                              value={spouse.meal_preference?.[1] || ""}
                                              onChange={(value) => handleSpouseMealChange(value, 1)}
                                              isMulti
                                          />

                                          <Dropdown
                                              isSearchable
                                              options={alcoholicArray}
                                              title={t("contacts.alcoholPreference")}
                                              placeholder="Select Alcohol Preference"
                                              value={spouse.meal_preference?.[2] || ""}
                                              onChange={(value) => handleSpouseMealChange(value, 2)}
                                              isMulti
                                          />
                                      </div>
                                  </div>

                                  {/* Auto-add indicator for spouse */}
                                  {showSpouseIndicator && (
                                      <div className="mt-4 rounded bg-yellow-100 p-2 text-sm text-yellow-700">
                                          ✓ Spouse information is complete and will be saved with the contact
                                      </div>
                                  )}

                                  {/* Spouse Medicine Section */}
                                  <div className="mt-6">
                                      <div className="mt-5 grid grid-cols-12 gap-2">
                                          <div className="col-span-8">
                                              <button
                                                  type="button"
                                                  className="rounded-lg bg-secondary px-4 py-2 text-white"
                                                  onClick={handleAddSpouseMedicine}
                                              >
                                                  Add Medicine for Spouse
                                              </button>
                                          </div>
                                      </div>

                                      {/* Only show medicine fields if there are medicines */}
                                      {spouse.medicines &&
                                          spouse.medicines.length > 0 &&
                                          spouse.medicines.map((medicine, index) => (
                                              <div key={medicine.id} className="mb-4 mt-5">
                                                  <div className="mb-3 flex items-center justify-between">
                                                      <h4 className="text-sm font-medium text-gray-700">
                                                          Spouse Medicine {index + 1}
                                                      </h4>
                                                      <button
                                                          type="button"
                                                          className="mt-4"
                                                          onClick={() => handleRemoveSpouseMedicine(medicine.id)}
                                                      >
                                                          <TrashIcon className="h-5 w-5 cursor-pointer text-red-500" />
                                                      </button>
                                                  </div>

                                                  <div className="grid grid-cols-4 gap-7 md:grid-cols-2 lg:grid-cols-4">
                                                      <Input
                                                          type="text"
                                                          label="Medicine Name *"
                                                          placeholder="Enter medicine name"
                                                          value={medicine.name}
                                                          onChange={(e) =>
                                                              handleSpouseMedicineChange(
                                                                  medicine.id,
                                                                  "name",
                                                                  e.target.value
                                                              )
                                                          }
                                                      />

                                                      <Input
                                                          type="text"
                                                          label="Problem/Ailment *"
                                                          placeholder="Enter problem or ailment"
                                                          value={medicine.ailment}
                                                          onChange={(e) =>
                                                              handleSpouseMedicineChange(
                                                                  medicine.id,
                                                                  "ailment",
                                                                  e.target.value
                                                              )
                                                          }
                                                      />

                                                      <Input
                                                          type="text"
                                                          label="Medicine Type"
                                                          placeholder="e.g., Tablet, Capsule, Syrup"
                                                          value={medicine.type}
                                                          onChange={(e) =>
                                                              handleSpouseMedicineChange(
                                                                  medicine.id,
                                                                  "type",
                                                                  e.target.value
                                                              )
                                                          }
                                                      />

                                                      <Input
                                                          type="text"
                                                          label="Medication Type"
                                                          placeholder="e.g., Once daily, Twice daily"
                                                          value={medicine.usage}
                                                          onChange={(e) =>
                                                              handleSpouseMedicineChange(
                                                                  medicine.id,
                                                                  "usage",
                                                                  e.target.value
                                                              )
                                                          }
                                                      />
                                                  </div>

                                                  <div className="mt-4">
                                                      <Input
                                                          textarea
                                                          label="Special Instructions"
                                                          placeholder="Enter special instructions"
                                                          value={medicine.special_instructions}
                                                          onChange={(e) =>
                                                              handleSpouseMedicineChange(
                                                                  medicine.id,
                                                                  "special_instructions",
                                                                  e.target.value
                                                              )
                                                          }
                                                          rows={3}
                                                      />
                                                  </div>
                                                  {/* Show validation error if any */}
                                                  {spouseMedicineValidationErrors[medicine.id] && (
                                                      <div className="mb-3 rounded-md bg-red-50 p-3">
                                                          <p className="text-sm text-red-600">
                                                              {spouseMedicineValidationErrors[medicine.id]}
                                                          </p>
                                                      </div>
                                                  )}
                                              </div>
                                          ))}

                                      {/* Show message when no medicines added */}
                                      {(!spouse.medicines || spouse.medicines.length === 0) && (
                                          <div className="mt-5 text-center text-gray-500">
                                              <p className="text-sm">
                                                  No medicines added for spouse yet. Click "Add Medicine for Spouse"
                                                  to get started.
                                              </p>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>

                          {/* UPDATED: Enhanced Children Section with Middle Name */}
                          <div>
                              <div className="mb-4 flex items-center gap-x-10">
                                  {/* <h2 className="label"></h2> */}
                                  <div className="mb-5 ltr:text-left rtl:text-right">
                                      <div className="flex items-center justify-between">
                                          <div className="label mb-2 text-secondary text-lg font-semibold text-gray-800">Children</div>
                                      </div>
                                  </div>
                                  {/* Plus button to add new child form block */}
                                  <button
                                      type="button"
                                      onClick={handleAddNewChildForm}
                                      className="flex items-center gap-2 text-green-600 hover:text-green-700"
                                  >
                                      <PlusCircleIcon className="h-6 w-6" />
                                      <span className="text-sm">Add Child</span>
                                  </button>
                              </div>

                              {/* Existing Children */}
                              {children?.map((child, index) => (
                                  <div
                                      key={`child-${child.id}`}
                                      className="mt-5 space-y-4 rounded-lg border bg-gray-50 p-4"
                                  >
                                      <div className="grid gap-x-4 xl:grid-cols-8 3xl:grid-cols-12">
                                          <div className="col-span-2">
                                              <Input
                                                  label="Salutation"
                                                  placeholder="Mr./Mrs./Ms./Dr."
                                                  labelOnTop
                                                  value={child.salutation || ""}
                                                  onChange={(event) =>
                                                      handleChildAdultFieldChange(
                                                          child.id,
                                                          "salutation",
                                                          event.target.value
                                                      )
                                                  }
                                              />
                                          </div>

                                          <div className="col-span-2">
                                              <Input
                                                  label={`First Name`}
                                                  placeholder="First Name"
                                                  labelOnTop
                                                  value={child.name}
                                                  onChange={(event) =>
                                                      handleChildAdultFieldChange(
                                                          child.id,
                                                          "name",
                                                          event.target.value
                                                      )
                                                  }
                                              />
                                          </div>

                                          <div className="col-span-2">
                                              <Input
                                                  label="Middle Name"
                                                  placeholder="Middle Name"
                                                  labelOnTop
                                                  value={child.middleName || ""}
                                                  onChange={(event) =>
                                                      handleChildAdultFieldChange(
                                                          child.id,
                                                          "middleName",
                                                          event.target.value
                                                      )
                                                  }
                                              />
                                          </div>

                                          <div className="col-span-2">
                                              <Input
                                                  label="Last Name"
                                                  placeholder="Last Name"
                                                  labelOnTop
                                                  value={child.lastName || ""}
                                                  onChange={(event) =>
                                                      handleChildAdultFieldChange(
                                                          child.id,
                                                          "lastName",
                                                          event.target.value
                                                      )
                                                  }
                                              />
                                          </div>

                                          <div className="col-span-2 mt-6">
                                              <Dropdown
                                                  isSearchable
                                                  options={countriesCodeData?.countries.map((country) => ({
                                                      label: `+${country.callingCodes[0]} ${country.name}`,
                                                      value: `+${country.callingCodes[0]} ${country.name}`,
                                                  }))}
                                                  placeholder="Country Code"
                                                  value={child.countryCode}
                                                  onChange={(event) =>
                                                      handleChildAdultFieldChange(child.id, "countryCode", event)
                                                  }
                                                  invisible
                                              />
                                          </div>

                                          <div className="col-span-2 mt-6">
                                              <Input
                                                  type="tel"
                                                  placeholder="Contact Number"
                                                  value={child.contactNumber}
                                                  onChange={(event) =>
                                                      handleChildAdultFieldChange(
                                                          child.id,
                                                          "contactNumber",
                                                          event.target.value
                                                      )
                                                  }
                                                  invisible
                                              />
                                          </div>
                                      </div>

                                      {/* Child Gender and Actions Row */}
                                      <div className="flex items-center justify-between">
                                          <div className="flex gap-x-4">
                                              <RadioInput
                                                  name={`Child_${child.id}`}
                                                  options={[
                                                      { id: `Male_${child.id}`, value: "Male", label: "Male" },
                                                      { id: `Female_${child.id}`, value: "Female", label: "Female" },
                                                      { id: `Other_${child.id}`, value: "Other", label: "Other" },
                                                      { id: `N/A_${child.id}`, value: "N/A", label: "N/A" },
                                                  ]}
                                                  value={child.gender}
                                                  onChange={(value) =>
                                                      handleChildAdultFieldChange(child.id, "gender", value)
                                                  }
                                                  Classes="flex space-x-3"
                                                  checked={child?.gender}
                                              />
                                          </div>
                                          <button type="button" onClick={() => handleRemoveChild(child.id)}>
                                              <TrashIcon className="h-5 w-5 cursor-pointer text-red-500" />
                                          </button>
                                      </div>

                                      {/* Child Profile Image */}
                                      <div className="mt-4">
                                          <ChooseFile
                                              label={`Child ${index + 1} Profile Image`}
                                              onClickCross={() => handleRemoveChildProfileImage(child.id)}
                                              placeholder
                                              selectedFile={child.profileImage}
                                              loading={childrenProfileLoading[child.id] || false}
                                              dir
                                              onChange={(event) => handleChildProfileImage(event, child.id)}
                                              key={`child-profile-${child.id}-${child.profileImage ? "with-image" : "no-image"}`}
                                              uni={`Child-${child.id}`}
                                          />
                                          {childrenProfileErrors[child.id] && (
                                              <span className="mt-2 block text-xs text-red-500">
                                                  {childrenProfileErrors[child.id]}
                                              </span>
                                          )}
                                      </div>
                                      <div className="w-3/12">
                                          <Input
                                              label="Wedding Hall Seat"
                                              placeholder="Wedding Hall Seat"
                                              value={child.weddingHallSeat}
                                              onChange={(e) =>
                                                  handleChildAdultFieldChange(
                                                      child.id,
                                                      "weddingHallSeat",
                                                      e.target.value
                                                  )
                                              }
                                          />
                                      </div>

                                      {/* Child Preferences Section */}
                                      <div className="mt-4">
                                          <div className="mb-3">
                                              <div className="label text-secondary">
                                                  Child {index + 1} Preferences
                                              </div>
                                          </div>
                                          <div className="grid grid-cols-3 gap-x-5">
                                              <Dropdown
                                                  isSearchable
                                                  options={primaryArray}
                                                  title={t("contacts.primaryMealPreference")}
                                                  placeholder="Select Primary Meal"
                                                  value={child.meal_preference?.[0] || ""}
                                                  onChange={(value) => handleChildMealChange(child.id, value, 0)}
                                                  isMulti
                                              />

                                              <Dropdown
                                                  isSearchable
                                                  options={secondaryArray}
                                                  title={t("contacts.secondaryMealPreference")}
                                                  placeholder="Select Secondary Meal"
                                                  value={child.meal_preference?.[1] || ""}
                                                  onChange={(value) => handleChildMealChange(child.id, value, 1)}
                                                  isMulti
                                              />

                                              <Dropdown
                                                  isSearchable
                                                  options={alcoholicArray}
                                                  title={t("contacts.alcoholPreference")}
                                                  placeholder="Select Alcohol Preference"
                                                  value={child.meal_preference?.[2] || ""}
                                                  onChange={(value) => handleChildMealChange(child.id, value, 2)}
                                                  isMulti
                                              />
                                          </div>
                                      </div>
                                  </div>
                              ))}

                              {/* Medicine Section for Existing Children */}
                              {children?.map((child, index) => (
                                  <div
                                      key={`child-medicine-${child.id}`}
                                      className="mt-5 space-y-4 rounded-lg border bg-blue-50 p-4"
                                  >
                                      <h3 className="text-sm font-medium text-gray-700">
                                          Medicine for Child {index + 1}
                                      </h3>

                                      <div className="mt-5 grid grid-cols-12 gap-2">
                                          <div className="col-span-8">
                                              <button
                                                  type="button"
                                                  className="rounded-lg bg-secondary px-4 py-2 text-white"
                                                  onClick={() => handleAddChildMedicine(child.id)}
                                              >
                                                  Add Medicine for Child {index + 1}
                                              </button>
                                          </div>
                                      </div>

                                      {/* Only show medicine fields if there are medicines */}
                                      {child.medicines &&
                                          child.medicines.length > 0 &&
                                          child.medicines.map((medicine, medIndex) => (
                                              <div key={medicine.id} className="mb-4 mt-5">
                                                  <div className="mb-3 flex items-center justify-between">
                                                      <h4 className="text-sm font-medium text-gray-700">
                                                          Child {index + 1} Medicine {medIndex + 1}
                                                      </h4>
                                                      <button
                                                          type="button"
                                                          className="mt-4"
                                                          onClick={() =>
                                                              handleRemoveChildMedicine(child.id, medicine.id)
                                                          }
                                                      >
                                                          <TrashIcon className="h-5 w-5 cursor-pointer text-red-500" />
                                                      </button>
                                                  </div>

                                                  <div className="grid grid-cols-4 gap-7 md:grid-cols-2 lg:grid-cols-4">
                                                      <Input
                                                          type="text"
                                                          label="Medicine Name *"
                                                          placeholder="Enter medicine name"
                                                          value={medicine.name}
                                                          onChange={(e) =>
                                                              handleChildMedicineChange(
                                                                  child.id,
                                                                  medicine.id,
                                                                  "name",
                                                                  e.target.value
                                                              )
                                                          }
                                                      />

                                                      <Input
                                                          type="text"
                                                          label="Problem/Ailment *"
                                                          placeholder="Enter problem or ailment"
                                                          value={medicine.ailment}
                                                          onChange={(e) =>
                                                              handleChildMedicineChange(
                                                                  child.id,
                                                                  medicine.id,
                                                                  "ailment",
                                                                  e.target.value
                                                              )
                                                          }
                                                      />

                                                      <Input
                                                          type="text"
                                                          label="Medicine Type"
                                                          placeholder="e.g., Tablet, Capsule, Syrup"
                                                          value={medicine.type}
                                                          onChange={(e) =>
                                                              handleChildMedicineChange(
                                                                  child.id,
                                                                  medicine.id,
                                                                  "type",
                                                                  e.target.value
                                                              )
                                                          }
                                                      />

                                                      <Input
                                                          type="text"
                                                          label="Medication Type"
                                                          placeholder="e.g., Once daily, Twice daily"
                                                          value={medicine.usage}
                                                          onChange={(e) =>
                                                              handleChildMedicineChange(
                                                                  child.id,
                                                                  medicine.id,
                                                                  "usage",
                                                                  e.target.value
                                                              )
                                                          }
                                                      />
                                                  </div>

                                                  <div className="mt-4">
                                                      <Input
                                                          textarea
                                                          label="Special Instructions"
                                                          placeholder="Enter special instructions"
                                                          value={medicine.special_instructions}
                                                          onChange={(e) =>
                                                              handleChildMedicineChange(
                                                                  child.id,
                                                                  medicine.id,
                                                                  "special_instructions",
                                                                  e.target.value
                                                              )
                                                          }
                                                          rows={3}
                                                      />
                                                  </div>
                                                  {/* Show validation error if any */}
                                                  {childrenMedicineValidationErrors[child.id]?.[medicine.id] && (
                                                      <div className="mb-3 rounded-md bg-red-50 p-3">
                                                          <p className="text-sm text-red-600">
                                                              {
                                                                  childrenMedicineValidationErrors[child.id][
                                                                      medicine.id
                                                                  ]
                                                              }
                                                          </p>
                                                      </div>
                                                  )}
                                              </div>
                                          ))}

                                      {/* Show message when no medicines added */}
                                      {(!child.medicines || child.medicines.length === 0) && (
                                          <div className="mt-5 text-center text-gray-500">
                                              <p className="text-sm">
                                                  No medicines added for Child {index + 1} yet. Click "Add Medicine
                                                  for Child {index + 1}" to get started.
                                              </p>
                                          </div>
                                      )}
                                  </div>
                              ))}

                              {/* NEW: New Child Form - Only shows when showNewChildForm is true */}
                              {showNewChildForm && (
                                  <div className="mt-5 space-y-4 rounded-lg border border-dashed bg-blue-50 p-4">
                                      <h3 className="text-sm font-medium text-gray-700">Add New Child</h3>
                                      <div className="grid gap-x-4 xl:grid-cols-8 3xl:grid-cols-12">
                                          <div className="col-span-2">
                                              <Input
                                                  label="Salutation"
                                                  placeholder="Mr./Mrs./Ms./Dr."
                                                  labelOnTop
                                                  value={newChild.salutation}
                                                  onChange={(event) =>
                                                      handleInputChange("salutation", event.target.value)
                                                  }
                                                  isRequired
                                                  error={errors.salutation}
                                              />
                                          </div>

                                          <div className="col-span-2">
                                              <Input
                                                  label="First Name"
                                                  placeholder="First Name"
                                                  labelOnTop
                                                  value={newChild.name}
                                                  isRequired
                                                  error={errors.name}
                                                  onChange={(event) => handleInputChange("name", event.target.value)}
                                              />
                                          </div>

                                          <div className="col-span-2">
                                              <Input
                                                  label="Middle Name"
                                                  placeholder="Middle Name"
                                                  labelOnTop
                                                  value={newChild.middleName}
                                                  onChange={(event) =>
                                                      handleInputChange("middleName", event.target.value)
                                                  }
                                              />
                                          </div>

                                          <div className="col-span-2">
                                              <Input
                                                  label="Last Name"
                                                  placeholder="Last Name"
                                                  labelOnTop
                                                  value={newChild.lastName}
                                                  isRequired
                                                  error={errors.lastName}
                                                  onChange={(event) =>
                                                      handleInputChange("lastName", event.target.value)
                                                  }
                                              />
                                          </div>

                                          <div className="col-span-2 mt-6">
                                              <Dropdown
                                                  isSearchable
                                                  options={countriesCodeData?.countries.map((country) => ({
                                                      label: `+${country.callingCodes[0]} ${country.name}`,
                                                      value: `+${country.callingCodes[0]} ${country.name}`,
                                                  }))}
                                                  placeholder="Country Code"
                                                  value={newChild.countryCode}
                                                  onChange={(event) => handleInputChange("countryCode", event)}
                                                  invisible
                                                  isRequired
                                                  withError={errors.countryCode}
                                              />
                                          </div>

                                          <div className="col-span-2 mt-6">
                                              <Input
                                                  type="tel"
                                                  placeholder="Contact Number"
                                                  value={newChild.contactNumber}
                                                  onChange={(event) =>
                                                      handleInputChange("contactNumber", event.target.value)
                                                  }
                                                  invisible
                                                  isRequired
                                                  error={errors.contactNumber}
                                              />
                                          </div>
                                      </div>

                                      {/* New Child Gender */}
                                      <div>
                                          {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                                          <div className="flex gap-x-4">
                                              <RadioInput
                                                  name="NewChild"
                                                  options={[
                                                      { id: "Male_NewChild", value: "Male", label: "Male" },
                                                      { id: "Female_NewChild", value: "Female", label: "Female" },
                                                      { id: "Other_NewChild", value: "Other", label: "Other" },
                                                      { id: "N/A_NewChild", value: "N/A", label: "N/A" },
                                                  ]}
                                                  value={newChild.gender}
                                                  onChange={(value) => handleInputChange("gender", value)}
                                                  Classes="flex space-x-3"
                                                  checked={newChild?.gender}
                                              />
                                          </div>
                                      </div>

                                      {/* New Child Profile Image */}
                                      <div className="mt-4">
                                          <ChooseFile
                                              label="New Child Profile Image"
                                              onClickCross={() => handleRemoveChildProfileImage(null, true)}
                                              placeholder
                                              selectedFile={newChild.profileImage}
                                              loading={childrenProfileLoading.newChild || false}
                                              dir
                                              onChange={(event) => handleChildProfileImage(event, null, true)}
                                              key={`new-child-profile-${newChild.profileImage ? "with-image" : "no-image"}`}
                                              uni="NewChild"
                                          />
                                          {childrenProfileErrors.newChild && (
                                              <span className="mt-2 block text-xs text-red-500">
                                                  {childrenProfileErrors.newChild}
                                              </span>
                                          )}
                                      </div>
                                      <div className="w-3/12">
                                          <Input
                                              label="Wedding Hall Seat"
                                              placeholder="Wedding Hall Seat"
                                              value={newChild.weddingHallSeat}
                                              onChange={(e) => handleInputChange("weddingHallSeat", e.target.value)}
                                          />
                                      </div>
                                      {/* New Child Preferences Section */}
                                      <div className="mt-4">
                                          <div className="mb-3">
                                              <div className="label text-secondary">New Child Preferences</div>
                                          </div>
                                          <div className="grid grid-cols-3 gap-x-5">
                                              <Dropdown
                                                  isSearchable
                                                  options={primaryArray}
                                                  title={t("contacts.primaryMealPreference")}
                                                  placeholder="Select Primary Meal"
                                                  value={newChild.meal_preference?.[0] || ""}
                                                  onChange={(value) => handleNewChildMealChange(value, 0)}
                                                  isMulti
                                              />

                                              <Dropdown
                                                  isSearchable
                                                  options={secondaryArray}
                                                  title={t("contacts.secondaryMealPreference")}
                                                  placeholder="Select Secondary Meal"
                                                  value={newChild.meal_preference?.[1] || ""}
                                                  onChange={(value) => handleNewChildMealChange(value, 1)}
                                                  isMulti
                                              />

                                              <Dropdown
                                                  isSearchable
                                                  options={alcoholicArray}
                                                  title={t("contacts.alcoholPreference")}
                                                  placeholder="Select Alcohol Preference"
                                                  value={newChild.meal_preference?.[2] || ""}
                                                  onChange={(value) => handleNewChildMealChange(value, 2)}
                                                  isMulti
                                              />
                                          </div>
                                      </div>

                                      {/* Auto-add indicator */}
                                      {isChildFormComplete() && (
                                          <div className="rounded bg-green-100 p-2 text-sm text-green-600">
                                              ✓ Child will be added automatically when you finish filling the form
                                          </div>
                                      )}

                                      {/* New Child Medicine Section */}
                                      <div className="mt-6">
                                          <div className="mt-5 grid grid-cols-12 gap-2">
                                              <div className="col-span-8">
                                                  <button
                                                      type="button"
                                                      className="rounded-lg bg-secondary px-4 py-2 text-white"
                                                      onClick={handleAddNewChildMedicine}
                                                  >
                                                      Add Medicine for New Child
                                                  </button>
                                              </div>
                                          </div>

                                          {/* Only show medicine fields if there are medicines */}
                                          {newChild.medicines &&
                                              newChild.medicines.length > 0 &&
                                              newChild.medicines.map((medicine, index) => (
                                                  <div key={medicine.id} className="mb-4 mt-5">
                                                      <div className="mb-3 flex items-center justify-between">
                                                          <h4 className="text-sm font-medium text-gray-700">
                                                              New Child Medicine {index + 1}
                                                          </h4>
                                                          <button
                                                              type="button"
                                                              className="mt-4"
                                                              onClick={() =>
                                                                  handleRemoveNewChildMedicine(medicine.id)
                                                              }
                                                          >
                                                              <TrashIcon className="h-5 w-5 cursor-pointer text-red-500" />
                                                          </button>
                                                      </div>

                                                      <div className="grid grid-cols-4 gap-7 md:grid-cols-2 lg:grid-cols-4">
                                                          <Input
                                                              type="text"
                                                              label="Medicine Name *"
                                                              placeholder="Enter medicine name"
                                                              value={medicine.name}
                                                              onChange={(e) =>
                                                                  handleNewChildMedicineChange(
                                                                      medicine.id,
                                                                      "name",
                                                                      e.target.value
                                                                  )
                                                              }
                                                          />

                                                          <Input
                                                              type="text"
                                                              label="Problem/Ailment *"
                                                              placeholder="Enter problem or ailment"
                                                              value={medicine.ailment}
                                                              onChange={(e) =>
                                                                  handleNewChildMedicineChange(
                                                                      medicine.id,
                                                                      "ailment",
                                                                      e.target.value
                                                                  )
                                                              }
                                                          />

                                                          <Input
                                                              type="text"
                                                              label="Medicine Type"
                                                              placeholder="e.g., Tablet, Capsule, Syrup"
                                                              value={medicine.type}
                                                              onChange={(e) =>
                                                                  handleNewChildMedicineChange(
                                                                      medicine.id,
                                                                      "type",
                                                                      e.target.value
                                                                  )
                                                              }
                                                          />

                                                          <Input
                                                              type="text"
                                                              label="Medication Type"
                                                              placeholder="e.g., Once daily, Twice daily"
                                                              value={medicine.usage}
                                                              onChange={(e) =>
                                                                  handleNewChildMedicineChange(
                                                                      medicine.id,
                                                                      "usage",
                                                                      e.target.value
                                                                  )
                                                              }
                                                          />
                                                      </div>

                                                      <div className="mt-4">
                                                          <Input
                                                              textarea
                                                              label="Special Instructions"
                                                              placeholder="Enter special instructions"
                                                              value={medicine.special_instructions}
                                                              onChange={(e) =>
                                                                  handleNewChildMedicineChange(
                                                                      medicine.id,
                                                                      "special_instructions",
                                                                      e.target.value
                                                                  )
                                                              }
                                                              rows={3}
                                                          />
                                                      </div>
                                                      {/* Show validation error if any */}
                                                      {newChildMedicineValidationErrors[medicine.id] && (
                                                          <div className="mb-3 rounded-md bg-red-50 p-3">
                                                              <p className="text-sm text-red-600">
                                                                  {newChildMedicineValidationErrors[medicine.id]}
                                                              </p>
                                                          </div>
                                                      )}
                                                  </div>
                                              ))}

                                          {/* Show message when no medicines added */}
                                          {(!newChild.medicines || newChild.medicines.length === 0) && (
                                              <div className="mt-5 text-center text-gray-500">
                                                  <p className="text-sm">
                                                      No medicines added for new child yet. Click "Add Medicine for
                                                      New Child" to get started.
                                                  </p>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              )}
                          </div>
                      </>
                  )}
                  </>
                )}
                </div>
                
                <div className="card mt-6 rounded-2xl bg-white p-6 shadow">

                  {/* HEADER */}
                  <div className="mb-5 flex cursor-pointer items-center justify-between"  onClick={() => setIsMedicinesOpen(!isMedicinesOpen)}>
                    <div className="label text-secondary">{t("Medicines")}</div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white hover:bg-secondary/90">
                    {isMedicinesOpen ? "−" : "+"}
                    </span>
                  </div>

                  {isMedicinesOpen && (
                  <>
                  <div className="mb-5 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="rounded-lg bg-secondary px-4 py-2 text-white hover:bg-secondary/90"
                    >
                      + Add Medicine
                    </button>
                  </div>

                  {/* MEDICINE LIST */}
                  {medicines.map((medicine, index) => (
                    <div
                      key={medicine.id}
                      className="mb-6 rounded-xl border p-5"
                    >

                      {/* TITLE + DELETE */}
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">
                          Medicine {index + 1}
                        </h4>

                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(medicine.id)}
                        >
                          <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-600" />
                        </button>
                      </div>

                      {/* FORM GRID */}
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                        <Input
                          label="Medicine Name *"
                          placeholder="Enter medicine name"
                          value={medicine.name}
                          onChange={(e) =>
                            handleMedicineChange(medicine.id, "name", e.target.value)
                          }
                        />

                        <Input
                          label="Problem / Ailment *"
                          placeholder="Enter problem"
                          value={medicine.ailment}
                          onChange={(e) =>
                            handleMedicineChange(medicine.id, "ailment", e.target.value)
                          }
                        />

                        <Input
                          label="Medicine Type"
                          placeholder="Tablet, Capsule, Syrup"
                          value={medicine.type}
                          onChange={(e) =>
                            handleMedicineChange(medicine.id, "type", e.target.value)
                          }
                        />

                        <Input
                          label="Medication Schedule"
                          placeholder="Once daily, Twice daily"
                          value={medicine.usage}
                          onChange={(e) =>
                            handleMedicineChange(medicine.id, "usage", e.target.value)
                          }
                        />
                      </div>

                      {/* INSTRUCTIONS */}
                      <div className="mt-4">
                        <Input
                          textarea
                          rows={3}
                          label="Special Instructions"
                          placeholder="Enter instructions"
                          value={medicine.special_instructions}
                          onChange={(e) =>
                            handleMedicineChange(
                              medicine.id,
                              "special_instructions",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* VALIDATION ERROR */}
                      {medicineValidationErrors[medicine.id] && (
                        <div className="mt-3 rounded-md bg-red-50 p-3">
                          <p className="text-sm text-red-600">
                            {medicineValidationErrors[medicine.id]}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  </>
                  )}
                </div>

                
                <div className="card mt-6">
                  <div className="mb-5 flex cursor-pointer items-center justify-between"  onClick={() => setIsAddressOpen(!isAddressOpen)}>
                    <div className="label text-secondary">{t("contacts.residenceAddress")}</div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white hover:bg-secondary/90">
                    {isAddressOpen ? "−" : "+"}
                    </span>
                  </div>
                  {isAddressOpen && (
	                  <>
                  <Input
                      label={t("contacts.address")}
                      placeholder="Address"
                      textarea
                      value={address}
                      rows={2}
                      onChange={(e) => setAddress(e.target.value)}
                  />

                  <div className="mt-5 grid grid-cols-4 gap-7 md:grid-cols-2 xl:grid-cols-4">
                      <div ref={fieldRefs.city}>
                          <Input
                              label={t("contacts.city")}
                              placeholder="City"
                              labelOnTop
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                          />
                      </div>
                      <div ref={fieldRefs.state}>
                          <Input
                              label={t("contacts.state")}
                              placeholder="State"
                              labelOnTop
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                          />
                      </div>
                      <Input
                          type="number"
                          label={t("contacts.pin")}
                          placeholder="PIN"
                          labelOnTop
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                      />
                      <div ref={fieldRefs.country}>
                          <Dropdown
                              isSearchable
                              options={countriesData.countries.map((country) => ({
                                  label: country.name,
                                  Value: country.name,
                              }))}
                              title={t("contacts.country")}
                              placeholder="Select Country"
                              value={country}
                              onChange={(value) => setCountry(value)}
                          />
                      </div>
                  </div>

                  <div className="mb-5 mt-5 ltr:text-left rtl:text-right">
                      <div>
                          <div className="label mb-2 text-secondary">{t("contacts.workAddress")}</div>
                      </div>
                  </div>

                  <div className="mb-5 mt-5 grid grid-cols-4 gap-7 md:grid-cols-2 xl:grid-cols-4">
                      <Input
                          label={t("contacts.companyName")}
                          placeholder="Company Name"
                          labelOnTop
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                      />
                      <Input
                          label={t("contacts.city")}
                          placeholder="City"
                          labelOnTop
                          value={workCity}
                          onChange={(e) => setWorkCity(e.target.value)}
                      />
                      <Input
                          label={t("contacts.state")}
                          placeholder="State"
                          labelOnTop
                          value={workState}
                          onChange={(e) => setWorkState(e.target.value)}
                      />
                      <Input
                          type="number"
                          label={t("contacts.pin")}
                          placeholder="PIN"
                          labelOnTop
                          value={workPin}
                          onChange={(e) => setWorkPin(e.target.value)}
                      />

                      <Dropdown
                          isSearchable
                          options={countriesData.countries.map((country) => ({
                              label: country.name,
                              Value: country.name,
                          }))}
                          title={t("contacts.country")}
                          placeholder="Select Country"
                          value={workCountry}
                          onChange={(value) => setWorkCountry(value)}
                      />
                  </div>

                  <Input
                      label={t("contacts.address")}
                      placeholder="Address"
                      textarea
                      value={workAddress}
                      rows={2}
                      onChange={(e) => setWorkAddress(e.target.value)}
                  />
                  </>
                  )}
                </div>
                <div className="card mt-6">
                  <div className="mb-5 flex cursor-pointer items-center justify-between"  onClick={() => setIsPreferenceOpen(!isPreferenceOpen)}>
                    <div className="label text-secondary">{t("contacts.preferences")}</div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white hover:bg-secondary/90">
                      {isPreferenceOpen ? "−" : "+"}
                    </span>
                  </div>
                  {isPreferenceOpen && (
                  <div className="my-5 grid grid-cols-3 gap-x-5">
                      <Dropdown
                          isSearchable
                          options={primaryArray}
                          title={t("contacts.primaryMealPreference")}
                          placeholder="Select Primary Meal"
                          value={selectedMealIds[0] || ""}
                          onChange={(value) => handleMealChange(value, 0)}
                          isMulti
                      />

                      <Dropdown
                          isSearchable
                          options={secondaryArray}
                          title={t("contacts.secondaryMealPreference")}
                          placeholder="Select Secondary Meal"
                          value={selectedMealIds[1] || ""}
                          onChange={(value) => handleMealChange(value, 1)}
                          isMulti
                      />

                      <Dropdown
                          isSearchable
                          options={alcoholicArray}
                          title={t("contacts.alcoholPreference")}
                          placeholder="Select Alcohol Preference"
                          value={selectedMealIds[2] || ""}
                          onChange={(value) => handleMealChange(value, 2)}
                          isMulti
                      />
                  </div>
                  )}
                </div>
                <div className="card mt-6">
                  <div
                    className="mb-5 flex cursor-pointer items-center justify-between"
                    onClick={() => setIsOtherInfoOpen(!isOtherInfoOpen)}
                  >
                    <div className="label text-secondary">
                      {t("headings.otherInfo")}
                    </div>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white hover:bg-secondary/90">
                      {isOtherInfoOpen ? "−" : "+"}
                    </span>
                  </div>

                  {isOtherInfoOpen && (
                  <>
                  <div className="flex items-center">
                      <div className="label pr-20 ltr:text-left rtl:text-right">{t("contacts.specialNeeds")}</div>

                      <input
                          name="Gender"
                          options={[
                              {
                                  id: "Wheel Chair",
                                  value: "Wheel Chair",
                                  label: "Wheel Chair",
                              },
                          ]}
                          Classes="flex"
                          type="checkbox"
                          value={specialNeed}
                          onChange={(e) => setSpecialNeed(e.target.checked)}
                          checked={specialNeed}
                      />

                      <div className="label pl-2 ltr:text-left rtl:text-right">{t("contacts.wheelChair")}</div>
                  </div>

                  <div className="my-5">
                      <div>
                          <ChooseFile
                              uni="Identify"
                              label={t("contacts.IdentityProofFile")}
                              onClickCross={handleCrossClick}
                              placeholder
                              multi
                              selectedFile={identityFile}
                              loading={fileLoading}
                              onChange={handleFileChangeIdentify}
                          />
                      </div>
                  </div>

                  <Input
                      label={t("headings.notes")}
                      placeholder="Note"
                      textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                  />

                  <span className="text-xs font-medium text-red-500"> {message.text}</span>

                  
                  </>
                  )}
                </div>
                <div className="my-4 flex justify-end space-x-5">
                      {data ? (
                          <Button
                              icon={updateLoading ? "" : <CheckIcon />}
                              title={updateLoading ? <Spinner /> : t("contacts.saveContact")}
                              onClick={updateContact}
                          />
                      ) : (
                          <Button
                              icon={addLoading ? "" : <CheckIcon />}
                              title={addLoading ? <Spinner /> : t("contacts.saveContact")}
                              onClick={AddNewContact}
                          />
                      )}
                      <Button
                          icon={<XMarkIcon />}
                          title="Cancel"
                          buttonColor="bg-red-500"
                          onClick={() => navigate(CONTACTS)}
                      />
                </div>
            </form>

            {/* QR Code Allocation Modal */}
            <Transition appear show={showAllotQRModal} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setShowAllotQRModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-75"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-75"
                            >
                                <Dialog.Panel className="w-full max-w-xl overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                    <div className="mb-5 flex items-center justify-between">
                                        <Dialog.Title
                                            as="h3"
                                            className="font-poppins text-lg font-semibold leading-7 text-secondary-color"
                                        >
                                            QR Codes Status
                                        </Dialog.Title>
                                        <XMarkIcon
                                            onClick={() => {
                                                setShowAllotQRModal(false);
                                                setNewQRCodes("");
                                                setNewQRCodesError("");
                                            }}
                                            className="h-6 w-6 cursor-pointer text-info-color"
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <div className="mb-8 space-y-1">
                                            {qrCountsLoading ? (
                                                <>
                                                    <div className="text-left text-sm text-gray-600">
                                                        <div className="h-5 w-48 animate-pulse rounded bg-gray-200"></div>
                                                    </div>
                                                    <div className="text-left text-sm text-gray-600">
                                                        <div className="h-5 w-40 animate-pulse rounded bg-gray-200"></div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-left text-sm text-gray-600">
                                                        Total Available QR Codes:{" "}
                                                        <span className="font-semibold">
                                                            {qrCodeCounts.totalAvailable - qrCodeCounts.used}
                                                        </span>
                                                    </p>
                                                    <p className="text-left text-sm text-gray-600">
                                                        Allocated QR Codes:{" "}
                                                        <span className="font-semibold">
                                                            {qrCodeCounts.allocated - qrCodeCounts.used}
                                                        </span>
                                                    </p>
                                                    <p className="text-left text-sm text-gray-600">
                                                        Used QR Codes:{" "}
                                                        <span className="font-semibold">{qrCodeCounts.used}</span>
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        <h2 className="sub-heading mb-1 ltr:text-left rtl:text-right">
                                            Allocate More QR Codes
                                        </h2>
                                        <Input
                                            label="Number of QR Codes"
                                            type="number"
                                            value={newQRCodes}
                                            onChange={(e) => {
                                                setNewQRCodes(e.target.value);
                                                setNewQRCodesError("");
                                            }}
                                            placeholder="Enter number of QR codes"
                                            error={newQRCodesError}
                                            isRequired
                                            labelOnTop
                                        />
                                    </div>

                                    <div className="flex justify-center gap-4 pt-8">
                                        <Button
                                            icon={<CheckIcon />}
                                            title="Allocate"
                                            type="button"
                                            onClick={handleAllotQRCodes}
                                            loading={btnLoading}
                                        />
                                        <Button
                                            icon={<XMarkIcon />}
                                            title="Cancel"
                                            type="button"
                                            buttonColor="bg-red-500"
                                            onClick={() => {
                                                setShowAllotQRModal(false);
                                                setNewQRCodes("");
                                                setNewQRCodesError("");
                                            }}
                                        />
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Color Code Modal */}
            <AddColorModal
                isOpen={openColorCodeModal}
                setIsOpen={setOpenColorCodeModal}
                handleSubmit={addNewColorCode}
                value={newColorCodeName}
                handleChange={(e) => setNewColorCodeName(e.target.value)}
                message={errorMessageServer}
                setErrorMessageServer={setErrorMessageServer}
                setNewColorCodeName={setNewColorCodeName}
            />

            {/* Confirmation Modals */}
            <ConfirmationModal
                message="Are you sure you want to delete this Group?"
                isOpen={openDeleteModal.open}
                setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
                handleSubmit={deleteGroup}
            />

            <ConfirmationModal
                message="Are you sure you want to delete this Family?"
                isOpen={openDeleteModalFamily.open}
                setIsOpen={(open) => setOpenDeleteModalFamily((prev) => ({ ...prev, open }))}
                handleSubmit={deleteFamily}
            />

            <ConfirmationModal
                message="Are you sure you want to delete this Color Code?"
                isOpen={openDeleteModalColorCode.open}
                setIsOpen={(open) => setOpenDeleteModalColorCode((prev) => ({ ...prev, open }))}
                handleSubmit={deleteColorCode}
            />
        </>
    );
};

export default AddContact;
