import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { BookOpen, Search, Filter, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      toast.error('Failed to fetch notes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Notes</h1>
          <p className="text-gray-500 mt-1">Access and share academic materials</p>
        </div>
        <Link 
          to="/notes/upload"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Upload Notes
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes by title or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
        <button className="flex items-center justify-center px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading notes...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No notes found</h3>
          <p className="text-gray-500 mt-1">Be the first to upload notes for this subject!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <div key={note.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {note.category}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{note.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{note.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subject:</span>
                  <span className="font-medium text-gray-900">{note.subject}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Module:</span>
                  <span className="font-medium text-gray-900">{note.module || 'N/A'}</span>
                </div>
              </div>

              <a 
                href={note.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-colors font-medium border border-gray-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
