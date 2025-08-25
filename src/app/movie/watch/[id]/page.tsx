export default async function watchmovies({ params }: { params: Promise<{ id: string }> }){

    const {id} = await params
    console.log(id)

    const embedUrl = `https://vidsrc.xyz/embed/movie?tmdb=${id}`
    
    const response = await fetch(`http://localhost:9513/api/get-movie-data?id=${id}`)
    const movie = await response.json()

    return (
        <div>
            {movie.title}
            {movie.title}
            <iframe src= {embedUrl}>

            </iframe>
        </div>
    )
}