import React, { useState, useEffect } from 'react';
import { Check, Droplet, Footprints, Dumbbell, Sparkles, TrendingUp, Activity } from 'lucide-react';
import { motion } from "motion/react"

const Dashboard = () => {
  const defaultData = {
    meditation: false,
    waterIntake: 0,
    stepsWalked: 0,
    exercises: {
      "Jumping Jacks": false,
      "Squats": false,
      "Plank": false,
      "Lunges": false,
      "Push-ups": false,
      "Light Jogging / Fast Walking": false,
    },
    lastUpdated: new Date().toDateString()
  };

  const [data, setData] = useState(defaultData);
  const [showConfetti, setShowConfetti] = useState(false);
  const allCompleted = Object.values(data.exercises || {}).every(Boolean);

  const exercises = [
    { heading: "Jumping Jacks", subheading: "Boost cardio and warm up muscles with dynamic full-body movement" },
    { heading: "Squats", subheading: "Strengthen legs and core while improving mobility and balance" },
    { heading: "Plank", subheading: "Build core stability and endurance with isometric holds" },
    { heading: "Lunges", subheading: "Enhance lower body strength and improve coordination" },
    { heading: "Push-ups", subheading: "Develop upper body power and functional strength" },
    { heading: "Light Jogging / Fast Walking", subheading: "Increase cardiovascular health with low-impact movement" }
  ];

  useEffect(() => {
    const saved = localStorage.getItem("careDashboard");
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toDateString();
      if (parsed.lastUpdated !== today) {
        localStorage.setItem("careDashboard", JSON.stringify(defaultData));
        setData(defaultData);
      } else {
        setData(parsed);
      }
    } else {
      localStorage.setItem("careDashboard", JSON.stringify(defaultData));
    }
  }, []);

  const update = (key, value) => {
    setData((prev) => {
      const updated = { ...prev, [key]: value, lastUpdated: new Date().toDateString() };
      localStorage.setItem("careDashboard", JSON.stringify(updated));
      
      if (key === 'meditation' && value === true) {
        triggerConfetti();
      }
      
      return updated;
    });
  };

  const updateExercise = (exerciseName, checked) => {
    setData(prev => {
      const updated = {
        ...prev,
        exercises: { ...(prev.exercises || {}), [exerciseName]: checked },
        lastUpdated: new Date().toDateString()
      };
      localStorage.setItem("careDashboard", JSON.stringify(updated));
      
      if (Object.values(updated.exercises).every(Boolean)) {
        triggerConfetti();
      }
      
      return updated;
    });
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const waterProgress = Math.min((data.waterIntake / 3000) * 100, 100);
  const stepsProgress = Math.min((data.stepsWalked / 10000) * 100, 100);
  const exerciseProgress = (Object.values(data.exercises).filter(Boolean).length / 6) * 100;
  const completedTasks = [
    data.meditation,
    data.waterIntake >= 3000,
    data.stepsWalked >= 10000,
    allCompleted
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen p-6 relative" style={{ backgroundColor: '#0a0a0a' }}>
      {showConfetti && <Confetti />}
      
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1}} className="mb-8 rounded-2xl p-6 border" style={{ backgroundColor: '#0b0b0b', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Daily Wellness Dashboard</h1>
              <p className="text-gray-400">Track your journey to a healthier you</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">{completedTasks}/4</div>
              <div className="text-sm text-gray-400">Tasks Completed</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Sparkles className="text-white" />} label="Meditation" completed={data.meditation} />
            <StatCard icon={<Droplet className="text-white" />} label="Hydration" completed={data.waterIntake >= 3000} progress={waterProgress} />
            <StatCard icon={<Footprints className="text-white" />} label="Steps" completed={data.stepsWalked >= 10000} progress={stepsProgress} />
            <StatCard icon={<Dumbbell className="text-white" />} label="Exercise" completed={allCompleted} progress={exerciseProgress} />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Tasks Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meditation */}
            <TaskCard
              title="Meditation"
              description="Take a moment to breathe and reset. Begin a 10-minute guided meditation designed to reduce stress and restore inner balance."
              icon={<Sparkles className="text-white" size={24} />}
              completed={data.meditation}
              action={
                <button
                  disabled={data.meditation}
                  onClick={() => update('meditation', true)}
                  className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-transform"
                >
                  {data.meditation ? 'Completed ✓' : 'Start Session'}
                </button>
              }
            />

            {/* Water Intake */}
            <TaskCard
              title="Water Intake"
              description="Stay hydrated and healthy. Goal: 3000ml per day"
              icon={<Droplet className="text-white" size={24} />}
              completed={data.waterIntake >= 3000}
              action={
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{data.waterIntake}ml / 3000ml</span>
                    <span className="text-white font-semibold">{waterProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/20">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${waterProgress}%` }}
                    />
                  </div>
                  <button
                    onClick={() => update('waterIntake', data.waterIntake + 250)}
                    className="w-full px-6 py-3 bg-white text-black rounded-xl font-semibold hover:scale-105 transition-transform"
                  >
                    + Add 250ml
                  </button>
                </div>
              }
            />

            {/* Steps */}
            <TaskCard
              title="Steps Walked"
              description="Stay active and track your daily steps. Goal: 10,000 steps"
              icon={<Footprints className="text-white" size={24} />}
              completed={data.stepsWalked >= 10000}
              action={
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{data.stepsWalked.toLocaleString()} / 10,000 steps</span>
                    <span className="text-white font-semibold">{stepsProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/20">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${stepsProgress}%` }}
                    />
                  </div>
                  <button
                    onClick={() => update('stepsWalked', data.stepsWalked + 500)}
                    className="w-full px-6 py-3 bg-white text-black rounded-xl font-semibold hover:scale-105 transition-transform"
                  >
                    + Add 500 Steps
                  </button>
                </div>
              }
            />

            {/* Exercises */}
            <div className="rounded-2xl p-6 border relative" style={{ backgroundColor: '#0b0b0b', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              {allCompleted && (
                <div className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-white animate-bounce">
                  <Check className="size-5 text-black" />
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <Dumbbell className="text-white" size={24} />
                <h3 className="text-xl font-bold text-white">Recommended Exercises</h3>
              </div>
              
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {Object.values(data.exercises).filter(Boolean).length} / {exercises.length} completed
                </span>
                <span className="text-white font-semibold">{exerciseProgress.toFixed(0)}%</span>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-6 border border-white/20">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${exerciseProgress}%` }}
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {exercises.map(ex => (
                  <ExerciseCard
                    key={ex.heading}
                    heading={ex.heading}
                    subheading={ex.subheading}
                    checked={data.exercises?.[ex.heading] || false}
                    onToggle={updateExercise}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Progress Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl p-6 border sticky top-6" style={{ backgroundColor: '#0b0b0b', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-white" size={24} />
                <h2 className="text-xl font-bold text-white">Today's Progress</h2>
              </div>

              <div className="space-y-4">
                <ProgressItem
                  title="Meditation"
                  description="Daily mindfulness practice"
                  completed={data.meditation}
                  icon={<Sparkles className="text-white" size={20} />}
                />
                
                <ProgressItem
                  title="Hydration"
                  description={`${data.waterIntake}ml of water consumed`}
                  completed={data.waterIntake >= 3000}
                  icon={<Droplet className="text-white" size={20} />}
                  progress={waterProgress}
                />
                
                <ProgressItem
                  title="Activity"
                  description={`${data.stepsWalked.toLocaleString()} steps walked`}
                  completed={data.stepsWalked >= 10000}
                  icon={<Footprints className="text-white" size={20} />}
                  progress={stepsProgress}
                />
                
                <ProgressItem
                  title="Exercise"
                  description={`${Object.values(data.exercises).filter(Boolean).length}/6 exercises done`}
                  completed={allCompleted}
                  icon={<Dumbbell className="text-white" size={20} />}
                  progress={exerciseProgress}
                />
              </div>

              {completedTasks === 4 && (
                <div className="mt-6 p-4 bg-white/10 border border-white/30 rounded-xl">
                  <p className="text-white font-semibold text-center">🎉 All tasks completed! Amazing work!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, completed, progress }) => (
  <div className="rounded-xl p-4 border" style={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
    <div className="flex items-center justify-between mb-2">
      {icon}
      {completed && <Check className="text-white size-5" />}
    </div>
    <div className="text-sm text-gray-400 mb-2">{label}</div>
    {progress !== undefined && (
      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden border border-white/20">
        <div 
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
  </div>
);

const TaskCard = ({ title, description, icon, completed, action }) => (
  <div className="rounded-2xl p-6 border relative" style={{ backgroundColor: '#0b0b0b', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
    {completed && (
      <div className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-white">
        <Check className="size-5 text-black" />
      </div>
    )}
    
    <div className="flex items-center gap-3 mb-3">
      {icon}
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    
    <p className="text-gray-400 text-sm mb-6">{description}</p>
    
    {action}
  </div>
);

const ExerciseCard = ({ heading, subheading, checked, onToggle }) => (
  <div className="rounded-xl p-4 border hover:border-white/40 transition-all cursor-pointer" 
       style={{ backgroundColor: checked ? 'rgba(255, 255, 255, 0.1)' : '#0a0a0a', borderColor: checked ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)' }}
       onClick={() => onToggle(heading, !checked)}>
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-1">
        <div className={`size-5 rounded border-2 flex items-center justify-center transition-all ${
          checked ? 'bg-white border-white' : 'border-white/30'
        }`}>
          {checked && <Check className="size-3 text-black" />}
        </div>
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold mb-1 ${checked ? 'text-white' : 'text-white'}`}>{heading}</h4>
        <p className="text-sm text-gray-400">{subheading}</p>
      </div>
    </div>
  </div>
);

const ProgressItem = ({ title, description, completed, icon, progress }) => (
  <div className="rounded-xl p-4 border" style={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
    <div className="flex items-start gap-3 mb-3">
      <div className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${
        completed ? 'bg-white border-white' : 'bg-white/5 border-white/20'
      }`}>
        {completed ? <Check className="text-black" size={20} /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
    {progress !== undefined && (
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/20">
        <div 
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
  </div>
);

const Confetti = () => (
  <div className="fixed inset-0 pointer-events-none z-50">
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute w-3 h-3 rounded-full animate-fall"
        style={{
          left: `${Math.random() * 100}%`,
          top: '-10px',
          backgroundColor: 'white',
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`
        }}
      />
    ))}
    <style>{`
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
      .animate-fall {
        animation: fall linear forwards;
      }
    `}</style>
  </div>
);

export default Dashboard;