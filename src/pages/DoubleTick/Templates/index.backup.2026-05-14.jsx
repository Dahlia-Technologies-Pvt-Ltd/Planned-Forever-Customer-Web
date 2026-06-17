import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import ApiServices from "../../../api/services";
import React, { useEffect, useState } from "react";
import { DOUBLE_TICK } from "../../../routes/Names";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import Dropdown from "../../../components/common/Dropdown";
import ChooseFile from "../../../components/common/ChooseFile";
import { useThemeContext } from "../../../context/GlobalContext";

const Templates = () => {
  const navigate = useNavigate();
  const { allGroups, allContact, withOutformattedContact, openSuccessModal, closeSuccessModel, getContacts, getGroupNames } = useThemeContext();

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [guestNames, setGuestNames] = useState([]);
  const [inputValues, setInputValues] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const [headerImage, setHeaderImage] = useState(null);
  const [sendTemplate, setSendTemplate] = useState(false);
  const [templatesListing, setTemplatesListing] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showHeaderImage, setShowHeaderImage] = useState(true);

  let indexCounter = 0;
  const hasHeader = selectedTemplate?.components?.some((component) => component?.type === "HEADER");
  const hasMediaUrl = selectedTemplate?.components?.some((component) => component?.type === "HEADER" && component?.variables?.[0]?.mediaUrl);
  const shouldShowImageInput = hasHeader || hasMediaUrl;

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setHeaderImage(file);
    }
  };

  const handleCrossClick = () => {
    setHeaderImage(null);
  };

  const formatTemplate = (template) => {
    return template?.replace(/\\n/g, "\n");
  };

  const formatName = (name = "") => {
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getContactGroupId = (contact) => contact?.group?.id || contact?.group_id || null;

  const getContactFullName = (contact) => {
    return [contact?.salutation, contact?.first_name, contact?.last_name].filter(Boolean).join(" ").trim();
  };

  const filteredContacts = selectedGroup?.value
    ? (withOutformattedContact || []).filter((contact) => getContactGroupId(contact) === selectedGroup.value)
    : withOutformattedContact || [];

  const guestOptions = filteredContacts.map((contact) => ({
    value: contact?.uuid,
    label: getContactFullName(contact),
  }));

  const getTemplatesList = async () => {
    try {
      setLoading(true);
      const res = await ApiServices.doubleTick.templateList({});
      const { data } = res;
      if (data.code === 200) {
        const filteredTemplates = data.data?.filter((template) => template?.name && template?.name?.includes("planned_forever"));
        setTemplatesListing(filteredTemplates);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setBtnLoading(true);

      const userIds = guestNames?.map((guest) => guest?.value).filter(Boolean);
      const placeholders = inputValues?.filter(Boolean);

      let payload;
      if (headerImage) {
        payload = new FormData();
        payload.append("template_name", selectedTemplate.name);
        userIds.forEach((id) => payload.append("user_ids[]", id));
        placeholders.forEach((value) => payload.append("placeholders[]", value));
        payload.append("header_type", "image");
        payload.append("image", headerImage);
      } else {
        payload = {
          template_name: selectedTemplate.name,
          user_ids: userIds,
          placeholders,
        };
      }

      const res = await ApiServices.doubleTick.sendTemplate(payload, {
        headers: headerImage ? { "Content-Type": "multipart/form-data" } : {},
      });
      const { data } = res;
      if (data.code === 200) {
        openSuccessModal({
          title: "Success",
          message: "Template sent successfully",
          onClickDone: () => {
            closeSuccessModel();
            setSendTemplate(false);
            setErrors({});
            setGuestNames([]);
            setHeaderImage(null);
            setInputValues([]);
            setSelectedGroup(null);
            navigate(DOUBLE_TICK);
          },
        });
      }
    } catch (err) {
      console.error("Error sending template:", err);
    } finally {
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    getTemplatesList();
    getContacts();
    getGroupNames();
  }, []);

  return (
    <div className="card min-h-[82vh] space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Templates List</h2>
      </div>
      {!sendTemplate ? (
        <div className="-mr-4 grid max-h-[70vh] grid-cols-3 gap-3 overflow-auto pr-4">
          {loading ? (
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} count={1} className="!h-72 !w-full !rounded" />
              ))}
            </>
          ) : (
            templatesListing?.map((item, index) => (
              <div key={index} className="flex h-full flex-col justify-between space-y-6 rounded border px-5 pb-3 pt-5">
                <div className="space-y-5">
                  <h2 className="text-lg font-medium">{formatName(item?.name)}</h2>
                  {item?.components?.map((component, idx) =>
                    component.type === "BODY" ? (
                      <p key={idx} className="whitespace-pre-line text-sm text-gray-500">
                        {formatTemplate(component.text)}
                      </p>
                    ) : null,
                  )}
                </div>
                <div className="mt-auto flex items-center justify-end">
                  <Button
                    title="Send Template"
                    onClick={() => {
                      setSendTemplate(true);
                      setSelectedTemplate(item);
                      setSelectedGroup(null);
                      setGuestNames([]);
                      setHeaderImage(null);
                      setInputValues([]);
                      setShowHeaderImage(true);
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid min-h-[75vh] grid-cols-2 gap-5 divide-x">
          <div className="-mr-4 max-h-[70vh] space-y-5 overflow-auto pr-4">
            <h2 className="text-lg font-medium">{formatName(selectedTemplate?.name)}</h2>

            {selectedTemplate?.components?.map((component, index) =>
              component.type === "HEADER" && component.variables?.[0]?.mediaUrl && showHeaderImage ? (
                <div key={index} className="h-96 w-full rounded-md">
                  <img
                    src={component.variables[0].mediaUrl}
                    alt="Template Header"
                    className="h-full w-full rounded-md object-contain"
                    onError={() => setShowHeaderImage(false)}
                  />
                </div>
              ) : null,
            )}

            {selectedTemplate?.components?.map((component, index) =>
              component.type === "BODY" ? (
                <p key={index} className="whitespace-pre-line text-sm text-gray-500">
                  {formatTemplate(component.text)}
                </p>
              ) : null,
            )}
          </div>

          <div className="relative pl-5">
            <div className="space-y-4">
              <h2 className="text-base">Add Variables</h2>
              <div className="grid grid-cols-2 gap-3">
                {selectedTemplate?.components?.map((component) =>
                  component.type === "BODY"
                    ? component.variables?.map((variable) => {
                        if (variable?.name === "guest_name" || variable?.name === "name" || variable?.name === "guest" || variable?.name === "user") {
                          return (
                            <React.Fragment key={variable.name}>
                              <Dropdown
                                title="Group Name"
                                placeholder="Select Group"
                                options={[{ label: "All Groups", value: "all" }, ...(allGroups || [])]}
                                value={selectedGroup?.value ? selectedGroup : { label: "All Groups", value: "all" }}
                                onChange={(selected) => {
                                  if (selected?.value === "all") {
                                    setSelectedGroup(null);
                                  } else {
                                    setSelectedGroup(selected);
                                  }
                                  setGuestNames([]);
                                }}
                              />
                              <Dropdown
                                isRequired
                                title="Guest Name"
                                placeholder={selectedGroup?.label ? `Select Guests from ${selectedGroup.label}` : "Select Guests"}
                                options={[{ label: "All Guest", value: "all" }, ...guestOptions]}
                                value={guestOptions.length > 0 && guestNames.length === guestOptions.length ? [{ label: "All Guest", value: "all" }] : guestNames}
                                isMulti
                                onChange={(selected) => {
                                  const selectedGuests = selected || [];

                                  if (selectedGuests.some((item) => item.value === "all")) {
                                    setGuestNames(guestOptions);
                                  } else if (guestOptions.length > 0 && selectedGuests.length === guestOptions.length) {
                                    setGuestNames(guestOptions);
                                  } else {
                                    setGuestNames(selectedGuests);
                                  }
                                }}
                                withError={errors.guestNames}
                              />
                            </React.Fragment>
                          );
                        }

                        const currentIndex = indexCounter;
                        indexCounter++;

                        return (
                          <Input
                            isRequired
                            key={variable.name}
                            label={formatName(variable?.name)}
                            placeholder={formatName(variable?.name)}
                            value={inputValues[currentIndex] || ""}
                            error={errors[`input_${currentIndex}`]}
                            onChange={(e) => {
                              const newValues = [...inputValues];
                              newValues[currentIndex] = e.target.value;
                              setInputValues(newValues);
                            }}
                          />
                        );
                      })
                    : null,
                )}
                {shouldShowImageInput && (
                  <div>
                    <h2 className="label">
                      Document
                      <span className="text-base text-red-500">* {errors.headerImage}</span>
                    </h2>
                    <ChooseFile
                      placeholder="Choose Image"
                      onChange={handleImageChange}
                      selectedFile={headerImage}
                      onClickCross={handleCrossClick}
                      error={errors.headerImage}
                    />
                  </div>
                )}
                <input type="hidden" value={inputValues.join(",")} />
                <input type="hidden" value={guestNames.join(",")} />
                <input type="hidden" value={headerImage || ""} />
              </div>
            </div>
            <div className="absolute -bottom-2 right-4 flex items-end justify-end gap-x-3">
              <Button
                title="Cancel"
                type="button"
                buttonColor="bg-red-500"
                onClick={() => {
                  setSendTemplate(false);
                  setErrors({});
                  setGuestNames([]);
                  setHeaderImage(null);
                  setInputValues([]);
                  setSelectedGroup(null);
                  setShowHeaderImage(true);
                }}
              />
              <Button title="Send Template" onClick={handleSubmit} loading={btnLoading} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
