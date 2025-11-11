import { ChevronDownIcon } from '@heroicons/react/24/outline';
import React from 'react';

const Badge = ({ title, className, showIcon }) => {
  return (
    <span
      className={`${className} mr-2 my-1 rounded bg-blue-100 px-2.5 py-0.5 gap-x-2  items-center text-center text-xs font-semibold text-blue-800 flex whitespace-nowrap`}
    >
      {title}

      {showIcon && (
        <ChevronDownIcon className='w-4 h-4'/>
      )}
    </span>
  );
};

export default Badge;
