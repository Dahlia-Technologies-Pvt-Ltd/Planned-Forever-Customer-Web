import Badge from "./Badge";
import Lottie from "react-lottie";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
// import animationData from "../assets/lotties/empty-folder";
import { ChevronUpIcon, ChevronDownIcon, ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";
import ReactPaginate from "react-paginate";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";

const TagBadge = ({ tags }) => (
  <div className="w-full">
    {tags?.map((tag, index) => (
      <span key={index} className="mr-2 rounded bg-blue-100 px-2.5 py-0.5 text-center text-xs font-semibold text-blue-800">
        {tag}
      </span>
    ))}
  </div>
);

const Table = ({
  data,
  columns,
  loading,
  selectedRow,
  setSelectedRow,
  onRowClick,
  onEdit,
  onDecline,
  onAccept,
  onRecipt,
  onBlock,
  onDelete,
  usePagination = false,
  onQuickContact,
  dashboardHeight,
}) => {
  // Columns Lenght
  const colspan = columns.length;

  // States
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(0); // ReactPaginate uses 0-based indexing

  // Media Query
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });

  // Sorting Function
  const handleSort = (key) => {
    setSortConfig({ key, direction: toggleDirection() });
  };

  const toggleDirection = () => (sortConfig.direction === "asc" ? "desc" : "asc");

  const sortedData = () => {
    if (!sortConfig.key) {
      return data;
    }

    return data.slice().sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];

      if (sortConfig.direction === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueB < valueA ? -1 : valueB > valueA ? 1 : 0;
      }
    });
  };

  // Render cell content based on its type
  const renderCellContent = (row, column) => {
    const value = row[column.path];

    if (Array.isArray(value)) {
      return <TagBadge tags={value} />;
    } else if (column.hasImage || column.route) {
      const imageSrc = column.hasImage ? row.image : null;

      return (
        <div className="flex items-center">
          {column.route ? (
            <Link to={column.route} className="flex items-center">
              {imageSrc && <img src={imageSrc} alt={value} className="mr-2 h-8 w-8 rounded-full" />}
              {value}
            </Link>
          ) : (
            <>
              {imageSrc && <img src={imageSrc} alt={value} className="mr-2 h-8 w-8 rounded-full" />}
              {value}
            </>
          )}
        </div>
      );
    } else {
      return value;
    }
  };

  // If the Value is nested like ( data.name )
  function getNestedValue(path, object) {
    return path.split(".").reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), object);
  }

  // Paginate the data
  const itemsPerPage = 5;

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageClick = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  return (
    <>
      <div className={`-mx-6 ${dashboardHeight ? "h-full" : "h-[calc(100vh-305px)]"} overflow-x-auto rounded-10`}>
        <table className="mb-8 w-full table-auto text-left">
          <thead>
            <tr>
              {columns?.map((column, index) => (
                <th key={index} className="border-b border-gray-100 bg-white p-4 first:pl-8" onClick={() => column.path && handleSort(column.path)}>
                  <p className="font-inter cursor-pointer whitespace-nowrap text-sm font-semibold leading-5">
                    {column.header}

                    {column.header === "Actions" ? (
                      ""
                    ) : (
                      <span>
                        {sortConfig?.key === column.path && sortConfig.direction === "asc" ? (
                          <ChevronUpIcon className="ml-1.5 inline-block h-4 w-3.5 text-secondary-color" />
                        ) : (
                          <ChevronDownIcon className="ml-1.5 inline-block h-4 w-3.5  text-secondary-color" />
                        )}
                      </span>
                    )}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">
                  <Skeleton count={isLargeScreenLaptop ? 9 : isLaptopMedium ? 6 : isLaptop ? 4 : 10} height={50} />
                </td>
              </tr>
            ) : data?.length > 0 ? (
              sortedData()?.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`cursor-pointer even:bg-gray-100 ${selectedRow === row ? "border-l-4 border-secondary bg-secondary/15" : ""}`}
                  onClick={() => {
                    onRowClick && onRowClick(row);
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={`px-4 py-4 first:pl-8`}>
                      <p className={`space-x-2 text-sm font-normal ${column?.header === "Amount" ? "text-accent" : "text-primary-color-200"}`}>
                        {column?.actions
                          ? column?.actions?.map((action, actionIndex) => (
                              <span key={actionIndex} className="cursor-pointer">
                                {action === "decline" ? (
                                  <span className="text-sm font-medium text-red-500 underline" onClick={() => onDecline(row)}>
                                    Decline
                                  </span>
                                ) : (
                                  action === "accept" && (
                                    <span className="text-sm font-medium text-accent underline" onClick={() => onAccept(row)}>
                                      Accept
                                    </span>
                                  )
                                )}
                                {action === "edit" && (
                                  <span className="text-sm font-medium text-secondary underline" onClick={() => onEdit(row)}>
                                    Edit
                                  </span>
                                )}

                                {action === "quick_contact" && (
                                  <span className="text-sm font-medium text-yellow-600 underline" onClick={() => onQuickContact(row)}>
                                    Quick Contact
                                  </span>
                                )}

                                {action === "recipt" && (
                                  <span className="text-sm font-medium text-secondary underline" onClick={() => onRecipt(row)}>
                                    Recipt
                                  </span>
                                )}

                                {action === "delete" && (
                                  <span className="text-sm font-medium text-red-500 underline" onClick={() => onDelete(row)}>
                                    Delete
                                  </span>
                                )}

                                {action === "block" ? (
                                  <span className="text-sm font-medium text-red-500 underline" onClick={() => onBlock(row)}>
                                    Block
                                  </span>
                                ) : (
                                  action === "unblock" && (
                                    <span className="text-sm font-medium text-green-500 underline" onClick={() => onBlock(row)}>
                                      Unblock
                                    </span>
                                  )
                                )}
                              </span>
                            ))
                          : renderCellContent(row, column)}
                      </p>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="h-60">
                <td colSpan={colspan}>
                  <Lottie options={emptyFolderAnimation} height={200} width={200} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {usePagination && (
        <>
          <div className="absolute bottom-4 flex w-[96%] items-center justify-between">
            <p className="text-base font-medium text-secondary-color">
              {currentPage * itemsPerPage + 1} - {Math.min((currentPage + 1) * itemsPerPage, 10)} of {10}
            </p>
            <ReactPaginate
              breakLabel="..."
              pageRangeDisplayed={5}
              forcePage={currentPage}
              marginPagesDisplayed={2}
              activeClassName="active"
              nextClassName="item next"
              renderOnZeroPageCount={null}
              breakClassName="item break-me "
              containerClassName="pagination"
              onPageChange={handlePageClick}
              previousClassName="item previous"
              pageClassName="item pagination-page "
              pageCount={Math.ceil(data.length / itemsPerPage)}
              nextLabel={<ChevronRightIcon className="h-5 w-5" />}
              previousLabel={<ChevronLeftIcon className="h-5 w-5" />}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Table;
