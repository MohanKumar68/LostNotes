import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FileQuestion, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    module: '',
    description: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('note_requests')
        .select(`*, users(full_name)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('note_requests').insert([
        {
          user_id: user.id,
          subject: formData.subject,
          module: formData.module,
          description: formData.description,
        }
      ]);

      if (error) throw error;
      toast.success('Request submitted!');
      setShowModal(false);
      fetchRequests();
    } catch (error) {
      toast.error('Failed to submit request');
    }
  };

  const handleMarkFulfilled = async (id) => {
    try {
      const { error } = await supabase
        .from('note_requests')
        .update({ status: 'fulfilled' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Request marked as fulfilled');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Note Requests</h1>
          <p className="text-gray-500 mt-1">Ask the community for materials you need</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Request
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading requests...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900">{req.subject}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  req.status === 'open' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                }`}>
                  {req.status.toUpperCase()}
                </span>
              </div>
              {req.module && <p className="text-sm text-gray-500 mb-2">Module: {req.module}</p>}
              <p className="text-gray-700 mb-4">{req.description}</p>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Requested by: {req.users?.full_name || 'Student'}
                </span>
                
                {req.user_id === user.id && req.status === 'open' && (
                  <button 
                    onClick={() => handleMarkFulfilled(req.id)}
                    className="flex items-center text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Fulfilled
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for New Request */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Request Notes</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  required
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module (Optional)</label>
                <input
                  type="text"
                  value={formData.module}
                  onChange={e => setFormData({...formData, module: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What exactly are you looking for?"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
