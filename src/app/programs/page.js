"use client";

import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Award, Sprout, School, Recycle, ChevronRight, CheckCircle2, Star, BookOpen, Leaf, TreeDeciduous, GraduationCap, Heart, Mail, X, ArrowLeft, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const programs = [
  {
    id: 'mushroom-walk',
    title: 'Guided Mushroom Walks',
    tagline: 'Discover biodiversity through year-round mushroom identification',
    description: 'Discover biodiversity through year-round mushroom identification, focusing on the monsoon season. This exciting project helps demystify the ecological roles of fungi with six key features, followed by the creation of mobile mushroom museums.',
    icon: Sprout,
    duration: 'Year-round (peak season: Monsoon)',
    participants: 'Small groups',
    highlights: [
      'Expert-guided mushroom walks across 18+ locations',
      'Year-round identification with focus on monsoon season',
      'Hands-on biodiversity discovery and documentation',
      'Learn ecological roles and fungi interactions',
      'Pre-monsoon habitat tagging experiments',
      'Creation of mobile mushroom museums'
    ],
    syllabus: [
      'Introduction to fungi biodiversity and identification basics',
      'Habitat tagging and fruiting prediction techniques',
      'Monsoon season intensive walks and species documentation',
      'Ecological roles of fungi in forest ecosystems',
      'Photography and field documentation methods',
      'Mobile mushroom museum creation and curation'
    ],
    outcomes: [
      'Identify mushroom species in their natural habitats',
      'Understand fungi\'s crucial ecological roles',
      'Participate in citizen science documentation',
      'Contribute to regional biodiversity knowledge'
    ],
    targetAudience: [
      'Nature enthusiasts and hikers',
      'Students and educators',
      'Amateur mycologists',
      'Families seeking outdoor education'
    ],
    statistics: {
      label: 'Success Rate',
      value: '36/40',
      description: 'In a pre-monsoon experiment, students tagged potential habitats; two months later, 36 out of 40 tags successfully fruited with mushrooms.'
    },
    locations: [
      'Bangalore', 'Nalagarh', 'Churdhar Peak', 'Shali Peak', 'Gurugram', 'Mussoorie',
      'Dehradun', 'Chandigarh', 'Joshimath', 'Manali', 'Mandi', 'Rudraprayag',
      'Ramnagar', 'Shimla', 'Bir', 'Dharampur', 'Solan', 'Summerhill'
    ],
    testimonials: [
      {
        name: 'Padmini Parmar',
        text: 'A very interesting and informative mushroom walk organised by Shrey and Ashish. Never knew a whole new, exciting world of fungi existed right beside the road which I had passed countless times.'
      }
    ],
    videoEmbed: 'https://www.youtube.com/embed/vqc6lOWicPE',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'grow-mushrooms',
    title: 'Grow Your Own Mushrooms',
    tagline: 'Turn your kitchen waste into a bountiful mushroom harvest',
    description: 'This is an online, hands-on series of 8 sessions to help you grow your own oyster mushrooms on kitchen waste. Follow along & towards the end of this series, you will be able to successfully harvest your first crop in 30 days.',
    isPrimary: true,
    icon: TreeDeciduous,
    duration: '8 online sessions',
    participants: 'Individual learners',
    highlights: [
      'Grow oyster mushrooms on kitchen waste',
      '8 comprehensive hands-on sessions',
      'First harvest in just 30 days',
      'Beginner friendly - no experience needed',
      'Step-by-step guidance from experts',
      'Online format - learn from home'
    ],
    syllabus: [
      'Session 1: Introduction to mushroom cultivation and kitchen waste preparation',
      'Session 2: Understanding oyster mushroom biology and growth requirements',
      'Session 3: Substrate preparation using kitchen scraps',
      'Session 4: Spawn inoculation and sterile techniques',
      'Session 5: Creating optimal growing conditions at home',
      'Session 6: Monitoring growth and troubleshooting common issues',
      'Session 7: Fruiting initiation and pinning phase',
      'Session 8: Harvesting techniques and celebrating your first crop'
    ],
    outcomes: [
      'Successfully grow oyster mushrooms from kitchen waste',
      'Harvest your first mushroom crop within 30 days',
      'Reduce kitchen waste through productive recycling',
      'Gain confidence to continue growing mushrooms independently'
    ],
    targetAudience: [
      'Home gardeners and urban dwellers',
      'Sustainability enthusiasts',
      'Beginners with no prior experience',
      'Anyone wanting to reduce kitchen waste',
      'Families seeking fun educational projects'
    ],
    testimonials: [
      {
        name: 'Romi Kohsala',
        text: 'I am not sure which is easier- to push a car uphill single-handedly or to enthuse an 80-year person to get excited to grow mushrooms. But Shrey has done just that. I was successful. Oysters grew. I just followed what he told me to do.'
      },
      {
        name: 'Raman Bhal',
        text: 'Something that I couldn\'t even measure was the happiness which I got post getting the first harvest! It was invaluable!'
      }
    ],
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'demystify-fungi',
    title: 'Demystify Your Local Fungi',
    tagline: 'Become local mushroom experts and create a field guide',
    description: 'Join us on an exciting journey to become local mushroom experts! You\'ll become masters at spotting and understanding the ecological importance of mushrooms for life. Plus, we\'ll create a field guide of the mushrooms around you.',
    icon: BookOpen,
    duration: 'Multi-week program',
    participants: 'Small groups',
    highlights: [
      'Field exploration in your local area',
      'Macro observation and photography techniques',
      'Regular local mushroom walks and surveys',
      'Species identification and documentation',
      'Co-create a comprehensive field guide for your region',
      'Understand ecological importance of fungi'
    ],
    syllabus: [
      'Week 1: Introduction to local fungi biodiversity and field techniques',
      'Week 2-3: Field exploration and habitat surveys in your area',
      'Week 3-4: Macro observation and mushroom photography',
      'Week 4-5: Species identification and ecological roles',
      'Week 5-6: Field guide creation and documentation',
      'Week 6: Final field guide presentation and publishing'
    ],
    outcomes: [
      'Become experts at spotting local mushroom species',
      'Understand the ecological importance of fungi',
      'Co-create a published field guide for your region',
      'Contribute to local biodiversity knowledge'
    ],
    targetAudience: [
      'Citizen scientists and nature recorders',
      'Local community members interested in nature',
      'Amateur naturalists and photographers',
      'Environmental educators and students'
    ],
    testimonials: [
      {
        name: 'Venus Joshi',
        text: 'Got yet another reason to walk in Woods.. Definitely looking forward to Co-creating a guide book for my area.'
      }
    ],
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'wipro-earthian',
    title: 'Wipro Earthian Program',
    tagline: 'National Level School Competition for Sustainability',
    description: 'Eco Vigyan gladly invites you to attend the National Level School Competition for Sustainability managed by Wipro earthian in collaboration with Wipro earthian\'s Sustainability Program and the Department of Education (DOE) Himachal Pradesh. This competition is open to all Schools, Administrations, Teachers, and Educational Institutions across India to build knowledge, skills, and a mindset for self-reliance.',
    isPrimary: true,
    icon: School,
    duration: 'Full academic year',
    participants: 'Whole school community',
    highlights: [
      'Biodiversity & Nature Care initiatives',
      'Water & Waste Management projects',
      'Community Awareness campaigns',
      'National-level competition participation',
      'Collaboration with DOE Himachal Pradesh',
      'Build knowledge, skills, and self-reliance mindset'
    ],
    syllabus: [
      'Phase 1: Registration and eco-club formation',
      'Phase 2: Biodiversity surveys and nature care projects',
      'Phase 3: Water conservation and waste management systems',
      'Phase 4: Community outreach and awareness programs',
      'Phase 5: Project documentation and presentation',
      'Phase 6: National competition and awards ceremony'
    ],
    outcomes: [
      'Develop comprehensive sustainability projects',
      'Compete at national level with schools across India',
      'Build leadership and project management skills',
      'Create lasting environmental impact in school communities'
    ],
    targetAudience: [
      'Schools across India',
      'School Administrations',
      'Teachers and Educators',
      'Educational Institutions'
    ],
    videoEmbed: 'https://www.youtube.com/embed/Ri-3fJ3JoHY',
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'chemical-free',
    title: 'Chemical Free Living Series',
    tagline: '3 Sessions to decode non-toxic living',
    description: 'To handhold you and get you off most synthetic chemicals in your everyday routine, we are happy to announce a journey of 3 sessions to decode a synthetic chemical-free living.',
    isPrimary: true,
    icon: Heart,
    duration: '3 sessions',
    participants: 'Small groups',
    highlights: [
      'Chemical-free Edibles: Decode what goes into your food',
      'Personal Care Products: Identify synthetic chemicals in skincare',
      'Household Cleaning: Create effective, non-toxic cleaners',
      'Hands-on sessions with practical solutions',
      'Make bio-products with easily available ingredients',
      'Reflective approach focusing on solutions, not just problems'
    ],
    syllabus: [
      'Session 1: Chemical-free Edibles - Understanding food ingredients',
      'Session 1: Decoding labels and identifying harmful additives',
      'Session 2: Personal Care Products - Synthetic chemicals in skincare',
      'Session 2: Creating natural alternatives for personal care',
      'Session 3: Household Cleaning - Non-toxic cleaners for home',
      'Session 3: DIY bio-products with accessible ingredients'
    ],
    outcomes: [
      'Identify synthetic chemicals in everyday products',
      'Create natural alternatives for food, personal care, and cleaning',
      'Transition to a non-toxic living routine',
      'Make bio-products on your own with simple ingredients'
    ],
    targetAudience: [
      'Health-conscious families and parents',
      'Educators and school communities',
      'Anyone seeking toxin-free living solutions',
      'Environmental enthusiasts'
    ],
    testimonials: [
      {
        name: 'Educator',
        text: 'It was reflective and provided solutions rather just discussing about problems'
      },
      {
        name: 'Educator',
        text: 'What is not good for you & me is not good for Mother earth too!'
      }
    ],
    color: 'from-rose-500 to-red-600'
  },
  {
    id: 'waste-management',
    title: 'Mastering Solid Waste Management',
    tagline: 'Empower your community in waste management',
    description: 'This is our pilot program, designed to empower institutes, households, and communities in waste management. Learn practical solutions for composting, zero-waste events, and community-wide sustainability initiatives.',
    icon: Recycle,
    duration: '6-8 months for full cycle',
    participants: 'Institutes, households, communities',
    highlights: [
      'Streamlined Composting: Deliver organic compost in 6-8 months',
      'Zero-Waste Events: Host events where waste is upcycled',
      'Transform waste into decorations and unique gifts',
      'Community-wide waste management systems',
      'Hands-on training for institutes and households',
      'Proven pilot program with successful implementations'
    ],
    syllabus: [
      'Module 1: Introduction to waste management and the 3 R\'s',
      'Module 2: Setting up streamlined composting systems',
      'Module 3: Waste segregation and collection best practices',
      'Module 4: Planning and executing zero-waste events',
      'Module 5: Upcycling waste into decorations and gifts',
      'Module 6: Scaling to community-wide sustainability initiatives'
    ],
    outcomes: [
      'Produce organic compost in 6-8 months from waste',
      'Host successful zero-waste events in your community',
      'Upcycle waste into useful decorations and gifts',
      'Transform from nature lover to nature protector'
    ],
    targetAudience: [
      'Educational institutes and schools',
      'Households seeking sustainable practices',
      'Community organizations and NGOs',
      'Event organizers and planners'
    ],
    videoEmbed: 'https://www.youtube.com/embed/lyseeUQZv0Y',
    testimonials: [
      {
        name: 'Dr. Shilpi Singh',
        text: 'From being a nature lover I became a nature protector. Thank you, Shery to show me the easy way of living keep up the good work and keep inspiring'
      }
    ],
    color: 'from-green-500 to-emerald-600'
  }
];

