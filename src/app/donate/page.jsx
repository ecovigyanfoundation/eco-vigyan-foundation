"use client";

import React, { useState } from 'react';
import Footer from "@/components/Footer";
import { Copy, Check, ShieldCheck, Heart, Landmark, Sprout, Leaf, Trash2, Microscope, Sun, Phone } from 'lucide-react';

export default function DonatePage() {
  const [copied, setCopied] = useState(null);

  // Official Donation Data
  const OFFICIAL_ACCOUNT_INFO = {
    bankName: "HDFC Bank Ltd",
    branch: "Totu Cheli Chounla- 4184",
    accountName: "Eco Vigyan Foundation",
    accountNumber: "50100584067512",
    ifscCode: "HDFC0004184",
    contactEmail: "ecovigyan@gmail.com",
    contactPhone: "8894486066",
    cin: "U85300HP2022NPL009648",
    // Adding UPI/QR code data
    upiDisplay: "62940308 (Linked Mobile/VPA)", // Use the number shown on the QR image
    qrCodeImage: "/images/qr.png" // Assuming the image is saved in the public/images folder
  };

  // Helper to copy text to clipboard
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  // Specific programs/impacts for Eco Vigyan Foundation
  const impactPrograms = [
    { 
      title: "Strengthen Eco-clubs", 
      icon: <Sprout className="w-5 h-5 text-emerald-600" />,
      description: "Nurturing environmental consciousness and action in schools across the region." 
    },
    { 
      title: "Conserve Himalayan Biodiversity", 
      icon: <Leaf className="w-5 h-5 text-amber-600" />,
      description: "Promoting conservation and protecting sensitive ecosystems in the Himalayas." 
    },
    { 
      title: "Combat Improper Waste Disposal", 
      icon: <Trash2 className="w-5 h-5 text-red-600" />,
      description: "Funding cleanup drives and education to reduce littering and improper waste in forests." 
    },
    { 
      title: "Zero Waste/Fungi Cultivation", 
      icon: <Microscope className="w-5 h-5 text-purple-600" />,
      description: "Developing educational resources and promoting zero-waste mushroom cultivation in schools." 
    },
    { 
      title: "Promote Chemical-Free Living", 
      icon: <Sun className="w-5 h-5 text-yellow-600" />,
      description: "Making chemical-free, sustainable living practices accessible to local communities." 
    },
  ];

  const CopyButton = ({ text, field }) => (
    <button 
      onClick={() => copyToClipboard(text, field)}
      className="text-gray-400 hover:text-emerald-600 transition p-1 -mr-2 rounded-full hover:bg-gray-100"
      aria-label={`Copy ${field}`}
    >
      {copied === field ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">

      {/* --- HERO HEADER --- */}
      <div className="bg-emerald-800 py-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Support Our Mission for a Greener Tomorrow
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto">
            Your generous donation strengthens ecological education and conservation efforts in the Himalayas.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* --- LEFT COLUMN: APPEAL & INFO --- */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Mission/Impact List */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Heart className="text-orange-500 w-6 h-6 mr-3 fill-current" /> 
                How Your Donation Makes a Difference
              </h2>
              <ul className="space-y-4">
                {impactPrograms.map((program, index) => (
                  <li key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                    <div className="pt-1">{program.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-800">{program.title}</h3>
                      <p className="text-sm text-gray-600">{program.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tax Benefit Badge (Updated with provided data) */}
            <div className="bg-green-700 text-white p-6 rounded-xl flex items-start space-x-4 shadow-xl">
              <ShieldCheck className="w-10 h-10 flex-shrink-0 text-green-300" />
              <div>
                <h3 className="text-xl font-bold">Your Donation is Tax-Exempt!</h3>
                <p className="text-green-200 text-sm mt-1">
                  Eco Vigyan Foundation (CIN: {OFFICIAL_ACCOUNT_INFO.cin}) is a registered non-profit. Your generous donations are exempt from tax under **Section 80G** of the Indian Tax Act.
                </p>
                <p className="text-green-100 text-xs mt-3">
                  You will receive your official 80G receipt via email shortly after your contribution.
                </p>
              </div>
            </div>

            {/* Support Contact (Updated with provided data) */}
            <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Need Assistance?</h3>
              <p className="text-gray-600 text-sm">
                For donation queries or more information, please contact us:
              </p>
              <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-2 sm:space-y-0 mt-3">
                <div className="flex items-center text-gray-800">
                  <Leaf className="w-4 h-4 mr-2 text-emerald-500" />
                  <span className="font-bold">{OFFICIAL_ACCOUNT_INFO.contactEmail}</span>
                </div>
                <div className="flex items-center text-gray-800">
                  <Phone className="w-4 h-4 mr-2 text-emerald-500" />
                  <span className="font-bold">+{OFFICIAL_ACCOUNT_INFO.contactPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: PAYMENT METHODS --- */}
          <div className="lg:col-span-5 space-y-6">

            {/* METHOD 1: BANK TRANSFER (Updated with provided data) */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-emerald-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Landmark className="w-5 h-5 mr-2 text-gray-500" />
                    Bank Transfer (NEFT/IMPS)
                  </h3>
                  <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded">Tax Exempt</span>
                </div>

                <div className="space-y-4">
                  
                  {/* Account Name */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Account Name</p>
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900">{OFFICIAL_ACCOUNT_INFO.accountName}</p>
                      <CopyButton text={OFFICIAL_ACCOUNT_INFO.accountName} field="name" />
                    </div>
                  </div>

                  {/* Account Number */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Account Number</p>
                    <div className="flex justify-between items-center">
                      <p className="font-mono text-lg font-bold text-gray-900 tracking-wide">{OFFICIAL_ACCOUNT_INFO.accountNumber}</p>
                      <CopyButton text={OFFICIAL_ACCOUNT_INFO.accountNumber} field="acc" />
                    </div>
                  </div>

                  {/* IFSC */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">IFSC Code</p>
                    <div className="flex justify-between items-center">
                      <p className="font-mono text-lg font-bold text-gray-900">{OFFICIAL_ACCOUNT_INFO.ifscCode}</p>
                      <CopyButton text={OFFICIAL_ACCOUNT_INFO.ifscCode} field="ifsc" />
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Bank</p>
                      <p className="text-sm font-medium">{OFFICIAL_ACCOUNT_INFO.bankName}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Branch</p>
                      <p className="text-sm font-medium">{OFFICIAL_ACCOUNT_INFO.branch}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* METHOD 2: QR CODE (Updated with provided image) */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Scan to Donate</h3>
              <p className="text-sm text-gray-500 mb-6">Use any UPI App (GPay, PhonePe, Paytm)</p>
              
              <div className="bg-white p-2 rounded-xl shadow-inner border-2 border-dashed border-gray-300">
                <img 
                  // Use the provided uploaded file path
                  src={OFFICIAL_ACCOUNT_INFO.qrCodeImage} 
                  alt="Eco Vigyan Foundation Donation QR Code" 
                  className="w-48 h-48 opacity-90 object-contain"
                />
              </div>
              <p className="mt-4 font-mono text-sm bg-gray-100 px-3 py-1 rounded text-gray-600 font-semibold">
                Beneficiary Name: {OFFICIAL_ACCOUNT_INFO.accountName}
              </p>
              <p className="font-mono text-sm bg-gray-100 px-3 py-1 rounded text-gray-600 font-semibold mt-1">
                Linked UPI/Mobile Number Snippet: {OFFICIAL_ACCOUNT_INFO.upiDisplay}
              </p>
              <p className="text-xs text-red-500 mt-2">**Please verify the beneficiary name before proceeding.**</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}