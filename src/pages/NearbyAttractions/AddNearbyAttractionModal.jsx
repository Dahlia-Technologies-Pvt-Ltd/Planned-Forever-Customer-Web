import React from "react";
import ApiServices from "../../api/services";
import Input from "@components/common/Input";
import Button from "@components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import InputTags from "@components/common/InputTags";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import countriesCodeData from "@utilities/countryCode.json";
import Dropdown from "@components/common/Dropdown";
import countriesData from "@utilities/country.json";
import ChooseFile from "@components/common/ChooseFile";
import MapPicker from "@components/MapPicker";
import { useTranslation } from "react-i18next";

const AddVendorModal = ({ isOpen, setIsOpen, data, refreshData, setModalData }) => {
  const { t } = useTranslation("common");

  // Context
  const {
    eventSelect,
    setBtnLoading,
    btnLoading,
    setLoading,
    loading,
    openSuccessModal,
    closeSuccessModel,
    setErrorMessage,
    errorMessage,
    allType2CategoryList,
    getType2CategoryList,
  } = useThemeContext();

  // useStates

  const [firstName, setFirstName] = useState("");
  const [firstDesignation, setFirstDesignation] = useState("");
  const [firstContactNumber, setFirstContactNumber] = useState({ phone: "", countryCode: "" });
  const [firstContactNumberWhatsapp, setFirstContactNumberWhatsapp] = useState({ phone: "", countryCode: "" });
  const [attractionName, setAttractionName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState({ address: "", lat: "", lng: "" });
  const [addressLocationError, setAddressLocationError] = useState("");
  const [attractionNameError, setAttractionNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [firstDesignationError, setFirstDesignationError] = useState("");
  const [firstContactNumberErrorDrop, setFirstContactNumberErrorDrop] = useState("");
  const [firstContactNumberErrorInput, setFirstContactNumberErrorInput] = useState("");
  const [serverError, setServerError] = useState("");

  const { t: commonT } = useTranslation("common");

  // Validations
  const isValidForm = () => {
    let isValidData = true;

    if (!location.address) {
      setAddressLocationError(" Required");
      isValidData = false;
    }

    if (firstName === "") {
      setFirstNameError(" Required");
      isValidData = false;
    }

    if (attractionName === "") {
      setAttractionNameError(" Required");
      isValidData = false;
    }

    if (firstContactNumberWhatsapp?.countryCode === "") {
      setFirstContactNumberErrorDrop("Required");
      isValidData = false;
    } else {
      setFirstContactNumberErrorDrop("");
    }
    if (firstContactNumberWhatsapp?.phone === "") {
      setFirstContactNumberErrorInput("Required");
      isValidData = false;
    } else {
      setFirstContactNumberErrorInput("");
    }

    return isValidData;
  };

  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    website: "",
    drive: "",
    portfolio: "",
    other: "",
  });

  const [imgs, setImags] = useState([]);

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setLoading(true);

        let formData = new FormData();

        formData.append("name", attractionName ?? "");
        formData.append("description", description ?? "");

        formData.append("event_id", eventSelect ?? "");

        formData.append("address", location.address ?? "");

        formData.append("google_location[0]", location?.lat ?? "");
        formData.append("google_location[1]", location?.lng ?? "");

        formData.append("contact_person_name", firstName ?? "");
        formData.append("contact_person_designation", firstDesignation ?? "");

        // First contact (normal phone)
        formData.append("contact_person_contacts[0][type]", "phone");
        formData.append("contact_person_contacts[0][countryCode]", firstContactNumber?.countryCode?.value ?? "");
        formData.append("contact_person_contacts[0][phone]", firstContactNumber?.phone ?? "");

        // Second contact (WhatsApp number)
        formData.append("contact_person_contacts[1][type]", "whatsapp");
        formData.append("contact_person_contacts[1][countryCode]", firstContactNumberWhatsapp?.countryCode?.value ?? "");
        formData.append("contact_person_contacts[1][phone]", firstContactNumberWhatsapp?.phone ?? "");

        if (imgs && Array.isArray(imgs) && imgs?.length > 0) {
          imgs.forEach((image, index) => {
            formData.append(`images[${index}]`, image ?? "");
          });
        } else {
          formData.append("images", []);
        }

        Object.keys(socialLinks).forEach((key, index) => {
          const url = socialLinks[key];

          if (url) {
            // Only include links that have a URL
            formData.append(`social_media_links[${index}][name]`, key);
            formData.append(`social_media_links[${index}][url]`, url);
          }
        });

        const response = await (data === null
          ? ApiServices.Nearby_Attraction.addNearbyAttraction(formData)
          : ApiServices.Nearby_Attraction.updateNearbyAttraction(data?.id, formData));

        if (response.data.code === 200) {
          setLoading(false);
          setIsOpen(false);
          setModalData(null);
          clearAllData();
          refreshData();
          openSuccessModal({
            title: t("messages.success"),
            message: data === null ? t("nearByAttraction.nearByAttractionAddedSuccess") : t("nearByAttraction.nearByAttractionUpdatedSucess"),
            onClickDone: (close) => {
              closeSuccessModel();
            },
          });
        } else {
          setLoading(false);
        }
      } catch (err) {
        setServerError(err?.message);
        setLoading(false);
      }
    } else {
      // Handle form validation errors
    }
  };

  // Clear States
  const clearAllData = () => {
    setServerError("");
    setImags([]);
    setSocialLinks({
      instagram: "",
      facebook: "",
      website: "",
      other: "",
    });

    setDescription("");

    setAttractionName("");

    setLocation({ address: "", lat: "", lng: "" });

    setImags(null);

    setFirstName("");
    setFirstDesignation("");

    setFirstContactNumber({});
    setFirstContactNumberWhatsapp({});
  };

  // Use Effects
  useEffect(() => {
    if (data !== null) {
      const newSocialLinks = (data?.social_media_links || [])?.reduce((acc, link) => {
        acc[link?.name] = link?.url;
        return acc;
      }, {});

      setSocialLinks(newSocialLinks);

      setDescription(data?.description);

      setAttractionName(data?.name);

      setLocation({ address: data?.address, lat: Number(data?.google_location[0]), lng: Number(data?.google_location[1]) });

      setImags(data?.images);

      setFirstName(data?.["contact_person_name"]);
      setFirstDesignation(data?.["contact_person_designation"]);

      const transformedData = data?.contact_person_contacts?.map((item) => ({
        phone: item.phone,
        countryCode: {
          label: item.countryCode,
          value: item.countryCode,
        },
      }));

      setFirstContactNumber(transformedData[0]);
      setFirstContactNumberWhatsapp(transformedData[1]);
    }
  }, [isOpen]);

  console.log({ data });

  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setBtnLoading(false);
    setModalData(null);
  };

  const handleReplyImageChange = (e) => {
    // Get the new files from the input
    const newFiles = Array.from(e.target.files);

    // Use the setCarPicture function to update the state
    setImags((prevFiles) => [...(prevFiles || []), ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setImags(imgs.filter((_, i) => i !== index));
  };

  const handleChange = (type, value) => {
    setSocialLinks((prevLinks) => ({
      ...prevLinks,
      [type]: value,
    }));
  };

  console.log({ data });

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    if (selectedLocation) {
      setAddressLocationError("");
    }
  };

  console.log({ firstContactNumberWhatsapp, firstContactNumber, location });

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-75"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-75"
              >
                <Dialog.Panel className="w-full max-w-7xl overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="mb-5 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? t("nearByAttraction.addNearByAttraction") : t("nearByAttraction.updateNearByAttraction")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className=" h-[450px] overflow-y-auto p-2">
                      <div className="mb-5 ltr:text-left rtl:text-right">
                        <h2 className="label mb-2 text-secondary">{t("headings.basicInfo")}</h2>
                      </div>

                      <Input
                        isRequired
                        label={t("nearByAttraction.attractionName")}
                        placeholder={t("nearByAttraction.attractionName")}
                        labelOnTop
                        error={attractionNameError}
                        value={attractionName}
                        onChange={(e) => {
                          setAttractionName(e.target.value);
                          setAttractionNameError("");
                        }}
                      />

                      <div className="mt-5">
                        <Input
                          labelOnTop
                          label={t("nearByAttraction.description")}
                          placeholder={t("nearByAttraction.description")}
                          textarea
                          error={descriptionError}
                          value={description}
                          onChange={(e) => {
                            setDescription(e.target.value);
                            setDescriptionError("");
                          }}
                        />
                      </div>

                      <div className="mt-5 grid grid-cols-12">
                        <div className="col-span-8 md:col-span-12 lg:col-span-12 xl:col-span-8">
                          {/* <Input
                              isRequired
                              labelOnTop
                              label="Google Location Address"
                              placeholder="Google Location Address"
                              error={addressLocationError}
                              value={location?.address}
                              readOnly
                            /> */}

                          <div className="mt-3">
                            <MapPicker
                              label={t("nearByAttraction.googleLocationAddress")}
                              setLocation={setLocation}
                              venueAddressError={addressLocationError}
                              placeholder={t("nearByAttraction.googleLocationAddress")}
                              onLocationSelect={handleLocationSelect}
                              location={location}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mb-5 mt-5 ltr:text-left rtl:text-right">
                        <h2 className="label mb-2 text-secondary">{t("nearByAttraction.contactPerson")}</h2>
                      </div>

                      <div className="grid grid-cols-4 gap-7">
                        <Input
                          isRequired
                          error={firstNameError}
                          label={t("nearByAttraction.name")}
                          placeholder={t("nearByAttraction.name")}
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            setFirstNameError("");
                          }}
                        />
                        <Input
                          error={firstDesignationError}
                          label={t("nearByAttraction.designation")}
                          placeholder={t("nearByAttraction.designation")}
                          value={firstDesignation}
                          onChange={(e) => setFirstDesignation(e.target.value)}
                        />
                        <Dropdown
                          isSearchable
                          options={countriesCodeData?.countries.map((country) => ({
                            label: `+${country.callingCodes[0]} ${country.name}`,
                            value: `+${country.callingCodes[0]} ${country.name}`,
                          }))}
                          placeholder={t("nearByAttraction.countryCode")}
                          value={firstContactNumber.countryCode}
                          onChange={(e) => setFirstContactNumber({ ...firstContactNumber, countryCode: e })}
                          title={t("nearByAttraction.countryCode")}
                        />
                        <Input
                          isRequired
                          label={t("nearByAttraction.contactNumber")}
                          placeholder={t("nearByAttraction.contactNumber")}
                          value={firstContactNumber.phone}
                          onChange={(e) => setFirstContactNumber({ ...firstContactNumber, phone: e.target.value })}
                        />

                        <Dropdown
                          isSearchable
                          options={countriesCodeData?.countries.map((country) => ({
                            label: `+${country.callingCodes[0]} ${country.name}`,
                            value: `+${country.callingCodes[0]} ${country.name}`,
                          }))}
                          placeholder={t("nearByAttraction.countryCode")}
                          value={firstContactNumberWhatsapp.countryCode}
                          onChange={(e) => {
                            setFirstContactNumberWhatsapp({ ...firstContactNumberWhatsapp, countryCode: e });
                            setFirstContactNumberErrorDrop("");
                          }}
                          title={t("nearByAttraction.countryCode")}
                          withError={firstContactNumberErrorDrop}
                          isRequired
                        />
                        <Input
                          isRequired
                          error={firstContactNumberErrorInput}
                          label={t("nearByAttraction.whatsappNumber")}
                          placeholder={t("nearByAttraction.whatsappNumber")}
                          value={firstContactNumberWhatsapp.phone}
                          onChange={(e) => {
                            setFirstContactNumberWhatsapp({ ...firstContactNumberWhatsapp, phone: e.target.value });
                            setFirstContactNumberErrorInput("");
                          }}
                        />
                      </div>

                      <div className="mt-5 ltr:text-left rtl:text-right">
                        <h2 className="label mb-2 text-secondary">{t("nearByAttraction.touristPlaceRelevantLinks")}</h2>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4">
                        <Input
                          label={t("nearByAttraction.instagramLink")}
                          placeholder={t("nearByAttraction.instagramLink")}
                          value={socialLinks?.instagram}
                          onChange={(e) => handleChange("instagram", e.target.value)}
                        />
                        <Input
                          label={t("nearByAttraction.facebookLink")}
                          placeholder={t("nearByAttraction.facebookLink")}
                          value={socialLinks?.facebook}
                          onChange={(e) => handleChange("facebook", e.target.value)}
                        />
                        <Input
                          label={t("nearByAttraction.websiteLink")}
                          placeholder={t("nearByAttraction.websiteLink")}
                          value={socialLinks?.website}
                          onChange={(e) => handleChange("website", e.target.value)}
                        />

                        <Input
                          label={t("nearByAttraction.otherLink")}
                          placeholder={t("nearByAttraction.otherLink")}
                          value={socialLinks?.other}
                          onChange={(e) => handleChange("other", e.target.value)}
                        />
                      </div>

                      <div className="mb-5 mt-5 ltr:text-left rtl:text-right">
                        <h2 className="label mb-2 text-secondary">{t("nearByAttraction.referenceImage")}</h2>
                      </div>

                      <div className="mt-5 w-2/12">
                        <ChooseFile
                          onClickCross={handleRemoveFile}
                          placeholder
                          selectedFile={imgs}
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handleReplyImageChange}
                          multi
                        />
                      </div>
                    </div>

                    {/* Error Message */}
                    <div className="my-5 flex justify-center">
                      {serverError && <p className="mt-5 text-xs font-medium text-red-500">{serverError}</p>}
                    </div>

                    <div className="mx-auto mt-10 grid w-8/12 grid-cols-2 gap-7">
                      <Button
                        icon={<CheckIcon />}
                        title={data === null ? t("nearByAttraction.addNearByAttraction") : t("nearByAttraction.updateNearByAttraction")}
                        type="submit"
                        loading={loading}
                      />
                      <Button icon={<XMarkIcon />} title={t("buttons.cancel")} type="button" buttonColor="bg-red-500" onClick={closeModal} />
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AddVendorModal;
