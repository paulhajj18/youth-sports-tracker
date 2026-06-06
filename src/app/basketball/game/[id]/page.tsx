"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";

import {
  doc,
  onSnapshot,
  updateDoc,
  increment,
  arrayUnion,
serverTimestamp,
} from "firebase/firestore";

type Stats = {
  points: number;

  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;

  fgMade: number;
  fgAttempted: number;

  threeMade: number;
  threeAttempted: number;

  ftMade: number;
  ftAttempted: number;
};

type ActionLog = {
  type: string;
  timestamp: number;
};

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();


const gameId = params.id as string;

const editParam =
  searchParams.get("edit");

const [canEdit, setCanEdit] =
  useState(false);


const gameRef = doc(
  db,
  "basketballGames",
  gameId
);

  const [kidName, setKidName] = useState("");

  const [gameDate, setGameDate] =
    useState("");

  const dateInputRef = useRef<HTMLInputElement>(null);

  const [teamName, setTeamName] =
    useState("");

  const [opponentName, setOpponentName] =
    useState("");

const [homeScore, setHomeScore] =
  useState(0);

const [awayScore, setAwayScore] =
  useState(0);

const [quarter, setQuarter] =
  useState(1);

const [gameStatus, setGameStatus] =
  useState("live");

const [stats, setStats] = useState<Stats>({
  points: 0,

  rebounds: 0,
  assists: 0,
  steals: 0,
  blocks: 0,
  turnovers: 0,

  fgMade: 0,
  fgAttempted: 0,

  threeMade: 0,
  threeAttempted: 0,

  ftMade: 0,
  ftAttempted: 0,
});

type CommentItem = {
  text: string;
  timestamp: number;
};

const [comments, setComments] = useState<CommentItem[]>([]);

  const [log, setLog] = useState<ActionLog[]>(
    []
  );

  const [comment, setComment] = useState("");

  const [activeButton, setActiveButton] =
    useState("");


const [activePlayerId, setActivePlayerId] =
  useState("");

// LOAD ACTIVE PLAYER ONLY FOR NEW GAMES
useEffect(() => {

  async function setupPlayer() {

    const storedPlayerId =
      localStorage.getItem(
        "activePlayerId"
      );

    // FIRST CHECK IF GAME ALREADY HAS PLAYER
    const unsub = onSnapshot(
      gameRef,
      async (snap) => {

        const data = snap.data();

        if (!data) return;

        // EXISTING GAME PLAYER
        if (data.playerId) {

          setActivePlayerId(
            data.playerId
          );

        } else if (storedPlayerId) {

          // NEW GAME ONLY
          setActivePlayerId(
            storedPlayerId
          );

          await updateDoc(gameRef, {
            playerId: storedPlayerId,
          });
        }
      }
    );

    return () => unsub();
  }

  setupPlayer();

}, []);


  // LIVE SYNC

  useEffect(() => {
    const unsub = onSnapshot(gameRef, (snap) => {
      const data = snap.data();

      if (!data) return;

setGameStatus(
  data.gameStatus || "live"
);

setCanEdit(
  editParam === data.editToken
);

      setKidName(data.kidName || "Player");
      setGameDate(data.gameDate || "");

  setTeamName(
    data.teamName ?? ""
  );

  setOpponentName(
    data.opponentName ?? ""
  );

setHomeScore(
  data.homeScore || 0
);

setAwayScore(
  data.awayScore || 0
);

setQuarter(
  data.quarter || 1
);

setStats({
  points: data.points || 0,

  rebounds: data.rebounds || 0,
  assists: data.assists || 0,
  steals: data.steals || 0,
  blocks: data.blocks || 0,
  turnovers: data.turnovers || 0,

  fgMade: data.fgMade || 0,
  fgAttempted: data.fgAttempted || 0,

  threeMade: data.threeMade || 0,
  threeAttempted: data.threeAttempted || 0,

  ftMade: data.ftMade || 0,
  ftAttempted: data.ftAttempted || 0,
});


      setComments(data.comments || []);

      setLog(data.log || []);
    });

    return () => unsub();
  }, []);

  // COMMENTARY
