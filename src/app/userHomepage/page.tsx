import NavbarComponent from "@/components/NavbarComponent";
import "./Homepage.css"; // Import global H


export default function UserHomepage() {
  return (
    <div className="container">
      <NavbarComponent />
      <main className="main-content">
        <h1 className="main-title">
          Your Mood Picks <br />
          <span className="main-subtitle">The Playlist & The Popcorn</span>
        </h1>
        <p className="description">
          Your mood is more than a feeling — it's a vibe waiting to be heard and seen.
          Moodly curates movies and melodies that match you, while connecting you with a community that feels the same.
        </p>
        <button className="explore-btn">EXPLORE MOODLY</button>
      </main>
    </div>
  );
}
