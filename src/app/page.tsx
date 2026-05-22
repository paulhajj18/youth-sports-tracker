"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Home() {

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

const shareApp = async () => {
  triggerFlash("share");

  try {
    await navigator.share({
      title: "Youth Sports Tracker",

      text:
        "Track your kid's stats and share game updates instantly!",

      url: "https://youthsportstracker.com",
    });
  } catch (err) {
    console.log("Share cancelled");
  }
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
<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center leading-snug drop-shadow-2xl">
  Youth Sports Tracker
</h1>

{/* SUBTITLE */}
<h2 className="text-lg sm:text-xl font-semibold text-yellow-300 text-center mt-2 tracking-wide">
  ⚾ Baseball • Softball ⚾
</h2>

{/* DESCRIPTION */}
<p className="text-lg text-gray-200 text-center mt-6 mb-6 leading-relaxed max-w-xl">
  Track your player&apos;s stats live during the game.
  <br />
  Add fun commentary and instantly share updates with family and friends.
</p>

{/* MAIN CARD */}
<div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/10">

  {/* PLAY BALL */}
  <button
    onClick={() => {
      triggerFlash("play");

      router.push("/play");
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

  {/* SEASON STATS */}
  <button
    onClick={() => {
      triggerFlash("season");

      router.push("/season");
    }}
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
      mb-4

      ${
        activeButton === "season"
          ? "scale-95 brightness-125"
          : ""
      }
    `}
  >
    📊 Season Stats
  </button>

  {/* DIVIDER */}
  <div className="flex items-center gap-3 my-4">

    <div className="flex-1 h-px bg-white/15" />

    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-300">
      More
    </p>

    <div className="flex-1 h-px bg-white/15" />

  </div>

{/* BUTTON GRID */}
<div className="grid grid-cols-2 gap-3">

  {/* HOW TO */}
  <button
    onClick={() => {
      triggerFlash("howto");

      router.push("/how-to");
    }}
    className={`
      bg-blue-600
      hover:bg-blue-700
      transition-all
      duration-150
      text-white
      font-semibold
      text-sm
      p-2.5
      rounded-xl

      ${
        activeButton === "howto"
          ? "scale-95 brightness-125"
          : ""
      }
    `}
  >
    📘 How It Works
  </button>

  {/* SHARE */}
  <button
    onClick={shareApp}
    className={`
      bg-orange-500
      hover:bg-orange-600
      transition-all
      duration-150
      text-white
      font-semibold
      text-sm
      p-2.5
      rounded-xl

      ${
        activeButton === "share"
          ? "scale-95 brightness-125"
          : ""
      }
    `}
  >
    📣 Tell A Friend
  </button>

  {/* SCREENSHOTS */}
  <button
    onClick={() => {
      triggerFlash("screenshots");

      router.push("/screenshots");
    }}
    className={`
      bg-pink-600
      hover:bg-pink-700
      transition-all
      duration-150
      text-white
      font-semibold
      text-sm
      p-2.5
      rounded-xl

      ${
        activeButton === "screenshots"
          ? "scale-95 brightness-125"
          : ""
      }
    `}
  >
    📸 Screenshots
  </button>

  {/* INSTALL */}
  <button
    onClick={showInstallHelp}
    className={`
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
    🆓 100% Free to Use
  </p>
            <p>
              🚫 No downloads or signups needed
           </p>

<p className="pt-2">
  <a
    href="/contact"
    className="text-gray-400 hover:text-white transition text-xs underline underline-offset-2"
  >
    Contact / Feedback
  </a>
</p>

  <footer className="text-center text-xs text-gray-500 py-3">
    © 2026 Youth Sports Tracker ⚾
  </footer>
          </div>

        </div>

      </div>

    </div>
  );
}