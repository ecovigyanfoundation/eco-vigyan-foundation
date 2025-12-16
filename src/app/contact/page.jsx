import React from 'react';

// --- Constants ---
// **ACTION REQUIRED:** Replace this with the actual standard Google Maps Embed URL you get from Google Maps "Share" -> "Embed a map" tab.
const mapEmbedSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3416.9602165583833!2d77.1110667!3d31.083033600000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3905798fc73fdf2b%3A0xb793c3a386cbe0cd!2sEco%20Vigyan%20Foundation!5e0!3m2!1sen!2sin!4v1765907367493!5m2!1sen!2sin";

// CHANGE THIS: Replace with the actual URL of your desired scenery image
const backgroundImageURL = "https://images.unsplash.com/photo-1549495760-44ed55b6826c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; 

// --- Data ---
const phoneNumbers = ["+91-8894486066", "+91-9882950813"];
const email = "ecovigyan@gmail.com";
const socialHandle = "ecovigyan"; 
const serviceAddress = "ECO VIGYAN FOUNDATION, VILLAGE JADHENI, NEAR JUTOGH CANTONMENT, BAICHRI, SHIMLA, HIMACHAL PRADESH 171011";
const footerInfo = "REGISTERED OFFICE: 74/24-3, JUTOGH CANTT, GURUDWARA LINE, WARD 2, SHIMLA, HIMACHAL PRADESH 171008 | CIN: UBE5300HP2022NPL009648 | PAN: AAHCE3033F";

// --- Icons (Styled with specific Tailwind colors) ---
const PhoneIcon = () => <span className="text-white bg-[#25D366] rounded-full p-2.5 leading-none flex items-center justify-center w-9 h-9 text-lg">📞</span>;
const EmailIcon = () => <span className="text-gray-800 text-2xl leading-none">📧</span>; 
const LocationIconPin = () => <span className="text-red-600 text-3xl leading-none">📍</span>;
const InstagramIcon = () => <span className="text-white bg-[#E1306C] rounded-md p-1.5 leading-none text-xl">📸</span>; 
const FacebookIcon = () => <span className="text-white bg-[#1877F2] rounded-full p-1.5 leading-none text-xl">📘</span>; 

const ContactPage = () => {

  return (
    <div 
        className="relative min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${backgroundImageURL})` }}
    >
        <div className="absolute inset-0 bg-white opacity-80"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12 font-sans">

            {/* --- Contact Header Section --- */}
            <div className="flex justify-between items-start pt-6 pb-6 w-full flex-wrap">
                
                {/* Group 1: Phone Numbers */}
                <div className="flex items-center gap-4 my-2">
                    <PhoneIcon />
                    <div className="flex flex-col">
                        {phoneNumbers.map((number, index) => (
                            <a key={index} href={`tel:${number}`} className="text-gray-800 text-lg font-medium hover:text-green-600">
                                {number}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Group 2: Email */}
                <div className="flex items-center gap-3 my-2 md:ml-16">
                    <EmailIcon />
                    <a href={`mailto:${email}`} className="text-gray-800 text-lg font-medium hover:text-green-600">
                        {email}
                    </a>
                </div>

                {/* Group 3: Social Media */}
                <div className="flex items-center gap-4 my-2 md:mr-0">
                    <a href="#" className="flex items-center">
                        <InstagramIcon />
                    </a>
                    <a href="#" className="flex items-center">
                        <FacebookIcon />
                    </a>
                    <span className="text-lg text-gray-800 font-medium">@{socialHandle}</span>
                </div>
            </div>
            
            <hr className="border-gray-300 w-full" />

            {/* --- Address Section --- */}
            <div className="py-8">
                <div className="flex items-start gap-1 mb-1">
                    <LocationIconPin />
                    <span className="text-gray-800 font-bold text-lg pt-1">Service address:</span>
                </div>
                <p className="pl-12 text-gray-600 text-lg">
                    {serviceAddress}
                </p>
            </div>

            {/* --- Map Section --- */}
            <div className="py-4">
                <div className="bg-[#E4F3E4] p-4 rounded-lg shadow-xl border border-green-300">
                    <iframe
                        src={mapEmbedSrc}
                        width="100%"
                        height="450"
                        allowFullScreen=""
                        loading="lazy"
                        title="Service Location Map"
                        className="border-0 rounded-md"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
            
            <hr className="border-gray-300 w-full mt-10" />

            {/* --- Footer/Registration Info --- */}
            <div className="pt-4">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                    {footerInfo}
                </p>
            </div>
        </div>
    </div>
  );
};

export default ContactPage;