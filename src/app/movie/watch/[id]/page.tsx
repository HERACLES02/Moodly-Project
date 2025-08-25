import NavbarComponent from '@/components/NavbarComponent'
import AddToPlaylistComponent from '@/components/PlaylistComponents/AddToPlaylistComponent'
import './page.css'

export default async function watchmovies({ params }: { params: Promise<{ id: string }> }){
    const {id} = await params
    console.log(id)
    const embedUrl = `https://vidsrc.xyz/embed/movie?tmdb=${id}`
   
    const response = await fetch(`http://localhost:9513/api/get-movie-data?id=${id}`)
    const movie = await response.json()
    
    return (
        <div className="watch-page-container">
            <NavbarComponent/>
            
            {/* Video Player Section */}
            <div className="video-container">
                <iframe
                    src={embedUrl}
                    className="video-player"
                    allowFullScreen
                    title={`Watch ${movie.title}`}
                >
                </iframe>
            </div>

            {/* Movie Title and Actions Below Video */}
            <div className="movie-title-section">
                <div className="movie-title-info">
                    <h1 className="movie-title-below">{movie.title}</h1>
                    {movie.release_date && (
                        <span className="movie-year-below">
                            ({new Date(movie.release_date).getFullYear()})
                        </span>
                    )}
                </div>
                <div className="movie-actions">
                    <AddToPlaylistComponent itemId = {id}/>
                    
                </div>
            </div>

            {/* Movie Information Section */}
            <div className="movie-info-section">
                {movie.vote_average && (
                    <div className="movie-rating-info">
                        <span className="rating-display">
                            ⭐ {movie.vote_average.toFixed(1)} / 10
                        </span>
                    </div>
                )}

                {movie.overview && (
                    <div className="movie-overview">
                        <h2>Overview</h2>
                        <p>{movie.overview}</p>
                    </div>
                )}
               
                {movie.genres && movie.genres.length > 0 && (
                    <div className="movie-genres">
                        <h3>Genres</h3>
                        <div className="genre-tags">
                            {movie.genres.map((genre: any) => (
                                <span key={genre.id} className="genre-tag">
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}