const commentaryMap: Record<string, string> = {
  twoMade: `${kidName} knocks down a basket! 🏀`,

  twoMiss: `${kidName} misses a shot.`,

  threeMade: `${kidName} drills a three! 🎯`,

  threeMiss: `${kidName} misses from deep.`,

  ftMade: `${kidName} sinks a free throw.`,

  ftMiss: `${kidName} misses the free throw.`,

  rebound: `${kidName} grabs a rebound!`,

  assist: `${kidName} records an assist!`,

  steal: `${kidName} comes up with a steal!`,

  block: `${kidName} swats the shot!`,

  turnover: `${kidName} commits a turnover.`,
};

  // BUTTON FLASH
  const triggerFlash = (name: string) => {
    setActiveButton(name);

    setTimeout(() => {
      setActiveButton("");
    }, 200);
  };
  // ADD STAT

const addBasketballStat = async (
  action: string
) => {

triggerFlash(action);

  const updates: any = {};

  switch (action) {
case "twoMade":
  updates.points = increment(2);

  updates.homeScore = increment(2);

  updates.fgMade = increment(1);
  updates.fgAttempted = increment(1);
  break;

    case "twoMiss":
      updates.fgAttempted = increment(1);
      break;

case "threeMade":

  updates.points = increment(3);

  updates.homeScore = increment(3);

  updates.fgMade = increment(1);
  updates.fgAttempted = increment(1);

  updates.threeMade = increment(1);
  updates.threeAttempted = increment(1);

  break;

    case "threeMiss":
      updates.fgAttempted = increment(1);
      updates.threeAttempted =
        increment(1);
      break;

case "ftMade":

  updates.points = increment(1);

  updates.homeScore = increment(1);

  updates.ftMade = increment(1);
  updates.ftAttempted = increment(1);

  break;

    case "ftMiss":
      updates.ftAttempted = increment(1);
      break;

    case "rebound":
      updates.rebounds = increment(1);
      break;

    case "assist":
      updates.assists = increment(1);
      break;

    case "steal":
      updates.steals = increment(1);
      break;

    case "block":
      updates.blocks = increment(1);
      break;

    case "turnover":
      updates.turnovers = increment(1);
      break;
  }

updates.comments = arrayUnion({
  text:
    commentaryMap[action] ??
    `${kidName} records a play.`,
  timestamp: Date.now(),
});

updates.log = arrayUnion({
  type: action,
  timestamp: Date.now(),
});

  await updateDoc(gameRef, updates);
};



  // UNDO
const undoLast = async () => {
  const last = log[log.length - 1];

  if (!last) return;

  triggerFlash("undo");

  const updates: any = {
    log: log.slice(0, -1),

    comments: arrayUnion({
      text: `Undo: ${last.type}`,
      timestamp: Date.now(),
    }),
  };

  switch (last.type) {

case "twoMade":

  updates.points = increment(-2);

  updates.homeScore = increment(-2);

  updates.fgMade = increment(-1);
  updates.fgAttempted = increment(-1);

  break;

    case "twoMiss":
      updates.fgAttempted = increment(-1);
      break;

    case "threeMade":
      updates.points = increment(-3);

      updates.fgMade = increment(-1);
      updates.fgAttempted = increment(-1);

      updates.threeMade = increment(-1);
      updates.threeAttempted = increment(-1);
updates.homeScore = increment(-3);

      break;

    case "threeMiss":
      updates.fgAttempted = increment(-1);
      updates.threeAttempted = increment(-1);
      break;

    case "ftMade":
      updates.points = increment(-1);
      updates.ftMade = increment(-1);
      updates.ftAttempted = increment(-1);
updates.homeScore = increment(-1);
      break;

    case "ftMiss":
      updates.ftAttempted = increment(-1);
      break;

    case "rebound":
      updates.rebounds = increment(-1);
      break;

    case "assist":
      updates.assists = increment(-1);
      break;

    case "steal":
      updates.steals = increment(-1);
      break;

    case "block":
      updates.blocks = increment(-1);
      break;

    case "turnover":
      updates.turnovers = increment(-1);
      break;
  }

  await updateDoc(gameRef, updates);
};

  // COMMENT
  const addComment = async () => {
    if (!comment.trim()) return;

await updateDoc(gameRef, {
  comments: arrayUnion({
    text: comment,
    timestamp: Date.now(),
  }),
});
    setComment("");
  };

