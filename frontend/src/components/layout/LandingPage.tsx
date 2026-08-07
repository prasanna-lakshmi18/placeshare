import { ArrowRight, BookOpen, MessageSquare, ShieldCheck, Zap } from 'lucide-react';

interface LandingPageProps {
  onRegisterClick: () => void;
}

export function LandingPage({ onRegisterClick }: LandingPageProps) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center overflow-hidden">
      {/* Background Glowing Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 max-w-4xl mx-auto flex-1 w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-medium mb-8 border border-brand-100 dark:border-brand-500/20">
          <Zap size={14} />
          <span>The #1 Placement Experience Platform</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
          Observe, Evaluate, and <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-blue-500">
            Crack Your Dream Role
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
          PlaceShare provides the platform and community students use to share interview experiences, read detailed company reviews, and prepare for their dream placements.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onRegisterClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span>Start Building</span>
            <ArrowRight size={18} />
          </button>
          
          <button
            onClick={() => window.scrollTo({ top: document.getElementById('features')?.offsetTop, behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-xl transition-all duration-300"
          >
            Explore Features
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 w-full bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Engineering Platform for Your Career</h2>
            <p className="text-gray-500 dark:text-gray-400">Improve your interview performance across the entire recruiting lifecycle.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-brand-500/30 transition-colors">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <BookOpen className="text-brand-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Discover Real Experiences</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Filter and search through thousands of verified interview experiences. Understand exactly what companies are asking and how to answer.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-brand-500/30 transition-colors">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <MessageSquare className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Community Driven</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Engage in discussions, ask clarifying questions on specific interview rounds, and get help from peers who have successfully cracked the process.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-brand-500/30 transition-colors">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <ShieldCheck className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Anonymous & Secure</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Share your journey without compromising your identity. Built with privacy in mind so you can provide honest feedback safely.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
