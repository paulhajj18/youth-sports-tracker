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
      let sacFlies = 0;
      let strikeouts = 0;
      let groundOuts = 0;
      let flyOuts = 0;
      let reachedOnError = 0;
      let fieldersChoice = 0;


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
sacFlies += game.sac_fly || 0;
reachedOnError +=
  game.reached_on_error || 0;

fieldersChoice +=
  game.fielders_choice || 0;

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
  flyOuts +
  reachedOnError +
  fieldersChoice;


const avg =
  atBats > 0
    ? (hits / atBats)
        .toFixed(3)
        .replace(/^0/, "")
    : ".000";


// OBP
const obpDenominator =
  atBats + walks + hbp + sacFlies;

const obp =
  obpDenominator > 0
    ? (
        (hits + walks + hbp) /
        obpDenominator
      )
        .toFixed(3)
        .replace(/^0/, "")
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

// SHARE SEASON STATS
const shareSeasonStats =
  async () => {

    if (!playerId) return;

    // LOOKUP PLAYER
    const q = query(
      collection(db, "players"),

      where(
        "playerId",
        "==",
        playerId
      )
    );

    const querySnapshot =
      await getDocs(q);

    if (querySnapshot.empty) {
      alert("Player not found.");
      return;
    }

    const playerData =
      querySnapshot.docs[0].data();

    const publicSlug =
      playerData.publicSlug;

    const url =
`${window.location.origin}/season/${publicSlug}`;

    if (navigator.share) {

      navigator.share({
        title:
`${playerData.firstName}'s Season Stats`,

        text:
"Check out these season stats!",

        url,
      });

    } else {

      navigator.clipboard.writeText(
        url
      );

      alert(
        "Season stats link copied!"
      );
    }
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
  className="
    absolute
    inset-0
    bg-repeat
    opacity-80
  "
  style={{
    backgroundImage:
      "url('/images/baseball-kids.png')",

    backgroundSize: "350px",
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
{games.length > 0 && (

  <button
    onClick={shareSeasonStats}
    className="
      mt-4
      w-full
      bg-green-600
      hover:bg-green-700
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
    📲 Share Season Stats
  </button>
)}

{/* SEASON TOTALS */}
{totals && (

<div className="
  mt-6
  bg-slate-900/70
  backdrop-blur-md
  border
  border-white/10
  rounded-3xl
  p-5
  shadow-2xl
">

    <h2 className="text-2xl font-bold mb-5 text-center">
      📊 Season Totals
    </h2>

    {/* FEATURED STATS */}
    <div className="grid grid-cols-2 gap-3 mb-4">

      {/* AVG */}
      <div className="
        bg-orange-500
        text-black
        rounded-2xl
        p-4
        text-center
        shadow-lg
      ">
        <p className="text-xs font-semibold opacity-80">
          Batting Average
        </p>

        <p className="text-4xl font-black">
          {totals.avg}
        </p>

        <p className="text-xs mt-1">
          AVG
        </p>
      </div>

      {/* HITS */}
      <div className="
        bg-green-700
        rounded-2xl
        p-4
        text-center
        shadow-lg
      ">
        <p className="text-xs text-green-100">
          Total Hits
        </p>

        <p className="text-4xl font-black">
          {totals.hits}
        </p>

        <p className="text-xs text-green-100 mt-1">
          HITS
        </p>
      </div>

      {/* RBI */}
      <div className="
        bg-blue-700
        rounded-2xl
        p-4
        text-center
        shadow-lg
      ">
        <p className="text-xs text-blue-100">
          Runs Batted In
        </p>

        <p className="text-4xl font-black">
          {totals.rbi}
        </p>

        <p className="text-xs text-blue-100 mt-1">
          RBI
        </p>
      </div>

      {/* RUNS */}
      <div className="
        bg-pink-700
        rounded-2xl
        p-4
        text-center
        shadow-lg
      ">
        <p className="text-xs text-pink-100">
          Runs Scored
        </p>

        <p className="text-4xl font-black">
          {totals.runs}
        </p>

        <p className="text-xs text-pink-100 mt-1">
          RUNS
        </p>
      </div>

    </div>

{/* SECONDARY STATS */}
<div className="grid grid-cols-3 gap-3 text-center mb-4">

  <div className="bg-cyan-700 rounded-2xl p-3">
    <p className="text-[11px] opacity-80">
      OBP
    </p>

    <p className="text-2xl font-bold">
      {totals.obp}
    </p>
  </div>

  <div className="bg-yellow-500 text-black rounded-2xl p-3">
    <p className="text-[11px] opacity-80">
      HR
    </p>

    <p className="text-2xl font-bold">
      {totals.homeruns}
    </p>
  </div>

  <div className="bg-indigo-700 rounded-2xl p-3">
    <p className="text-[11px] opacity-80">
      SB
    </p>

    <p className="text-2xl font-bold">
      {totals.stolenBases}
    </p>
  </div>

</div>

    {/* DETAIL STATS */}
    <div className="grid grid-cols-3 gap-3 text-center">

      <div className="bg-green-800 rounded-2xl p-3">
        <p className="text-[11px] opacity-80">
          1B
        </p>

        <p className="text-xl font-bold">
          {totals.singles}
        </p>
      </div>

      <div className="bg-sky-700 rounded-2xl p-3">
        <p className="text-[11px] opacity-80">
          2B
        </p>

        <p className="text-xl font-bold">
          {totals.doubles}
        </p>
      </div>

      <div className="bg-purple-700 rounded-2xl p-3">
        <p className="text-[11px] opacity-80">
          3B
        </p>

        <p className="text-xl font-bold">
          {totals.triples}
        </p>
      </div>

      <div className="bg-cyan-800 rounded-2xl p-3">
        <p className="text-[11px] opacity-80">
          BB
        </p>

        <p className="text-xl font-bold">
          {totals.walks}
        </p>
      </div>

      <div className="bg-red-700 rounded-2xl p-3">
        <p className="text-[11px] opacity-80">
          SO
        </p>

        <p className="text-xl font-bold">
          {totals.strikeouts}
        </p>
      </div>

      <div className="bg-lime-700 rounded-2xl p-3">
        <p className="text-[11px] opacity-80">
          HBP
        </p>

        <p className="text-xl font-bold">
          {totals.hbp}
        </p>
      </div>

{/* BOTTOM ROW */}
<div className="grid grid-cols-2 gap-3 mt-3 col-span-3">

  {/* AB */}
  <div className="bg-slate-800 rounded-2xl p-3 text-center">
    <p className="text-[11px] opacity-80">
      AB
    </p>

    <p className="text-2xl font-bold">
      {totals.atBats}
    </p>
  </div>

  {/* GP */}
  <div className="bg-slate-700 rounded-2xl p-3 text-center">
    <p className="text-[11px] opacity-80">
      GP
    </p>

    <p className="text-2xl font-bold">
      {totals.gamesPlayed}
    </p>
  </div>

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
  bg-slate-900/70
  backdrop-blur-md
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
    router.push(
      `/game/${game.id}?edit=${game.editToken}`
    )
  }
  className="
    bg-yellow-500
    hover:bg-yellow-700
    px-3
    py-1
    rounded-xl
    text-xs
    text-black
    font-semibold
    transition-all
  "
>
  Edit
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

                    <p className="text-sm text-gray-600 mb-2">
                      Game ID: {game.id}
                    </p>
<p className="text-sm text-yellow-300 mb-2">
  📅 {game.gameDate || "Unknown Date"}
</p>
  <p className="text-xs text-cyan-300">
    {game.teamName} vs {game.opponentName}
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
              © 2026 Youth Sports Tracker ⚾
            </footer>

          </div>

        </div>

      </div>

    </div>
  );
}