export default function Programs() {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modalView, setModalView] = useState('details'); // 'details' | 'enrollment' | 'success'
  const [enrollmentData, setEnrollmentData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openProgramModal = (program) => {
    setSelectedProgram(program);
    setModalView('details');
  };

  const handleEnrollClick = () => {
    setModalView('enrollment');
  };

  const handleBackToDetails = () => {
    setModalView('details');
  };

  const handleCloseModal = () => {
    setSelectedProgram(null);
    setModalView('details');
    setEnrollmentData({
      fullName: '',
      email: '',
      phone: '',
      message: ''
    });
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // API call to submit enrollment
      const response = await fetch('/api/programs/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: enrollmentData.fullName,
          email: enrollmentData.email,
          phone: enrollmentData.phone,
          program: selectedProgram.title,
          message: enrollmentData.message
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModalView('success');
        setEnrollmentData({
          fullName: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        throw new Error(data.error || 'Enrollment submission failed');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert(error.message || 'Failed to submit enrollment. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-emerald-600 to-teal-700 overflow-hidden">
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
              <GraduationCap className="w-4 h-4" />
              <span>Education Meets Adventure</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-serif">
              Sustainability Programs
            </h1>
            <p className="text-xl md:text-2xl text-emerald-50 max-w-3xl mx-auto leading-relaxed">
              Explore our exciting programs where environmental science comes alive through hands-on learning and community action
            </p>
          </motion.div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <motion.div
                key={program.id}
                id={program.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="h-full bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-emerald-100">
                  {/* Header with Gradient */}
                  <div className={`relative h-48 bg-gradient-to-br ${program.color} p-8 flex items-center justify-between`}>
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,_white,transparent)]" />
                    <div className="relative z-10 flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <program.icon className="w-7 h-7 text-white" />
                        </div>
                        {program.isPrimary && (
                          <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2 font-serif">
                        {program.title}
                      </h3>
                      <p className="text-white/90 text-sm">
                        {program.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="p-8">
                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span>{program.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span>{program.participants}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {program.description}
                    </p>

                    {/* Highlights Preview */}
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Program Highlights
                      </h4>
                      <ul className="space-y-2">
                        {program.highlights.slice(0, 3).map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                        {program.highlights.length > 3 && (
                          <li className="text-sm text-emerald-600 font-medium pl-6">
                            + {program.highlights.length - 3} more benefits
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => openProgramModal(program)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 group shadow-lg"
                    >
                      <span>View Full Details & Enroll</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 border border-white rounded-full" />
          <div className="absolute bottom-10 left-10 w-64 h-64 border border-white rounded-full" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Leaf className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6 font-serif">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Join thousands of learners who have transformed their relationship with nature and sustainability through our programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-white text-emerald-900 px-8 py-4 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-xl"
            >
              Enroll in a Program
            </button>
            <Link href="/contact" className="bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-600 transition-all border-2 border-emerald-500 flex items-center gap-2 justify-center">
              <Mail className="w-5 h-5" />
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Program Details Modal */}
      <AnimatePresence>
        {selectedProgram && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className={`relative bg-gradient-to-br ${selectedProgram.color} p-8`}>
                  <button
                    onClick={() => setSelectedProgram(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <selectedProgram.icon className="w-9 h-9 text-white" />
                    </div>
                    {selectedProgram.isPrimary && (
                      <span className="bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-full text-sm font-bold">
                        FEATURED PROGRAM
                      </span>
                    )}
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-3 font-serif">
                    {selectedProgram.title}
                  </h2>
                  <p className="text-xl text-white/90">
                    {selectedProgram.tagline}
                  </p>
                </div>

                <div className="p-8 overflow-y-auto">
                  {/* Three-View Modal Content */}
                  {modalView === 'details' && (
                    <>
                      {/* Quick Info Grid */}
                      <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-emerald-50 p-4 rounded-xl">
                      <Clock className="w-6 h-6 text-emerald-600 mb-2" />
                      <div className="text-xs text-gray-600 mb-1">Duration</div>
                      <div className="font-bold text-gray-900">{selectedProgram.duration}</div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl">
                      <Users className="w-6 h-6 text-emerald-600 mb-2" />
                      <div className="text-xs text-gray-600 mb-1">Group Size</div>
                      <div className="font-bold text-gray-900">{selectedProgram.participants}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">About This Program</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedProgram.description}</p>
                  </div>

                  {/* Video Section */}
                  {selectedProgram.videoEmbed && (
                    <div className="mb-8">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                          📺 To get a quick program overview, watch this video!
                        </h3>
                        <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                          <iframe
                            width="100%"
                            height="100%"
                            src={selectedProgram.videoEmbed}
                            title="Program Overview Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Program Focus (for Wipro) */}
                  {selectedProgram.id === 'wipro-earthian' && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Program Focus</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
                          <Leaf className="w-10 h-10 text-green-600 mx-auto mb-3" />
                          <h4 className="font-bold text-gray-900">Biodiversity & Nature Care</h4>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                          <Recycle className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                          <h4 className="font-bold text-gray-900">Water & Waste Management</h4>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 text-center">
                          <Users className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                          <h4 className="font-bold text-gray-900">Community Awareness</h4>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Statistics */}
                  {selectedProgram.statistics && (
                    <div className="mb-8">
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                            {selectedProgram.statistics.label}
                          </div>
                          <div className="text-5xl font-bold text-emerald-900 mb-3">
                            {selectedProgram.statistics.value}
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {selectedProgram.statistics.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Locations */}
                  {selectedProgram.locations && selectedProgram.locations.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                        Walk Locations (2021-23)
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProgram.locations.map((location, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-emerald-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-emerald-50 transition-colors"
                          >
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Highlights */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      What You'll Get
                    </h3>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {selectedProgram.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Syllabus */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Program Syllabus</h3>
                    <div className="space-y-3">
                      {selectedProgram.syllabus.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Learning Outcomes</h3>
                    <ul className="space-y-3">
                      {selectedProgram.outcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Target Audience */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Perfect For</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProgram.targetAudience.map((audience, idx) => (
                        <span
                          key={idx}
                          className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Testimonials */}
                  {selectedProgram.testimonials && selectedProgram.testimonials.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        Participant Feedback
                      </h3>
                      <div className="space-y-4">
                        {selectedProgram.testimonials.map((testimonial, idx) => (
                          <div
                            key={idx}
                            className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6"
                          >
                            <div className="flex gap-2 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              ))}
                            </div>
                            <p className="text-gray-700 leading-relaxed mb-4 italic">
                              "{testimonial.text}"
                            </p>
                            <div className="font-bold text-gray-900">— {testimonial.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enrollment CTA */}
                  <button 
                    onClick={handleEnrollClick}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
                  >
                    Enroll in This Program
                  </button>
                </>
              )}

              {/* Enrollment View */}
              {modalView === 'enrollment' && (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Complete Your Enrollment</h3>
                  
                  <form onSubmit={handleEnrollSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={enrollmentData.fullName}
                        onChange={(e) => setEnrollmentData({...enrollmentData, fullName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={enrollmentData.email}
                        onChange={(e) => setEnrollmentData({...enrollmentData, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={enrollmentData.phone}
                        onChange={(e) => setEnrollmentData({...enrollmentData, phone: e.target.value})}
                        pattern="^(\+91|91)?[6-9]\d{9}$"
                        title="Please enter a valid Indian phone number (10 digits starting with 6-9, optionally prefixed with +91 or 91)"
                        className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="+91 9876543210"
                      />
                      <p className="text-xs text-gray-500 mt-1">10 digits starting with 6-9 (e.g., 9876543210 or +91 9876543210)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        value={enrollmentData.message}
                        onChange={(e) => setEnrollmentData({...enrollmentData, message: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                        placeholder="Tell us why you're interested in this program..."
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleBackToDetails}
                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Enrollment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Success View */}
              {modalView === 'success' && (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-12 h-12 text-white" />
                  </motion.div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Enrollment Successful! 🎉
                  </h3>
                  
                  <p className="text-lg text-gray-600 mb-2">
                    Thank you for enrolling in
                  </p>
                  <p className="text-xl font-bold text-emerald-600 mb-6">
                    {selectedProgram.title}
                  </p>
                  
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 max-w-md mx-auto mb-8">
                    <p className="text-gray-700 leading-relaxed">
                      We've received your enrollment request. Our team will review it and contact you shortly with further details about the program.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleCloseModal}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
                  >
                    Browse More Programs
                  </button>
                </div>
              )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
