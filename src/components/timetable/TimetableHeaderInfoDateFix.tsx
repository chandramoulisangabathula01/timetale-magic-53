
import React from 'react';
import { format } from 'date-fns';

interface TimetableHeaderInfoDateFixProps {
  wef: string;
  formatDate: (date: string) => string;
}

export const formatDateToDDMMYYYY = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const TimetableHeaderInfoDateFix: React.FC<TimetableHeaderInfoDateFixProps> = ({
  wef,
  formatDate = formatDateToDDMMYYYY
}) => {
  const formattedDate = formatDate(wef);
  
  return (
    <div className="text-sm text-gray-600">
      <span>w.e.f: {formattedDate}</span>
    </div>
  );
};

export default TimetableHeaderInfoDateFix;
