import React from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  AlertTriangle 
} from 'lucide-react';

const DashboardPage = () => {
  const stats = [
    { name: 'Total Revenue', value: '₱128,450', change: '+12%', icon: <TrendingUp className="text-green-400" /> },
    { name: 'Products', value: '42', change: '+3 new', icon: <Package className="text-blue-400" /> },
    { name: 'Total Orders', value: '156', change: '+18%', icon: <ShoppingCart className="text-purple-400" /> },
    { name: 'Low Stock', value: '5', change: 'Action required', icon: <AlertTriangle className="text-amber-400" /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-[#111111] border border-gray-800 p-6 rounded-2xl hover:border-green-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-900 rounded-xl group-hover:bg-gray-800 transition-colors">
                {stat.icon}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.name === 'Low Stock' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Recent Orders</h3>
            <button className="text-green-500 text-sm hover:underline font-medium">View all</button>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="text-sm hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-mono">#ORD-00{i}</td>
                    <td className="px-6 py-4">Customer Name {i}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-xs">
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">₱12,450.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-6">Inventory Status</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Rib Type Stock</span>
                <span className="text-white font-medium">85%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[85%] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Spandrel Stock</span>
                <span className="text-white font-medium">42%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[42%] rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Flat Type Stock</span>
                <span className="text-white font-medium">68%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[68%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-800">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">Stock Alerts</h4>
            <div className="flex items-center space-x-3 text-sm text-red-400 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
              <AlertTriangle size={16} />
              <span>Spandrel Blue is running low!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
