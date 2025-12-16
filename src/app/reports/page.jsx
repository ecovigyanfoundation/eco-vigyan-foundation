// ReportsPage.jsx

import React from 'react';
import Link from 'next/link';
// Assuming you have access to icons (e.g., Lucide, Heroicons).
// I'll use a simple SVG icon for "External Link / PDF"
const DocumentIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 10 10 11"></polyline>
  </svg>
);


// 1. Define the reports data
const reportsData = [
  { title: "Wipro earthian annual report", year: 2021, url: "https://drive.google.com/file/d/1O-y7GoJjwM9YFQ84TR1yJr3wWkHRw9iF/view?usp=drive_link" },
  { title: "Wipro earthian annual report", year: 2022, url: "https://drive.google.com/file/d/1MK0dpM9czx1gIuZFDs6zHNuLx0xgzsQh/view?usp=drive_link" },
  { title: "Wipro earthian annual report", year: 2023, url: "https://drive.google.com/file/d/17bJdBJeSIFxmz9d04_jUE4erN1JGT_Bu/view?usp=drive_link" },
  { title: "Citizen Science through Fungi", year: 2024, url: "https://drive.google.com/file/d/1eqeHDBSxraAFIg_7T7Zuf3UxyAsldjot/view?usp=sharing" },
  { title: "Citizen Science through Fungi", year: 2022, url: "https://drive.google.com/file/d/1PFpBes9iLT_PjXyXGv5KZCsUhckBSqLZ/view?usp=sharing" },
  { title: "St. Luke’s Waste Management Policy", year: null, url: "https://drive.google.com/file/d/1YiPIxAFzYMCpqpEeY6oIGCJGoSxbvakN/view?usp=drive_link" },
  { title: "Wipro earthian annual report", year: 2025, url: "https://drive.google.com/file/d/1HajY5lk6xjapTm6xxzvjnyOK9Rh6RQtQ/view?usp=drive_link" },
];

// 2. Sort the data by year in descending order
// Items without a year (null) will be placed at the end.
const sortedReports = reportsData.sort((a, b) => {
  if (a.year === null) return 1;
  if (b.year === null) return -1;
  return b.year - a.year; // Descending order
});


export default function ReportsPage() {
  return (
    <section className="max-w-5xl mx-auto p-6 md:p-10">
      
      {/* Page Header */}
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-3">
          Annual Reports & Documents
        </h1>
        <p className="text-xl text-gray-600">
          Access our published documents, sorted by year from the most recent.
        </p>
      </header>

      {/* Reports List */}
      <ul className="space-y-4">
        {sortedReports.map((report, index) => (
          <li key={index}>
            <Link
              href={report.url}
              target="_blank" // Opens the PDF link in a new tab
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-5 border border-gray-200 rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:border-indigo-500 hover:bg-indigo-50"
            >
              {/* Report Title and Year */}
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                  {report.title}
                  {report.year && <span className="ml-2 font-normal text-indigo-500">({report.year})</span>}
                </span>
                
                {/* Fallback for items without a year */}
                {!report.year && (
                  <span className="text-sm text-gray-500 mt-1 italic">Policy Document (Year N/A)</span>
                )}
              </div>

              {/* Icon for external link / PDF */}
              <div className="text-indigo-500 group-hover:text-indigo-700 ml-4 flex-shrink-0">
                <DocumentIcon />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}