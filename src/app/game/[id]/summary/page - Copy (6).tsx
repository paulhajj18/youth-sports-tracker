"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import * as htmlToImage from "html-to-image";

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

export default function SummaryPage() {
  const params = useParams();
  const gameId = params.id as string;

  const gameRef = doc(db, "games", gameId);

  const cardRef = useRef<HTMLDivElement>(null);

  const [kidName, setKidName] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

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
    });

    return () => unsub();
  }, [gameId]);

  // ✅ OPTION 3: Share Image via iOS/Android Share Sheet
  const shareImage = async () => {
    try {
      if (!cardRef.current) return;

      console.log("Generating share image...");

      // ensure layout is ready
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

      // ✅ Native share sheet (iPhone / Android)
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${kidName} Game Summary`,
          text: "Check out this game!",
          files: [file],
        });
      } else {
        // fallback for desktop
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

  const gameDate = new Date().toLocaleDateString();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      <div className="w-full max-w-md">

        {/* CARD */}
        <div
          ref={cardRef}
          className="bg-white rounded-2xl shadow-xl p-6 text-black"
        >

          {/* HEADER */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">{kidName}</h1>

            <p className="text-gray-500 text-xs mt-1">
              {gameDate}
            </p>

            <p className="text-gray-600 text-sm">
              Game Summary
            </p>
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

        </div>

        {/* ✅ SHARE BUTTON (iPhone-native sheet) */}
        <button
          onClick={shareImage}
          className="w-full mt-4 bg-purple-600 text-white py-3 rounded-xl font-semibold"
        >
          Share Game Card
        </button>

      </div>
    </div>
  );
}