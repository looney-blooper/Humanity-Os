import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import TimerModal from "../../components/TimerModal";
import exercises from '../../lib/exercise.json';
import { motion } from "motion/react"

export default function Dashboard() {
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
  const allCompleted = Object.values(data.exercises || {}).every(Boolean);


  // data.exercises comes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("careDashboard");
    if (saved) {
      const parsed = JSON.parse(saved);
      setData(parsed);
    }
  }, []);




  useEffect(() => {
    const saved = localStorage.getItem("careDashboard");

    if (saved) {
      const parsed = JSON.parse(saved);

      const today = new Date().toDateString(); // e.g., "Sat Nov 15 2025"

      // If saved day !== today → new day → reset storage
      if (parsed.lastUpdated !== today) {
        localStorage.setItem("careDashboard", JSON.stringify(defaultData));
        setData(defaultData);
      } else {
        setData(parsed);
      }
    } else {
      // No data exists → save default
      localStorage.setItem("careDashboard", JSON.stringify(defaultData));
    }
  }, []);
  const getLocalAttribute = (key, attribute) => {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    try {
      const parsed = JSON.parse(saved);
      return parsed[attribute] ?? null;
    } catch {
      return null;
    }
  };

  const updateExercise = (exerciseName, checked) => {
    setData(prev => {
      const updated = {
        ...prev,
        exercises: {
          ...(prev.exercises || {}),
          [exerciseName]: checked
        },
        lastUpdated: new Date().toDateString()
      };

      localStorage.setItem("careDashboard", JSON.stringify(updated));
      return updated;
    });
  };


  const update = (key, value) => {
    setData((prev) => {
      const updated = {
        ...prev,
        [key]: value,
        lastUpdated: new Date().toDateString()
      };
      localStorage.setItem("careDashboard", JSON.stringify(updated));
      return updated;
    });
  };




  return (
    <div className="xl:px-20 md:px-10 p-6 min-h-[calc(100vh-60px)] flex lg:flex-row flex-col-reverse gap-10  ">
      {/* Tasks  */}
      <div className="lg:w-2/3 h-full flex xl:flex-row flex-col gap-10">

        <motion.div initial={{opacity:0}} whileInView={{x:0 , y:0 , opacity:1 }} transition={{duration:0.6}} className="space-y-6 space-x-6 xl:flex-1/2 ">
          {/* Meditaation  */}
          <div className="relative w-full rounded-lg p-4 border-1 space-y-3 border-white/10 bg-[#0b0b0b]">
            {getLocalAttribute('careDashboard', 'meditation') && <div className="absolute right-5 p-1 rounded-full bg-green-500">
              <Check className="size-3" />
            </div>}
            <h4 className="text-xl font-bold">Meditation</h4>
            <p className="text-sm">Take a moment to breathe and reset. Begin a 10-minute guided meditation designed to reduce stress and restore inner balance.</p>

            <div className="w-full flex justify-end mt-4">
              <button disabled={getLocalAttribute('careDashboard', 'meditation')} onClick={() => document.getElementById("timerModal").showModal()} className="px-4 disabled:opacity-60 disabled:hover:scale-100 py-1 hover:scale-102 cursor-pointer transition-all duration-150 bg-white text-black tracking-wide font-semibold rounded w-full mt-5">Start </button>
            </div>
            <TimerModal update={update} />


          </div>

          {/* Water   */}
          <div className="w-full  rounded-lg p-4 border-1 space-y-3 border-white/10 bg-[#0b0b0b] relative">
            {(getLocalAttribute('careDashboard', 'waterIntake') >= 3000) && <div className="absolute right-5 p-1 rounded-full bg-green-500">
              <Check className="size-3" />
            </div>}
            <h4 className="text-xl font-bold">Water Intake Tracking</h4>
            <p className="text-sm">Stay hydrated and healthy. Log your daily water intake to monitor progress, build consistency, and maintain optimal body and mind performance.</p>

            <div className="w-full flex justify-end mt-4">

              <button
                className="px-4 py-1 bg-white hover:scale-102 transition-all duration-150 cursor-pointer text-black tracking-wide font-semibold rounded w-full mt-5"
                onClick={() => {
                  const saved = JSON.parse(localStorage.getItem("careDashboard")) || {};
                  const current = saved.waterIntake || 0;

                  const updated = {
                    ...saved,
                    waterIntake: current + 100,
                    lastUpdated: new Date().toDateString()
                  };

                  localStorage.setItem("careDashboard", JSON.stringify(updated));
                  setData(updated); // only if you're inside your component with setData
                }}
              >
                + Add 100ml
              </button>
            </div>


          </div>
          {/* Steps Walked  */}
          <div className="w-full rounded-lg p-4 border-1 space-y-3 border-white/10 bg-[#0b0b0b] relative">

            {getLocalAttribute("careDashboard", "stepsWalked") >= 10000 && (
              <div className="absolute right-5 p-1 rounded-full bg-green-500">
                <Check className="size-3" />
              </div>
            )}


            <h4 className="text-xl font-bold">Steps Walked</h4>
            <p className="text-sm">
              Stay active and track your daily steps. Small movements build long-term
              fitness and consistency.
            </p>

            <div className="w-full flex justify-end mt-4">
              <button
                className="px-4 py-1 bg-white text-black tracking-wide font-semibold rounded w-full mt-5"
                onClick={() => update("stepsWalked", data.stepsWalked + 100)}
              >
                + Add 100 Steps
              </button>
            </div>
          </div>


        </motion.div>
        <motion.div initial={{opacity:0}} whileInView={{x:0 , y:0 , opacity:1 }} transition={{duration:0.6 , delay:0.2}}  className="xl:flex-1/2 w-full  border-1  rounded-lg p-4 border-white/10 bg-[#0b0b0b] relative">
          {allCompleted && (
            <div className="absolute right-2 top-2 size-6 flex items-center justify-center rounded-full bg-green-500">
              <Check className="size-4" />
            </div>
          )}
          <h4 className="text-xl font-bold">Recommended Exercise</h4>

          <div className="flex flex-col w-full gap-4 mt-8 overflow-y-auto">

            {exercises.map(ex => (
              <ExerciseCard
                key={ex.heading}
                heading={ex.heading}
                subheading={ex.subheading}
                checked={data.exercises?.[ex.heading] || false} // <-- get value from localStorage-backed state
                onToggle={updateExercise}
              />
            ))}
          </div>

          <div className="w-full"></div>
        </motion.div>




      </div>

      {/* Progress */}
      <motion.div initial={{opacity:0}} whileInView={{x:0 , y:0 , opacity:1 }} transition={{duration:0.6 , delay:0.4}} className="w-full h-fit lg:w-1/3 border-1 rounded-lg p-4 border-white/10 bg-[#0b0b0b]  top-0 z-50 sticky">
        <h2 className="text-xl font-bold">Track Progress</h2>

        {/* Tasks  progress */}
        <div className="space-y-4 mt-8 w-full">
          {/* meditation  */}
          <div className="flex itmes-center space-x-2 border-1 border-white/20 rounded-lg p-2">
            {(getLocalAttribute('careDashboard', 'meditation')) ? <div className=" right-5 size-5 flex items-center justify-center rounded-full bg-green-500">
              <Check className="size-4" />
            </div> : <div className="size-5"></div>}
            <div className="space-y-2">
              <h2 className="font-bold">Meditation</h2>
              <p className="text-sm">Monitor your daily meditation streak and celebrate consistent mindful growth</p>

            </div>

          </div>

          {/* Water Intake  */}
          <div className="flex itmes-center space-x-2 border-1 border-white/20 rounded-lg p-2">
            {(getLocalAttribute('careDashboard', 'waterIntake') >= 3000) ? <div className=" right-5 size-5 flex items-center justify-center rounded-full bg-green-500">
              <Check className="size-4" />
            </div> : <div className="size-5"></div>}
            <div className="space-y-2">
              <h2 className="font-bold">Water Intake Tracking</h2>
              <p className="text-sm">Track every glass you drink and maintain consistent hydration throughout the day.</p>
              <p>Your water intake count: {getLocalAttribute("careDashboard", 'waterIntake')} ml</p>

            </div>

          </div>

          {/* Steps walked  */}
          <div className="flex itmes-center space-x-2 border-1 border-white/20 rounded-lg p-2">
            {(getLocalAttribute('careDashboard', 'stepsWalked') >= 10000) ? <div className="  size-5 flex items-center justify-center rounded-full bg-green-500">
              <Check className="size-4" />
            </div> : <div className="size-5"></div>}
            <div className="space-y-2">
              <h2 className="font-bold">Steps walked</h2>
              <p className="text-sm">Monitor your walking progress to improve stamina, energy, and overall physical health</p>
              <p>Total steps you have covered: {getLocalAttribute("careDashboard", "stepsWalked")}</p>

            </div>

          </div>

          {/* Recommended Exercise  */}
          <div className="flex itmes-center space-x-2 border-1 border-white/20 rounded-lg p-2 relative">
            {allCompleted ? <div className="  size-5 flex items-center justify-center rounded-full bg-green-500">
              <Check className="size-4" />
            </div> : <div className="size-5"></div>}
            <div className="space-y-2">
              <h2 className="font-bold">Recommended Exercise</h2>
              <p className="text-sm">Follow personalized exercise suggestions designed to strengthen your body and boost energy.</p>

            </div>

          </div>
        </div>

      </motion.div>





    </div>
  );
}


export const ExerciseCard = ({ heading, subheading, checked = false, onToggle }) => {
  return (
    <div className="relative border-1 border-white/10 flex gap-2 rounded p-2">



      <input
        type="checkbox"
        className="checkbox"
        checked={checked} // always a boolean now
        onChange={(e) => onToggle(heading, e.target.checked)}
      />

      <div>
        <h2 className="font-bold">{heading}</h2>
        <p className="text-sm mt-1">{subheading}</p>
      </div>
    </div>
  );
};

