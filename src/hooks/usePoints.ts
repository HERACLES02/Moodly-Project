"use client";

import { useState } from "react";

export function usePoints() {
  const [isAdding, setIsAdding] = useState(false);

  const addPoints = async (
    action: "watch" | "listen" | "favorite",
    mediaId?: string,
    mediaType?: "movie" | "song"
  ) => {
    // Prevent double-clicking
    if (isAdding) return;
    
    setIsAdding(true);

    try {
      // Log what we're doing
      console.log( `Adding points for: ${action} ${mediaType || ''}`);
      
      const response = await fetch("/api/points/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          mediaId,
          mediaType
        })
      });

      const data = await response.json();

      if (data.success) {
        // Show success in terminal
        console.log('✅ SUCCESS!');
        console.log('🎉 Points Added: ',data.pointsAdded);
        console.log('💰 Total Points Now: ',data.totalPoints);
        console.log('📝 Message: ',data.message);
        console.log('------------------------');

        // Trigger event to update points display
        window.dispatchEvent(new Event("pointsEarned"));
      } else {
        console.error('❌ Failed to add points:', data.error);
      }

    } catch (error) {
      console.error("❌ Error adding points:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return { addPoints, isAdding };
}