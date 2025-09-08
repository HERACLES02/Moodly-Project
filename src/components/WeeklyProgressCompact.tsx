"use client";

import { useEffect, useState } from "react";
import { Film, Music, Trophy } from "lucide-react";
import { usePoints } from "@/hooks/usePoints";

interface WeeklyProgress {
  moviesWatched: number;
  songsListened: number;
  bonusClaimed: boolean;
}

export default function WeeklyProgressCompact() {
  const [progress, setProgress] = useState<WeeklyProgress | null>(null);


  useEffect(() => {
    fetchProgress();
    
    window.addEventListener("pointsEarned", fetchProgress);
    
    return () => {
      window.removeEventListener("pointsEarned", fetchProgress);
    };
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/points/weekly-activity");

      if (!response.ok) {
        const text = await response.text(); // log raw response
        console.error("Server returned error:", text);
        return; // don’t call response.json() if server returned HTML
      }

      const data = await response.json();
      if (data.weeklyProgress) setProgress(data.weeklyProgress);

    } catch (error) {
      console.error("Failed to fetch weekly progress:", error);
    }
  };


  
  if (!progress) return null;

  const movieProgress = Math.min(progress.moviesWatched, 3);
  const songProgress = Math.min(progress.songsListened, 3);
  const moviePercentage = (movieProgress / 3) * 100;
  const songPercentage = (songProgress / 3) * 100;

  return (
    <div className="weekly-progress-compact">
      <div className="progress-item">
        <Film className="progress-icon" />
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill progress-fill-movie"
              style={{ width: `${moviePercentage}%` }}
            />
          </div>
          <span className="progress-text">{Math.min(progress.moviesWatched, 3)}/3</span>
        </div>
      </div>

      <div className="progress-item">
        <Music className="progress-icon" />
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill progress-fill-song"
              style={{ width: `${songPercentage}%` }}
            />
          </div>
          <span className="progress-text">{Math.min(progress.songsListened, 3)}/3</span>
        </div>
      </div>

      {progress.bonusClaimed && (
        <div className="bonus-indicator">
          <Trophy className="trophy-icon" />
        </div>
      )}
    </div>
  );
}