
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DataImport from './pages/DataImport';
import RetailAnalysis from './pages/RetailAnalysis';
import RestaurantAnalysis from './pages/RestaurantAnalysis';
import HotelAnalysis from './pages/HotelAnalysis';
import ManufacturingAnalysis from './pages/ManufacturingAnalysis';
import LogisticsAnalysis from './pages/LogisticsAnalysis';
import HRAnalysis from './pages/HRAnalysis';
import OperationsAnalysis from './pages/OperationsAnalysis';
import FinanceAnalysis from './pages/FinanceAnalysis';
import LoginPage from './pages/LoginPage';
import GuestHome from './pages/GuestHome';
import PlanSubscriptions from './pages/PlanSubscriptions';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/import/:industry" element={<DataImport />} />
            <Route path="/retail/analysis" element={<RetailAnalysis />} />
            <Route path="/restaurants/analysis" element={<RestaurantAnalysis />} />
            <Route path="/hotels/analysis" element={<HotelAnalysis />} />
            <Route path="/manufacturing/analysis" element={<ManufacturingAnalysis />} />
            <Route path="/logistics/analysis" element={<LogisticsAnalysis />} />
            <Route path="/hr/analysis" element={<HRAnalysis />} />
            <Route path="/operations/analysis" element={<OperationsAnalysis />} />
            <Route path="/finance/analysis" element={<FinanceAnalysis />} />

            <Route path="/login" element={<LoginPage/>}/>
             <Route path="/" element={<GuestHome/>}/>
             <Route path="/plans" element={<PlanSubscriptions/>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;