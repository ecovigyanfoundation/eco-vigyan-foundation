import React from 'react';

// --- Constants ---
const mapEmbedSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3416.9602165583833!2d77.1110667!3d31.083033600000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3905798fc73fdf2b%3A0xb793c3a386cbe0cd!2sEco%20Vigyan%20Foundation!5e0!3m2!1sen!2sin!4v1766068671079!5m2!1sen!2sin";

const backgroundImageURL = "/images/bg.jpg"; 

// --- Data ---
const phoneNumbers = ["+91-8894486066", "+91-9882950813"];
const email = "ecovigyan@gmail.com";
const socialHandle = "ecovigyan"; 
const serviceAddress =
  "ECO VIGYAN FOUNDATION, VILLAGE JADHENI, NEAR JUTOGH CANTONMENT, BAICHRI, SHIMLA, HIMACHAL PRADESH 171011";

const footerInfo =
  "REGISTERED OFFICE: 74/24-3, JUTOGH CANTT, GURUDWARA LINE, WARD 2, SHIMLA, HIMACHAL PRADESH 171008 | CIN: UBE5300HP2022NPL009648 | PAN: AAHCE3033F";

// --- Icons ---
const PhoneIcon = () => (
  <span className="text-white bg-[#25D366] rounded-full p-2.5 flex items-center justify-center w-9 h-9 text-lg">
    📞
  </span>
);

const EmailIcon = () => <span className="text-gray-800 text-2xl">📧</span>;
const LocationIconPin = () => <span className="text-red-600 text-3xl">📍</span>;
const InstagramIcon = () => (
  <span className="text-white bg-[#E1306C] rounded-md p-1.5 text-xl">📸</span>
);
const FacebookIcon = () => (
  <span className="text-white bg-[#1877F2] rounded-full p-1.5 text-xl">📘</span>
);

// --- Component ---
const ContactPage = () => {
  return (
    <div 
      className="relative min-h-screen bg-cover bg-center bg-fixed flex flex-col justify-center"
      style={{ backgroundImage: `url(${backgroundImageURL})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
        
      <div className="relative max-w-7xl mx-auto px-4 py-12 z-10 w-full">

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                
          {/* LEFT SIDE: Contact Info */}
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
            <h1 className="text-3xl font-bold text-emerald-800 mb-8 border-b border-emerald-100 pb-4">
              Contact Us
            </h1>
                    
            <div className="space-y-8">

              {/* Phone */}
              <div className="flex items-center gap-4">
                <PhoneIcon />
                <div className="flex flex-col">
                  {phoneNumbers.map((number, index) => (
                    <a
                      key={index}
                      href={`tel:${number}`}
                      className="text-gray-800 text-lg font-medium hover:text-emerald-600 transition-colors"
                    >
                      {number}
                    </a>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4">
                <EmailIcon />
                <a
                  href={`mailto:${email}`}
                  className="text-gray-800 text-lg font-medium hover:text-emerald-600 transition-colors"
                >
                  {email}
                </a>
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <LocationIconPin />
                  <span className="text-emerald-800 font-bold text-xl">
                    Service Address:
                  </span>
                </div>
                <p className="pl-10 text-gray-700 text-lg leading-relaxed">
                  {serviceAddress}
                </p>
              </div>

              {/* Social Media */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex gap-3">
                  <a href="#" className="hover:scale-110 transition-transform">
                    <InstagramIcon />
                  </a>
                  <a href="#" className="hover:scale-110 transition-transform">
                    <FacebookIcon />
                  </a>
                </div>
                <span className="text-lg text-emerald-900 font-bold">
                  @{socialHandle}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Map (UNCHANGED STYLING) */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white border-white">
              <iframe
                src={mapEmbedSrc}
                width="100%"
                height="350"
                loading="lazy"
                allowFullScreen
                title="Eco Vigyan Foundation Location"
                className="border-0 rounded-xl"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-6 border-t border-white/20">
          <p className="text-[10px] md:text-xs text-white/90 text-center font-medium max-w-4xl mx-auto leading-relaxed drop-shadow-md">
            {footerInfo}
          </p>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
