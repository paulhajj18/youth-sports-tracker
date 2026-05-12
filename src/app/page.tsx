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
  const [name, setName] = useState("");

  const router = useRouter();

  const startGame = async () => {
    if (!name) return;

    const docRef = await addDoc(
      collection(db, "games"),
      {
        kidName: name,
        createdAt: serverTimestamp(),
      }
    );

    router.push(`/game/${docRef.id}`);
  };

  const showInstallHelp = () => {
    alert(
      "📲 SAVE TO HOME SCREEN\n\n" +
      "On iPhone:\n\n" +
      "1. Tap the Share button in Safari\n" +
      "2. Tap 'Add to Home Screen'\n\n" +
      "Then Youth Sports Tracker will appear like an app on your phone!"
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/baseball-kids.png')",
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/65" />

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-md text-center text-white">

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold mb-3 drop-shadow-lg">
          ⚾ Youth Baseball/Softball Live Sports Tracker
        </h1>

        <p className="text-lg text-gray-200 mb-6">
          Track your kid's live baseball/softball stats and share
          game updates instantly with family
          & friends.
        </p>

        {/* CARD */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/10">

          <input
            className="
              w-full
              p-3
              rounded-xl
              bg-white/20
              border
              border-white/20
              text-white
              placeholder:text-gray-300
              mb-4
              outline-none
            "
            placeholder="Enter your kid's name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <button
            onClick={startGame}
            className="
              w-full
              bg-green-500
              hover:bg-green-600
              transition
              text-white
              font-bold
              p-3
              rounded-xl
              shadow-lg
              mb-3
            "
          >
            ⚾ Play Ball!
          </button>

          {/* HOW TO BUTTON */}
          <button
            onClick={() =>
              router.push("/how-to")
            }
            className="
              w-full
              bg-blue-600
              hover:bg-blue-700
              transition
              text-white
              font-semibold
              p-3
              rounded-xl
              mb-3
            "
          >
            📘 How It Works
          </button>

          {/* SAVE TO HOME SCREEN */}
          <button
            onClick={showInstallHelp}
            className="
              w-full
              bg-purple-600
              hover:bg-purple-700
              transition
              text-white
              font-semibold
              p-3
              rounded-xl
            "
          >
            📲 Save To Home Screen
          </button>

        </div>

        {/* FOOTER TEXT */}
        <div className="mt-5 bg-black/30 rounded-2xl p-4 backdrop-blur-sm">

          <p className="text-sm text-gray-200 leading-relaxed">
            <strong>
              No app download required.
              <br />
              No signups needed.
              <br />
              Just start scoring and share live!
            </strong>
          </p>

        </div>

      </div>
    </div>
  );
}