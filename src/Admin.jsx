import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { ArrowLeft } from 'lucide-react';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold text-[#8B4513]">LATCINTL Admin</h1>
            <p className="text-gray-600 mt-2">Order Management Dashboard</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 bg-[#8B4513] text-white px-6 py-3 rounded-2xl hover:bg-[#A0522D]"
          >
            <ArrowLeft size={20} />
            Back to Store
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-gray-500">Total Orders</p>
            <p className="text-5xl font-bold text-[#8B4513] mt-2">{orders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-gray-500">Total Revenue (Pi)</p>
            <p className="text-5xl font-bold text-[#8B4513] mt-2">
              {orders.reduce((sum, order) => sum + (order.total || 0), 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-gray-500">Pending Orders</p>
            <p className="text-5xl font-bold text-amber-600 mt-2">0</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl shadow overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Recent Orders</h2>
            <button 
              onClick={fetchOrders}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-center py-20 text-gray-500">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-center py-20 text-gray-500">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#8B4513] text-white">
                  <tr>
                    <th className="p-5 text-left">Order ID</th>
                    <th className="p-5 text-left">Customer</th>
                    <th className="p-5 text-left">Items</th>
                    <th className="p-5 text-left">Total (Pi)</th>
                    <th className="p-5 text-left">Date</th>
                    <th className="p-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="p-5 font-mono text-sm">{order.payment_id}</td>
                      <td className="p-5">@{order.username}</td>
                      <td className="p-5">
                        {order.items?.length || 0} items
                      </td>
                      <td className="p-5 font-bold text-[#8B4513]">{order.total} Pi</td>
                      <td className="p-5 text-gray-600">
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                      <td className="p-5 text-center">
                        <span className="bg-green-100 text-green-700 px-6 py-1.5 rounded-full text-sm font-medium">
                          PAID
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
                              }
