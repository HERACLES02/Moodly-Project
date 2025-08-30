"use client";

import { useEffect, useState } from "react";
import { Trophy, Coins, Star } from "lucide-react";

export default function PointsDisplay() {
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);

  // Fetch points when component loads
  useEffect(() => {
    fetchPoints();
    
    // Listen for custom events when points are earned
    window.addEventListener("pointsEarned", fetchPoints);
    
    // Cleanup
    return () => {
      window.removeEventListener("pointsEarned", fetchPoints);
    };
  }, []);

  const fetchPoints = async () => {
    try {
      const response = await fetch("/api/points/get");
      const data = await response.json();
      
      // Check if points increased for animation
      if (data.points > points) {
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 1000);
      }
      
      setPoints(data.points || 0);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch points:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
        <div className="w-4 h-4 bg-gray-600 rounded-full animate-pulse"></div>
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`
      flex items-center gap-2 px-4 py-2 
      bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
      border border-yellow-500/30 rounded-lg
      transition-all duration-300
      ${showAnimation ? 'scale-110 shadow-lg shadow-yellow-500/50' : ''}
    `}>
      <Trophy className="w-5 h-5 text-yellow-500" />
      <span className="font-semibold text-white">
        Your Points:
      </span>
      <span className={`
        font-bold text-lg text-white
        ${showAnimation ? 'animate-bounce' : ''}
      `}>
        {points.toLocaleString()}
      </span>
    </div>
  );
}