import { useState } from 'react';
import { Target, BookOpen, User, Check, Sparkles, Loader2, Plus } from 'lucide-react';
import { apiService } from '../services/api';
import { aiService, type QuizQuestion } from '../services/ai';
import { QuizModal } from './QuizModal';

interface OnboardingFormProps {
  onComplete: (userId: string) => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetRole, setTargetRole] = useState('Web Developer');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);
  
  // AI Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [skillToVerify, setSkillToVerify] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // This function handles the "Start Quiz" logic
  const initiateSkillCheck = async () => {
    if (!currentSkill.trim()) return;

    const skillName = currentSkill.trim();
    
    // Don't add duplicates
    if (skills.includes(skillName)) {
      setCurrentSkill('');
      return;
    }

    // 1. Set Loading State
    setIsVerifying(true);
    setSkillToVerify(skillName);

    // 2. Generate Quiz using AI
    try {
      const questions = await aiService.generateSkillQuiz(skillName);
      setQuizQuestions(questions);
      setShowQuiz(true); // Open the modal
    } catch (error) {
      console.error("Failed to generate quiz", error);
      // Fallback: Just add the skill if AI fails
      setSkills([...skills, skillName]);
      setCurrentSkill('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      initiateSkillCheck();
    }
  };

  const handleQuizComplete = (shouldAdd: boolean) => {
    setShowQuiz(false); // Close modal
    
    if (shouldAdd) {
      // Add skill (User passed OR User chose "Add Anyway")
      setSkills([...skills, skillToVerify]);
    }
    // If shouldAdd is false, we just close the modal and do nothing
    
    setCurrentSkill('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await apiService.createUser(name, email, targetRole, experienceLevel);
      
      if (skills.length > 0) {
        await apiService.addUserSkills(user.id, skills);
      }
      
      await apiService.initializeProgress(user.id, targetRole, skills);
      
      onComplete(user.id);
    } catch (err) {
      console.error('Error creating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      {/* The AI Quiz Modal */}
      {showQuiz && (
        <QuizModal 
          skillName={skillToVerify}
          questions={quizQuestions}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Your Profile</h1>
            <p className="text-gray-600">Let AI verify your skills and build your roadmap</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          {/* Section 2: Career Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="targetRole" className="block text-sm font-semibold text-gray-700 mb-2">
                Target Role
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="targetRole"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option>Web Developer</option>
                  <option>Data Scientist</option>
                  <option>DevOps Engineer</option>
                  <option>Mobile Developer</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                Experience Level
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="experienceLevel"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: AI Skill Verification */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Verified Skills
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. React"
                disabled={isVerifying}
              />
              
              {/* THE NEW BUTTON */}
              <button
                type="button"
                onClick={initiateSkillCheck}
                disabled={isVerifying || !currentSkill.trim()}
                className="bg-blue-600 text-white px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isVerifying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Verify
                  </>
                )}
              </button>
            </div>
            
            {/* Loading Text */}
            {isVerifying && (
               <p className="text-sm text-blue-600 mb-3 animate-pulse">Generating quiz questions...</p>
            )}
            
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isVerifying}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Building Your Roadmap...' : 'Generate My Path'}
          </button>
        </form>
      </div>
    </div>
  );
}