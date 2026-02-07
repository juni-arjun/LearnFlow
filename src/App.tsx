import { useState } from 'react';
import { OnboardingForm } from './components/OnboardingForm';
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/LoginForm';

// // --- TEMP TEST ---
// import { useEffect } from 'react';
// import { aiService } from './services/ai';

// useEffect(() => {
//   console.log("Testing AI...");
//   aiService.generateSkillQuiz("React").then(data => console.log(data));
// }, []);
// // ----------------

function App() {
  const [userId, setUserId] = useState<string | null>(
    localStorage.getItem('learnflow_user_id')
  );
  
  // New state: Are we showing Login or Signup? (Default to Signup)
  const [isLoginMode, setIsLoginMode] = useState(false);

  const handleLoginSuccess = (id: string) => {
    setUserId(id);
    localStorage.setItem('learnflow_user_id', id);
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem('learnflow_user_id');
    setIsLoginMode(true); // Go back to login screen after logout
  };

  // If user is logged in, show Dashboard
  if (userId) {
    return <Dashboard userId={userId} onLogout={handleLogout} />;
  }
  
  // If not logged in, toggle between Login and Signup forms
  return (
    <div>
      {isLoginMode ? (
        <LoginForm 
          onLogin={handleLoginSuccess} 
          onSwitchToSignup={() => setIsLoginMode(false)} 
        />
      ) : (
        <OnboardingForm 
          onComplete={handleLoginSuccess} 
        />
      )}
      
      {/* Small link on Signup page to switch to Login */}
      {!isLoginMode && (
        <div className="fixed bottom-4 left-0 right-0 text-center">
           <p className="text-sm text-gray-600 bg-white/80 inline-block px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
             Already have an account?{' '}
             <button 
               onClick={() => setIsLoginMode(true)}
               className="text-blue-600 font-semibold hover:underline"
             >
               Login here
             </button>
           </p>
        </div>
      )}
    </div>
  );
}

export default App;