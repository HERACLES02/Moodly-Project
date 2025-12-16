"use client"

import { useEffect, useState } from "react"
import { Star, Trophy } from "lucide-react"
import "./PointsDisplay.css"
import { useUser } from "@/contexts/UserContext"
import MoodCurrencyIcon from "./icons/MoodCurrencyIcon"

export default function PointsDisplay() {
  const { user } = useUser()

  // useEffect(() => {
  //   fetchPoints();

  //   window.addEventListener("pointsEarned", fetchPoints);

  //   return () => {
  //     window.removeEventListener("pointsEarned", fetchPoints);
  //   };
  // }, []);

  // const fetchPoints = async () => {
  //   try {
  //     const response = await fetch("/api/points/get");
  //     const data = await response.json();

  //     if (data.points > points) {
  //       console.log(' Points Updated:', data.points);
  //     }

  //     setPoints(data.points || 0);
  //   } catch (error) {
  //     console.error("Failed to fetch points:", error);
  //   }
  // };

  return (
    <div className="points-display-container">
      <MoodCurrencyIcon size={40} />
      <span className="points-value">{user?.points}</span>
    </div>
  )
}