const fgPct =
  stats.fgAttempted > 0
    ? (
        (stats.fgMade /
          stats.fgAttempted) *
        100
      ).toFixed(0)
    : "0";

const threePct =
  stats.threeAttempted > 0
    ? (
        (stats.threeMade /
          stats.threeAttempted) *
        100
      ).toFixed(0)
    : "0";

const ftPct =
  stats.ftAttempted > 0
    ? (
        (stats.ftMade /
          stats.ftAttempted) *
        100
      ).toFixed(0)
    : "0";

  // SHARE
  const shareGame = () => {
    const url =
      `${window.location.origin}/basketball/game/${gameId}?`;

    if (navigator.share) {
      navigator.share({
        title: `Live Game for ${kidName}`,
        text: `Follow ${kidName}'s live basketball game! 🏀`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);

      alert("Read-only link copied!");
    }
  };

  const goToSummary = () => {
    window.location.href =
      `/basketball/game/${gameId}/summary`;
  };

  const buttonClass = (
    key: string,
    base: string
  ) =>
    `${base} transition-all duration-150 ${
      activeButton === key
        ? "scale-95 brightness-125"
        : ""
    }`;

const getPeriodLabel = (
  quarter: number
) => {
  if (quarter <= 4) {
    return `Q${quarter}`;
  }

  if (quarter === 5) {
    return "OT";
  }

  return `OT${quarter - 4}`;
};

return (
  <div className="relative min-h-screen">

    {/* Background Image */}
    <div
      className="absolute inset-0 opacity-40"
      style={{
        backgroundImage: "url('/images/basketball-kids.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "250px",
        filter: "grayscale(100%)",
      }}
    />

    {/* Dark Overlay */}
    <div className="absolute inset-0 bg-slate-950/80" />

    {/* Main Content */}
    <div className="relative z-10 text-white p-4 mx-auto max-w-2xl">

{/* HEADER */}

<div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-5 shadow-lg mb-4">

  <div className="flex justify-between items-start">

    <div>

      <p className="text-sm opacity-80">
        🏀 Tracking stats for
      </p>

      <h1 className="text-3xl font-bold">
        {kidName || "Player"}
      </h1>






{canEdit && activePlayerId && (
  <div className="text-left text-sm text-gray-400 mb-2 font-semibold">
    ID :
    <span className="ml-1">
      {activePlayerId}

    </span>

  </div>
)}

      <div className="mt-3">
        {canEdit ? (
<label
  onClick={() => dateInputRef.current?.showPicker()}
  className="
                relative
  overflow-hidden
  flex
              items-center
              gap-2
              bg-white/10
              hover:bg-white/20
              transition
              border
              border-white/20
              rounded-xl
              px-3
              py-2
              text-sm
              text-slate-200
              cursor-pointer
              w-fit
            "
          >
            <span>📅</span>

            <span>
              {gameDate
                ? new Date(
                    gameDate + "T12:00:00"
                  ).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )
                : "Select Game Date"}
            </span>

            <input
              ref={dateInputRef}
              type="date"
              value={gameDate}
              onChange={async (e) => {
                const value = e.target.value;

                setGameDate(value);

                await updateDoc(gameRef, {
                  gameDate: value,
                });
              }}
             className="
  absolute
  opacity-0
  inset-0
  w-full
  h-full
  cursor-pointer
"
            />
          </label>
        ) : (
          <p className="text-sm text-slate-300 mt-1">
            📅{" "}
            {gameDate
              ? new Date(
                  gameDate + "T12:00:00"
                ).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )
              : "No Game Date"}
          </p>
        )}
      </div>




    </div>

