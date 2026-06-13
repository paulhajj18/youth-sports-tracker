"use client";

import { useEffect, useState } from "react";
import {
  useRouter,
  useParams,
} from "next/navigation";

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

const params = useParams();

const playerSlug =
  params.playerSlug as string;

  const [playerId, setPlayerId] =
    useState("");

  const [games, setGames] =
    useState<any[]>([]);

  const [totals, setTotals] =
    useState<any>(null);

const [playerName, setPlayerName] =
  useState("");

  // AUTO-FILL LAST PLAYER
useEffect(() => {

  loadPlayerFromSlug();

}, [playerSlug]);

useEffect(() => {

  if (playerId) {
    loadSeasonStats();
  }

}, [playerId]);

const loadPlayerFromSlug =
  async () => {

    if (!playerSlug) return;

    const q = query(
      collection(db, "players"),
      where(
        "publicSlug",
        "==",
        playerSlug
      )
    );

    const querySnapshot =
      await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    const playerData =
      querySnapshot.docs[0].data();

setPlayerName(
  playerData.firstName || ""
);

    setPlayerId(
      playerData.playerId
    );
  };

  const loadSeasonStats =
    async () => {

      if (!playerId.trim()) return;

      // QUERY GAMES
      const q = query(
        collection(db, "basketballGames"),

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

const gameList = querySnapshot.docs
  .map((doc): any => ({
    id: doc.id,
    ...doc.data(),
  }))
  .sort((a: any, b: any) =>
    new Date(b.gameDate).getTime() -
    new Date(a.gameDate).getTime()
  );

setGames(gameList);


// BASKETBALL TOTALS

let points = 0;
let rebounds = 0;
let assists = 0;
let steals = 0;
let blocks = 0;
let turnovers = 0;

let fgMade = 0;
let fgAttempted = 0;

let threeMade = 0;
let threeAttempted = 0;

let ftMade = 0;
let ftAttempted = 0;

gameList.forEach((game) => {
  points += game.points || 0;
  rebounds += game.rebounds || 0;
  assists += game.assists || 0;
  steals += game.steals || 0;
  blocks += game.blocks || 0;
  turnovers += game.turnovers || 0;

  fgMade += game.fgMade || 0;
  fgAttempted += game.fgAttempted || 0;

  threeMade += game.threeMade || 0;
  threeAttempted += game.threeAttempted || 0;

  ftMade += game.ftMade || 0;
  ftAttempted += game.ftAttempted || 0;
});

const gamesPlayed =
  gameList.length || 1;

const ppg =
  (points / gamesPlayed).toFixed(1);

const rpg =
  (rebounds / gamesPlayed).toFixed(1);

const apg =
  (assists / gamesPlayed).toFixed(1);

const spg =
  (steals / gamesPlayed).toFixed(1);

const bpg =
  (blocks / gamesPlayed).toFixed(1);

const topg =
  (turnovers / gamesPlayed).toFixed(1);

const fgPct =
  fgAttempted > 0
    ? ((fgMade / fgAttempted) * 100).toFixed(1)
    : "0.0";

const threePct =
  threeAttempted > 0
    ? ((threeMade / threeAttempted) * 100).toFixed(1)
    : "0.0";

const ftPct =
  ftAttempted > 0
    ? ((ftMade / ftAttempted) * 100).toFixed(1)
    : "0.0";

setTotals({
  gamesPlayed,

  ppg,
  rpg,
  apg,
  spg,
  bpg,
  topg,

  fgPct,
  threePct,
  ftPct,
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
`${window.location.origin}/basketball/season/${publicSlug}`;

    if (navigator.share) {

      navigator.share({
        title:
`${playerData.firstName}'s Season Stats`,

text:
`Check out ${playerData.firstName}'s basketball season stats! 🏀`,

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
      doc(db, "basketballGames", gameId)
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
      "url('/images/basketball-kids.png')",

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
           🏀
          </div>

        </div>

        {/* SUBTITLE */}
        <p className="text-lg text-gray-200 mb-6 leading-relaxed">
          View season totals, averages, and game history.
        </p>

        {/* MAIN CARD */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/10">



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
      📊 {playerName}'s Season Stats
    </h2>

{/* FEATURED STATS */}
<div className="grid grid-cols-2 gap-3 mb-4">

  <div className="bg-orange-500 text-black rounded-2xl p-4 text-center shadow-lg">
    <p className="text-xs font-semibold opacity-80">
      Points Per Game
    </p>

    <p className="text-4xl font-black">
      {totals.ppg}
    </p>

    <p className="text-xs mt-1">
      PPG
    </p>
  </div>

  <div className="bg-green-700 rounded-2xl p-4 text-center shadow-lg">
    <p className="text-xs text-green-100">
      Rebounds Per Game
    </p>

    <p className="text-4xl font-black">
      {totals.rpg}
    </p>

    <p className="text-xs text-green-100 mt-1">
      RPG
    </p>
  </div>

  <div className="bg-blue-700 rounded-2xl p-4 text-center shadow-lg">
    <p className="text-xs text-blue-100">
      Assists Per Game
    </p>

    <p className="text-4xl font-black">
      {totals.apg}
    </p>

    <p className="text-xs text-blue-100 mt-1">
      APG
    </p>
  </div>

  <div className="bg-pink-700 rounded-2xl p-4 text-center shadow-lg">
    <p className="text-xs text-pink-100">
      Steals Per Game
    </p>

    <p className="text-4xl font-black">
      {totals.spg}
    </p>

    <p className="text-xs text-pink-100 mt-1">
      SPG
    </p>
  </div>

</div>

{/* SECONDARY STATS */}
<div className="grid grid-cols-3 gap-3 text-center mb-4">

  <div className="bg-cyan-700 rounded-2xl p-3">
    <p className="text-[11px] opacity-80">
      BPG
    </p>

    <p className="text-2xl font-bold">
      {totals.bpg}
    </p>
  </div>

  <div className="bg-yellow-500 text-black rounded-2xl p-3">
    <p className="text-[11px] opacity-80">
      TOPG
    </p>

    <p className="text-2xl font-bold">
      {totals.topg}
    </p>
  </div>

  <div className="bg-indigo-700 rounded-2xl p-3">
    <p className="text-[11px] opacity-80">
      GP
    </p>

    <p className="text-2xl font-bold">
      {totals.gamesPlayed}
    </p>
  </div>

</div>
{/* SHOOTING PERCENTAGES */}
<div className="grid grid-cols-3 gap-3 text-center">

  <div className="bg-green-800 rounded-2xl p-3">
    <p className="text-[11px] opacity-80">
      FG%
    </p>

    <p className="text-2xl font-bold">
      {totals.fgPct}%
    </p>
  </div>

  <div className="bg-blue-700 rounded-2xl p-3">
    <p className="text-[11px] opacity-80">
      3PT%
    </p>

    <p className="text-2xl font-bold">
      {totals.threePct}%
    </p>
  </div>

  <div className="bg-purple-700 rounded-2xl p-3">
    <p className="text-[11px] opacity-80">
      FT%
    </p>

    <p className="text-2xl font-bold">
      {totals.ftPct}%
    </p>
  </div>

</div>


  <h3 className="text-center text-xs text-gray-300 mt-1 tracking-widest opacity-80">
  www.youthsportstracker.com
</h3>
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
      router.push(`/basketball/game/${game.id}/summary`)
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



</div>

                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      Game ID: {game.id}
                    </p>
<p className="text-sm text-yellow-300 mb-2">
  📅 {game.gameDate || "Unknown Date"}
</p>


<div className="flex justify-between text-sm mb-2">

  <span className="text-green-300 font-semibold">
    {game.teamName || "Our Team"}
  </span>

  <span className="font-bold text-white">
    {game.homeScore || 0} - {game.awayScore || 0}
  </span>

  <span className="text-red-300 font-semibold">
    {game.opponentName || "Other Team"}
  </span>

</div>

<div className="grid grid-cols-2 gap-2 text-sm text-gray-200">

  <div>
    PTS: {game.points || 0}
  </div>

  <div>
    REB: {game.rebounds || 0}
  </div>

  <div>
    AST: {game.assists || 0}
  </div>

  <div>
    STL: {game.steals || 0}
  </div>

  <div>
    BLK: {game.blocks || 0}
  </div>

  <div>
    TO: {game.turnovers || 0}
  </div>

  <div>
    FG: {game.fgMade || 0}-{game.fgAttempted || 0}
  </div>

  <div>
    3PT: {game.threeMade || 0}-{game.threeAttempted || 0}
  </div>

  <div>
    FT: {game.ftMade || 0}-{game.ftAttempted || 0}
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
              ⚾ View season averages
            </p>

            <p>
             📊 Track game-by-game performance
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
              © 2026 Youth Sports Tracker 🏀
            </footer>

          </div>

        </div>

      </div>

    </div>
  );
}
