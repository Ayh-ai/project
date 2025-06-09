
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import UploadFile from './UploadFile';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Store,
  UtensilsCrossed,
  Building2,
  Factory,
  Truck,
  Users,
  BarChart2,
  //Briefcase,
  AlertCircle,
  DollarSign,
  ArrowRight,
  //FileText, // Changed from FileCheck to FileText since FileCheck doesn't exist in lucide-react
  //TrendingUp
} from 'lucide-react';
//import {motion} from 'framer-motion' ;

//import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


const industries = [
  {
    id: 'retail',
    title: 'Retail Analytics',
    description: 'Analyze sales trends, inventory management, and customer behavior patterns for retail businesses.',
    icon: Store,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
    metrics: ['Sales Performance', 'Customer Insights', 'Inventory Turnover', 'Store Analytics']
  },
  {
    id: 'restaurants',
    title: 'Restaurant Insights',
    description: 'Track menu performance, table turnover rates, and peak hours analysis for restaurants.',
    icon: UtensilsCrossed,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200',
    metrics: ['Menu Analytics', 'Table Turnover', 'Peak Hours', 'Customer Satisfaction']
  },
  {
    id: 'hotels',
    title: 'Hotel Performance',
    description: 'Monitor occupancy rates, revenue per room, and guest satisfaction metrics for hotels.',
    icon: Building2,
    image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&q=80&w=1200',
    metrics: ['Occupancy Rate', 'RevPAR', 'Guest Satisfaction', 'Booking Trends']
  },
  {
    id: 'manufacturing',
    title: 'Manufacturing Analytics',
    description: 'Track production efficiency, quality control metrics, and operational performance in manufacturing.',
    icon: Factory,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200',
    metrics: ['Production Efficiency', 'Quality Control', 'Equipment Utilization', 'Inventory Management']
  },
  {
    id: 'logistics',
    title: 'Logistics & Transportation',
    description: 'Monitor delivery performance, fleet efficiency, and optimize transportation operations.',
    icon: Truck,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200',
    metrics: ['Delivery Performance', 'Fleet Efficiency', 'Route Optimization', 'Cost Analysis']
  }
];

const departmentalAnalytics = [
  {
    id: 'hr',
    title: 'Human Resources Analytics',
    description: 'Analyze employee performance, turnover rates, and workforce metrics for data-driven HR decisions.',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1200',
    metrics: ['Employee Performance', 'Turnover Rate', 'Training Impact', 'Recruitment Analytics']
  },
  {
    id: 'operations',
    title: 'Operations Analytics',
    description: 'Track project progress, resource allocation, and operational efficiency metrics.',
    icon: BarChart2,
    image: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?auto=format&fit=crop&q=80&w=1200',
    metrics: ['Project Progress', 'Resource Allocation', 'Task Completion', 'Team Performance']
  },
  {
    id: 'finance',
    title: 'Financial Analytics',
    description: 'Monitor expenses, budget allocation, and financial performance indicators.',
    icon: DollarSign,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
    metrics: ['Revenue Analysis', 'Expense Tracking', 'Budget Performance', 'Cash Flow']
  }
];

