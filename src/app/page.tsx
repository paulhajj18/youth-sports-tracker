"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();

  const startGame = async () => {
    if (!name) return;

    const docRef = await addDoc(collection(db, "games"), {
      kidName: name,
      createdAt: serverTimestamp(),
    });

    router.push(`/game/${docRef.id}`);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">

      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/baseball-kids.png')",
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60" />

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-md text-center text-white">

        <h1 className="text-4xl font-extrabold mb-2 drop-shadow-lg">
          ⚾ Youth Baseball Live Sports Tracker
        </h1>

        <p className="text-sm mb-6 text-gray-200">
          Start a <strong>live game tracker</strong> to share out your kid’s at bat stats, game score, and your personal commentating to friends & family.  <strong>Simple to use!  No download or signups needed!</strong>
        </p>

        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl shadow-lg">

          <input
            className="w-full p-3 rounded-lg text-white mb-3"
            placeholder="Enter kid's name (e.g. Henry)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            onClick={startGame}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold p-3 rounded-lg"
          >
            Play Ball!
          </button>

        </div>

      </div>
    </div>
  );
}