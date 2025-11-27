import React, { useState, useEffect } from 'react';
import { Task, FilterType } from '../types';

const STORAGE_KEY = 'taskflow_tasks';

export const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      completed: false,
      createdAt: Date.now()
    };

    setTasks(prev => [newTask, ...prev]);
    setInputText('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks(prev => prev.filter(t => !t.completed));
  };

  // Derived state
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'ACTIVE') return !task.completed;
    if (filter === 'COMPLETED') return task.completed;
    return true;
  });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-20 md:pb-0">
      
      {/* Progress Tracker Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg transform transition-all hover:scale-[1.01]">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Your Progress</h2>
            <p className="text-indigo-100 text-sm font-medium opacity-90">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>
          <div className="text-3xl font-bold tracking-tight">{progress}%</div>
        </div>
        <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm overflow-hidden">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Input Area */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <form onSubmit={addTask} className="relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Add a new task..."
              className="w-full pl-5 pr-14 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-gray-800 placeholder-gray-400 font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-95 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </form>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {(['ACTIVE', 'COMPLETED', 'ALL'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                  filter === f
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-transparent text-gray-500 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {filteredTasks.length === 0 ? (
            <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <p className="text-gray-500 font-medium">No tasks found</p>
              <p className="text-gray-400 text-sm mt-1">Add a task to start your journey</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {filteredTasks.map(task => (
                <li
                  key={task.id}
                  className="group flex items-center gap-4 p-4 md:p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                      task.completed
                        ? 'bg-indigo-500 border-indigo-500 text-white scale-100'
                        : 'border-gray-300 hover:border-indigo-400 scale-95 hover:scale-100'
                    }`}
                  >
                    {task.completed && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  
                  <span 
                    onClick={() => toggleTask(task.id)}
                    className={`flex-1 text-base transition-all select-none ${
                      task.completed ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'
                    }`}
                  >
                    {task.text}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    aria-label="Delete task"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Footer actions */}
        {completedTasks > 0 && (
          <div className="bg-gray-50 p-3 flex justify-center border-t border-gray-100">
            <button 
              onClick={clearCompleted}
              className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear completed tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};