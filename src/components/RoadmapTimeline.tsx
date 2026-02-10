import { useState, useEffect } from 'react';
import { Map, CheckCircle2, Circle, ExternalLink, Youtube, BookOpen, GraduationCap } from 'lucide-react';
import { apiService } from '../services/api';
import type { RoadmapStep } from '../utils/skillAnalysis';

interface RoadmapTimelineProps {
  roadmap: RoadmapStep[];
  completedSkills: string[];
  onToggleSkill: (skillName: string, isCompleted: boolean) => void;
}

interface Resource {
  id: string;
  resource_type: string;
  title: string;
  url: string;
}

export function RoadmapTimeline({ roadmap, completedSkills, onToggleSkill }: RoadmapTimelineProps) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [resources, setResources] = useState<Record<string, Resource[]>>({});
  const [loadingResources, setLoadingResources] = useState<Record<string, boolean>>({});

  const loadResources = async (skillName: string) => {
    if (resources[skillName]) {
      return;
    }

    setLoadingResources((prev) => ({ ...prev, [skillName]: true }));

    try {
      const data = await apiService.getLearningResources(skillName);
      setResources((prev) => ({ ...prev, [skillName]: data }));
    } catch (err) {
      console.error('Error loading resources:', err);
    } finally {
      setLoadingResources((prev) => ({ ...prev, [skillName]: false }));
    }
  };

  const handleToggleExpand = (skillName: string) => {
    if (expandedSkill === skillName) {
      setExpandedSkill(null);
    } else {
      setExpandedSkill(skillName);
      loadResources(skillName);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'documentation':
        return <BookOpen className="w-4 h-4" />;
      case 'course':
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'youtube':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'documentation':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'course':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Map className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Learning Roadmap</h2>
          <p className="text-sm text-gray-600">Follow this path to reach your goal</p>
        </div>
      </div>

      <div className="space-y-4">
        {roadmap.map((step, index) => {
          const isCompleted = completedSkills.includes(step.skill);
          const isExpanded = expandedSkill === step.skill;
          const skillResources = resources[step.skill] || [];

          return (
            <div key={step.skill} className="relative">
              {index < roadmap.length - 1 && (
                <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200"></div>
              )}

              <div
                className={`relative bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${
                  isCompleted ? 'border-2 border-green-500' : 'border-2 border-gray-200'
                }`}
                onClick={() => handleToggleExpand(step.skill)}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSkill(step.skill, isCompleted);
                    }}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-white border-2 border-gray-300 text-gray-400 hover:border-blue-500 hover:text-blue-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Step {step.order}: {(step as any).displayTitle || step.skill}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {isCompleted ? 'Completed' : 'Not started yet'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">{isExpanded ? '▼' : '▶'}</span>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Learning Resources:
                        </h4>

                        {loadingResources[step.skill] ? (
                          <div className="flex items-center gap-2 text-gray-500 py-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <p className="text-sm">Loading resources...</p>
                          </div>
                        ) : skillResources.length > 0 ? (
                          <div className="space-y-2">
                            {skillResources.map((resource) => (
                              <a
                                key={resource.id}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md ${getResourceColor(
                                  resource.resource_type
                                )}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex-shrink-0">
                                  {getResourceIcon(resource.resource_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{resource.title}</p>
                                  <p className="text-xs opacity-75">{resource.resource_type}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 py-2">
                            No resources available for this skill yet.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
