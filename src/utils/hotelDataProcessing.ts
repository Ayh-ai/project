import { read, utils } from 'xlsx';

export interface HotelData {
  CheckOutDate: string;
  RoomType: string;
  NightsStayed: number;
  BookingSource: string;
  PricePerNight: number;
  TotalPrice: number;
  Status: string;
  CustomerRating: number;
  GuestCount: number;
  PaymentMethod: string;
  CancellationReason: string;
  TotalRooms: number;
}

export interface ProcessedHotelData {
  totalRevenue: number;
  totalBookings: number;
  occupancyRate: number;
  revPAR: number;
  averageDailyRate: number;
  averageCustomerRating: number;
  averageLengthOfStay: number;
  bookingsByDayOfWeek: { [key: string]: number };
  cancellationsByReason: { [key: string]: number };
  bookingsByRoomType: { [key: string]: number };
  bookingsBySource: { [key: string]: number };
  paymentMethodDistribution: { [key: string]: number };
  availableMonths: Array<{ value: string; label: string }>;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const calculateColumnAverage = (data: any[], columnName: string): number => {
  const validValues = data
    .map(row => Number(row[columnName]))
    .filter(value => !isNaN(value) && value !== null && value !== undefined && value > 0);
  
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
};

const handleMissingValues = (data: any[]): HotelData[] => {
  const avgNightsStayed = calculateColumnAverage(data, 'NightsStayed');
  const avgPricePerNight = calculateColumnAverage(data, 'PricePerNight');
  const avgTotalPrice = calculateColumnAverage(data, 'TotalPrice');
  const avgCustomerRating = calculateColumnAverage(data, 'CustomerRating');
  const avgGuestCount = calculateColumnAverage(data, 'GuestCount');
  const avgTotalRooms = calculateColumnAverage(data, 'TotalRooms');

  return data.map(row => ({
    CheckOutDate: row.CheckOutDate || new Date().toISOString(),
    RoomType: row.RoomType || 'Unknown Room Type',
    NightsStayed: Number(row.NightsStayed) || avgNightsStayed || 1,
    BookingSource: row.BookingSource || 'Unknown Source',
    PricePerNight: Number(row.PricePerNight) || avgPricePerNight || 0,
    TotalPrice: Number(row.TotalPrice) || avgTotalPrice || 0,
    Status: row.Status || 'Unknown',
    CustomerRating: Number(row.CustomerRating) || avgCustomerRating || 0,
    GuestCount: Number(row.GuestCount) || avgGuestCount || 1,
    PaymentMethod: row.PaymentMethod || 'Unknown',
    CancellationReason: row.CancellationReason || 'Unknown',
    TotalRooms: Number(row.TotalRooms) || avgTotalRooms || 1
  }));
};

export const processHotelData = async (file: File, selectedMonth?: string): Promise<ProcessedHotelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = utils.sheet_to_json(worksheet);
        const jsonData = handleMissingValues(rawData);

        const availableMonths = [...new Set(jsonData.map(row => {
          const date = new Date(row.CheckOutDate);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }))].sort().map(month => {
          const [year, monthNum] = month.split('-');
          const date = new Date(parseInt(year), parseInt(monthNum) - 1);
          return {
            value: month,
            label: date.toLocaleString('default', { month: 'long', year: 'numeric' })
          };
        });

        const filteredData = selectedMonth
          ? jsonData.filter(row => {
              const date = new Date(row.CheckOutDate);
              const rowMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              return rowMonth === selectedMonth;
            })
          : jsonData;

        if (filteredData.length === 0) {
          resolve({
            totalRevenue: 0,
            totalBookings: 0,
            occupancyRate: 0,
            revPAR: 0,
            averageDailyRate: 0,
            averageCustomerRating: 0,
            averageLengthOfStay: 0,
            bookingsByDayOfWeek: {},
            cancellationsByReason: {},
            bookingsByRoomType: {},
            bookingsBySource: {},
            paymentMethodDistribution: {},
            availableMonths
          });
          return;
        }

        // Get unique dates and calculate total days
        const uniqueDates = new Set(filteredData.map(row => row.CheckOutDate.split('T')[0]));
        const totalDays = uniqueDates.size;

        // Filter confirmed bookings and calculate total booked nights
        const confirmedBookings = filteredData.filter(row => 
          row.Status.toLowerCase() === 'confirmed' || 
          row.Status.toLowerCase() === 'checked-out' ||
          row.Status.toLowerCase() === 'completed'
        );
        const totalBookedNights = confirmedBookings.reduce((sum, row) => sum + row.NightsStayed, 0);

        // Get maximum total rooms from the dataset
        const maxTotalRooms = Math.max(...filteredData.map(row => row.TotalRooms));

        // Calculate total available room nights
        const totalAvailableRoomNights = maxTotalRooms * totalDays;

        // Calculate occupancy rate
        const occupancyRate = totalAvailableRoomNights > 0 
          ? (totalBookedNights / totalAvailableRoomNights) * 100 
          : 0;

        const bookingsByDayOfWeek: { [key: string]: number } = {};
        const cancellationsByReason: { [key: string]: number } = {};
        const bookingsByRoomType: { [key: string]: number } = {};
        const bookingsBySource: { [key: string]: number } = {};
        const paymentMethodDistribution: { [key: string]: number } = {};

        let totalRevenue = 0;
        let totalCustomerRating = 0;
        let validRatingsCount = 0;

        filteredData.forEach(row => {
          if (row.Status.toLowerCase() === 'confirmed' || 
              row.Status.toLowerCase() === 'checked-out' ||
              row.Status.toLowerCase() === 'completed') {
            totalRevenue += row.TotalPrice;
          }

          if (row.CustomerRating > 0) {
            totalCustomerRating += row.CustomerRating;
            validRatingsCount++;
          }

          const date = new Date(row.CheckOutDate);
          const dayOfWeek = daysOfWeek[date.getDay()];
          bookingsByDayOfWeek[dayOfWeek] = (bookingsByDayOfWeek[dayOfWeek] || 0) + 1;

          if (row.Status.toLowerCase() === 'cancelled') {
            cancellationsByReason[row.CancellationReason] = 
              (cancellationsByReason[row.CancellationReason] || 0) + 1;
          }

          bookingsByRoomType[row.RoomType] = (bookingsByRoomType[row.RoomType] || 0) + 1;
          bookingsBySource[row.BookingSource] = (bookingsBySource[row.BookingSource] || 0) + 1;
          paymentMethodDistribution[row.PaymentMethod] = 
            (paymentMethodDistribution[row.PaymentMethod] || 0) + 1;
        });

        const revPAR = totalAvailableRoomNights > 0 
          ? totalRevenue / totalAvailableRoomNights 
          : 0;

        const averageDailyRate = totalBookedNights > 0 
          ? totalRevenue / totalBookedNights 
          : 0;

        const averageCustomerRating = validRatingsCount > 0 
          ? totalCustomerRating / validRatingsCount 
          : 0;

        const averageLengthOfStay = confirmedBookings.length > 0 
          ? totalBookedNights / confirmedBookings.length 
          : 0;

        resolve({
          totalRevenue,
          totalBookings: filteredData.length,
          occupancyRate,
          revPAR,
          averageDailyRate,
          averageCustomerRating,
          averageLengthOfStay,
          bookingsByDayOfWeek,
          cancellationsByReason,
          bookingsByRoomType,
          bookingsBySource,
          paymentMethodDistribution,
          availableMonths
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsArrayBuffer(file);
  });
};