import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Calendar, Plus, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LostFound() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lost'); // 'lost', 'found', 'returned'
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'lost',
    item_name: '',
    category: 'ID Cards',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    try {
      let query = supabase.from('lost_found_items').select('*').order('created_at', { ascending: false });
      
      if (activeTab === 'returned') {
        query = query.eq('status', 'returned');
      } else {
        query = query.eq('status', 'active').eq('type', activeTab);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReturned = async (id) => {
    try {
      const { error } = await supabase
        .from('lost_found_items')
        .update({ status: 'returned' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Item marked as returned! 🎉');
      fetchItems();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = null;

    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('lost-found-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('lost-found-images')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const { error: dbError } = await supabase.from('lost_found_items').insert([
        {
          user_id: user.id,
          ...formData,
          image_url: imageUrl,
        }
      ]);

      if (dbError) throw dbError;

      toast.success('Item reported successfully!');
      setShowModal(false);
      fetchItems();
    } catch (error) {
      toast.error('Failed to report item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lost & Found</h1>
          <p className="text-gray-500 mt-1">Help return items to their rightful owners</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-700 transition-colors shadow-sm flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Report Item
        </button>
      </div>

      <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
        {['lost', 'found', 'returned'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-medium capitalize transition-colors ${
              activeTab === tab 
                ? 'bg-orange-100 text-orange-800' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab} Items
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No items found</h3>
          <p className="text-gray-500 mt-1">No {activeTab} items reported currently.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
              {item.image_url ? (
                <img src={item.image_url} alt={item.item_name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{item.item_name}</h3>
                  <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                    {item.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 flex-1">{item.description}</p>
                
                <div className="space-y-2 mb-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {item.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>

                {item.user_id === user.id && item.status === 'active' && (
                  <button 
                    onClick={() => handleMarkReturned(item.id)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Returned
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4">Report Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input type="radio" checked={formData.type === 'lost'} onChange={() => setFormData({...formData, type: 'lost'})} className="mr-2" />
                  I lost something
                </label>
                <label className="flex items-center">
                  <input type="radio" checked={formData.type === 'found'} onChange={() => setFormData({...formData, type: 'found'})} className="mr-2" />
                  I found something
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input required type="text" value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-xl bg-white">
                    <option>ID Cards</option>
                    <option>Mobile Phones</option>
                    <option>AirPods</option>
                    <option>Bottles</option>
                    <option>Books</option>
                    <option>Keys</option>
                    <option>Wallets</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="Where was it lost/found?" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="Color, brand, identifying marks..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="w-full" />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
