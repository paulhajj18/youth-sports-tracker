"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { db } from "@/lib/firebase";

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function SeasonPage() {

  const router = useRouter();

  const [playerId, setPlayerId] =
    useState("");

  const [games, setGames] =
    useState<any[]>([]);

  const [totals, setTotals] =
    useState<any>(null);

  // AUTO-FILL LAST PLAYER
  useEffect(() => {
    const storedPlayerId =
      localStorage.getItem(
        "activePlayerId"
      );

    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    }
  }, []);

  const loadSeasonStats =
    async () => {

      if (!playerId.trim()) return;

      // QUERY GAMES
      const q = query(
        collection(db, "games"),

        where(
          "playerId",
          "==",
          playerId.trim()
        )
      );



      const querySnapshot =
        await getDocs(q);

// NO RESULTS

if (querySnapshot.empty) {

  alert(
    "No games found for this Player ID."
  );

  setGames([]);

  setTotals(null);

  return;
}

      const gameList: any[] = [];

      querySnapshot.forEach((doc) => {
        gameList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setGames(gameList);

      // TOTALS
      let singles = 0;
      let doubles = 0;
      let triples = 0;
      let homeruns = 0;

      let strikeouts = 0;
      let groundOuts = 0;
      let flyOuts = 0;

let walks = 0;
let hbp = 0;

let stolenBases = 0;

      let rbi = 0;
      let runs = 0;

      gameList.forEach((game) => {

        singles += game.single || 0;
        doubles += game.double || 0;
        triples += game.triple || 0;
        homeruns += game.homerun || 0;

        strikeouts += game.strikeout || 0;
        groundOuts += game.ground_out || 0;
        flyOuts += game.fly_out || 0;

walks += game.walk || 0;
hbp += game.hit_by_pitch || 0;

stolenBases += game.stolen_base || 0;

        rbi += game.rbi || 0;
        runs += game.run_scored || 0;
      });

      // HITS
      const hits =
        singles +
        doubles +
        triples +
        homeruns;

      // AT BATS
      const atBats =
        hits +
        strikeouts +
        groundOuts +
        flyOuts;

      // AVG
      const avg =
        atBats > 0
          ? (hits / atBats).toFixed(3)
          : ".000";

      // OBP
      const obpDenominator =
        atBats + walks + hbp;

      const obp =
        obpDenominator > 0
          ? (
              (hits + walks + hbp) /
              obpDenominator
            ).toFixed(3)
          : ".000";

      setTotals({
        gamesPlayed: gameList.length,

        hits,
        atBats,
        avg,
        obp,

        singles,
        doubles,
        triples,
        homeruns,

        rbi,
        runs,

walks,
hbp,

stolenBases,

strikeouts,

      });
    };
const deleteGame =
  async (gameId: string) => {

    const confirmed = confirm(
      "Delete this game permanently?"
    );

    if (!confirmed) return;

    // DELETE GAME
    await deleteDoc(
      doc(db, "games", gameId)
    );

    // REMOVE FROM UI
    const updatedGames =
      games.filter(
        (game) => game.id !== gameId
      );

    setGames(updatedGames);

    // RELOAD TOTALS
    loadSeasonStats();
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
            📊
          </div>

          <h1 className="text-4xl font-extrabold drop-shadow-2xl text-center leading-tight">
            Season Stats
          </h1>

          <div className="text-3xl shrink-0">
            ⚾
          </div>

        </div>

        {/* SUBTITLE */}
        <p className="text-lg text-gray-200 mb-6 leading-relaxed">
          View season totals, averages, and game history.
        </p>

        {/* MAIN CARD */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/10">

          <h2 className="text-lg font-bold mb-3">
            Enter Player ID
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
            placeholder="Paul-235059"
            value={playerId}
            onChange={(e) =>
              setPlayerId(e.target.value)
            }
          />

          <button
            onClick={loadSeasonStats}
            className="
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
            "
          >
            📊 View Season Stats
          </button>
  <h3 className="text-center text-xs text-gray-300 mt-1 tracking-widest opacity-80">
  www.youthsportstracker.com
</h3>
          {/* SEASON TOTALS */}
          {totals && (

            <div className="
              mt-6
              bg-black/30
              border
              border-white/10
              rounded-3xl
              p-5
            ">

              <h2 className="text-2xl font-bold mb-4 text-center">
                Season Totals
              </h2>

              <div className="grid grid-cols-3 gap-3 text-center">

<div className="bg-slate-700 rounded-2xl p-2">
  <p className="text-xs text-gray-200">
    GP
  </p>

  <p className="text-xl font-bold">
    {totals.gamesPlayed}
  </p>
</div>

                <div className="bg-green-700 rounded-2xl p-2">
                  <p className="text-xs text-gray-200">
                    AVG
                  </p>

                  <p className="text-xl font-bold">
                    {totals.avg}
                  </p>
                </div>

                <div className="bg-blue-700 rounded-2xl p-2">
                  <p className="text-xs text-gray-200">
                    OBP
                  </p>

                  <p className="text-xl font-bold">
                    {totals.obp}
                  </p>
                </div>

                <div className="bg-red-700 rounded-2xl p-2">
                  <p className="text-xs text-gray-200">
                    H
                  </p>

                  <p className="text-xl font-bold">
                    {totals.hits}
                  </p>
                </div>

                <div className="bg-yellow-600 rounded-2xl p-2">
                  <p className="text-xs text-gray-200">
                    HR
                  </p>

                  <p className="text-xl font-bold text-black">
                    {totals.homeruns}
                  </p>
                </div>

                <div className="bg-purple-700 rounded-2xl p-2">
                  <p className="text-xs text-gray-200">
                    RBI
                  </p>

                  <p className="text-xl font-bold">
                    {totals.rbi}
                  </p>
                </div>

                <div className="bg-cyan-700 rounded-2xl p-2">
                  <p className="text-xs text-gray-200">
                    RUN
                  </p>

                  <p className="text-xl font-bold">
                    {totals.runs}
                  </p>
                </div>

                <div className="bg-emerald-700 rounded-2xl p-2">
                  <p className="text-xs text-gray-200">
                    AB
                  </p>

                  <p className="text-xl font-bold">
                    {totals.atBats}
                  </p>
                </div>

                <div className="bg-indigo-700 rounded-2xl p-2">
                  <p className="text-xs text-gray-200">
                    1B
                  </p>

                  <p className="text-xl font-bold">
                    {totals.singles}
                  </p>
                </div>

                <div className="bg-sky-700 rounded-2xl p-2">
                  <p className="text-xs text-gray-200">
                    2B
                  </p>

                  <p className="text-xl font-bold">
                    {totals.doubles}
                  </p>
                </div>

                <div className="bg-pink-700 rounded-2xl p-2">
                  <p className="text-xs text-gray-200">
                    3B
                  </p>

                  <p className="text-xl font-bold">
                    {totals.triples}
                  </p>
                </div>

                <div className="bg-orange-700 rounded-2xl p-2">
                  <p className="text-xs text-gray-200">
                    BB
                  </p>

                  <p className="text-xl font-bold">
                    {totals.walks}
                  </p>
                </div>

                <div className="bg-rose-700 rounded-2xl p-2">
                  <p className="text-xs text-gray-200">
                    SO
                  </p>

                  <p className="text-xl font-bold">
                    {totals.strikeouts}
                  </p>
                </div>
<div className="bg-teal-700 rounded-xl p-2">
  <p className="text-[10px] text-gray-200">
    SB
  </p>

  <p className="text-xl font-bold">
    {totals.stolenBases}
  </p>
</div>

<div className="bg-lime-700 rounded-xl p-2">
  <p className="text-[10px] text-gray-200">
    HBP
  </p>

  <p className="text-xl font-bold">
    {totals.hbp}
  </p>
</div>
              </div>

            </div>

          )}

          {/* GAME HISTORY */}
          {games.length > 0 && (

            <div className="mt-6 text-left">

              <h3 className="text-lg font-bold mb-3 text-center">
                Game History
              </h3>

              <div className="space-y-3">

                {games.map((game) => (

                  <div
                    key={game.id}
                    className="
                      bg-black/30
                      border
                      border-white/10
                      rounded-2xl
                      p-4
                    "
                  >

                    <div className="flex items-center justify-between mb-2">

                      <p className="font-bold text-green-300">
                        {game.kidName}
                      </p>

                      <div className="flex gap-2">

  <button
    onClick={() =>
      router.push(`/game/${game.id}/summary`)
    }
    className="
      bg-blue-600
      hover:bg-blue-700
      px-3
      py-1
      rounded-xl
      text-xs
      font-semibold
      transition-all
    "
  >
    View
  </button>

  <button
    onClick={() =>
      deleteGame(game.id)
    }
    className="
      bg-red-600
      hover:bg-red-700
      px-3
      py-1
      rounded-xl
      text-xs
      font-semibold
      transition-all
    "
  >
    Delete
  </button>

</div>

                    </div>

                    <p className="text-sm text-gray-300 mb-2">
                      Game ID: {game.id}
                    </p>
<p className="text-sm text-yellow-300 mb-2">
  📅 {game.gameDate || "Unknown Date"}
</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-200">

                      <div>
                        Hits: {(game.single || 0) + (game.double || 0) + (game.triple || 0) + (game.homerun || 0)}
                      </div>

                      <div>
                        RBI: {game.rbi || 0}
                      </div>

                      <div>
                        Runs: {game.run_scored || 0}
                      </div>

                      <div>
                        HR: {game.homerun || 0}
                      </div>

                      <div>
                        Walks: {game.walk || 0}
                      </div>

                      <div>
                        Strikeouts: {game.strikeout || 0}
                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

        </div>

        {/* FEATURE BOX */}
        <div className="mt-5 bg-black/30 rounded-2xl p-4 backdrop-blur-sm border border-white/5">

          <div className="space-y-2 text-sm text-gray-200">

            <p>
              ⚾ View season batting stats
            </p>

            <p>
              📊 Track totals & averages
            </p>

            <p>
              📲 Share player stats with family & friends
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
