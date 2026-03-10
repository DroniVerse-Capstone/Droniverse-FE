"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import { FaPlus } from "react-icons/fa";

export default function LabManagement() {
  const route = useRouter();
  return (
    <div className="text-right">
      <Button 
        size={"default"} 
        icon={<FaPlus />} 
        onClick={() => route.push("/map-editor")}
      >
        Tạo bài Lab
      </Button>
    </div>
  );
}
