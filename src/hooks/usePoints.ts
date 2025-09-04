"use client";

import { useState } from "react";

export function usePoints() {
  const [isAdding, setIsAdding] = useState(false);

  const addPoints = async (
    action: "watch" | "listen" | "favorite",
    mediaId?: string,
    mediaType?: "movie" | "song"
  ) => {
    if (isAdding) return;
    
    setIsAdding(true);

    try {
      console.log(`Adding points for: ${action} ${mediaType || ''}`);
      
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
        console.log('✅ SUCCESS!');
        console.log('📈 Points Added:', data.pointsAdded);
        console.log('💰 Total Points Now:', data.totalPoints);
        console.log('📝 Message:', data.message);
        
        if (data.weeklyBonus) {
          console.log('🎉 WEEKLY BONUS!');
          console.log('🌟 Bonus Points:', data.weeklyBonus.points);
          console.log('💬 Bonus Message:', data.weeklyBonus.message);
          
          window.dispatchEvent(new CustomEvent("weeklyBonusEarned", {
            detail: data.weeklyBonus
          }));
        }
        
        console.log('------------------------');

        window.dispatchEvent(new Event("pointsEarned"));
      } else {
        console.error('❌ Failed to add points:', data.error);
      }

    } catch (error) {
      console.error("🚨 Error adding points:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const deductPoints = async (
    action: "unfavorite",
    mediaId?: string,
    mediaType?: "movie" | "song"
  ) => {
    if (isAdding) return;
    
    setIsAdding(true);

    try {
      console.log(`Deducting points for: ${action} ${mediaType || ''}`);
      
      const response = await fetch("/api/points/deduct", {
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
        console.log('✅ SUCCESS!');
        console.log('📉 Points Deducted:', data.pointsDeducted);
        console.log('💰 Total Points Now:', data.totalPoints);
        console.log('📝 Message:', data.message);
        
        window.dispatchEvent(new Event("pointsEarned"));
      } else {
        console.error('❌ Failed to deduct points:', data.error);
      }

    } catch (error) {
      console.error("🚨 Error deducting points:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return { addPoints, deductPoints, isAdding };
}