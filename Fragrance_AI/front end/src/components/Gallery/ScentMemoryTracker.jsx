import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ScentMemoryTracker = () => {
  const scentHistory = [
    { month: 'Jan', floral: 30, woody: 20, citrus: 50, fresh: 40, spicy: 10, sweet: 25 },
    { month: 'Feb', floral: 40, woody: 30, citrus: 30, fresh: 35, spicy: 15, sweet: 35 },
    { month: 'Mar', floral: 25, woody: 45, citrus: 30, fresh: 25, spicy: 20, sweet: 40 },
    { month: 'Apr', floral: 35, woody: 35, citrus: 30, fresh: 45, spicy: 25, sweet: 30 },
    { month: 'May', floral: 50, woody: 20, citrus: 30, fresh: 30, spicy: 15, sweet: 45 },
    { month: 'Jun', floral: 45, woody: 25, citrus: 30, fresh: 35, spicy: 30, sweet: 35 }
  ];

  const chartData = {
    labels: scentHistory.map(item => item.month),
    datasets: [
      {
        label: 'Floral',
        data: scentHistory.map(item => item.floral),
        borderColor: '#FF6B9D',
        backgroundColor: 'rgba(255, 107, 157, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Woody',
        data: scentHistory.map(item => item.woody),
        borderColor: '#8B4513',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Citrus',
        data: scentHistory.map(item => item.citrus),
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Fresh',
        data: scentHistory.map(item => item.fresh),
        borderColor: '#00CED1',
        backgroundColor: 'rgba(0, 206, 209, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#C0C0C0',
          font: {
            family: 'Inter'
          }
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(192, 192, 192, 0.1)'
        },
        ticks: {
          color: '#C0C0C0'
        }
      },
      y: {
        grid: {
          color: 'rgba(192, 192, 192, 0.1)'
        },
        ticks: {
          color: '#C0C0C0'
        },
        min: 0,
        max: 100
      }
    },
    maintainAspectRatio: false
  };

  const currentStats = scentHistory[scentHistory.length - 1];
  const totalUsage = Object.values(currentStats).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) - 100;

  return (
    <div className="glass-panel">
      <h3 className="text-2xl font-montserrat font-semibold mb-2">🕯️ Scent Memory Tracker</h3>
      <p className="text-accent-silver mb-6">Your fragrance preference evolution and pattern analysis</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl border border-accent-silver/20">
            <h4 className="font-semibold text-accent-cyan mb-2">Current Month Stats</h4>
            <div className="space-y-2">
              {Object.entries(currentStats).map(([key, value]) => {
                if (key === 'month') return null;
                return (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-accent-silver capitalize">{key}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-accent-cyan to-accent-gold"
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold w-8">{value}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 bg-accent-cyan/5 border border-accent-cyan rounded-xl">
            <h4 className="font-semibold text-accent-cyan mb-2">📈 Insights</h4>
            <p className="text-sm text-accent-silver">
              You're trending towards floral and fresh scents this season. Your preference for woody notes has decreased by 15% compared to last month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScentMemoryTracker;