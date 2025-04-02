
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary p-2 rounded-lg">
        <img
          src="/images/college-logo.svg"
          alt="College Logo"
          width="24"
          height="24"
          className="text-white"
        />
      </div>
      <span className="font-bold text-xl">AUTOMATIC TIMETABLE GENERATION</span>
    </div>
  );
};

export default Logo;
