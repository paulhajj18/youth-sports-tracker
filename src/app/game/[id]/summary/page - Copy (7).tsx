"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
=======
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import * as htmlToImage from "html-to-image";
>>>>>>> 884704efb1273d6957ab22052ea6c2391a684438

import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type Stats = {
  single: number;
  double: number;
  triple: number;
  homerun: number;

  strikeout_swinging: number;
  strikeout_looking: number;

  ground_out: number;
  fly_out: number;
  other_out: number;
};

<<<<<<< HEAD
type Comment = {
  text: string;
  timestamp: number;
};

=======
>>>>>>> 884704efb1273d6957ab22052ea6c2391a684438
export default function SummaryPage() {
  const params = useParams();
  const gameId = params.id as string;

  const gameRef = doc(db, "games", gameId);
<<<<<<< HEAD

  const [kidName, setKidName] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  // 🔥 LIVE DATA
=======
  const cardRef = useRef<HTMLDivElement>(null);

  const [kidName, setKidName] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

  // 🔥 FIREBASE SYNC
>>>>>>> 884704efb1273d6957ab22052ea6c2391a684438
  useEffect(() => {
    const unsub = onSnapshot(gameRef, (snap) => {
      const data = snap.data();
      if (!data) return;

      setKidName(data.kidName || "Player");

      setStats({
        single: data.single || 0,
        double: data.double || 0,
        triple: data.triple || 0,
        homerun: data.homerun || 0,

        strikeout_swinging: data.strikeout_swinging || 0,
        strikeout_looking: data.strikeout_looking || 0,

        ground_out: data.ground_out || 0,
        fly_out: data.fly_out || 0,
        other_out: data.other_out || 0,
      });
<<<<<<< HEAD

      setComments(data.comments || []);
=======
>>>>>>> 884704efb1273d6957ab22052ea6c2391a684438
    });

    return () => unsub();
  }, [gameId]);

<<<<<<< HEAD
  if (!stats) return <div className="p-6">Loading...</div>;
=======
  // 🧠 RECAP ENGINE
  const generateRecap = () => {
    if (!stats) return "";

    const hits =
      stats.single +
      stats.double +
      stats.triple +
      stats.homerun;

    const outs =
      stats.strikeout_swinging +
      stats.strikeout_looking +
      stats.ground_out +
      stats.fly_out +
      stats.other_out;

    const hitParts = [];
    if (stats.single) hitParts.push(`${stats.single} single`);
    if (stats.double) hitParts.push(`${stats.double} double`);
    if (stats.triple) hitParts.push(`${stats.triple} triple`);
    if (stats.homerun) hitParts.push(`${stats.homerun} HR`);

    const outParts = [];
    if (stats.strikeout_swinging) outParts.push(`${stats.strikeout_swinging} K swinging`);
    if (stats.strikeout_looking) outParts.push(`${stats.strikeout_looking} K looking`);
    if (stats.ground_out) outParts.push(`${stats.ground_out} ground out`);
    if (stats.fly_out) outParts.push(`${stats.fly_out} fly out`);
    if (stats.other_out) outParts.push(`${stats.other_out} other out`);

    const atBats = hits + outs;
    const avg = atBats > 0 ? (hits / atBats).toFixed(3) : "0.000";

    return `${kidName} went ${hits}-for-${atBats} (AVG ${avg}). ${
      hitParts.length ? `Hits: ${hitParts.join(", ")}.` : ""
    } ${
      outParts.length ? `Outs: ${outParts.join(", ")}.` : ""
    }`;
  };

  // 📤 SHARE SHEET (BEST MOBILE UX)
  const shareImage = async () => {
    try {
      if (!cardRef.current) return;

      await document.fonts?.ready;
      await new Promise((r) => setTimeout(r, 200));

      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        cacheBust: true,
      });

      const blob = await (await fetch(dataUrl)).blob();

      const file = new File(
        [blob],
        `${kidName || "game"}-summary.png`,
        { type: "image/png" }
      );

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${kidName} Game Summary`,
          text: generateRecap(),
          files: [file],
        });
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = file.name;
        link.click();
      }
    } catch (err) {
      console.error("Share failed:", err);
      alert("Share failed — check console");
    }
  };

  if (!stats) return <div className="p-6">Loading summary...</div>;
>>>>>>> 884704efb1273d6957ab22052ea6c2391a684438

  const hits =
    stats.single +
    stats.double +
    stats.triple +
    stats.homerun;

  const outs =
    stats.strikeout_swinging +
    stats.strikeout_looking +
    stats.ground_out +
    stats.fly_out +
    stats.other_out;

  const atBats = hits + outs;
  const avg = atBats > 0 ? (hits / atBats).toFixed(3) : "0.000";

<<<<<<< HEAD
  return (
    <div className="min-h-screen bg-white text-black p-6 max-w-xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-1">
        {kidName} - Game Summary
      </h1>

      {/* STATS CARD */}
      <div className="bg-white border rounded-xl p-4 shadow-sm mb-4">

        <p><b>Hits:</b> {hits}</p>
        <p><b>Outs:</b> {outs}</p>
        <p><b>At Bats:</b> {atBats}</p>
        <p><b>AVG:</b> {avg}</p>

        <hr className="my-2" />

        <p className="font-semibold">Breakdown</p>

        <p>Single: {stats.single}</p>
        <p>Double: {stats.double}</p>
        <p>Triple: {stats.triple}</p>
        <p>Home Run: {stats.homerun}</p>

        <p>K Swing: {stats.strikeout_swinging}</p>
        <p>K Looking: {stats.strikeout_looking}</p>
        <p>Ground Out: {stats.ground_out}</p>
        <p>Fly Out: {stats.fly_out}</p>
        <p>Other Out: {stats.other_out}</p>

      </div>

      {/* 🧠 COMMENTS (FIXED GAMECHANGER STYLE) */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">

        <h2 className="font-semibold mb-2">Live Commentary</h2>

        {comments.length === 0 && (
          <p className="text-gray-400 text-sm">
            No comments yet
          </p>
        )}

        <div className="space-y-2">
          {comments.map((c, i) => (
            <div
              key={i}
              className="
                bg-white
                border
                border-gray-200
                rounded-lg
                p-2
                text-sm
                shadow-sm
              "
            >
              <div className="text-black">
                {c.text}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {new Date(c.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>

      </div>

=======
  const gameDate = new Date().toLocaleDateString();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      <div className="w-full max-w-md">

        {/* 🧾 CARD (shared image) */}
        <div
          ref={cardRef}
          className="bg-white rounded-2xl shadow-xl p-6 text-black"
        >

          {/* HEADER */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">{kidName}</h1>
            <p className="text-gray-500 text-xs mt-1">{gameDate}</p>
            <p className="text-gray-600 text-sm">Game Summary</p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-4 text-center mb-6">

            <div className="bg-green-200 rounded-xl p-4">
              <p className="text-sm text-gray-700">HITS</p>
              <p className="text-2xl font-bold">{hits}</p>
            </div>

            <div className="bg-red-200 rounded-xl p-4">
              <p className="text-sm text-gray-700">OUTS</p>
              <p className="text-2xl font-bold">{outs}</p>
            </div>

            <div className="bg-blue-200 rounded-xl p-4 col-span-2">
              <p className="text-sm text-gray-700">AVG</p>
              <p className="text-2xl font-bold">{avg}</p>
            </div>

          </div>

          {/* BREAKDOWN */}
          <div className="text-sm space-y-1">

            <p className="font-semibold">Hits</p>
            <p>Single: {stats.single}</p>
            <p>Double: {stats.double}</p>
            <p>Triple: {stats.triple}</p>
            <p>Home Run: {stats.homerun}</p>

            <hr className="my-2" />

            <p className="font-semibold">Outs</p>
            <p>K Swing: {stats.strikeout_swinging}</p>
            <p>K Looking: {stats.strikeout_looking}</p>
            <p>Ground Out: {stats.ground_out}</p>
            <p>Fly Out: {stats.fly_out}</p>
            <p>Other Out: {stats.other_out}</p>
          </div>

          {/* 🧠 RECAP INSIDE IMAGE */}
          <div className="mt-4 text-sm border-t pt-3">
            <p className="font-semibold">Recap</p>
            <p className="text-gray-700">{generateRecap()}</p>
          </div>

        </div>

        {/* 📤 SHARE BUTTON */}
        <button
          onClick={shareImage}
          className="w-full mt-4 bg-purple-600 text-white py-3 rounded-xl font-semibold"
        >
          Share Game Card
        </button>

      </div>
>>>>>>> 884704efb1273d6957ab22052ea6c2391a684438
    </div>
  );
}