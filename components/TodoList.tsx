import React, { useState, useEffect, useRef } from 'react';
import { Task, FilterType } from '../types';

const STORAGE_KEY = 'taskflow_tasks';

export const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

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

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

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

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditValue(task.text);
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      setTasks(prev => prev.map(t => t.id === editingId ? { ...t, text: editValue.trim() } : t));
      setEditingId(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
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
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-yellow-200 transform transition-all hover:scale-[1.01]">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1 text-gray-900">Your Progress</h2>
            <p className="text-yellow-900 text-sm font-semibold opacity-80">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>
          <div className="text-3xl font-bold tracking-tight text-gray-900">{progress}%</div>
        </div>
        <div className="w-full bg-black/10 rounded-full h-3 backdrop-blur-sm overflow-hidden">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-yellow-100 overflow-hidden">
        
        {/* Input Area */}
        <div className="p-4 md:p-6 border-b border-yellow-50">
          <form onSubmit={addTask} className="relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Add a new task..."
              className="w-full pl-5 pr-14 py-4 bg-yellow-50/50 rounded-2xl border-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all text-gray-800 placeholder-gray-400 font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-95 shadow-sm font-bold"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
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
                    ? 'bg-yellow-100 text-yellow-800'
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
              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4 text-yellow-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No tasks found</p>
              <p className="text-gray-400 text-sm mt-1">Add a task to start your day</p>
            </div>
          ) : (
            <ul className="divide-y divide-yellow-50">
              {filteredTasks.map(task => (
                <li
                  key={task.id}
                  className="group flex items-center gap-3 p-4 md:p-5 hover:bg-yellow-50/30 transition-colors"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                      task.completed
                        ? 'bg-yellow-400 border-yellow-400 text-gray-900 scale-100'
                        : 'border-gray-300 hover:border-yellow-400 scale-95 hover:scale-100'
                    }`}
                  >
                    {task.completed && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Text or Edit Input */}
                  <div className="flex-1 min-w-0">
                    {editingId === task.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          onBlur={saveEdit}
                          className="w-full px-2 py-1 bg-white border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-800"
                        />
                      </div>
                    ) : (
                      <span 
                        onClick={() => toggleTask(task.id)}
                        className={`block truncate cursor-pointer select-none transition-all ${
                          task.completed ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'
                        }`}
                      >
                        {task.text}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === task.id ? (
                      // Save Button (Icon only visible in edit mode)
                      <button 
                        onClick={saveEdit}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                      </button>
                    ) : (
                      // Edit Button
                      <button
                        onClick={() => startEditing(task)}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-100 rounded-lg transition-all"
                        aria-label="Edit task"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      aria-label="Delete task"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Footer actions */}
        {completedTasks > 0 && (
          <div className="bg-yellow-50/50 p-3 flex justify-center border-t border-yellow-100">
            <button 
              onClick={clearCompleted}
              className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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