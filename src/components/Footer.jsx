"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin, ArrowRight, Heart } from 'lucide-react';

export default function Footer() {
  const volunteerPrograms = [
    "Community Dev", "Cultural Exchange", "Eco Awareness", 
    "Nature Walks", "School Gardens", "Waste Mgmt"
  ];

  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Linkedin, href: "#" },
  ];

  return (
    <footer className="relative bg-emerald-950 text-emerald-50/80 overflow-hidden font-sans border-t-2 border-emerald-500">
      
      {/* Container: Balanced vertical padding for larger text */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <div>
              {/* Increased from text-xl to text-2xl */}
              <h3 className="text-2xl font-black text-emerald-400 tracking-tight uppercase">
                EcoVigyan <span className="text-emerald-500">Foundation</span>
              </h3>
              <p className="text-xs font-bold tracking-widest text-white mt-1 uppercase">
                Est. 2024 • Shimla
              </p>
            </div>
            {/* Increased from text-xs to text-sm */}
            <p className="text-sm leading-relaxed text-emerald-100/70">
              Fostering a culture of sustainability and learning through nature in schools across India.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, idx) => (
                <a key={idx} href={social.href} className="w-9 h-9 rounded-full bg-emerald-900/50 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300">
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            {/* Increased heading from text-sm to text-base */}
            <h3 className="text-base font-bold text-white mb-5 flex items-center">
              <span className="w-6 h-1 bg-emerald-500 rounded-full mr-3"></span>
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm font-medium"> {/* Size increased to text-sm */}
              {[
                { name: "About Us", href: "/about" },
                { name: "Our Activities", href: "/activities" },
                { name: "Donate", href: "/donate", highlight: true },
                { name: "Contact Us", href: "/contact" },
              ].map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className={`flex items-center transition-colors ${link.highlight ? 'text-emerald-400 font-bold' : 'hover:text-white'}`}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Volunteer Programs */}
          <div>
            <h3 className="text-base font-bold text-white mb-5 flex items-center">
              <span className="w-6 h-1 bg-emerald-500 rounded-full mr-3"></span>
              Volunteer
            </h3>
            <div className="grid grid-cols-1 gap-y-2.5 text-sm font-medium"> {/* Increased size and spacing */}
              {volunteerPrograms.map((program, index) => (
                <a key={index} href="#" className="hover:text-emerald-400 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mr-2.5"></span>
                  {program}
                </a>
              ))}
            </div>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-base font-bold text-white mb-5 flex items-center">
              <span className="w-6 h-1 bg-emerald-500 rounded-full mr-3"></span>
              Get in Touch
            </h3>
            <address className="not-italic space-y-4 text-sm font-medium"> {/* Increased text size */}
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                <span>Village Jadheni, Shimla, Himachal Pradesh 171011</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                <a href="tel:+918894486066" className="hover:text-white">+91-8894486066</a>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                <a href="mailto:ecovigyan@gmail.com" className="hover:text-white">ecovigyan@gmail.com</a>
              </div>
            </address>
          </div>
        </div>

        {/* Copyright Section: Adjusted text size */}
        <div className="border-t border-emerald-900 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-emerald-600 font-bold uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Eco Vigyan Foundation.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="hover:text-emerald-400">Privacy Policy</a>
            <a href="/terms" className="hover:text-emerald-400">Terms of Use</a>
            <span className="flex items-center">
              Made with <Heart className="w-3 h-3 mx-1 text-red-500 fill-current" />
            </span>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}