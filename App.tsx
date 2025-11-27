import React from 'react';
import { TodoList } from './components/TodoList';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-yellow-50 text-gray-900 font-sans selection:bg-yellow-200 selection:text-yellow-900">
      
      {/* Modern Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-yellow-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-yellow-200">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600 tracking-tight">
              TaskFlow
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <TodoList />
      </main>

    </div>
  );
};

export default App;