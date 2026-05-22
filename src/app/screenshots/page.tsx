"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ScreenshotsPage() {

  const router = useRouter();

  return (
    <div className="relative min-h-screen p-6 flex items-center justify-center overflow-hidden">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/baseball-kids.png')",
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70" />

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-3xl text-white">

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

        {/* MAIN CARD */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10">

          {/* TITLE */}
          <h1 className="text-4xl font-extrabold mb-3 text-center">
            📸 Screenshots
          </h1>

          {/* SUBTITLE */}
          <p className="text-center text-gray-200 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
            See how Youth Sports Tracker works during live games,
            stat tracking, commentary, and season summaries.
          </p>

          {/* SCREENSHOTS */}
          <div className="space-y-14">

            {/* LIVE BUTTONS */}
            <div className="text-center">

              <h2 className="font-bold text-2xl mb-5 text-green-400">
                ⚡ Live Tracking Buttons
              </h2>

              <div className="
                overflow-hidden
                rounded-2xl
                border
                border-white/50
                shadow-xl
                transition-all
                duration-300
                hover:scale-[1.01]
                hover:shadow-2xl
              ">
                <Image
                  src="/images/live_buttons.jpg"
                  alt="Live Tracking Buttons"
                  width={1400}
                  height={900}
                  className="w-full h-auto"
                  priority
                />
              </div>

              <p className="text-gray-200 mt-5 leading-relaxed max-w-2xl mx-auto">
                Quickly track hits, walks, strikeouts, RBIs,
                stolen bases, runs scored, and more during the game.
              </p>

            </div>

            {/* LIVE VIEW */}
            <div className="text-center">

              <h2 className="font-bold text-2xl mb-5 text-blue-400">
                📲 Live Game View
              </h2>

              <div className="
                overflow-hidden
                rounded-2xl
                border
                border-white/50
                shadow-xl
                transition-all
                duration-300
                hover:scale-[1.01]
                hover:shadow-2xl
              ">
                <Image
                  src="/images/live_view.jpg"
                  alt="Live Game View"
                  width={1400}
                  height={900}
                  className="w-full h-auto"
                />
              </div>

              <p className="text-gray-200 mt-5 leading-relaxed max-w-2xl mx-auto">
                Family and friends can follow the game live
                from anywhere using a simple shared link.
              </p>

            </div>

            {/* COMMENTARY */}
            <div className="text-center">

              <h2 className="font-bold text-2xl mb-5 text-pink-400">
                🎙️ Live Commentary
              </h2>

              <div className="
                overflow-hidden
                rounded-2xl
                border
                border-white/50
                shadow-xl
                transition-all
                duration-300
                hover:scale-[1.01]
                hover:shadow-2xl
              ">
                <Image
                  src="/images/live_commentary.jpg"
                  alt="Live Commentary"
                  width={1400}
                  height={900}
                  className="w-full h-auto"
                />
              </div>

              <p className="text-gray-200 mt-5 leading-relaxed max-w-2xl mx-auto">
                Add exciting live commentary, big moments,
                reactions, and updates throughout the game.
              </p>

            </div>

            {/* SEASON STATS */}
            <div className="text-center">

              <h2 className="font-bold text-2xl mb-5 text-yellow-400">
                📊 Season Stats
              </h2>

              <div className="
                overflow-hidden
                rounded-2xl
                border
                border-white/50
                shadow-xl
                transition-all
                duration-300
                hover:scale-[1.01]
                hover:shadow-2xl
              ">
                <Image
                  src="/images/season_stats.png"
                  alt="Season Stats"
                  width={1400}
                  height={900}
                  className="w-full h-auto"
                />
              </div>

              <p className="text-gray-200 mt-5 leading-relaxed max-w-2xl mx-auto">
                Automatically calculate season batting averages,
                OBP, totals, games played, and cumulative stats.
              </p>

            </div>

          </div>

        </div>

        {/* FOOTER */}
        <footer className="text-center text-xs text-gray-400 py-4">
          © 2026 Youth Sports Tracker
        </footer>

      </div>

    </div>
  );
}