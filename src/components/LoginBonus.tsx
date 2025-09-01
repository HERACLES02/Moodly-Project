// File: src/components/LoginBonus.tsx
"use client";

import { useEffect, useState } from "react";
import { Flame, Gift } from "lucide-react";

export default function LoginBonus() {
  const [bonusMessage, setBonusMessage] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    checkLoginBonus();
  }, []);

  const checkLoginBonus = async () => {
    try {
      const response = await fetch("/api/points/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();

      if (data.success && data.pointsAdded > 0) {
        setBonusMessage(data.message);
        setStreak(data.loginStreak);
        setShowNotification(true);

        window.dispatchEvent(new Event("pointsEarned"));

        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Failed to check login bonus:", error);
    }
  };

  if (!showNotification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-2xl p-4 max-w-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            {streak > 1 ? (
              <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
            ) : (
              <Gift className="w-6 h-6 text-yellow-300 animate-bounce" />
            )}
          </div>
          <div className="text-white">
            <p className="font-semibold text-sm">{bonusMessage}</p>
            {streak > 1 && (
              <p className="text-xs opacity-90 mt-1">
                Keep it up! Your streak is on fire! 
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}