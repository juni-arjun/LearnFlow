import { TrendingUp } from 'lucide-react';

interface ProgressTrackerProps {
  total: number;
  completed: number;
  percentage: number;
}

export function ProgressTracker({ total, completed, percentage }: ProgressTrackerProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Learning Progress</h2>
            <p className="text-sm text-gray-600">Track your journey to mastery</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-blue-600">{percentage}%</p>
          <p className="text-sm text-gray-600">
            {completed} of {total} skills
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {percentage > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
            style={{ left: `${Math.min(percentage, 95)}%` }}
          >
            <div className="relative">
              <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-600">Total Skills</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{completed}</p>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-2xl font-bold text-orange-600">{total - completed}</p>
          <p className="text-xs text-gray-600">Remaining</p>
        </div>
      </div>
    </div>
  );
}
