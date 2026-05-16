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

  // BUTTON FLASH STATE
  const [activeButton, setActiveButton] =
    useState("");

  const router = useRouter();

  // BUTTON FLASH EFFECT
  const triggerFlash = (name: string) => {
    setActiveButton(name);

    setTimeout(() => {
      setActiveButton("");
    }, 180);
  };

  const startGame = async () => {
    if (!name) return;

    triggerFlash("play");

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
    triggerFlash("install");

    alert(
      "📲 SAVE TO HOME SCREEN\n\n" +
      "On iPhone:\n\n" +
      "1. Tap the Share button in the browser\n" +
      "2. Tap 'Add to Home Screen'\n\n" +
      "Then Youth Sports Tracker will appear like an app on your phone!"
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('/images/baseball-kids.png')",
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70" />

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-md text-center text-white">

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold mb-3 drop-shadow-2xl">
          ⚾ Youth Sports Tracker ⚾ 
        </h1>

        {/* SUBTITLE */}
        <p className="text-lg text-gray-200 mb-6 leading-relaxed">
          Track your kid’s stats live during the game.
          <br />Add fun commentary. Share updates instantly with family & friends.
        </p>

        {/* MAIN CARD */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/10">

          {/* INPUT */}
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

          {/* PLAY BALL */}
          <button
            onClick={startGame}
            className={`
              w-full
              bg-green-500
              hover:bg-green-600
              transition-all
              duration-150
              text-white
              font-bold
              text-lg
              p-3
              rounded-2xl
              shadow-lg
              mb-4

              ${
                activeButton === "play"
                  ? "scale-95 brightness-125"
                  : ""
              }
            `}
          >
            ⚾ Play Ball!
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-4">

            <div className="flex-1 h-px bg-white/15" />

            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-300">
              More
            </p>

            <div className="flex-1 h-px bg-white/15" />

          </div>

          {/* HOW TO */}
          <button
            onClick={() => {
              triggerFlash("howto");

              router.push("/how-to");
            }}
            className={`
              w-full
              bg-blue-600
              hover:bg-blue-700
              transition-all
              duration-150
              text-white
              font-semibold
              text-sm
              p-2.5
              rounded-xl
              mb-3

              ${
                activeButton === "howto"
                  ? "scale-95 brightness-125"
                  : ""
              }
            `}
          >
            📘 How It Works
          </button>

          {/* INSTALL */}
          <button
            onClick={showInstallHelp}
            className={`
              w-full
              bg-purple-600
              hover:bg-purple-700
              transition-all
              duration-150
              text-white
              font-semibold
              text-sm
              p-2.5
              rounded-xl

              ${
                activeButton === "install"
                  ? "scale-95 brightness-125"
                  : ""
              }
            `}
          >
            📲 Save To Home Screen
          </button>

        </div>

        {/* FEATURE BOX */}
        <div className="mt-5 bg-black/30 rounded-2xl p-4 backdrop-blur-sm border border-white/5">

          <div className="space-y-2 text-sm text-gray-200">

            <p>
              ⚡ Instant live stat tracking
            </p>

            <p>
              📲 Share live game updates
            </p>

            <p>
              🎙️ Fun sports commentary
            </p>

            <p>
              🚫 No downloads or signups needed
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}