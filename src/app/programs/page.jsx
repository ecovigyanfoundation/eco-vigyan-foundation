// ProgramsList.jsx or a similar component file

import React from 'react';

// Data for the programs
const programs = [
  'Wipro earthian sustainability education program for schools',
  'Fun शाला: Bring fungal learning to your school',
  'Action for Oceans: A competition for school students',
  'Creating zero waste schools',
];

export default function ProgramsList() {
  // Define custom colors based on the image using arbitrary value notation [ ]
  // (Note: For a production app, define these in your tailwind.config.js)
  
  // Dark Brown/Ochre for Text and Title: #654321
  const textColorClass = 'text-[#654321]'; 
  
  // Light Gold/Ochre for Box Background: #EBD8A9';
  const boxBgClass = 'bg-[#EBD8A9]'; 
  
  // Soft Purple/Mauve for Border: #A38DCC
  const borderColorClass = 'border-[#A38DCC]'; 
  const hoverRingColor = 'ring-[#A38DCC]'; // Use purple for hover ring
  const hoverShadowColor = 'shadow-[#A38DCC]/50'; // Subtle purple shadow on hover

  return (
    <section className="max-w-4xl mx-auto p-4 md:p-8">
      
      {/* Title */}
      <h2 className={`text-4xl md:text-5xl font-extrabold mb-8 ${textColorClass} uppercase tracking-wider`}>
        PROGRAMS:
      </h2>
      
      {/* List Container */}
      <ul className="space-y-6">
        {programs.map((program, index) => (
          <li key={index}>
            {/* Program Card Styling: 
              - Increased padding and border width.
              - Added smooth hover effects (ring, shadow, slight lift).
            */}
            <div
              className={`
                // Base Layout & Size
                p-5 md:p-7 text-center w-full block
                
                // Color and Border
                ${boxBgClass} 
                ${borderColorClass} border-[3px] // Thicker border
                
                // Rounded Corners and Shadow
                rounded-2xl // Slightly more rounded corners
                shadow-lg 
                
                // Typography
                ${textColorClass} text-xl md:text-2xl font-semibold // Slightly bolder font
                
                // Hover and Transition Effects
                transition-all duration-300 ease-in-out
                transform hover:-translate-y-0.5 // Subtle lift
                hover:shadow-xl ${hoverShadowColor} // Enhanced shadow
                hover:ring-4 ${hoverRingColor} ring-offset-2 // Outline ring on hover
              `}
            >
              {program}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}