// import React, { useState, useRef } from "react";
// import Datepicker from "react-tailwindcss-datepicker";
// import moment from "moment";
// import { XCircleIcon } from "@heroicons/react/24/solid";

// const RangePicker = ({ setRangePicker, refreshData }) => {
//   const [dateToShow, setDateToShow] = useState({
//     startDate: null,
//     endDate: null,
//   });

//   const dateRef = useRef(null);


//   const handleValueChange = (newValue) => {
//     let startDateUTC, endDateUTC;

//     if (newValue.startDate) {
//       startDateUTC = moment.utc(newValue.startDate).startOf("day");
//     } else {
//       startDateUTC = moment.utc().startOf("day");
//     }

//     if (newValue.endDate) {
//       endDateUTC = moment.utc(newValue.endDate).endOf("day");
//     } else {
//       endDateUTC = moment.utc(startDateUTC).endOf("day");
//     }

//     const startDateUTCUnix = startDateUTC.valueOf() / 1000;
//     const endDateUTCUnix = endDateUTC.valueOf()

//     setRangePicker({ startDate: startDateUTCUnix, endDate: endDateUTCUnix });

//     setDateToShow({ startDate: startDateUTC.toDate(), endDate: endDateUTC.toDate() });
//   };

//   const handleClearInput = (e) => {
//     e.preventDefault();
//     if (dateRef.current) {
//       dateRef.current.clear();
//     }
//     setDateToShow({ startDate: null, endDate: null });
//     refreshData()
//   };

//   return (
//     <div className="w-44">
//       <form className="relative">
//        {/* {(dateToShow?.startDate && dateToShow?.endDate) &&  <button onClick={handleClearInput} className="absolute z-10 text-sm text-red-500 -translate-y-1/2 top-1/2 right-3 focus:outline-none">
//           <XCircleIcon className="w-5 h-5"/>
//         </button>} */}
//         <Datepicker
//           ref={dateRef}
//           value={dateToShow}
//           onChange={handleValueChange}
//           showShortcuts
//           showFooter
//           inputClassName="w-full pr-8 py-2.5 border-gray-400 rounded-lg focus:ring-0 text-sm placeholder:text-primary-light-color"
//           placeholder="Select Dates"
//           displayFormat="ddd, MMM DD, YYYY"
//         />
//       </form>
//     </div>
//   );
// };

// export default RangePicker;


import moment from "moment";
import React, { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";

const RangePicker = ({ setRangePicker }) => {
  const [dateToShow, setDateToShow] = useState({
    startDate: null,
    endDate: null,
  });

  const handleValueChange = (newValue) => {
    let startDate = moment(newValue.startDate).startOf("day");

    let endDate = newValue.endDate ? moment(newValue.endDate) : startDate;
    endDate = endDate.endOf("day");

    const startDateUTCUnix = Math.floor(startDate.utc().valueOf() / 1000);
    const endDateUTCUnix = Math.floor(endDate.utc().valueOf() / 1000);

    setRangePicker({ startDate: startDateUTCUnix, endDate: endDateUTCUnix });

    setDateToShow({ startDate: startDate.toDate(), endDate: endDate.toDate() });
  };

  return (
    <div className="w-40">
      <Datepicker
        value={dateToShow}
        onChange={handleValueChange}
        showShortcuts
        showFooter
        inputClassName="w-full h-11 pr-8 border-gray-400 rounded-xl focus:ring-0 text-sm placeholder:text-gray-400" 
        placeholder="Select Dates"
        displayFormat="ddd, MMM DD, YYYY"
      />
    </div>
  );
};

export default RangePicker;
