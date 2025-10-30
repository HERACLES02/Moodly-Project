"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import "./PointsDisplay.css";
import { useUser } from "@/contexts/UserContext";

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
        <Trophy className="trophy-icon" />
        <span className="points-label">
          Your Points:
        </span>
        <span className="points-value">
          {user?.points}
        </span>
      </div>
    );
  }