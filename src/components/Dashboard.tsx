import { useState, useEffect } from 'react';
import { User, BookOpen, Target, TrendingUp, CheckCircle2, Circle } from 'lucide-react';
import { apiService } from '../services/api';
import { analyzeSkillGap, calculateProgress } from '../utils/skillAnalysis';
import type { RoadmapStep } from '../utils/skillAnalysis';
import { SkillGapSection } from './SkillGapSection';
import { RoadmapTimeline } from './RoadmapTimeline';
import { ProgressTracker } from './ProgressTracker';

interface DashboardProps {
  userId: string;
  onLogout: () => void;
}

export function Dashboard({ userId, onLogout }: DashboardProps) {
  const [userData, setUserData] = useState<any>(null);
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<any[]>([]);
  const [completedSkills, setCompletedSkills] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [matchingSkills, setMatchingSkills] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [user, userSkills, progress] = await Promise.all([
        apiService.getUser(userId),
        apiService.getUserSkills(userId),
        apiService.getUserProgress(userId),
      ]);

      if (!user) {
        throw new Error('User not found');
      }

      setUserData(user);
      setCurrentSkills(userSkills);
      setCompletedSkills(progress);

      const roleSkills = await apiService.getRoleSkills(user.target_role);
      setRequiredSkills(roleSkills);

      const analysis = analyzeSkillGap(roleSkills, userSkills, progress);
      setMissingSkills(analysis.missingSkills);
      setMatchingSkills(analysis.matchingSkills);
      setRoadmap(analysis.roadmap);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSkill = async (skillName: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await apiService.markSkillIncomplete(userId, skillName);
      } else {
        await apiService.markSkillComplete(userId, skillName);
      }
      await loadDashboardData();
    } catch (err) {
      console.error('Error toggling skill:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  const progressPercentage = calculateProgress(
    requiredSkills.length,
    completedSkills.length
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{userData.name}</h1>
                <button
                  onClick={onLogout}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                    Switch User
                </button>
              </div>
              <p className="text-blue-100">Target Role: {userData.target_role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-200" />
                <div>
                  <p className="text-sm text-blue-200">Experience Level</p>
                  <p className="text-xl font-semibold">{userData.experience_level}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-blue-200" />
                <div>
                  <p className="text-sm text-blue-200">Skills to Learn</p>
                  <p className="text-xl font-semibold">{missingSkills.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-blue-200" />
                <div>
                  <p className="text-sm text-blue-200">Progress</p>
                  <p className="text-xl font-semibold">{progressPercentage}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProgressTracker
          total={requiredSkills.length}
          completed={completedSkills.length}
          percentage={progressPercentage}
        />

        <SkillGapSection
          ownedSkills={Array.from(new Set([...currentSkills, ...completedSkills]))}
          missingSkills={missingSkills}
        />

        <RoadmapTimeline
          roadmap={roadmap}
          completedSkills={completedSkills}
          onToggleSkill={handleToggleSkill}
        />
      </div>
    </div>
  );
}
