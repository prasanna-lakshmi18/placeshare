import { useState } from 'react';
import { X, Building2, Briefcase, FileText, Loader2 } from 'lucide-react';
import { useCreateExperience } from '../../hooks/useExperiences';

interface CreateExperienceProps {
  onClose: () => void;
}

export function CreateExperience({ onClose }: CreateExperienceProps) {
  const createExp = useCreateExperience();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [result, setResult] = useState('pending');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createExp.mutateAsync({ company, role, description, difficulty, result });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create experience');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800 transition-colors animate-in fade-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Share Your Experience</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Help fellow students by sharing your placement journey</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-sm text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 rounded-lg border border-rose-100 dark:border-rose-500/20">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  maxLength={200}
                  autoFocus
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  maxLength={200}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Result</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all"
              >
                <option value="pending">Pending</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience Details</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText size={18} className="text-gray-400" />
              </div>
              <textarea
                placeholder="Describe your experience in detail... Include interview rounds, questions asked, preparation tips, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                rows={8}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl leading-relaxed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all resize-y"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createExp.isPending}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-full hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {createExp.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> Posting...</>
              ) : (
                'Share Experience'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
