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
                track your player's hits, outs,
                walks, RBI, stolen bases,
                runs scored, and more
                throughout the game.
                <br />
                <br />
                Tracking every player on the team is work 🤓,
                <strong> but tracking just your own kid is fun!</strong> 😎
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
                Add your own live commentary,
                big moments, and reactions
                throughout the game for others
                to follow in real time.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mb-2 text-cyan-400">
                5. View Final Summary
              </h2>

              <p>
                At the end of the game, tap
                <strong> View Summary </strong>
                to see final stats, batting averages,
                OBP, game totals, and more.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mb-2 text-orange-400">
                6. Season Stats & Player IDs
              </h2>

              <p>
                Every player has their own
                unique Player ID.
                <br />
                <br />
                Use the
                <strong> Season Stats </strong>
                page to pull up cumulative stats
                across all saved games, including
                totals, averages, OBP, games played,
                and more.
                <br />
                <br />
                You can also share a player's
                stats page with family & friends.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mb-2 text-red-400">
                7. Save & Share Results
              </h2>

              <p>
                Share the final Summary page
                with family & friends, or save
                the unique game URL for future
                reference anytime during the season.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mb-2 text-lime-400">
                BONUS FEATURES
              </h2>

              <ul className="list-disc pl-6 space-y-2">
                <li>📱 Works great on phones</li>
                <li>🔗 Live shareable game links</li>
                <li>📊 Automatic batting averages & OBP</li>
                <li>☁️ Saved online — no spreadsheets needed</li>
                <li>🆓 Totally free to use</li>
              </ul>
            </div>

          </div>

        </div>

        <footer className="text-center text-xs text-gray-400 py-3">
          © 2026 Youth Sports Tracker
        </footer>

      </div>
    </div>
  );
}