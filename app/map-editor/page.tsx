"use client";

import dynamic from "next/dynamic";
import Loading from "@/app/loading";

const MapEditor = dynamic(() => import("@/components/map-editor/MapEditor"), {
  ssr: false,
});

export default function MapEditorPage() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <MapEditor />
    </div>
  );
}
