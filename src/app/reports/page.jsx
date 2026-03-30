"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, Download, Calendar, FolderOpen, Search, Sparkles } from 'lucide-react';

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const reports = [
    {
      id: '1',
      title: 'Wipro Earthian Annual Report',
      year: '2025',
      category: 'Wipro Earthian',
      description: 'Comprehensive overview of our 2025 Wipro Earthian Program activities, including school partnerships, eco-club initiatives, and student achievements across India.',
      pdfUrl: 'https://drive.google.com/file/d/1HajY5lk6xjapTm6xxzvjnyOK9Rh6RQtQ/view?usp=drive_link',
      fileSize: '4.2 MB',
      pages: 48
    },
    {
      id: '2',
      title: 'Citizen Science Through Fungi',
      year: '2024',
      category: 'Citizen Science',
      description: 'Documentation of community-led fungi identification and mapping initiatives, including biodiversity data collected by citizen scientists across the Himalayas.',
      pdfUrl: 'https://drive.google.com/file/d/1eqeHDBSxraAFIg_7T7Zuf3UxyAsldjot/view?usp=sharing',
      fileSize: '3.8 MB',
      pages: 36
    },
    {
      id: '3',
      title: 'Wipro Earthian Annual Report',
      year: '2023',
      category: 'Wipro Earthian',
      description: 'Annual summary of sustainability education programs, highlighting key milestones, student projects, and environmental impact across participating schools.',
      pdfUrl: 'https://drive.google.com/file/d/17bJdBJeSIFxmz9d04_jUE4erN1JGT_Bu/view?usp=drive_link',
      fileSize: '5.1 MB',
      pages: 52
    },
    {
      id: '4',
      title: 'Wipro Earthian Annual Report',
      year: '2022',
      category: 'Wipro Earthian',
      description: 'Year-end report showcasing eco-club activities, waste management initiatives, and biodiversity conservation projects led by students and teachers.',
      pdfUrl: 'https://drive.google.com/file/d/1MK0dpM9czx1gIuZFDs6zHNuLx0xgzsQh/view?usp=drive_link',
      fileSize: '4.5 MB',
      pages: 44
    },
    {
      id: '5',
      title: 'Citizen Science Through Fungi',
      year: '2022',
      category: 'Citizen Science',
      description: 'Research findings from volunteer-led fungi surveys, including species identification, habitat mapping, and ecological observations from forest walks.',
      pdfUrl: 'https://drive.google.com/file/d/1PFpBes9iLT_PjXyXGv5KZCsUhckBSqLZ/view?usp=sharing',
      fileSize: '3.2 MB',
      pages: 32
    },
    {
      id: '6',
      title: 'Wipro Earthian Annual Report',
      year: '2021',
      category: 'Wipro Earthian',
      description: 'Foundation year report documenting the launch of our Wipro Earthian programs, initial school partnerships, and early environmental education initiatives.',
      pdfUrl: 'https://drive.google.com/file/d/1O-y7GoJjwM9YFQ84TR1yJr3wWkHRw9iF/view?usp=drive_link',
      fileSize: '3.9 MB',
      pages: 40
    }
  ];

  const categories = ['All', 'Wipro Earthian', 'Citizen Science', 'Annual Report', 'Research'];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.year.includes(searchTerm) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Wipro Earthian':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Citizen Science':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Annual Report':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Research':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-emerald-700 to-emerald-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 border-2 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-64 h-64 border-2 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 border border-white rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm font-medium mb-6">
              <FolderOpen className="w-4 h-4" />
              <span>Public Records</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-serif">
              Reports & Documents
            </h1>
            <p className="text-xl md:text-2xl text-emerald-50 max-w-4xl mx-auto leading-relaxed">
              Access our annual reports, research findings, and program documentation. All resources are freely available to support transparency and knowledge sharing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="py-8 bg-white border-b border-emerald-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports by title, year, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-xl py-3 pl-12 pr-4 text-emerald-900 placeholder:text-emerald-400 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                      : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reports Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredReports.length > 0 ? (
            <div className="grid gap-6">
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group bg-white rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-emerald-100 hover:border-emerald-300"
                >
                  <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getCategoryColor(report.category)}`}>
                          {report.category}
                        </span>
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                          <Calendar className="w-4 h-4" />
                          {report.year}
                        </div>
                        <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
                          <span>{report.fileSize}</span>
                          <span>•</span>
                          <span>{report.pages} pages</span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-emerald-900 mb-2 group-hover:text-emerald-600 transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-emerald-800/70 leading-relaxed mb-4">
                        {report.description}
                      </p>

                      {/* Mobile file info */}
                      <div className="flex md:hidden items-center gap-3 text-xs text-gray-500 mb-4">
                        <span>{report.fileSize}</span>
                        <span>•</span>
                        <span>{report.pages} pages</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
                      <button
                        onClick={() => window.open(report.pdfUrl, '_blank')}
                        className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl group/btn"
                      >
                        <span>View PDF</span>
                        <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </button>
                      <button
                        onClick={() => window.open(report.pdfUrl, '_blank')}
                        className="flex items-center justify-center gap-2 bg-white text-emerald-700 border-2 border-emerald-200 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-teal-50 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <FolderOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Open Access</h3>
              <p className="text-emerald-800/70">
                All reports are freely available to support research, education, and transparency in environmental work.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Annual Updates</h3>
              <p className="text-emerald-800/70">
                We publish comprehensive reports annually to document our programs, research, and community impact.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Request Documents</h3>
              <p className="text-emerald-800/70">
                Need a specific document or report? Contact us at <a href="mailto:ecovigyan@gmail.com" className="text-emerald-600 font-semibold hover:underline">ecovigyan@gmail.com</a>
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
