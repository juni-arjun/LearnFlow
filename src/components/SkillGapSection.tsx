import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface SkillGapSectionProps {
  ownedSkills: string[]; // Renamed from 'currentSkills' to be clearer
  missingSkills: string[];
}

export function SkillGapSection({
  ownedSkills,
  missingSkills,
}: SkillGapSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* LEFT CARD: Skills You Have (Owned) */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Skills</h2>
            <p className="text-sm text-gray-600">Skills you have mastered</p>
          </div>
        </div>

        {ownedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {ownedSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500 py-4">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">No skills added yet. Start learning!</p>
          </div>
        )}
      </div>

      {/* RIGHT CARD: Skills To Learn (Missing) */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-orange-100 p-2 rounded-lg">
            <XCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Skills to Learn</h2>
            <p className="text-sm text-gray-600">Missing skills for your target role</p>
          </div>
        </div>

        {missingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-200"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600 py-4">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-medium">Great! You have all required skills!</p>
          </div>
        )}
      </div>
    </div>
  );
}