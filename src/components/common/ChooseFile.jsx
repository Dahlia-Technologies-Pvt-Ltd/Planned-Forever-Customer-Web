import React from "react";
import Spinner from "./Spinner";
import { Images } from "../../assets/Assets";
import { mediaUrl } from "../../utilities/config";
import { DocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ChooseFile = ({
  uni,
  multi,
  style,
  width,
  accept,
  noText,
  loading,
  onChange,
  imgStyle,
  required,
  placeholder,
  textOnImage,
  selectedFile,
  onClickCross,
  placeholderText,
  textAboveImage,
  dir,
  textBelowImage,
  label,
}) => {
  return (
    <div className={`${style ? "flex items-center gap-x-3" : ""} ${width ? width : "w-full"}`}>
      <div className={` ${required ? "border-red-500" : "border-secondary-color-500"} relative `}>
        {multi ? (
          <div className="flex items-center gap-x-3">
            <div className="label ">{label}</div>

            <div>
              <input type="file" multiple id="imageInput2" className="hidden" onChange={onChange} />
              <label
                htmlFor="imageInput2"
                className="mr-4  mt-2 flex w-full cursor-pointer justify-center rounded-full border-0 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
              >
                {placeholderText ? placeholderText : " Choose File"}
              </label>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-x-3">
            <div className="label ">{label}</div>

            <div>
              <input type="file" id={`${uni ? uni : "imageInput"}`} className="hidden" onChange={onChange} />
              <label
                htmlFor={`${uni ? uni : "imageInput"}`}
                className="mr-4  mt-2 flex w-full cursor-pointer justify-center rounded-full border-0 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
              >
                {placeholderText ? placeholderText : " Choose File"}
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {loading ? (
          <div className="flex h-24 w-24 items-center justify-center">
            <Spinner />
          </div>
        ) : multi ? (
          selectedFile &&
          selectedFile.map((file, index) => {
            const fileExtension = file.name ? file.name.split(".").pop().toLowerCase() : "";
            const isImage =
              typeof file === "string"
                ? /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file) // Check extension for string filenames
                : file.type && file.type.startsWith("image/"); // Check MIME type for File objects

            const isPdf =
              typeof file === "string"
                ? /\.pdf$/i.test(file) // Check extension for string filenames
                : file.type && file.type === "application/pdf";

            const fileUrl = typeof file === "string" ? mediaUrl + file : URL.createObjectURL(file);

            return (
              <div key={index}>
                {textAboveImage && (
                  <div className="p-2">
                    <p className="text-black">{textOnImage}</p>
                  </div>
                )}

                <div className="relative mx-1 my-3 inline-flex h-24 w-24 overflow-hidden rounded-xl">
                  <div className="absolute right-1 top-1 cursor-pointer rounded-full bg-red-500" onClick={() => onClickCross(index)}>
                    <XMarkIcon className="h-6 w-6 text-white" />
                  </div>

                  {isImage ? (
                    <img src={fileUrl} alt="Selected Image" className="h-full w-full object-cover" />
                  ) : isPdf ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-full w-full flex-col items-center justify-center bg-gray-200"
                    >
                      <DocumentIcon className="h-12 w-12 text-gray-500" />
                      <p className="mt-2 text-sm text-gray-700">View PDF</p>
                    </a>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <span className="text-sm text-gray-700">{fileExtension.toUpperCase()} File</span>
                    </div>
                  )}

                  {textOnImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white">{textOnImage}</p>
                    </div>
                  )}
                </div>

                {textBelowImage && (
                  <div className="p-2">
                    <p className="text-black">{textOnImage}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <>
            {loading ? (
              <div className="flex h-40 w-40 items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <>
                {selectedFile ? (
                  selectedFile.type && selectedFile.type.startsWith("image/") ? (
                    <>
                      {textAboveImage && (
                        <div className="p-2">
                          <p className="text-black">{textOnImage}</p>
                        </div>
                      )}
                      <div className="relative mt-3 h-40 w-40 overflow-hidden rounded-xl">
                        <div className="absolute right-1 top-1 cursor-pointer rounded-full bg-red-500" onClick={onClickCross}>
                          <XMarkIcon className="h-6 w-6 text-white" />
                        </div>
                        <a href={URL.createObjectURL(selectedFile)} download={selectedFile.name} className="h-full w-full">
                          <img src={URL.createObjectURL(selectedFile)} alt="Selected" className="h-full w-full object-cover" />
                        </a>
                        {textOnImage && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-white">{textOnImage}</p>
                          </div>
                        )}
                      </div>

                      {textBelowImage && (
                        <div className="p-2">
                          <p className="text-black">{textOnImage}</p>
                        </div>
                      )}
                    </>
                  ) : selectedFile.type && selectedFile.type.startsWith("video/") ? (
                    <div className="relative mt-4 h-40 w-40 overflow-hidden rounded-xl">
                      <div className="absolute right-1 top-1 cursor-pointer rounded-full bg-red-500" onClick={onClickCross}>
                        <XMarkIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex h-full w-full items-center justify-center border bg-gray-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7v10l10-5z" />
                        </svg>
                      </div>
                    </div>
                  ) : selectedFile.type && selectedFile.type.startsWith("application/pdf") ? (
                    <div className="relative mt-4 h-40 w-40 overflow-hidden rounded-xl">
                      <div className="absolute right-1 top-1 cursor-pointer rounded-full bg-red-500" onClick={onClickCross}>
                        <XMarkIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex h-full w-full items-center justify-center border bg-gray-200">
                        <a
                          href={typeof selectedFile === "string" ? mediaUrl + selectedFile : URL.createObjectURL(selectedFile)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center"
                        >
                          <DocumentIcon className="h-12 w-12 text-gray-500" />
                          <p className="mt-2 text-sm text-gray-700">View PDF</p>
                        </a>
                      </div>
                    </div>
                  ) : (
                    selectedFile && (
                      <div className={imgStyle ? imgStyle : "relative mt-4 h-16 w-16 overflow-hidden rounded-xl"}>
                        <div className="absolute right-1 top-1 cursor-pointer rounded-full bg-red-500" onClick={onClickCross}>
                          <XMarkIcon className="h-6 w-6 text-white" />
                        </div>

                        <a
                          href={typeof selectedFile === "string" ? mediaUrl + selectedFile : URL.createObjectURL(selectedFile)}
                          target={
                            ["jpg", "jpeg", "png", "gif", "pdf"].includes(
                              typeof selectedFile === "string"
                                ? selectedFile.split(".").pop().toLowerCase()
                                : selectedFile.name.split(".").pop().toLowerCase(),
                            )
                              ? "_blank"
                              : undefined
                          } // Open images & PDFs in new tab
                          download={
                            ["jpg", "jpeg", "png", "gif", "pdf"].includes(
                              typeof selectedFile === "string"
                                ? selectedFile.split(".").pop().toLowerCase()
                                : selectedFile.name.split(".").pop().toLowerCase(),
                            )
                              ? undefined // No download for images & PDFs
                              : typeof selectedFile === "string"
                                ? selectedFile.split("/").pop()
                                : selectedFile.name
                          } // Set filename for downloads
                          className="h-full w-full"
                        >
                          {selectedFile
                            ? (() => {
                                const fileExtension =
                                  typeof selectedFile === "string"
                                    ? selectedFile.split(".").pop().toLowerCase()
                                    : selectedFile.name.split(".").pop().toLowerCase();

                                // Check for Image files
                                if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
                                  return <img src={mediaUrl + selectedFile} alt="Selected Image" className="h-full w-full object-cover" />;
                                }
                                // Check for Excel files
                                else if (["xls", "xlsx", "xlsm", "csv"].includes(fileExtension)) {
                                  return <img src={Images.Excel} alt="Excel File" className="h-full w-full object-cover" />;
                                }
                                // Check for PDF files
                                else if (fileExtension === "pdf") {
                                  return (
                                    <a
                                      href={typeof selectedFile === "string" ? mediaUrl + selectedFile : URL.createObjectURL(selectedFile)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <DocumentIcon className="h-12 w-12 text-gray-600" />
                                    </a>
                                  );
                                }
                                // Default case for other file types
                                else {
                                  return <img src={mediaUrl + selectedFile} alt="File" className="h-full w-full object-cover" />;
                                }
                              })()
                            : null}
                        </a>
                      </div>
                    )
                  )
                ) : null}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChooseFile;
