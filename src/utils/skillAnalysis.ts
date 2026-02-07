export interface RoadmapStep {
  skill: string;
  order: number;
  status: 'missing' | 'completed' | 'current';
}

export function analyzeSkillGap(
  requiredSkills: { skill_name: string; order_index: number }[],
  currentSkills: string[],
  completedSkills: string[] = []
): {
  missingSkills: string[];
  matchingSkills: string[];
  roadmap: RoadmapStep[];
} {
  const normalizedCurrentSkills = currentSkills.map(s => s.toLowerCase().trim());
  const normalizedCompletedSkills = completedSkills.map(s => s.toLowerCase().trim());

  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];
  const roadmap: RoadmapStep[] = [];

  requiredSkills.forEach(({ skill_name, order_index }) => {
    const normalizedSkill = skill_name.toLowerCase().trim();
    const hasSkill = normalizedCurrentSkills.includes(normalizedSkill);
    const isCompleted = normalizedCompletedSkills.includes(normalizedSkill);

    if (hasSkill || isCompleted) {
      matchingSkills.push(skill_name);
    } else {
      missingSkills.push(skill_name);
    }

    roadmap.push({
      skill: skill_name,
      order: order_index,
      status: isCompleted ? 'completed' : hasSkill ? 'completed' : 'missing',
    });
  });

  return {
    missingSkills,
    matchingSkills,
    roadmap: roadmap.sort((a, b) => a.order - b.order),
  };
}

export function calculateProgress(
  totalSkills: number,
  completedSkills: number
): number {
  if (totalSkills === 0) return 0;
  return Math.round((completedSkills / totalSkills) * 100);
}
