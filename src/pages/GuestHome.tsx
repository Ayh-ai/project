import { useNavigate } from 'react-router-dom';
import {useState} from 'react' ;
import { FaGithub, FaLinkedin} from "react-icons/fa";
import { BarChart2, FileText, TrendingUp } from 'lucide-react';
//import buildingImage from '../assets/building.jpg';

const GuestHome = () => {
  const navigate = useNavigate();

  //const industries = ["Retail", "Restaurent", "Finance", "Manufacturing", "Hotels"];
  const [showModal, setShowModal] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  //const [showVideo, setShowVideo] = useState(false);

  const industryPresentations: { [key: string]: string } = {
    Retail: 'https://www.canva.com/design/DAGo9AN0pI8/qxFUhZfu51vgOwADn_PYag/view?embed',
    Healthcare: 'https://www.canva.com/design/DAGo9AN0pI8/qxFUhZfu51vgOwADn_PYag/view?embed',
    Finance: 'https://www.canva.com/design/DAGo9AN0pI8/qxFUhZfu51vgOwADn_PYag/view?embed',
    Manufacturing: 'https://www.canva.com/design/DAGo9AN0pI8/qxFUhZfu51vgOwADn_PYag/view?embed',
    Education: 'https://www.canva.com/design/DAGo9AN0pI8/qxFUhZfu51vgOwADn_PYag/view?embed',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navbar */}
      <header className="bg-white shadow-md py-4 px-8 flex items-center justify-between">
        <button
  onClick={() => navigate('/login')}
  className="bg-white font-semibold text-blue-600 border-2 border-blue-600 px-6 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-300 absolute right-8 top-4"
>
  Sign Up
</button>

      </header>

     {/* Hero Section with Centered Content and White Background */}

      <div className="bg-white text-gray-900">
  <div className="max-w-4xl mx-auto py-16 px-8 text-center">
    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
      Transform Your Business <span className="text-blue-600">Data</span>
      <br />
      Into Actionable <span className="text-blue-600">Insights</span>
    </h1>
    <p className="text-xl text-gray-600 mb-8 mx-auto max-w-2xl">
      Unlock the power of your business data with our comprehensive analytics platform. 
      Make informed decisions with real-time insights and predictive analytics.
    </p>
    <button
      onClick={() => setShowModal(true)}
      className=" px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
    >
      How it Works
    </button>
  </div>
</div>


    {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
    <div className="bg-white w-11/12 max-w-6xl rounded-xl p-6 relative max-h-[90vh] overflow-y-auto">
      {/* Close Button */}
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700 z-10"
      >
        ✕
      </button>

      {/* Industry Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        {["Retail", "Healthcare", "Finance", "Manufacturing", "Education"].map((industry) => (
          <button
            key={industry}
            onClick={() => setSelectedIndustry(industry)}
            className={`px-5 py-2 rounded-full font-medium transition-colors ${
              selectedIndustry === industry
                ? 'bg-blue-800 text-white'
                : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
            }`}
          >
            {industry}
          </button>
        ))}
      </div>

      {/* Presentation Display */}
      {selectedIndustry ? (
        <div className="w-full h-[400px] rounded-lg shadow-lg overflow-hidden">
          <iframe
            loading="lazy"
            className="w-full h-full border-0"
            src={{
              Retail: "https://www.canva.com/design/DAGo9AN0pI8/qxFUhZfu51vgOwADn_PYag/view?embed&autoplay=1&loop=1",
              Healthcare: "https://www.canva.com/design/DAH0XXXXXXX/healthcare/view?embed&autoplay=1&loop=1",
              Finance: "https://www.canva.com/design/DAF1XXXXXXX/finance/view?embed&autoplay=1&loop=1",
              Manufacturing: "https://www.canva.com/design/DAE2XXXXXXX/manufacturing/view?embed&autoplay=1&loop=1",
              Education: "https://www.canva.com/design/DAC3XXXXXXX/education/view?embed&autoplay=1&loop=1"
            }[selectedIndustry]}
            allowFullScreen
            title={`${selectedIndustry} Presentation`}
          />
        </div>
      ) : (
        <div className="border rounded-lg h-80 bg-gray-100 flex items-center justify-center text-gray-500 text-xl">
          Select an industry to view details
        </div>
      )}
    </div>
  </div>
)}

   <div className="relative h-24 w-full overflow-hidden mt-12">
  {/* Wavy separator */}
  <div className="absolute bottom-0 left-0 right-0 h-24 bg-[length:1200px_24px] bg-repeat-x" 
       style={{
         backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z\' opacity=\'.25\' fill=\'%233b82f6\'%3E%3C/path%3E%3Cpath d=\'M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z\' opacity=\'.5\' fill=\'%233b82f6\'%3E%3C/path%3E%3Cpath d=\'M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z\' fill=\'%233b82f6\'%3E%3C/path%3E%3C/svg%3E")'
       }}>
  </div>
</div>

      {/* Features Section */}
      <div id='why-us' className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Our Analytics Platform?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover how our comprehensive analytics solution can help you make better business decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[{
            title: 'Real-time Analytics',
            description: 'Get instant insights with real-time data processing and visualization.',
            icon: BarChart2
          }, {
            title: 'Custom Reports',
            description: 'Create customized reports tailored to your specific business needs.',
            icon: FileText
          }, {
            title: 'Predictive Insights',
            description: 'Make informed decisions with AI-powered predictive analytics.',
            icon: TrendingUp
          }].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <div className="bg-blue-50 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    
 <div className="relative h-24 w-full overflow-hidden mt-12">
  {/* Wavy separator with indigo-950 color */}
  <div className="absolute bottom-0 left-0 right-0 h-24 bg-[length:1200px_24px] bg-repeat-x" 
       style={{
         backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z\' opacity=\'.25\' fill=\'%231e1b4b\'%3E%3C/path%3E%3Cpath d=\'M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z\' opacity=\'.5\' fill=\'%231e1b4b\'%3E%3C/path%3E%3Cpath d=\'M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z\' fill=\'%231e1b4b\'%3E%3C/path%3E%3C/svg%3E")'
       }}>
  </div>
</div>


      {/* FAQ Section */}
<div id='faq' className="bg-white py-20 -mt-12">
  <div className=" max-w-4xl mx-auto px-8">

    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
      <span className="text-blue-500">{'{'}</span>
      Frequently Asked Questions
      <span className="text-blue-500">{'}'}</span>
      </h2>
    <div className="space-y-8">
      {[
        {
          question: 'What is DataInsight?',
          answer: ''
        },
        {
          question: ' Do I need technical skills to use DataInsight?',
          answer:''
        },
        {
          question: ' What kind of insights will I get?',
          answer: ''
        },
        {
          question: 'What if my industry isn’t listed on the platform?',
          answer: ''
        } ,
        {
          question: 'Is my data secure?',
          answer: ''
        },
        {
          question: ' How much does it cost?',
          answer: ''
        }
      ].map((faq, index) => {
        const [isOpen, setIsOpen] = useState(false);

        return (
          <div 
            key={index} 
            className="border-b border-gray-200 pb-6 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">{faq.question}</h4>
              <svg
                className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
              <p className="text-gray-600 pb-2">{faq.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
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

export default GuestHome;