<div className="flex flex-col items-end h-full min-h-[100px]">

<div
  className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full ${
    gameStatus === "live"
      ? "bg-red-900/40 border border-red-500/30 text-red-200"
      : "bg-green-900/40 border border-green-500/30 text-green-200"
  }`}
>
  {gameStatus === "live" ? (
    <>
      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
      LIVE
    </>
  ) : (
    <>
      <span>✅</span>
      FINAL
    </>
  )}
</div>


  {canEdit && (
    <button
      onClick={shareGame}
      className="
        mt-3
        bg-white/20
        hover:bg-white/30
        transition
        text-white
        text-sm
        font-semibold
        px-3
        py-2
        rounded-xl
        backdrop-blur-sm
      "
    >
      ⚡ Share Live!
    </button>
  )}




  {canEdit && (


<button
  onClick={async () => {
    const confirmed = window.confirm(
      "End game and view final stat summary?"
    );

    if (confirmed) {

await updateDoc(gameRef, {
  gameStatus: "final",
  endedAt: serverTimestamp(),

  comments: arrayUnion({
    text: "🏁 Final buzzer! Game is complete.",
    timestamp: Date.now(),
  }),
});
      goToSummary();
    }
  }}
  className="
    mt-6
    bg-blue-950/60
    hover:bg-blue-950/90
    transition
    text-white
    text-xs
    px-3
    py-1.5
    rounded-lg
    border
    border-white/20
  "
>
  🏁 End Game

</button>


  )}



</div>

  </div>

</div>



{/* SCOREBOARD */}

<div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 mb-4">

  <div className="grid grid-cols-3 items-center text-center">

    {/* TEAM */}
    <div>

{canEdit ? (
  <input
    value={teamName}
    placeholder="Your Team"
    onChange={(e) =>
      setTeamName(e.target.value)
    }
    onBlur={async () => {
      await updateDoc(gameRef, {
        teamName,
      });
    }}
    className="
      w-full
      text-center
      text-sm
      font-semibold
      bg-slate-800
      rounded
      px-2
      py-1
    "
  />
) : (
  <p className="font-semibold text-sm truncate">
    {teamName || "Your Team"}
  </p>
)}

      <p className="text-3xl font-bold mt-1">
        {homeScore}
      </p>

      {canEdit && (
        <div className="flex justify-center gap-2 mt-2">

          <button
            onClick={async () =>
              updateDoc(gameRef, {
                homeScore: Math.max(
                  homeScore - 1,
                  0
                ),
              })
            }
            className="bg-slate-700 w-6 h-6 rounded"
          >
            -
          </button>

          <button
            onClick={async () =>
              updateDoc(gameRef, {
                homeScore:
                  homeScore + 1,
              })
            }
            className="bg-green-600 w-6 h-6 rounded"
          >
            +
          </button>

        </div>
      )}

    </div>

    {/* QUARTER */}

    <div>

      <p className="text-xs text-slate-400">
        QUARTER
      </p>

<p className="text-2xl font-bold">
  {getPeriodLabel(quarter)}
</p>

      {canEdit && (
        <div className="flex justify-center gap-2 mt-2">

          <button
            onClick={async () =>
              updateDoc(gameRef, {
                quarter: Math.max(
                  quarter - 1,
                  1
                ),
              })
            }
            className="bg-slate-700 w-6 h-6 rounded"
          >
            -
          </button>

<button
  onClick={async () =>
    updateDoc(gameRef, {
      quarter: quarter + 1,
    })
  }

            className="bg-blue-600 w-6 h-6 rounded"
          >
            +
          </button>

        </div>
      )}

    </div>

    {/* OPPONENT */}

    <div>

{canEdit ? (
  <input
    value={opponentName}
    placeholder="Opponent"
    onChange={(e) =>
      setOpponentName(e.target.value)
    }
    onBlur={async () => {
      await updateDoc(gameRef, {
        opponentName,
      });
    }}
    className="
      w-full
      text-center
      text-sm
      font-semibold
      bg-slate-800
      rounded
      px-2
      py-1
    "
  />
) : (
  <p className="font-semibold text-sm truncate">
    {opponentName || "Opponent"}
  </p>
)}

      <p className="text-3xl font-bold mt-1">
        {awayScore}
      </p>

      {canEdit && (
        <div className="flex justify-center gap-2 mt-2">

          <button
            onClick={async () =>
              updateDoc(gameRef, {
                awayScore: Math.max(
                  awayScore - 1,
                  0
                ),
              })
            }
            className="bg-slate-700 w-6 h-6 rounded"
          >
            -
          </button>

          <button
            onClick={async () =>
              updateDoc(gameRef, {
                awayScore:
                  awayScore + 1,
              })
            }
            className="bg-green-600 w-6 h-6 rounded"
          >
            +
          </button>

        </div>
      )}

    </div>

  </div>

</div>

<div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 mb-4">

  <div className="grid grid-cols-3 gap-2">

  {/* POINTS */}
  <div className="bg-indigo-700 rounded-xl p-2 text-center">
    <p className="text-[10px] opacity-80">PTS</p>
    <p className="text-lg font-bold">{stats.points}</p>
  </div>

  {/* REBOUNDS */}
  <div className="bg-green-700 rounded-xl p-2 text-center">
    <p className="text-[10px] opacity-80">REB</p>
    <p className="text-lg font-bold">{stats.rebounds}</p>
  </div>

  {/* ASSISTS */}
  <div className="bg-blue-700 rounded-xl p-2 text-center">
    <p className="text-[10px] opacity-80">AST</p>
    <p className="text-lg font-bold">{stats.assists}</p>
  </div>

  {/* STEALS */}
  <div className="bg-yellow-700 rounded-xl p-2 text-center">
    <p className="text-[10px] opacity-80">STL</p>
    <p className="text-lg font-bold">{stats.steals}</p>
  </div>

  {/* BLOCKS */}
  <div className="bg-purple-700 rounded-xl p-2 text-center">
    <p className="text-[10px] opacity-80">BLK</p>
    <p className="text-lg font-bold">{stats.blocks}</p>
  </div>

  {/* TURNOVERS */}
  <div className="bg-red-700 rounded-xl p-2 text-center">
    <p className="text-[10px] opacity-80">TO</p>
    <p className="text-lg font-bold">{stats.turnovers}</p>
  </div>

  {/* FIELD GOALS */}
  <div className="bg-emerald-700 rounded-xl p-2 text-center">
    <p className="text-[10px] opacity-80">FG</p>
    <p className="text-lg font-bold">
      {stats.fgMade}-{stats.fgAttempted}
    </p>
  </div>

  {/* THREE POINTERS */}
  <div className="bg-sky-700 rounded-xl p-2 text-center">
    <p className="text-[10px] opacity-80">3PT</p>
    <p className="text-lg font-bold">
      {stats.threeMade}-{stats.threeAttempted}
    </p>
  </div>

  {/* FREE THROWS */}
  <div className="bg-teal-700 rounded-xl p-2 text-center">
    <p className="text-[10px] opacity-80">FT</p>
    <p className="text-lg font-bold">
      {stats.ftMade}-{stats.ftAttempted}
    </p>
  </div>

</div>
</div>

{/* BUTTONS CONTAINER */}

{canEdit && (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 mb-5">

  <h3 className="text-center text-xs text-yellow-500 mt-1 tracking-widest opacity-80">
    <strong>Use buttons below to track {kidName}'s stats</strong>
  </h3>

    <div className="grid grid-cols-2 gap-3 mb-4">

      <button
        onClick={() => addBasketballStat("twoMade")}
        className={buttonClass(
          "twoMade",
          "bg-green-600 p-4 rounded-xl font-bold"
        )}
      >
        +2 Made
      </button>

      <button
        onClick={() => addBasketballStat("twoMiss")}
        className={buttonClass(
          "twoMiss",
          "bg-slate-700 p-4 rounded-xl"
        )}
      >
        2 Miss
      </button>

      <button
        onClick={() => addBasketballStat("threeMade")}
        className={buttonClass(
          "threeMade",
          "bg-blue-600 p-4 rounded-xl font-bold"
        )}
      >
        +3 Made
      </button>

      <button
        onClick={() => addBasketballStat("threeMiss")}
        className={buttonClass(
          "threeMiss",
          "bg-slate-700 p-4 rounded-xl"
        )}
      >
        3 Miss
      </button>

      <button
        onClick={() => addBasketballStat("ftMade")}
        className={buttonClass(
          "ftMade",
          "bg-purple-600 p-4 rounded-xl font-bold"
        )}
      >
        FT Made
      </button>

      <button
        onClick={() => addBasketballStat("ftMiss")}
        className={buttonClass(
          "ftMiss",
          "bg-slate-700 p-4 rounded-xl"
        )}
      >
        FT Miss
      </button>

    </div>

    <div className="grid grid-cols-3 gap-3">

      <button
        onClick={() => addBasketballStat("rebound")}
        className={buttonClass(
          "rebound",
          "bg-orange-600 p-3 rounded-xl"
        )}
      >
        Rebound
      </button>

      <button
        onClick={() => addBasketballStat("assist")}
        className={buttonClass(
          "assist",
          "bg-cyan-600 p-3 rounded-xl"
        )}
      >
        Assist
      </button>

      <button
        onClick={() => addBasketballStat("steal")}
        className={buttonClass(
          "steal",
          "bg-indigo-600 p-3 rounded-xl"
        )}
      >
        Steal
      </button>

      <button
        onClick={() => addBasketballStat("block")}
        className={buttonClass(
          "block",
          "bg-pink-600 p-3 rounded-xl"
        )}
      >
        Block
      </button>

      <button
        onClick={() => addBasketballStat("turnover")}
        className={buttonClass(
          "turnover",
          "bg-red-600 p-3 rounded-xl"
        )}
      >
        Turnover
      </button>

      <button
        onClick={undoLast}
        className={buttonClass(
          "undo",
          "bg-yellow-500 text-black p-3 rounded-xl font-bold"
        )}
      >
        Undo ↶
      </button>

    </div>

  </div>
)}
      {/* COMMENTARY */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">

        <h2 className="font-bold text-xl mb-3">
          Live Commentary 🎙️
        </h2>

        {canEdit && (
          <div className="flex gap-2 mb-4">

            <input
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              className="bg-slate-800 border border-slate-700 p-3 flex-1 rounded-xl text-white"
              placeholder="Add commentary..."
            />

            <button
              onClick={addComment}
              className="bg-blue-600 px-4 rounded-xl"
            >
              Send
            </button>

          </div>
        )}

        <div className="space-y-2">

          {comments
            .slice()
            .reverse()
            .map((c, i) => (
              <div
                key={i}
                className="bg-slate-800 rounded-xl p-3 text-sm"
              >
                {c.text}
              </div>
            ))}

        </div>
  <footer className="text-center text-xs text-gray-500 py-3">
    © 2026 Youth Sports Tracker 🏀
  </footer>
      </div>

   </div>
</div>



  );
}