const Home = () => {

  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= industries.length - 1 ? prevIndex : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex <= 0 ? prevIndex : prevIndex - 1
    );
  };

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResult = (message: string) => {
    setPopupMessage(message);
    setPopupVisible(true);
    setLoading(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.text(popupMessage, 10, 10); // Adds the message at position (10, 10)
    doc.save('result.pdf'); // Saves the file as 'result.pdf'
  };

  /*Carousel settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  */




  return (
    // the old version is : min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 , 
    <div className="bg-white">

      <div className="absolute right-8 top-4 z-50">
        <button
          onClick={() => navigate('/')}
          className="bg-white font-semibold text-red-600 px-6 py-2 rounded-lg hover:bg-red-400 hover:text-white transition-colors duration-300"
        >
          Log out
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        {/* Dotted Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0"></div>

        {/* Blurred Circles */}
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-400 opacity-30 rounded-full filter blur-3xl z-0 animate-pulse-slow"></div>
        <div className="absolute bottom-[-120px] left-[20%] w-[200px] h-[200px] bg-indigo-500 opacity-20 rounded-full filter blur-2xl z-0 animate-pulse-slow"></div>

        {/* Animated Blob (right side) */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[600px] h-[600px] z-0 pointer-events-none overflow-hidden">
          <svg
            viewBox="0 0 600 600"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M 0 300 Q 200 200 400 300 T 600 300"
              stroke="url(#curveGradient)"
              strokeWidth="8"
              fill="none"
            />
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
        </div>


        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between px-6 py-32 space-y-12 lg:space-y-0 lg:space-x-16">

          <div className="flex-1 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              <span className="relative inline-block">
                <span className="text-indigo-900">Data</span>
              </span>
              &nbsp;<span className=" relative z-10 text-gray-800 font-semibold">unlocked.<span className="absolute inset-x-0 bottom-1 h-3 bg-yellow-300 opacity-70 rounded-md z-0"></span>
              </span>

              <br />
              <span className="text-indigo-900 ">Insights</span>
              <span className="text-gray-800 font-semibold">  delivered.</span>

              <br />
              <span className="text-gray-800 font-semibold">Results ahead.</span>
            </h1>


            <p className="mt-4 text-lg text-gray-600 max-w-xl">
              Discover custom solutions designed to transform insights into income across industries.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={() =>
                  document.getElementById('industries')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
              >
                Explore Solutions
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Industry Analytics Section */}
      <div id="industries" className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Industry-Specific Analytics
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose your industry to access tailored analytics solutions designed to address your unique business challenges.
          </p>
        </div>

        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white p-2 rounded-full shadow-md hover:bg-blue-500 z-10 border border-gray-200"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white p-2 rounded-full shadow-md hover:bg-blue-500  z-10 border border-gray-200"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>

          {/* Slider Container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 gap-8"
              style={{ transform: `translateX(-${currentIndex * 33.33}%)` }}
            >
              {industries.map((industry) => {
                const Icon = industry.icon;
                return (
                  <div
                    key={industry.id}
                    className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-2"
                  >
                    <div
                      className="group cursor-pointer h-full"
                      onClick={() => navigate(`/import/${industry.id}`)}
                    >
                      <div className="relative overflow-hidden rounded-xl transition-all duration-300 bg-white shadow-none hover:shadow-xl h-full">
                        <div className="h-48 overflow-hidden">
                          <img
                            src={industry.image}
                            alt={industry.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg p-2 z-20">
                            <Icon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center justify-between">
                            {industry.title}
                            <ArrowRight className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                          </h3>
                          <p className="text-gray-600 mb-4">{industry.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {industry.metrics.map((metric, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                              >
                                {metric}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-24 w-full overflow-hidden mt-12">
        {/* Wavy separator */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-[length:1200px_24px] bg-repeat-x"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z\' opacity=\'.25\' fill=\'%233b82f6\'%3E%3C/path%3E%3Cpath d=\'M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z\' opacity=\'.5\' fill=\'%233b82f6\'%3E%3C/path%3E%3Cpath d=\'M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z\' fill=\'%233b82f6\'%3E%3C/path%3E%3C/svg%3E")'
          }}>
        </div>
      </div>


      {/* Departmental Analytics Section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Departmental Analytics
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Empower your departments with specialized analytics tools designed to optimize performance and drive efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departmentalAnalytics.map((dept) => {
              const Icon = dept.icon;
              return (
                <div
                  key={dept.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/import/${dept.id}`)}
                >
                  <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-gray-50 to-white">
                    <div className="p-8">
                      <div className="mb-6">
                        <Icon className="h-12 w-12 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-between">
                        {dept.title}
                        <ArrowRight className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-gray-600 mb-6">{dept.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {dept.metrics.map((metric, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {/* API */}
      <div className='bg-indigo-950'>
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Upload Your File to Gemini API</h3>
          <p className="text-white mb-6">Select a file to analyze with Gemini AI's intelligent system.</p>

          <UploadFile onResult={handleResult}
            setLoading={setLoading} />

          {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white">Loading...</div>
              {/* You can replace the above text with a spinner component */}
            </div>
          )}
          <div className="mt-3 mb-20 px-6 flex justify-center">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <AlertCircle className="h-4 w-4" />
              <span>Supported formats: CSV, XLSX, XLS</span>
            </div>
          </div>

          {popupVisible && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl shadow-xl p-8 max-w-md max-h-[80vh] overflow-y-auto text-center relative">
                <button
                  onClick={() => setPopupVisible(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
                <h4 className="text-xl font-bold mb-4 text-blue-600">
                  Analysis Result
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{popupMessage}</p>

                <button
                  onClick={downloadPDF}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300"
                >
                  Download as PDF
                </button>


              </div>
            </div>
          )}
        </div>
      </div>


      <div className="relative h-24 w-full overflow-hidden">
        {/* Wavy separator with sky-950 color */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 bg-[length:1200px_24px] bg-repeat-x"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' fill='%23082f49'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.5' fill='%23082f49'%3E%3C/path%3E%3Cpath d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' fill='%23082f49'%3E%3C/path%3E%3C/svg%3E")`
          }}
        ></div>
      </div>



      <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-white">Company</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">About Us</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Support</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Help Center</a></li>
            <li><a href="#" className="hover:text-white">Contact Us</a></li>
            <li><a href="#" className="hover:text-white">Documentation</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Legal</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Follow Us</h3>
          <div className="flex mt-4 space-x-4">
            <a href="#" className="hover:text-white"><FaGithub size={20} /></a>
            <a href="#" className="hover:text-white"><FaLinkedin size={20} /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700 py-6 text-center text-sm">
        &copy; {new Date().getFullYear()} DataInsight. All rights reserved.
      </div>
    </footer>


    </div>
  );
};

export default Home;