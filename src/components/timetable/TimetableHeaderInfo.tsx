
// Import necessary modules from React and types from utils
import React from 'react';
import { Timetable } from '@/utils/types';

// Define the props interface for the TimetableHeaderInfo component
interface TimetableHeaderInfoProps {
  timetable: Timetable; // The timetable data to be displayed
  printMode?: boolean; // Optional flag to adjust styling for print layout
}

// TimetableHeaderInfo Component
// This component renders the header information for the timetable
// It conditionally renders different layouts based on the printMode prop
const TimetableHeaderInfo: React.FC<TimetableHeaderInfoProps> = ({ timetable, printMode = false }) => {
  // Check if the component is in print mode
  if (printMode) {
    // Render the header information suitable for printing
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
  
  // Render the header information for normal view
  return (
    <div className="mb-6 no-print bg-white p-4">
      <h2 style={{ marginBottom: "5px", fontSize: "16px" }} className="font-bold text-center">University College of Engineering & Technology for Women</h2>
      <p style={{ marginTop: 0, marginBottom: "8px", fontSize: "12px" }} className="text-center">Kakatiya University Campus, Warangal (T.S) - 506009</p>
      <h3 style={{ marginTop: 0, marginBottom: "5px", textDecoration: "underline", fontSize: "14px" }} className="font-bold text-center">
        {timetable.formData.courseName}.{timetable.formData.branch} ({timetable.formData.semester}) SEMESTER TIME TABLE STATEMENT {timetable.formData.academicYear}
      </h3>
      <p style={{ marginTop: 0, marginBottom: "15px", fontSize: "12px" }} className="text-center">
        {timetable.formData.year} {timetable.formData.branch} - {timetable.formData.academicYear}
      </p>
      
      <div className="flex justify-between items-center mb-2 px-2">
        <div><span className="font-semibold">Class In-Charge:</span> {timetable.formData.classInchargeName}</div>
        <div><span className="font-semibold">Room No:</span> {timetable.formData.roomNumber}</div>
      </div>
      <div className="flex justify-between items-center mb-2 px-2">
        <div><span className="font-semibold">Mobile Number:</span> {timetable.formData.mobileNumber}</div>
        <div><span className="font-semibold">W.E.F:</span> {timetable.formData.date || new Date().toISOString().split('T')[0]}</div>
      </div>
    </div>
    
  );
};

// Export the component as default
export default TimetableHeaderInfo;
