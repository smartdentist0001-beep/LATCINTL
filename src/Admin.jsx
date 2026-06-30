import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

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

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert("Failed to update status");
    } else {
      alert(`Order status changed to ${newStatus.toUpperCase()}`);
      fetchOrders(); // Refresh list
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold text-[#8B4513]">LATCINTL Admin</h1>
            <p className="text-gray-600 mt-2">Order Management System</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 bg-[#8B4513] text-white px-6 py-3 rounded-2xl hover:bg-[#A0522D]"
          >
            <ArrowLeft size={20} />
            Back to Store
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-gray-500">Total Orders</p>
            <p className="text-5xl font-bold text-[#8B4513] mt-2">{orders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-gray-500">Pending</p>
            <p className="text-5xl font-bold text-amber-600 mt-2">{pendingOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-gray-500">Total Revenue</p>
            <p className="text-5xl font-bold text-[#8B4513] mt-2">{totalRevenue} Pi</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow">
            <button 
              onClick={fetchOrders}
              className="w-full h-full flex items-center justify-center gap-2 hover:bg-gray-50 rounded-3xl border border-dashed"
            >
              <RefreshCw size={24} /> Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          {['all', 'pending', 'paid', 'shipped'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2 rounded-2xl capitalize transition ${
                filterStatus === status 
                  ? 'bg-[#8B4513] text-white' 
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold">All Orders</h2>
          </div>

          {loading ? (
            <p className="text-center py-20">Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center py-20 text-gray-500">No orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#8B4513] text-white">
                  <tr>
                    <th className="p-5 text-left">Order ID</th>
                    <th className="p-5 text-left">Customer</th>
                    <th className="p-5 text-left">Items Count</th>
                    <th className="p-5 text-left">Total (Pi)</th>
                    <th className="p-5 text-left">Date</th>
                    <th className="p-5 text-center">Status</th>
                    <th className="p-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="p-5 font-mono text-sm">{order.payment_id?.slice(0, 12)}...</td>
                      <td className="p-5 font-medium">@{order.username}</td>
                      <td className="p-5">{order.items?.length || 0}</td>
                      <td className="p-5 font-bold text-[#8B4513]">{order.total} Pi</td>
                      <td className="p-5 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-5 text-center">
                        <span className={`px-5 py-1.5 rounded-full text-sm font-medium ${
                          order.status === 'paid' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <select 
                          value={order.status || 'pending'}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="border rounded-lg px-3 py-1 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                        </select>
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
