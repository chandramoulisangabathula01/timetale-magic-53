
import React from 'react';
import { Timetable } from '@/utils/types';

interface TimetableHeaderInfoProps {
  timetable: Timetable;
  printMode?: boolean;
}

const TimetableHeaderInfo: React.FC<TimetableHeaderInfoProps> = ({ timetable, printMode = false }) => {
  if (printMode) {
    return (
      <div className="print-only">
        <div className="flex justify-center mb-4">
          <img src="/public/lovable-uploads/eb4f9a1c-adf2-4f9d-b5b7-86a8c285a2ec.png" alt="College Logo" className="w-20 h-20" />
        </div>
        <h2 className="font-bold text-center text-xl mb-1">University College of Engineering & Technology for Women</h2>
        <p className="text-center text-sm mb-2">Kakatiya University Campus, Warangal (T.S) - 506009</p>
        <h3 className="font-bold text-center text-lg underline mb-2">
          {timetable.formData.courseName}.{timetable.formData.branch} ({timetable.formData.semester}) SEMESTER TIME TABLE STATEMENT {timetable.formData.academicYear}
        </h3>
        <p className="text-center text-sm mb-4">
          {timetable.formData.year} {timetable.formData.branch} - {timetable.formData.academicYear}
        </p>
        
        <div className="flex justify-between items-center mb-2 px-2">
          <div><span className="font-semibold">Class In-Charge:</span> {timetable.formData.classInchargeName}</div>
          <div><span className="font-semibold">Room No:</span> {timetable.formData.roomNumber}</div>
        </div>
        <div className="flex justify-between items-center mb-4 px-2">
          <div><span className="font-semibold">Mobile Number:</span> {timetable.formData.mobileNumber}</div>
          <div><span className="font-semibold">W.E.F:</span> {timetable.formData.date || new Date().toISOString().split('T')[0]}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-6 no-print bg-white">
      <h2 className="font-bold text-center text-xl mb-1">College of Engineering</h2>
      <h3 className="font-bold text-center text-lg">
        {timetable.formData.courseName} - {timetable.formData.year} - {timetable.formData.branch} - Semester {timetable.formData.semester}
      </h3>
      <p className="text-center text-sm text-muted-foreground">
        Academic Year: {timetable.formData.academicYear} | Room: {timetable.formData.roomNumber}
      </p>
      <p className="text-center text-sm mt-2">
        Class Incharge: <span className="font-medium">{timetable.formData.classInchargeName}</span> | Contact: {timetable.formData.mobileNumber}
      </p>
    </div>
  );
};

export default TimetableHeaderInfo;
