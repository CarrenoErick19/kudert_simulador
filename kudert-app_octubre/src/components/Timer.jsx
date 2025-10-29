// src/components/Timer.jsx
import React from "react";

export default function Timer({ timeLeft }) {
  return (
    <div className="text-white font-bold text-lg mb-4">
      Tiempo:{" "}
      <span className={timeLeft <= 3 ? "text-red-500" : "text-yellow-400"}>
        {timeLeft}s
      </span>
    </div>
  );
}
