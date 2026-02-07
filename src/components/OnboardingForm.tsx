import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { apiService } from '../services/api';

interface Role {
  id: string;
  role_name: string;
  description: string;
}

interface OnboardingFormProps {
  onComplete: (userId: string) => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await apiService.getRoles();
      setRoles(data);
      if (data.length > 0) {
        setTargetRole(data[0].role_name);
      }
    } catch (err) {
      console.error('Error loading roles:', err);
      setError('Failed to load roles');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await apiService.createUser(name, email, targetRole, experienceLevel);

      if (currentSkills.trim()) {
        const skillsList = currentSkills
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        if (skillsList.length > 0) {
          await apiService.addUserSkills(user.id, skillsList);
        }
      }

      onComplete(user.id);
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 p-3 rounded-xl">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to LearnFlow</h1>
            <p className="text-gray-600">Get your personalized learning roadmap</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label htmlFor="targetRole" className="block text-sm font-semibold text-gray-700 mb-2">
              Target Career Role
            </label>
            <select
              id="targetRole"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.role_name}>
                  {role.role_name}
                </option>
              ))}
            </select>
            {targetRole && (
              <p className="mt-2 text-sm text-gray-600">
                {roles.find(r => r.role_name === targetRole)?.description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-semibold text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              id="experienceLevel"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label htmlFor="currentSkills" className="block text-sm font-semibold text-gray-700 mb-2">
              Current Skills (comma-separated)
            </label>
            <textarea
              id="currentSkills"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              placeholder="e.g., JavaScript, HTML, CSS, Git"
            />
            <p className="mt-2 text-sm text-gray-600">
              Leave empty if you're just starting out
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Your Roadmap...' : 'Generate My Learning Path'}
          </button>
        </form>
      </div>
    </div>
  );
}
