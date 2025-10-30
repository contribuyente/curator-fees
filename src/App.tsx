import { useState } from 'react'
import { startOfMonth, endOfMonth } from 'date-fns'
import { DateRangePicker } from './components/DateRangePicker'
import { CuratorFeesCalculator } from './components/CuratorFeesCalculator'
import { CuratorFeesReport } from './components/CuratorFeesReport'
import { DateRange, CuratorFeesSummary, RangeType } from './types'
import './App.css'

function App() {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    // If current month is not over, use today as end date
    const toDate = now < monthEnd ? now : monthEnd;
    
    return {
      from: monthStart,
      to: toDate
    };
  });

  const [rangeType, setRangeType] = useState<RangeType>('month');
  const [curatorFees, setCuratorFees] = useState<CuratorFeesSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const handleRangeTypeChange = (newRangeType: RangeType) => {
    setRangeType(newRangeType);
  };

  const handleFeesCalculated = (fees: CuratorFeesSummary[]) => {
    setCuratorFees(fees);
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <div className="app">
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        rangeType={rangeType}
        onRangeTypeChange={handleRangeTypeChange}
      />
      
      <CuratorFeesCalculator
        dateRange={dateRange}
        onFeesCalculated={handleFeesCalculated}
        onLoadingChange={handleLoadingChange}
      />
      
      <CuratorFeesReport
        fees={curatorFees}
        dateRange={dateRange}
        isLoading={isLoading}
      />
    </div>
  )
}

export default App
