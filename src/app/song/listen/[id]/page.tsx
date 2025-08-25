import NavbarComponent from '@/components/NavbarComponent'
import './page.css'
export default async function listenMusic({ params }: { params: Promise<{ id: string }> }){
    const { id } = await params
    console.log(id)
    
    const response = await fetch(`http://localhost:9513/api/get-song-data?id=${id}`)
    const embedUrl = `https://open.spotify.com/embed/track/${id}`
    const song = await response.json()
    
    return (
        <>
        <NavbarComponent/>
        <div className="listen-page-container">
            
            {/* Top Music Player Bar */}

            {/* Spotify Player Embed */}
            <div className="spotify-embed-container">
                <iframe 
                    src={embedUrl}
                    className="spotify-player"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title={`Listen to ${song.name || 'song'}`}
                >
                </iframe>
            </div>

            {/* Main Content - Left Side Only */}
            <div className="main-content-area">
                <div className="currently-playing-section">
                    <h1 className="section-heading">Currently Playing</h1>
                    <p className="song-title">{song.name || "Song Name"}</p>
                    {song.artists && song.artists.length > 0 && (
                        <p className="artist-name">
                            {song.artists.map((artist: any) => artist.name).join(', ')}
                        </p>
                    )}
                </div>

                <div className="next-up-section">
                    <h1 className="section-heading">Next up</h1>
                    <p className="song-title">Song Name</p>
                    <p className="artist-name">Artist Name</p>
                </div>
            </div>
        </div>
        </>
        
    )
}