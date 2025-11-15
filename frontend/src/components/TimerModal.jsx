import { useEffect, useRef, useState } from "react";

export default function TimerModal({update}) {
  const [minutes, setMinutes] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const intervalRef = useRef(null);

  const DURATIONS = [0.25, 5, 10, 15, 20, 30, 45, 60];

  useEffect(() => {
    if (!running) {
      setSecondsLeft(minutes * 60);
      setCompleted(false);
    }
  }, [minutes]);

  const startTimer = () => {
    if (running) return;

    setRunning(true);
    setCompleted(false);

    const endAt = Date.now() + secondsLeft * 1000;

    intervalRef.current = setInterval(() => {
      const diff = Math.ceil((endAt - Date.now()) / 1000);

      if (diff <= 0) {
        clearInterval(intervalRef.current);
        setRunning(false);
        setCompleted(true);
        setSecondsLeft(0);
      } else {
        setSecondsLeft(diff);
      }
    }, 250);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setCompleted(false);
    setSecondsLeft(minutes * 60);
  };

  const format = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  return (
    <dialog id="timerModal" className="modal">
      <div className="modal-box w-96 p-6 rounded-2xl bg-[#0b0b0b]">

        <h3 className="text-xl font-bold mb-4">Timer</h3>

        {/* Duration Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => !running && setMinutes(d)}
              className={`btn btn-sm ${minutes === d ? "btn-primary" : "btn-outline"}`}
              disabled={running}
            >
              {d} min
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="text-center text-4xl font-mono mb-4">
          {format(secondsLeft)}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mt-3">
          {!running ? (
            <button className="btn btn-success" onClick={startTimer}>Start</button>
          ) : (
            <button className="btn btn-warning" onClick={stopTimer}>Stop</button>
          )}

          <button className="btn" onClick={resetTimer} disabled={running}>
            Reset
          </button>
        </div>

        {/* Modal Action Section */}
        <div className="modal-action flex justify-between">

          {/* Completed Button — Only visible when finished */}
          {completed && (
            <button className="btn btn-info" onClick={() =>{update('meditation',true)}}>
              Completed
            </button>
          )}

          {/* Close Button — Disabled while running */}
          <button
            className="btn"
            disabled={running}
            onClick={() => document.getElementById("timerModal").close()}
          >
            Close
          </button>
        </div>

      </div>
    </dialog>
  );
}
