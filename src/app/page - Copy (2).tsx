"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">
        Youth Sports Tracker
      </h1>

      <div className="w-full max-w-sm space-y-4">
        <input
          className="w-full border p-3 rounded"
          placeholder="Enter kid's name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded">
          Start Game
        </button>
      </div>
    </div>
  );
}