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
} from "firebase/firestore";

type Stats = {
  single: number;
  double: number;
  triple: number;
  homerun: number;

  walk: number;
  hit_by_pitch: number;
  reached_on_error: number;

  rbi: number;
  stolen_base: number;
  run_scored: number;

  sac_fly: number;

  strikeout: number;

  fielders_choice: number;

  ground_out: number;
  fly_out: number;

};

type ActionLog = {
  type: keyof Stats;
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

const [isLive, setIsLive] = useState(false);

  const gameRef = doc(db, "games", gameId);

  const [kidName, setKidName] = useState("");

  const [gameDate, setGameDate] =
    useState("");

  const dateInputRef = useRef<HTMLInputElement>(null);

  const [teamName, setTeamName] =
    useState("");

  const [opponentName, setOpponentName] =
    useState("");

  const [ourScore, setOurScore] = useState(0);
  const [theirScore, setTheirScore] =
    useState(0);

  const [inning, setInning] = useState(1);

  const [stats, setStats] = useState<Stats>({
    single: 0,
    double: 0,
    triple: 0,
    homerun: 0,

hit_by_pitch: 0,
reached_on_error: 0,
sac_fly: 0,

    walk: 0,
    rbi: 0,
    stolen_base: 0,
    run_scored: 0,

   strikeout: 0,

   fielders_choice: 0,

    ground_out: 0,
    fly_out: 0,

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

setCanEdit(
  editParam === data.editToken
);

setIsLive(data.isLive ?? false);

      setKidName(data.kidName || "Player");
      setGameDate(data.gameDate || "");

  setTeamName(
    data.teamName ?? ""
  );

  setOpponentName(
    data.opponentName ?? ""
  );


      setOurScore(data.ourScore || 0);

      setTheirScore(data.theirScore || 0);

      setInning(data.inning || 1);

      setStats({
        single: data.single || 0,
        double: data.double || 0,
        triple: data.triple || 0,
        homerun: data.homerun || 0,

        walk: data.walk || 0,
        rbi: data.rbi || 0,

hit_by_pitch:
  data.hit_by_pitch || 0,

reached_on_error:
  data.reached_on_error || 0,

sac_fly:
  data.sac_fly || 0,

        stolen_base:
          data.stolen_base || 0,

        run_scored:
          data.run_scored || 0,

     strikeout:
       data.strikeout || 0,

    fielders_choice:
       data.fielders_choice || 0,

        ground_out:
          data.ground_out || 0,

        fly_out: data.fly_out || 0,


      });

      setComments(data.comments || []);

      setLog(data.log || []);
    });

    return () => unsub();
  }, []);

  // COMMENTARY
  const commentaryMap: Record<
    keyof Stats,
    string
  > = {
    single: `${kidName} rips a single!`,
    double: `${kidName} smashes a double!`,
    triple: `${kidName} blasts a triple!`,
    homerun: `WOW! ${kidName} launches a HOME RUN! ⚾`,

    walk: `${kidName} draws a walk.`,

    rbi: `${kidName} picks up an RBI!`,

    hit_by_pitch:
        `Ooof! ${kidName} is hit by the pitch.`,

    reached_on_error:
       `${kidName} reaches on an error!`,

    sac_fly:
       `${kidName} lifts a sacrifice fly!`,

    stolen_base: `${kidName} steals a base!`,

    run_scored: `${kidName} scores a run!`,

strikeout:
  `${kidName} strikes out.`,

fielders_choice:
  `${kidName} reaches on a fielder's choice.`,

    ground_out: `${kidName} grounds out.`,

    fly_out: `${kidName} flies out.`,


  };

  // BUTTON FLASH
  const triggerFlash = (name: string) => {
    setActiveButton(name);

    setTimeout(() => {
      setActiveButton("");
    }, 200);
  };
  // ADD STAT
  const addStat = async (key: keyof Stats) => {
    const commentary =
      commentaryMap[key] ||
      `${kidName} records a play.`;

    triggerFlash(key);

    await updateDoc(gameRef, {
      [key]: increment(1),

      comments: arrayUnion({
       text: commentary,
       timestamp: Date.now(),
      }),

      log: arrayUnion({
        type: key,
        timestamp: Date.now(),
      }),
    });
  };

  // SCORE CHANGES
  const changeOurScore = async (
    amount: number
  ) => {
    const newScore = Math.max(
      0,
      ourScore + amount
    );

    setOurScore(newScore);

    await updateDoc(gameRef, {
      ourScore: newScore,

comments: arrayUnion({
  text: `${teamName} score updated: ${newScore}`,
  timestamp: Date.now(),
}),
    });
  };

  const changeTheirScore = async (
    amount: number
  ) => {
    const newScore = Math.max(
      0,
      theirScore + amount
    );

    setTheirScore(newScore);

    await updateDoc(gameRef, {
      theirScore: newScore,

comments: arrayUnion({
  text: `${opponentName} score updated: ${newScore}`,
  timestamp: Date.now(),
}),
    });
  };

  const changeInning = async (
    amount: number
  ) => {
    const newInning = Math.max(
      1,
      inning + amount
    );

    setInning(newInning);

    await updateDoc(gameRef, {
      inning: newInning,

comments: arrayUnion({
  text: `Now entering inning ${newInning}.`,
  timestamp: Date.now(),
}),
    });
  };

  // UNDO
 const undoLast = async () => {
  const last = log[log.length - 1];

  if (!last) return;

  triggerFlash("undo");

  await updateDoc(gameRef, {
    [last.type]: increment(-1),

    log: log.slice(0, -1),

    comments: arrayUnion({
      text: `Oops, ${last.type} was undone.`,
      timestamp: Date.now(),
    }),
  });
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

  // CALCULATIONS
  const hits = useMemo(
    () =>
      stats.single +
      stats.double +
      stats.triple +
      stats.homerun,
    [stats]
  );

const outs = useMemo(
  () =>
    stats.strikeout +
    stats.ground_out +
    stats.fly_out +
    stats.sac_fly,
  [stats]
);

const atBats =
  hits +
stats.strikeout +
stats.ground_out +
stats.fly_out +
stats.fielders_choice +
stats.reached_on_error;

// AVG

const avg =
  atBats > 0
    ? (hits / atBats)
        .toFixed(3)
        .replace(/^0/, "")
    : ".000";


const obp =
  atBats +
    stats.walk +
    stats.hit_by_pitch +
    stats.sac_fly >
  0
    ? (
        (
          hits +
          stats.walk +
          stats.hit_by_pitch
        ) /
        (
          atBats +
          stats.walk +
          stats.hit_by_pitch +
          stats.sac_fly
        )
      )
        .toFixed(3)
        .replace(/^0/, "")
    : ".000";


  // SHARE
  const shareGame = () => {
    const url =
      `${window.location.origin}/baseball/game/${gameId}?`;

    if (navigator.share) {
      navigator.share({
        title: `Live Game for ${kidName}`,
        text: `Follow ${kidName}'s live baseball game! ⚾`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);

      alert("Read-only link copied!");
    }
  };



const goToSummary = async () => {

  await updateDoc(gameRef, {
    isLive: false,

    comments: arrayUnion({
      text: `🏁 Final out! Game is complete.`,
      timestamp: Date.now(),
    }),
  });

  window.location.href =
    `/baseball/game/${gameId}/summary`;
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


return (
  <div className="relative min-h-screen">

    {/* Background Image */}
    <div
      className="absolute inset-0 opacity-40"
      style={{
        backgroundImage: "url('/images/baseball-kids.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "250px",
        filter: "grayscale(100%)",
      }}
    />

    {/* Dark Overlay */}
    <div className="absolute inset-0 bg-slate-950/80" />

    {/* Main Content */}
    <div className="relative z-10 text-white p-4 mx-auto max-w-xl">
{/* HEADER */}

<div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-5 shadow-lg mb-4">

  <div className="flex justify-between items-start">

    <div>

      <p className="text-sm opacity-80">
        ⚾ Tracking stats for
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

<div className="flex flex-col items-end justify-between h-full min-h-[100px]">

{isLive ? (
  <div
    className="
      bg-red-600
      text-white
      font-bold
      text-sm
      px-3
      py-1
      rounded-full
      animate-pulse
      shadow-lg
      mb-2
    "
  >
    🔴 LIVE
  </div>
) : (
  <div
    className="
      bg-green-700
      text-white
      font-bold
      text-sm
      px-3
      py-1
      rounded-full
      shadow-lg
      mb-2
    "
  >
    ✅ FINAL
  </div>
)}

  {canEdit && (
    <button
      onClick={shareGame}
      className="
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
  onClick={() => {
    const confirmed = window.confirm(
      "End game and view final stat summary?"
    );

    if (confirmed) {
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">

        <div className="grid grid-cols-3 gap-4 text-center">

          {/* OUR TEAM */}
          <div>

            {canEdit ? (
              

<input
  value={teamName}
  placeholder="Our Team Name"
  onChange={(e) => {
    setTeamName(e.target.value);
  }}
  onBlur={async () => {
    await updateDoc(gameRef, {
      teamName,
    });
  }}
  className="
    bg-transparent
    text-center
    text-base
    font-bold
    text-green-300
    border-b
    border-slate-600
    outline-none
    w-full
    mb-1
    placeholder:text-slate-500
  "
/>


            ) : (
              <p className="text-base font-bold text-green-300 mb-1">
                {teamName}
              </p>
            )}

            <div className="text-3xl font-bold">
              {ourScore}
            </div>

            {canEdit && (
              <div className="flex justify-center gap-2 mt-2">

                <button
                  onClick={() =>
                    changeOurScore(-1)
                  }
                  className="bg-slate-700 px-2 rounded"
                >
                  -
                </button>

                <button
                  onClick={() =>
                    changeOurScore(1)
                  }
                  className="bg-green-600 px-2 rounded"
                >
                  +
                </button>

              </div>
            )}

          </div>

          {/* INNING */}
          <div>

            <p className="text-sm text-slate-400 mb-1">
              Inning
            </p>

            <div className="text-3xl font-bold">
              {inning}
            </div>

            {canEdit && (
              <div className="flex justify-center gap-2 mt-2">

                <button
                  onClick={() =>
                    changeInning(-1)
                  }
                  className="bg-slate-700 px-2 rounded"
                >
                  -
                </button>

                <button
                  onClick={() =>
                    changeInning(1)
                  }
                  className="bg-blue-600 px-2 rounded"
                >
                  +
                </button>

              </div>
            )}

          </div>

          {/* OTHER TEAM */}
          <div>

            {canEdit ? (
             

 <input
  value={opponentName}
  placeholder="Other Team Name"
  onChange={(e) => {
    setOpponentName(e.target.value);
  }}
  onBlur={async () => {
    await updateDoc(gameRef, {
      opponentName,
    });
  }}
  className="
    bg-transparent
    text-center
    text-base
    font-bold
    text-red-300
    border-b
    border-slate-600
    outline-none
    w-full
    mb-1
    placeholder:text-slate-500
  "
/>


            ) : (
              <p className="text-base font-bold text-red-300 mb-1">
                {opponentName}
              </p>
            )}

            <div className="text-3xl font-bold">
              {theirScore}
            </div>

            {canEdit && (
              <div className="flex justify-center gap-2 mt-2">

                <button
                  onClick={() =>
                    changeTheirScore(-1)
                  }
                  className="bg-slate-700 px-2 rounded"
                >
                  -
                </button>

                <button
                  onClick={() =>
                    changeTheirScore(1)
                  }
                  className="bg-green-600 px-2 rounded"
                >
                  +
                </button>

              </div>
            )}

          </div>

        </div>

      </div>


{/* STATS CONTAINER */}
<div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-5">


  {/* QUICK STATS */}
  <div className="space-y-2 mb-5 text-center">

    {/* TOP ROW */}
    <div className="grid grid-cols-4 gap-2">

      {/* AB */}
      <div className="bg-slate-800 rounded-xl p-2">
        <p className="text-[11px] opacity-80">
          AB
        </p>

        <p className="text-sm font-bold">
          {atBats}
        </p>
      </div>

      {/* RUNS */}
      <div className="bg-pink-700 rounded-xl p-2">
        <p className="text-[11px] opacity-80">
          RUN
        </p>

        <p className="text-sm font-bold">
          {stats.run_scored}
        </p>
      </div>

      {/* HITS */}
      <div className="bg-green-700 rounded-xl p-2">
        <p className="text-[11px] opacity-80">
          HIT
        </p>

        <p className="text-sm font-bold">
          {hits}
        </p>
      </div>

      {/* RBI */}
      <div className="bg-blue-700 rounded-xl p-2">
        <p className="text-[11px] opacity-80">
          RBI
        </p>

        <p className="text-sm font-bold">
          {stats.rbi}
        </p>
      </div>

    </div>

    {/* SECOND ROW */}
    <div className="grid grid-cols-5 gap-2">

      {/* HR */}
      <div className="bg-yellow-500 text-black rounded-xl p-2">
        <p className="text-[10px] opacity-80">
          HR
        </p>

        <p className="text-sm font-bold">
          {stats.homerun}
        </p>
      </div>

      {/* WALKS */}
      <div className="bg-cyan-700 rounded-xl p-2">
        <p className="text-[10px] opacity-80">
          BB
        </p>

        <p className="text-sm font-bold">
          {stats.walk}
        </p>
      </div>

      {/* STRIKEOUTS */}
      <div className="bg-red-700 rounded-xl p-2">
        <p className="text-[10px] opacity-80">
          SO
        </p>

        <p className="text-sm font-bold">
          {
		stats.strikeout
          }
        </p>
      </div>

      {/* AVG */}
      <div className="bg-orange-500 text-black rounded-xl p-2">
        <p className="text-[10px] opacity-80">
          AVG
        </p>

        <p className="text-sm font-bold">
          {avg}
        </p>
      </div>

      {/* OBP */}
      <div className="bg-cyan-600 rounded-xl p-2">
        <p className="text-[10px] opacity-80">
          OBP
        </p>

        <p className="text-sm font-bold">
          {obp}
        </p>
      </div>

    </div>
 <h3 className="text-center text-xs text-gray-500 mt-1 tracking-widest opacity-80">
  www.youthsportstracker.com
</h3>
  </div>

  {/* DIVIDER */}
  <div className="border-t border-slate-700 my-4" />

  {/* LIVE STAT BREAKDOWN */}
  <div>


    <div className="flex flex-wrap gap-2 mb-3">

      <div className="bg-green-700 px-3 py-1 rounded-full text-xs">
        1B: {stats.single}
      </div>

      <div className="bg-green-700 px-3 py-1 rounded-full text-xs">
        2B: {stats.double}
      </div>

      <div className="bg-green-700 px-3 py-1 rounded-full text-xs">
        3B: {stats.triple}
      </div>

      <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
        HR: {stats.homerun}
      </div>

      <div className="bg-cyan-700 px-3 py-1 rounded-full text-xs">
        BB: {stats.walk}
      </div>

      <div className="bg-blue-700 px-3 py-1 rounded-full text-xs">
        RBI: {stats.rbi}
      </div>

      <div className="bg-indigo-700 px-3 py-1 rounded-full text-xs">
        SB: {stats.stolen_base}
      </div>

      <div className="bg-pink-700 px-3 py-1 rounded-full text-xs">
        RUN: {stats.run_scored}
      </div>

      <div className="bg-cyan-800 px-3 py-1 rounded-full text-xs">
        Hit By Pitch: {stats.hit_by_pitch}
      </div>

      <div className="bg-orange-700 px-3 py-1 rounded-full text-xs">
        Reached On Err: {stats.reached_on_error}
      </div>

      <div className="bg-red-800 px-3 py-1 rounded-full text-xs">
        Sac Fly: {stats.sac_fly}
      </div>

<div className="bg-orange-800 px-3 py-1 rounded-full text-xs">
  Fielders Ch: {stats.fielders_choice}
</div>
    </div>

    <div className="flex flex-wrap gap-2">

<div className="bg-red-600 px-3 py-1 rounded-full text-xs">
  SO: {stats.strikeout}
</div>
      <div className="bg-red-700 px-3 py-1 rounded-full text-xs">
        Ground Out: {stats.ground_out}
      </div>

      <div className="bg-rose-800 px-3 py-1 rounded-full text-xs">
        Fly/Line Out: {stats.fly_out}
      </div>



    </div>

  </div>

</div>

{/* BUTTONS CONTAINER */}


{canEdit && (
  <div className="bg-slate-500 border border-slate-300 rounded-2xl p-4 mb-5">

    <h2 className="font-semibold text-sm mb-2 text-white"><center>
      Track {kidName}'s Stats with Buttons below!</center>
    </h2>

 {/* HITS */}

    <div className="grid grid-cols-4 gap-2 mb-5">

      <button
        onClick={() => addStat("single")}
        className={buttonClass(
          "single",
          "bg-green-600 text-white p-2 text-sm rounded-xl shadow-lg"
        )}
      >
        1B
      </button>

      <button
        onClick={() => addStat("double")}
        className={buttonClass(
          "double",
          "bg-green-700 text-white p-2 text-sm rounded-xl shadow-lg"
        )}
      >
        2B
      </button>

      <button
        onClick={() => addStat("triple")}
        className={buttonClass(
          "triple",
          "bg-green-800 text-white p-2 text-sm rounded-xl shadow-lg"
        )}
      >
        3B
      </button>

      <button
        onClick={() => addStat("homerun")}
        className={buttonClass(
          "homerun",
          "bg-yellow-500 text-black font-bold p-2 text-sm rounded-xl shadow-lg"
        )}
      >
        HR
      </button>

    </div>

    {/* DIVIDER */}
    <div className="border-t border-slate-700 my-4" />

    {/* ON BASE */}


    <div className="grid grid-cols-3 gap-2 mb-5">

      <button
        onClick={() => addStat("walk")}
        className={buttonClass(
          "walk",
          "bg-cyan-700 text-white p-2 text-sm rounded-xl shadow-lg"
        )}
      >
        Walked
      </button>

      <button
        onClick={() => addStat("hit_by_pitch")}
        className={buttonClass(
          "hit_by_pitch",
          "bg-cyan-800 text-white p-2 text-sm rounded-xl shadow-lg"
        )}
      >
        Hit By Pitch
      </button>

      <button
        onClick={() => addStat("reached_on_error")}
        className={buttonClass(
          "reached_on_error",
          "bg-orange-700 text-white p-2 text-sm rounded-xl shadow-lg"
        )}
      >
        Reached On Err
      </button>

    </div>

    {/* DIVIDER */}
    <div className="border-t border-slate-700 my-4" />

    {/* EXTRA */}


    <div className="grid grid-cols-3 gap-2 mb-5">

      <button
        onClick={() => addStat("stolen_base")}
        className={buttonClass(
          "stolen_base",
          "bg-indigo-700 text-white p-2 text-sm rounded-xl shadow-lg"
        )}
      >
        Stole Base
      </button>

      <button
        onClick={() => addStat("rbi")}
        className={buttonClass(
          "rbi",
          "bg-blue-700 text-white p-2 text-sm rounded-xl shadow-lg"
        )}
      >
        RBI
      </button>

      <button
        onClick={() => addStat("run_scored")}
        className={buttonClass(
          "run_scored",
          "bg-pink-700 text-white p-2 text-sm rounded-xl shadow-lg"
        )}
      >
        Scored Run
      </button>

    </div>

    {/* DIVIDER */}
    <div className="border-t border-slate-700 my-4" />

    {/* OUTS */}
 

    <div className="grid grid-cols-3 gap-2">

<button
  onClick={() => addStat("strikeout")}
  className={buttonClass(
    "strikeout",
    "bg-red-600 text-white p-2 text-sm rounded-xl shadow-lg"
  )}
>
  Strikeout
</button>


      <button
        onClick={() => addStat("ground_out")}
        className={buttonClass(
          "ground_out",
          "bg-red-700 text-white p-2 text-sm rounded-xl shadow-lg"
        )}
      >
        Ground Out
      </button>

      <button
        onClick={() => addStat("fly_out")}
        className={buttonClass(
          "fly_out",
          "bg-rose-800 text-white p-2 text-sm rounded-xl shadow-lg"
        )}
      >
        Fly/Line Out
      </button>

      <button
        onClick={() => addStat("sac_fly")}
        className={buttonClass(
          "sac_fly",
          "bg-red-800 text-white p-2 text-sm rounded-xl shadow-lg"
        )}
      >
        Sac Fly
      </button>

<button
  onClick={() => addStat("fielders_choice")}
  className={buttonClass(
    "fielders_choice",
    "bg-orange-800 text-white p-2 text-sm rounded-xl shadow-lg"
  )}
>
  Fielder's Choice
</button>

          <button
            onClick={undoLast}
            className="bg-pink-600 text-white px-3 py-2 rounded-xl shadow-lg"
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
    © 2026 Youth Sports Tracker ⚾
  </footer>
      </div>

    </div>
  </div>
  );
}