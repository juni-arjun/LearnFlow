import { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { QuizQuestion } from '../services/ai';

interface QuizModalProps {
  skillName: string;
  questions: QuizQuestion[];
  onComplete: (shouldAdd: boolean) => void; // Changed from 'passed' to 'shouldAdd'
  onClose: () => void;
}

export function QuizModal({ skillName, questions, onComplete, onClose }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResult(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  // Logic: >= 2 correct is a "Pass"
  const passed = score >= 2;

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${passed ? 'bg-green-100' : 'bg-orange-100'}`}>
            {passed ? (
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {passed ? 'Skill Verified!' : 'Assessment Complete'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            You scored {score} out of {questions.length}.
            {passed 
              ? " Great job! This skill has been added to your profile." 
              : " You didn't pass the verification, but you can still add this skill if you feel confident."}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => onComplete(true)}
              className={`w-full py-3 rounded-xl font-semibold text-white transition ${passed ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              {passed ? 'Continue' : 'Add Skill Anyway'}
            </button>
            
            {!passed && (
              <button
                onClick={() => onComplete(false)}
                className="w-full py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                Skip / Don't Add
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ... (The rest of the rendering code for the questions remains exactly the same)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Verify {skillName}</h2>
            <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close quiz"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <h3 className="text-lg font-medium text-gray-800 mb-6">
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => {
            let optionStyle = "border-gray-200 hover:border-blue-500 hover:bg-blue-50";
            
            if (isAnswered) {
              if (index === currentQuestion.correctAnswer) {
                optionStyle = "border-green-500 bg-green-50 text-green-700";
              } else if (index === selectedOption) {
                optionStyle = "border-red-500 bg-red-50 text-red-700";
              } else {
                optionStyle = "border-gray-200 opacity-50";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${optionStyle}`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {isAnswered && index === currentQuestion.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {isAnswered && index === selectedOption && index !== currentQuestion.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLastQuestion ? 'Finish' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
}