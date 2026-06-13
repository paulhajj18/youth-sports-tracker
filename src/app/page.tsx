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
        "App to track a player's stats and share game updates instantly!",

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
            "url('/images/main-kids.png')",
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70" />

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-md text-center text-white">

{/* TITLE */}
<h1 className="text-2xl sm:text-4xl md:text-4xl font-extrabold text-center leading-snug drop-shadow-1xl">
  Youth Sports Tracker
</h1>

{/* SUBTITLE */}
<h2 className="text-lg sm:text-xl font-semibold text-yellow-300 text-center mt-2 tracking-wide">
  ⚾ Baseball • Softball • Basketball 🏀<br />
📱 Mobile Web App - Free
</h2>

{/* DESCRIPTION */}
<p className="text-lg text-gray-200 text-center mt-6 mb-6 leading-relaxed max-w-xl">
  Use your phone to track a player's stats live during the game.
  <br />
  Add fun commentary and instantly share updates with family and friends.
</p>

{/* MAIN CARD */}
<div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/10">

{/* BASEBALL */}

<div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">

  <h2 className="text-xl font-bold text-center mb-4">
    ⚾ Baseball
  </h2>

  <div className="grid grid-cols-2 gap-3">

    <button
      onClick={() =>
        router.push("/baseball/play/")
      }
      className="
        bg-blue-600
        hover:bg-blue-500
        rounded-xl
        py-3
        font-semibold
      "
    >
      Start Tracking
    </button>

    <button
      onClick={() =>
        router.push("/baseball/season/")
      }
      className="
        bg-slate-700
        hover:bg-slate-600
        rounded-xl
        py-3
        font-semibold
      "
    >
      📊 Season Stats
    </button>

  </div>

</div>

{/* BASKETBALL */}

<div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

  <h2 className="text-xl font-bold text-center mb-4">
    🏀 Basketball
  </h2>

  <div className="grid grid-cols-2 gap-3">

    <button
      onClick={() =>
        router.push("/basketball/play/")
      }
      className="
        bg-green-600
        hover:bg-green-500
        rounded-xl
        py-3
        font-semibold
      "
    >
      Start Tracking
    </button>

    <button
      onClick={() =>
        router.push("/basketball/season/")
      }
      className="
        bg-slate-700
        hover:bg-slate-600
        rounded-xl
        py-3
        font-semibold
      "
    >
     📊 Season Stats
    </button>

  </div>

</div>
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
              📊 Automatic season stat averages
            </p>

            <p>
              🎙️ Fun sports commentary
            </p>
  <p>
    🆓 100% Free to Use
  </p>
            <p>
              ☁️ Saved online - no spreadsheets needed
           </p>

            <p>
              🚫 No downloads or signups needed
           </p>
<p>
📱 Works great on phones
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