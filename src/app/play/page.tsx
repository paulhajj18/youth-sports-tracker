"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { db } from "@/lib/firebase";

import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function PlayPage() {
  const [playerId, setPlayerId] =
    useState("");

  const [firstName, setFirstName] =
    useState("");

  const [activeButton, setActiveButton] =
    useState("");

const [generatedId, setGeneratedId] =
  useState("");

  const router = useRouter();

  // BUTTON FLASH EFFECT
// BUTTON FLASH EFFECT
const triggerFlash = (name: string) => {
  setActiveButton(name);

  setTimeout(() => {
    setActiveButton("");
  }, 180);
};

// GENERATE PLAYER ID
const generatePlayerId = (
  firstName: string
) => {
  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `${firstName}-${randomNumber}`;
};


const startGame = async () => {
  if (!generatedId) return;

  triggerFlash("play");

  // GENERATE SECRET EDIT TOKEN
  const editToken =
    Math.random()
      .toString(36)
      .substring(2, 12);

  const docRef = await addDoc(
    collection(db, "games"),
    {
      playerId: generatedId,

      kidName:
        generatedId.split("-")[0],

      createdAt: serverTimestamp(),

      // SAVE TOKEN
      editToken,
    }
  );

  // OWNER URL
  router.push(
    `/game/${docRef.id}?edit=${editToken}`
  );
};

const continueWithPlayer =
  async () => {

    if (!playerId.trim()) return;

    triggerFlash("continue");

    // LOOK FOR PLAYER
    const q = query(
      collection(db, "players"),
      where(
        "playerId",
        "==",
        playerId.trim()
      )
    );

    const querySnapshot =
      await getDocs(q);

    // INVALID PLAYER
    if (querySnapshot.empty) {
      alert("Player ID not found.");
      return;
    }

    // SAVE LOCALLY
    localStorage.setItem(
      "activePlayerId",
      playerId.trim()
    );

    // GENERATE SECRET EDIT TOKEN
    const editToken =
      Math.random()
        .toString(36)
        .substring(2, 12);

    // CREATE GAME
    const docRef = await addDoc(
      collection(db, "games"),
      {
        playerId: playerId.trim(),

        kidName:
          playerId.split("-")[0],

        createdAt:
          serverTimestamp(),

        // SAVE TOKEN
        editToken,
      }
    );

    // GO TO GAME
    router.push(
      `/game/${docRef.id}?edit=${editToken}`
    );
};

useEffect(() => {
  const storedPlayerId =
    localStorage.getItem(
      "activePlayerId"
    );

  if (storedPlayerId) {
    setPlayerId(storedPlayerId);
  }
}, []);


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

 {/* BACK BUTTON */}
        <div className="flex justify-start mb-4">

          <button
            onClick={() => router.push("/")}
            className="
              bg-white/10
              hover:bg-white/20
              transition-all
              duration-150
              px-4
              py-2
              rounded-2xl
              border
              border-white/10
              text-sm
              font-semibold
              shadow-lg
            "
          >
            ← Home
          </button>

        </div>

        {/* TITLE */}
        <div className="flex items-center justify-center gap-3 mb-3">

          <div className="text-3xl shrink-0">
            ⚾
          </div>

          <h1 className="text-4xl font-extrabold drop-shadow-2xl text-center leading-tight">
            Play Ball!
          </h1>

          <div className="text-3xl shrink-0">
            ⚾
          </div>

        </div>

        {/* SUBTITLE */}
        <p className="text-lg text-gray-200 mb-6 leading-relaxed">
          Select Player ID to start your game.
        </p>
        <p className="text-sm text-gray-200 mb-6 leading-relaxed">
          Note: Your kid's Player ID is used for all games & season stats.  They are also unique, and only for you. <strong>Make a note of it and do not share.</strong>
        </p>

        {/* MAIN CARD */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/10">

          {/* EXISTING PLAYER */}
          <div className="mb-6">

            <h2 className="text-lg font-bold mb-3">
              Existing Player ID
            </h2>

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
              placeholder="Enter Player ID"
              value={playerId}
              onChange={(e) =>
                setPlayerId(e.target.value)
              }
            />

            <button
onClick={continueWithPlayer}
              className={`
                w-full
                bg-blue-600
                hover:bg-blue-700
                transition-all
                duration-150
                text-white
                font-bold
                text-lg
                p-3
                rounded-2xl
                shadow-lg

                ${
                  activeButton === "continue"
                    ? "scale-95 brightness-125"
                    : ""
                }
              `}
            >
             ⚾ Continue
            </button>

          </div>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-5">

            <div className="flex-1 h-px bg-white/15" />

            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-300">
              OR
            </p>

            <div className="flex-1 h-px bg-white/15" />

          </div>

          {/* CREATE NEW PLAYER */}
          <div>

            <h2 className="text-lg font-bold mb-3">
              Create New Player ID
            </h2>

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
              placeholder="Enter First Name"
              value={firstName}
              onChange={(e) =>
                setFirstName(e.target.value)
              }
            />

<button
onClick={async () => {
    triggerFlash("create");

    if (!firstName.trim()) return;

    const cleanName =
      firstName.trim();


const newId =
  generatePlayerId(cleanName);

setGeneratedId(newId);

localStorage.setItem(
  "activePlayerId",
  newId
);

const randomSlug =
  Math.random()
    .toString(36)
    .substring(2, 8);

const publicSlug =
  `${cleanName.toLowerCase()}-${randomSlug}`;

// SAVE PLAYER TO FIREBASE


await addDoc(
  collection(db, "players"),
  {
    playerId: newId,
    firstName: cleanName,
    publicSlug,
    createdAt: serverTimestamp(),
  }
);


  }}

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

    ${
      activeButton === "create"
        ? "scale-95 brightness-125"
        : ""
    }
  `}
>
  ⚾ Create New Player ID
</button>

{generatedId && (
  <div className="mt-4 bg-black/30 rounded-2xl p-4 border border-white/10">

    <p className="text-sm text-gray-300 mb-2">
      Your Kid's Player ID
    </p>

    <p className="text-2xl font-bold text-green-300 break-words">
      {generatedId}
    </p>

    <strong><p className="text-xs text-yellow-400 mt-2">
      Save this ID to access season stats later!
    </p></strong>

  </div>
)}

{generatedId && (
  <button
onClick={startGame}
    className="
      mt-4
      w-full
      bg-yellow-500
      hover:bg-yellow-400
      text-black
      font-extrabold
      text-lg
      py-3
      rounded-2xl
      shadow-lg
      transition-all
      duration-150
    "
  >
    ⚾ PLAY BALL →
  </button>
)}

          </div>

        </div>

        {/* FEATURE BOX */}
        <div className="mt-5 bg-black/30 rounded-2xl p-4 backdrop-blur-sm border border-white/5">

          <div className="space-y-2 text-sm text-gray-200">

            <p>
              📊 Track season stats across games
            </p>

            <p>
              ⚾ Player profiles & game history
            </p>

            <p>
              📲 Share season stats with family & friends
            </p>

            <p>
              🆓 100% Free to Use
            </p>

            <p>
              🚫 No downloads or signups needed
            </p>

            <footer className="text-center text-xs text-gray-500 py-3">
              © 2026 Youth Sports Tracker
            </footer>

          </div>

        </div>

      </div>

    </div>
  );
}