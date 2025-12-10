"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  ArrowRight,
  Heart
} from 'lucide-react';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

export default function Footer() {
  const volunteerPrograms = [
    "Child Care", "Teaching English",
    "Community Dev", "Cultural Exchange",
    "First Aid", "Sports & Arts",
    "Women's Power", "Eco Awareness",
    "Street Education", "Sanitation",
    "Fundraising"
  ];

  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Linkedin, href: "#" },
  ];

  return (
    <footer className="relative bg-emerald-950 text-emerald-50/80 overflow-hidden font-sans border-t-4 border-orange-600">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* --- Column 1: Brand & About --- */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                Paathshala <span className="text-orange-500">Trust</span>
              </h3>
              <p className="text-xs font-bold tracking-widest text-emerald-400 mt-1 uppercase">
                Est. 2002 • Shimla
              </p>
            </div>
            
            <p className="text-sm leading-relaxed text-emerald-100/70">
              Dedicated to the welfare of street children, sustainable development, and environmental stewardship. Join us in bridging the gap between poverty and opportunity.
            </p>

            <div className="flex space-x-4">
              {socialLinks.map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href} 
                  className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* --- Column 2: Quick Links --- */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-1 bg-orange-500 rounded-full mr-3"></span>
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "About Us", href: "/about" },
                { name: "Our Activities", href: "/activities" },
                { name: "Impact Reports", href: "/reports" },
                { name: "Donate", href: "/donate", highlight: true },
                { name: "Contact Us", href: "/contact" },
              ].map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href} 
                    className={`group flex items-center transition-colors duration-200 ${link.highlight ? 'text-orange-400 font-bold hover:text-orange-300' : 'hover:text-white'}`}
                  >
                    <ArrowRight className={`w-3 h-3 mr-2 transition-transform duration-300 ${link.highlight ? 'text-orange-400' : 'text-emerald-600 group-hover:translate-x-1'}`} />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* --- Column 3: Programs (Compact Grid) --- */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-1 bg-orange-500 rounded-full mr-3"></span>
              Volunteer
            </h3>
            {/* Split long list into a mini 2-column grid for neatness */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-sm">
              {volunteerPrograms.map((program, index) => (
                <a 
                  key={index}
                  href={`/programs/${program.toLowerCase().replace(/\s/g, '-')}`}
                  className="hover:text-orange-400 transition-colors duration-200 truncate flex items-center"
                  title={program}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mr-2 flex-shrink-0"></span>
                  {program}
                </a>
              ))}
            </div>
          </motion.div>

          {/* --- Column 4: Contact Info --- */}
          <motion.div variants={itemVariants}>
             <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <span className="w-8 h-1 bg-orange-500 rounded-full mr-3"></span>
              Get in Touch
            </h3>
            <address className="not-italic space-y-6 text-sm">
              <div className="flex items-start group">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0 group-hover:animate-bounce" />
                <span className="group-hover:text-white transition-colors">
                  S-7, Aayojan Apartments,<br />
                  Jyotinagar Exit, Lalkothi,<br />
                  Shimla, Rajasthan 302005
                </span>
              </div>
              
              <div className="flex items-center group">
                <Phone className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+919166371582" className="hover:text-white transition-colors">+91-9166371582</a>
                  <a href="tel:+919782209683" className="hover:text-white transition-colors">+91-9782209683</a>
                </div>
              </div>

              <div className="flex items-center group">
                <Mail className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                <a href="mailto:info@paathshalatrust.org" className="hover:text-white transition-colors">
                  info@paathshalatrust.org
                </a>
              </div>
            </address>

            {/* Newsletter Input (Optional Visual Enhancement) */}
            <div className="mt-6 pt-6 border-t border-emerald-900/50">
               <p className="text-xs font-bold text-emerald-400 mb-2 uppercase">Subscribe to Newsletter</p>
               <div className="flex">
                  <input type="email" placeholder="Email Address" className="w-full bg-emerald-900/30 border border-emerald-800 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-emerald-700" />
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 rounded-r-md transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </motion.div>

        </div>

        {/* --- Copyright Section --- */}
        <motion.div 
          variants={itemVariants}
          className="border-t border-emerald-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-emerald-600"
        >
          <p>© {new Date().getFullYear()} Paathshala Trust. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-orange-400 transition-colors">Terms of Use</a>
            <span className="flex items-center">
              Made with <Heart className="w-3 h-3 mx-1 text-red-500 fill-current" /> for a better world
            </span>
          </div>
        </motion.div>

      </motion.div>
    </footer>
  );
}