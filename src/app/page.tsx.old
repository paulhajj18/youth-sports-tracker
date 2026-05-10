"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { db } from "@/lib/firebase";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export default function Home() {
  const router = useRouter();

  const [playerName, setPlayerName] = useState("");
  const [ourTeam, setOurTeam] = useState("");
  const [otherTeam, setOtherTeam] = useState("");

  const startGame = async () => {
    if (!playerName) {
      alert("Enter player name");
      return;
    }

    const docRef = await addDoc(collection(db, "games"), {
      kidName: playerName,

      ourTeam: ourTeam || "Our Team",
      otherTeam: otherTeam || "Other Team",

      inning: 1,
      half: "Top",

      ourScore: 0,
      otherScore: 0,

      comments: [],
      createdAt: serverTimestamp(),
    });

    router.push(`/game/${docRef.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">

      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Youth Sports Tracker
        </h1>

        <div className="space-y-4">

          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Player Name"
            className="w-full border p-3 rounded"
          />

          <input
            value={ourTeam}
            onChange={(e) => setOurTeam(e.target.value)}
            placeholder="Our Team Name"
            className="w-full border p-3 rounded"
          />

          <input
            value={otherTeam}
            onChange={(e) => setOtherTeam(e.target.value)}
            placeholder="Other Team Name"
            className="w-full border p-3 rounded"
          />

          <button
            onClick={startGame}
            className="w-full bg-blue-600 text-white p-3 rounded font-semibold"
          >
            Start Game
          </button>

        </div>

      </div>

    </div>
  );
}