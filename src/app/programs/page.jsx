import React from 'react';

const ProgramCard = ({ image, title, bgColor }) => {
  return (
    <div className="flex flex-col group cursor-pointer">
      {/* Image Container */}
      <div className="overflow-hidden rounded-sm aspect-[4/3]">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      {/* Title Bar */}
      <div className={`${bgColor} py-4 px-2 text-center min-h-[70px] flex items-center justify-center mt-1`}>
        <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-wider leading-tight">
          {title}
        </h3>
      </div>
    </div>
  );
};

const SustainabilityPrograms = () => {
  const programs = [
    {
      title: "Guided Mushroom Walk",
      image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80", // Replace with your local paths
      bgColor: "bg-red-200 text-black", // Light pink/red based on your image
      textColor: "text-black"
    },
    {
      title: "Grow Your Own Mushrooms",
      image: "https://images.unsplash.com/photo-1591261730799-ee4e6c2d16d7?auto=format&fit=crop&w=800&q=80",
      bgColor: "bg-green-500",
    },
    {
      title: "Demystify Your Local Fungi",
      image: "https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&w=800&q=80",
      bgColor: "bg-cyan-500",
    },
    {
      title: "Wipro Earthian Program",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
      bgColor: "bg-red-100 text-black",
    },
    {
      title: "Chemical Free Living Series",
      image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
      bgColor: "bg-green-500",
    },
    {
      title: "Mastering Solid Waste Management",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
      bgColor: "bg-cyan-500",
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 font-sans">
      {/* Header Section */}
      <div className="text-right mb-4">
        <h2 className="text-3xl font-bold text-cyan-500 uppercase tracking-tighter inline-block border-b-2 border-cyan-500 pb-1">
          Programs
        </h2>
      </div>
      
      <hr className="border-gray-300 mb-8" />

      <div className="text-center mb-12">
        <p className="text-2xl md:text-3xl font-light text-gray-800">
          Explore our <span className="font-semibold italic">exciting sustainability programs</span> – the adventure begins here!
        </p>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {programs.map((program, index) => (
          <ProgramCard 
            key={index}
            image={program.image}
            title={program.title}
            bgColor={program.bgColor}
          />
        ))}
      </div>
    </section>
  );
};

export default SustainabilityPrograms;