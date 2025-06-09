import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useEffect, useRef } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const targetSection = useRef<string | null>(null);

  const handleLogoClick = () => {
    const guestRoutes = ['/login', '/', '/plans'];
    if (guestRoutes.includes(location.pathname)) {
      navigate('/');
    } else {
      navigate('/home');
    }
  };

  const handleSectionClick = (sectionId: string) => {
    if (location.pathname === '/') {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      targetSection.current = sectionId;
      navigate('/');
    }
  };

  useEffect(() => {
    if (location.pathname === '/' && targetSection.current) {
      const section = document.getElementById(targetSection.current);
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth' });
          targetSection.current = null;
        }, 100);
      }
    }
  }, [location.pathname]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          {/* Logo on the left */}
          <div 
            onClick={handleLogoClick} 
            className="flex items-center cursor-pointer gap-0 flex-shrink-0 mr-auto"
          >
            <img src={logo} className="h-8 w-auto pl-2" alt="Logo" />
            <span className="text-2xl font-semibold font-roboto text-blue-950">DataInsights <span className="text-xs align-top text-blue-600">beta</span></span>
          </div>

          {/* Navigation buttons pushed to the left */}
          {location.pathname === '/' && (
            <div className="flex items-center gap-6 mr-[10rem] mt-3">  {/* Added ml-8 for left margin */}
              <button 
                onClick={() => handleSectionClick('why-us')}
                className="relative group text-gray-600 hover:text-blue-600 font-medium px-3 py-1 transition-colors focus:outline-none"
              >
                Why us?
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>

              <button 
                onClick={() => handleSectionClick('faq')}
                className="relative group text-gray-600 hover:text-blue-600 font-medium px-3 py-1 transition-colors focus:outline-none"
              >
                FAQ
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>

              </button>

              <button
                onClick={() => navigate('/plans')}
                className=" relative group text-blue-600 hover:text-blue-800 font-medium px-3 py-1 transition-colors"
              >
                Pricing
                 <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>

              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;