'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartDataPoint {
  month: string;
  earnings: number;
  bookings: number;
}

interface EarningsChartProps {
  data: ChartDataPoint[];
}

export function EarningsChart({ data }: EarningsChartProps) {
  const [showBookings, setShowBookings] = useState(false);

  if (data.length === 0 || data.every((d) => d.earnings === 0 && d.bookings === 0)) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No earnings data to display yet
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalEarnings = data.reduce((sum, d) => sum + d.earnings, 0);
  const totalBookings = data.reduce((sum, d) => sum + d.bookings, 0);
  const avgEarnings = totalEarnings / data.length;
  const avgBookings = totalBookings / data.length;
  const bestMonth = data.reduce((best, d) => 
    (showBookings ? d.bookings > best.bookings : d.earnings > best.earnings) ? d : best
  , data[0]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-green-600">
            Earnings: {formatCurrency(payload[0]?.payload?.earnings || 0)}
          </p>
          <p className="text-sm text-blue-600">
            Bookings: {payload[0]?.payload?.bookings || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Toggle */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setShowBookings(false)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            !showBookings
              ? 'bg-brand-100 text-brand-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Earnings
        </button>
        <button
          onClick={() => setShowBookings(true)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            showBookings
              ? 'bg-brand-100 text-brand-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bookings
        </button>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
              tickFormatter={(value) => 
                showBookings ? value.toString() : `$${value}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={showBookings ? 'bookings' : 'earnings'}
              fill={showBookings ? '#3b82f6' : '#22c55e'}
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-lg font-semibold text-gray-900">
            {showBookings
              ? totalBookings
              : formatCurrency(totalEarnings)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Monthly Avg</p>
          <p className="text-lg font-semibold text-gray-900">
            {showBookings
              ? avgBookings.toFixed(1)
              : formatCurrency(avgEarnings)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Best Month</p>
          <p className="text-lg font-semibold text-gray-900">
            {bestMonth.month}: {showBookings
              ? bestMonth.bookings
              : formatCurrency(bestMonth.earnings)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default EarningsChart;
