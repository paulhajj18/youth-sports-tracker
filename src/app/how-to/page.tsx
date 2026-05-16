"use client";

import { useRouter } from "next/navigation";

export default function HowToPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen p-6 flex items-center justify-center">

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
      <div className="relative z-10 w-full max-w-2xl text-white">

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10">

          <h1 className="text-4xl font-extrabold mb-6 text-center">
            ⚾ How To Use
          </h1>

          <div className="space-y-6 text-lg leading-relaxed text-gray-100">

            <div>
              <h2 className="font-bold text-2xl mb-2 text-green-400">
                1. Start A Game
              </h2>

              <p>
                Enter your kid's name on the
                main screen and tap the
                <strong> Play Ball! </strong>
                button.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mb-2 text-blue-400">
                2. Track Live Stats
              </h2>

              <p>
                Use the simple stat buttons to
                track your player's hits, outs, walks, RBI,
                stolen bases, runs scored, and
                more throughout the game.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mb-2 text-yellow-400">
                3. Share Live Updates
              </h2>

              <p>
                Tap the
                <strong> Share </strong>
                button during the game to send
                a live game tracker
                to family & friends.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mb-2 text-pink-400">
                4. Add Commentary
              </h2>

              <p>
                Add your own live commentary
                and reactions throughout the
                game for others to follow.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mb-2 text-cyan-400">
                5. View Final Summary
              </h2>

              <p>
                At the end of the game, tap
                <strong> View Summary </strong>
                to see final stats, averages,
                OBP, and game totals.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mb-2 text-red-400">
                6. Share Final Results
              </h2>

              <p>
                Share the Summary page with
                family & friends, or save the unique game URL 
                link for future reference.
              </p>
            </div>

          </div>

          {/* BACK BUTTON */}
          <button
            onClick={() => router.push("/")}
            className="
              mt-8
              w-full
              bg-green-500
              hover:bg-green-600
              transition
              text-white
              font-bold
              p-4
              rounded-2xl
              text-lg
            "
          >
            ⚾ Back To Home
          </button>

        </div>

      </div>
    </div>
  );
}