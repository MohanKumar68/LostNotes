import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, CheckSquare, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || 'Student';

  const stats = [
    { label: 'Notes Available', value: '124', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Tasks', value: '5', icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Lost Items', value: '12', icon: Search, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'AI Study Plans', value: '2', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-blue-100 text-lg">Ready to conquer your studies today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 transform hover:-translate-y-1 transition-all duration-200">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            Quick Actions
          </h2>
          <div className="space-y-4">
            <Link to="/notes/upload" className="block w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <span className="font-semibold text-gray-900 block">Upload Notes</span>
              <span className="text-sm text-gray-500">Share your materials with peers</span>
            </Link>
            <Link to="/lost-found" className="block w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-colors">
              <span className="font-semibold text-gray-900 block">Report Item</span>
              <span className="text-sm text-gray-500">Lost or found something on campus?</span>
            </Link>
            <Link to="/tasks" className="block w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors">
              <span className="font-semibold text-gray-900 block">Add Task</span>
              <span className="text-sm text-gray-500">Keep track of your assignments</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            AI Insights
          </h2>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p className="text-purple-800 font-medium mb-2">Smart Tip for the Day:</p>
            <p className="text-purple-600 text-sm">
              You have 3 tasks due this week. Based on your study history, allocating 2 hours tonight to "Data Structures" will keep you on track. Check out the AI Tools section for a detailed study planner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
