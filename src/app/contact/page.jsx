import React from 'react';

// --- Constants ---
const mapEmbedSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3416.9602165583833!2d77.1110667!3d31.083033600000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3905798fc73fdf2b%3A0xb793c3a386cbe0cd!2sEco%20Vigyan%20Foundation!5e0!3m2!1sen!2sin!4v1766068671079!5m2!1sen!2sin";

const backgroundImageURL = "/images/bg.jpg"; 

// --- Data ---
const phoneNumbers = ["+91-8894486066", "+91-9882950813"];
const email = "ecovigyan@gmail.com";
const serviceAddress = "ECO VIGYAN FOUNDATION, VILLAGE JADHENI, NEAR JUTOGH CANTONMENT, BAICHRI, SHIMLA, HIMACHAL PRADESH 171011";

const footerInfo = "REGISTERED OFFICE: 74/24-3, JUTOGH CANTT, GURUDWARA LINE, WARD 2, SHIMLA, HIMACHAL PRADESH 171008 | CIN: UBE5300HP2022NPL009648 | PAN: AAHCE3033F";

// --- Icons ---
const WhatsAppIcon = () => (
  <div className="w-9 h-9 shrink-0">
    <img 
      src="/images/whatsapp.png" 
      alt="WhatsApp" 
      className="w-full h-full object-contain"
    />
  </div>
);

const EmailIcon = () => <span className="text-white text-2xl drop-shadow-md">📧</span>;
const LocationIconPin = () => <span className="text-red-500 text-3xl drop-shadow-md">📍</span>;

// --- Component ---
const ContactPage = () => {
  return (
    <div 
      className="relative min-h-screen bg-cover bg-center bg-fixed flex flex-col justify-center"
      style={{ backgroundImage: `url(${backgroundImageURL})` }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
        
      <div className="relative max-w-7xl mx-auto px-4 py-12 z-10 w-full">

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
          {/* LEFT SIDE: Contact Info (Transparent) */}
          <div className="p-4 md:p-8 text-white">
            <h1 className="text-4xl font-bold text-emerald-400 mb-8 border-b border-emerald-400/30 pb-4 drop-shadow-lg">
              Contact Us
            </h1>
                    
            <div className="space-y-10">

              {/* Phone / WhatsApp */}
              <div className="flex items-center gap-5">
                <WhatsAppIcon />
                <div className="flex flex-col">
                  {phoneNumbers.map((number, index) => (
                    <a
                      key={index}
                      href={`https://wa.me/${number.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-xl font-bold hover:text-emerald-400 transition-colors drop-shadow-md"
                    >
                      {number}
                    </a>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-5">
                <EmailIcon />
                <a
                  href={`mailto:${email}`}
                  className="text-white text-xl font-bold hover:text-emerald-400 transition-colors drop-shadow-md"
                >
                  {email}
                </a>
              </div>

              {/* Address */}
              <div className="max-w-md">
                <div className="flex items-center gap-3 mb-3">
                  <LocationIconPin />
                  <span className="text-emerald-400 font-black text-xl uppercase tracking-tight drop-shadow-md">
                    Service Address:
                  </span>
                </div>
                <p className="pl-11 text-gray-100 text-lg leading-relaxed drop-shadow-sm font-medium">
                  {serviceAddress}
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE: Shrunken Map */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white p-1  border-0 border-white ">
              <iframe
                src={mapEmbedSrc}
                width="100%"
                height="380"
                loading="lazy"
                allowFullScreen
                title="Eco Vigyan Foundation Location"
                className="border-0   "
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <div className="mt-16 pt-8 border-t border-white/20">
          <p className="text-[10px] md:text-xs text-white text-center font-bold max-w-5xl mx-auto leading-relaxed uppercase tracking-widest drop-shadow-md">
            {footerInfo}
          </p>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;