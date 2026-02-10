import { useState, useEffect, useRef } from 'react';
import { User, BookOpen, Target, TrendingUp, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import { aiService, type RoadmapItem } from '../services/ai';
import { calculateProgress } from '../utils/skillAnalysis';
import type { RoadmapStep } from '../utils/skillAnalysis';

import { SkillGapSection } from './SkillGapSection';
import { RoadmapTimeline } from './RoadmapTimeline';
import { ProgressTracker } from './ProgressTracker';

// We extend RoadmapStep to include the display title
interface EnrichedRoadmapStep extends RoadmapStep {
  displayTitle: string;
}

interface DashboardProps {
  userId: string;
  onLogout: () => void;
}

export function Dashboard({ userId, onLogout }: DashboardProps) {
  const [userData, setUserData] = useState<any>(null);
  
  const [verifiedSkills, setVerifiedSkills] = useState<string[]>([]); 
  const [completedSkills, setCompletedSkills] = useState<string[]>([]); 
  
  const [aiRoadmap, setAiRoadmap] = useState<RoadmapItem[]>([]); 
  
  // Update Type here to use the Enriched version
  const [uiRoadmap, setUiRoadmap] = useState<EnrichedRoadmapStep[]>([]); 
  
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]); 

  const [loading, setLoading] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  
  const roadmapFetchedRef = useRef(false);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  useEffect(() => {
    if (userData?.target_role && !roadmapFetchedRef.current) {
      loadAiRoadmap(userData.target_role);
    }
  }, [userData, verifiedSkills]);

  useEffect(() => {
    if (aiRoadmap.length > 0) {
      // 1. Build the UI Roadmap
      const formattedRoadmap: EnrichedRoadmapStep[] = aiRoadmap.map((item, index) => {
        // MATCHING LOGIC: Use the Short Name (item.skill)
        // Normalize strings to lowercase to make matching even safer
        const shortSkill = item.skill.trim();
        const isCompleted = completedSkills.some(s => s.toLowerCase() === shortSkill.toLowerCase());
        const isVerified = verifiedSkills.some(s => s.toLowerCase() === shortSkill.toLowerCase());
        
        return {
          skill: shortSkill,          // The ID (e.g. "NumPy")
          displayTitle: item.title,   // The Display Name (e.g. "NumPy for Data Science")
          order: index + 1,
          status: (isCompleted || isVerified) ? 'completed' : 'missing',
        };
      });
      setUiRoadmap(formattedRoadmap);

      // 2. Calculate "Skills to Learn"
      const missing = aiRoadmap
        .map(item => item.skill)
        .filter(skill => {
             const shortSkill = skill.trim().toLowerCase();
             const isVerified = verifiedSkills.some(s => s.toLowerCase() === shortSkill);
             const isCompleted = completedSkills.some(s => s.toLowerCase() === shortSkill);
             return !isVerified && !isCompleted;
        });
      
      setSkillsToLearn(missing);
    }
  }, [aiRoadmap, completedSkills, verifiedSkills]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [user, skills, progress] = await Promise.all([
        apiService.getUser(userId),
        apiService.getUserSkills(userId),
        apiService.getUserProgress(userId),
      ]);

      if (!user) throw new Error('User not found');

      setUserData(user);
      const skillNames = skills.map((s: any) => s.skill_name || s);
      const progressNames = progress.map((p: any) => p.skill_name || p);
      
      setVerifiedSkills(skillNames);
      setCompletedSkills(progressNames);
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAiRoadmap = async (role: string) => {
    roadmapFetchedRef.current = true; 
    setLoadingRoadmap(true);
    
    try {
      console.log(`Asking AI for ${role} roadmap...`);
      const roadmap = await aiService.generateRoadmap(role);
      setAiRoadmap(roadmap);
    } catch (error) {
      console.error("AI Roadmap failed", error);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleToggleSkill = async (skillName: string, isCompleted: boolean) => {
    if (isCompleted) {
      setCompletedSkills(prev => prev.filter(s => s !== skillName));
      try {
        await apiService.markSkillIncomplete(userId, skillName);
      } catch (err) {
        setCompletedSkills(prev => [...prev, skillName]); 
      }
    } else {
      setCompletedSkills(prev => [...prev, skillName]);
      try {
        await apiService.markSkillComplete(userId, skillName);
      } catch (err) {
        setCompletedSkills(prev => prev.filter(s => s !== skillName));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) return <div>User not found</div>;

  const totalSkills = aiRoadmap.length || 1;
  const totalCompleted = completedSkills.length + verifiedSkills.length; 
  const progressPercentage = calculateProgress(totalSkills, totalCompleted);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Switch User
                </button>
              </div>
              <p className="text-blue-100">Target Role: {userData.target_role}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-200" />
              <div><p className="text-sm text-blue-200">Experience</p><p className="text-xl font-semibold">{userData.experience_level}</p></div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-200" />
              <div><p className="text-sm text-blue-200">Skills to Learn</p><p className="text-xl font-semibold">{skillsToLearn.length}</p></div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-200" />
              <div><p className="text-sm text-blue-200">Progress</p><p className="text-xl font-semibold">{progressPercentage}%</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProgressTracker 
          total={totalSkills} 
          completed={totalCompleted} 
          percentage={progressPercentage} 
        />
        
        <SkillGapSection 
          ownedSkills={[...verifiedSkills, ...completedSkills]} 
          missingSkills={skillsToLearn} 
        />

        {loadingRoadmap ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Generating Your Custom Path...</h3>
            <p className="text-gray-500">AI is analyzing {userData.target_role} requirements for you.</p>
          </div>
        ) : (
          <RoadmapTimeline 
            roadmap={uiRoadmap} 
            completedSkills={completedSkills} 
            onToggleSkill={handleToggleSkill} 
          />
        )}
      </div>
    </div>
  );
}