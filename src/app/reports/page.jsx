"use client";

import React from 'react';
import Link from 'next/link';
import { FileText, ExternalLink, Download, Archive } from 'lucide-react';

const reportsData = [
  { title: "Wipro earthian annual report", year: 2021, url: "https://drive.google.com/file/d/1O-y7GoJjwM9YFQ84TR1yJr3wWkHRw9iF/view?usp=drive_link" },
  { title: "Wipro earthian annual report", year: 2022, url: "https://drive.google.com/file/d/1MK0dpM9czx1gIuZFDs6zHNuLx0xgzsQh/view?usp=drive_link" },
  { title: "Wipro earthian annual report", year: 2023, url: "https://drive.google.com/file/d/17bJdBJeSIFxmz9d04_jUE4erN1JGT_Bu/view?usp=drive_link" },
  { title: "Citizen Science through Fungi", year: 2024, url: "https://drive.google.com/file/d/1eqeHDBSxraAFIg_7T7Zuf3UxyAsldjot/view?usp=sharing" },
  { title: "Citizen Science through Fungi", year: 2022, url: "https://drive.google.com/file/d/1PFpBes9iLT_PjXyXGv5KZCsUhckBSqLZ/view?usp=sharing" },
  { title: "Wipro earthian annual report", year: 2025, url: "https://drive.google.com/file/d/1HajY5lk6xjapTm6xxzvjnyOK9Rh6RQtQ/view?usp=drive_link" },
];

const sortedReports = reportsData.sort((a, b) => {
  if (a.year === null) return 1;
  if (b.year === null) return -1;
  return b.year - a.year; 
});

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-stone-50 pb-20 font-sans">
      {/* --- Emerald Header Section --- */}

      {/* <section className="bg-emerald-900 py-20 px-4 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10">
          <Archive className="w-96 h-96 absolute -bottom-20 -right-20 text-white" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
            Knowledge Bank
          </h1>
          <div className="h-1.5 bg-emerald-400 mx-auto mb-8 rounded-full w-24" />
          <p className="text-xl md:text-2xl text-emerald-100 font-medium leading-relaxed">
            Transparency in our journey. Access our annual reports and research documentation.
          </p>
        </div>
      </section> */}
      

      <section className="max-w-5xl mx-auto p-6 md:p-8">
        <header className="mb-10 border-b border-stone-200 pb-6">
          <span className="text-emerald-600 font-bold uppercase tracking-widest text-sm">
            Public Records
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Reports & Documents
          </h2>
        </header>

        {/* Reports List */}
        <ul className="grid grid-cols-1 gap-4">
          {sortedReports.map((report, index) => (
            <li key={index}>
              <Link
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-6 bg-white border border-stone-200 rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-500"
              >
                <div className="flex items-center gap-5">
                  {/* Document Icon Box */}
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <FileText className="w-7 h-7" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">
                      {report.title}
                    </span>
                    
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full">
                         {report.year ? report.year : "N/A"}
                       </span>
                       {!report.year && (
                         <span className="text-xs text-stone-400 font-medium">Policy Document</span>
                       )}
                    </div>
                  </div>
                </div>

                {/* External Link Indicator */}
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                  <span className="hidden sm:inline uppercase tracking-widest">View PDF</span>
                  <ExternalLink className="w-5 h-5" />
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Archive Disclaimer */}
        <div className="mt-16 p-8 bg-white border border-dashed border-stone-300 rounded-[2rem] text-center">
          <p className="text-stone-500 font-medium italic">
            Can&apos;t find a specific document? Contact us at 
            <a href="mailto:ecovigyan@gmail.com" className="ml-1 text-emerald-600 font-bold hover:underline">
              ecovigyan@gmail.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}