import React, { useState } from 'react';
import axios from 'axios';
import { Brain, Calendar, FileText, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AITools() {
  const [plannerData, setPlannerData] = useState({ subjects: '', examDate: '', hoursPerDay: '' });
  const [plannerResult, setPlannerResult] = useState(null);
  const [plannerLoading, setPlannerLoading] = useState(false);

  const [summaryData, setSummaryData] = useState({ text: '' });
  const [summaryResult, setSummaryResult] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  const serverUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  const handlePlannerSubmit = async (e) => {
    e.preventDefault();
    setPlannerLoading(true);
    try {
      const response = await axios.post(`${serverUrl}/api/ai/planner`, plannerData);
      setPlannerResult(response.data);
      toast.success('Study plan generated!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate plan');
    } finally {
      setPlannerLoading(false);
    }
  };

  const handleSummarySubmit = async (e) => {
    e.preventDefault();
    setSummaryLoading(true);
    try {
      const response = await axios.post(`${serverUrl}/api/ai/summarizer`, summaryData);
      setSummaryResult(response.data);
      toast.success('Summary generated!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Brain className="w-8 h-8 mr-3 text-purple-600" />
          AI Study Tools
        </h1>
        <p className="text-gray-500 mt-1">Boost your productivity with smart assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Planner */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-purple-50">
            <h2 className="text-xl font-bold text-purple-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Smart Study Planner
            </h2>
            <p className="text-purple-700 text-sm mt-1">Generate a schedule based on your exams</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handlePlannerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (comma separated)</label>
                <input required type="text" value={plannerData.subjects} onChange={e => setPlannerData({...plannerData, subjects: e.target.value})} placeholder="Math, Physics, Chemistry" className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                  <input required type="date" value={plannerData.examDate} onChange={e => setPlannerData({...plannerData, examDate: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hours / Day</label>
                  <input required type="number" min="1" max="24" value={plannerData.hoursPerDay} onChange={e => setPlannerData({...plannerData, hoursPerDay: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
              </div>
              <button type="submit" disabled={plannerLoading} className="w-full bg-purple-600 text-white py-2 rounded-xl hover:bg-purple-700 disabled:opacity-50 font-medium">
                {plannerLoading ? 'Generating...' : 'Generate Plan'}
              </button>
            </form>

            {plannerResult && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">Your Schedule ({plannerResult.daysRemaining} days left)</h3>
                <div className="space-y-3">
                  {plannerResult.schedule.map(item => (
                    <div key={item.id} className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                      <div className="flex justify-between font-semibold text-purple-900 mb-1">
                        <span>{item.subject}</span>
                        <span>{item.hoursAllocated} hrs</span>
                      </div>
                      <p className="text-sm text-purple-700">{item.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Text Summarizer */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-blue-50">
            <h2 className="text-xl font-bold text-blue-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Assignment Summarizer
            </h2>
            <p className="text-blue-700 text-sm mt-1">Get quick bullet points from long texts</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSummarySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text to Summarize</label>
                <textarea required rows={6} value={summaryData.text} onChange={e => setSummaryData({...summaryData, text: e.target.value})} placeholder="Paste your long assignment or notes here..." className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <button type="submit" disabled={summaryLoading} className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium flex justify-center items-center">
                <Send className="w-4 h-4 mr-2" />
                {summaryLoading ? 'Summarizing...' : 'Summarize Text'}
              </button>
            </form>

            {summaryResult && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">Summary</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {summaryResult.summary.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
