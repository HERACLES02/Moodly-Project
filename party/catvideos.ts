interface CatVideoParams {
  name: string
  url: string
  duration: number
}

interface MovieParams {
  name: string
  url: string
  duration: number
}

interface SongParams {
  name: string
  url: string
  duration: number
}

const CLOUD = "https://pub-5028b4904eef4a52961fb036dec5fe6d.r2.dev"

function getCatVideos() {
  const catvideo: CatVideoParams[] = [
    {
      name: "cat10",
      url: "cat10.mp4",
      duration: 29.37,
    },
    {
      name: "cat11",
      url: "cat11.mp4",
      duration: 9.33,
    },
    {
      name: "cat12",
      url: "cat12.mp4",
      duration: 11.42,
    },
    {
      name: "cat13",
      url: "cat13.mp4",
      duration: 5.76,
    },
    {
      name: "cat14",
      url: "cat14.mp4",
      duration: 21.9,
    },
    {
      name: "cat15",
      url: "cat15.mp4",
      duration: 17.97,
    },
    {
      name: "cat16",
      url: "cat16.mp4",
      duration: 10.05,
    },
    {
      name: "cat17",
      url: "cat17.mp4",
      duration: 8.1,
    },
    {
      name: "cat18",
      url: "cat18.mp4",
      duration: 7.22,
    },
    {
      name: "cat19",
      url: "cat19.mp4",
      duration: 7.67,
    },
    {
      name: "cat20",
      url: "cat20.mp4",
      duration: 10.45,
    },
    {
      name: "cat21",
      url: "cat21.mp4",
      duration: 4.86,
    },
    {
      name: "cat22",
      url: "cat22.mp4",
      duration: 13.14,
    },
    {
      name: "cat23",
      url: "cat23.mp4",
      duration: 28.33,
    },
    {
      name: "cat24",
      url: "cat24.mp4",
      duration: 16.05,
    },
    {
      name: "cat25",
      url: "cat25.mp4",
      duration: 5.23,
    },
    {
      name: "cat26",
      url: "cat26.mp4",
      duration: 9.6,
    },
    {
      name: "cat27",
      url: "cat27.mp4",
      duration: 11.57,
    },
    {
      name: "cat28",
      url: "cat28.mp4",
      duration: 8.45,
    },
    {
      name: "cat29",
      url: "cat29.mp4",
      duration: 13.79,
    },
    {
      name: "cat30",
      url: "cat30.mp4",
      duration: 7.71,
    },
    {
      name: "cat31",
      url: "cat31.mp4",
      duration: 5.71,
    },
    {
      name: "cat32",
      url: "cat32.mp4",
      duration: 6.36,
    },
    {
      name: "cat33",
      url: "cat33.mp4",
      duration: 7.43,
    },
    {
      name: "cat34",
      url: "cat34.mp4",
      duration: 12.54,
    },
    {
      name: "cat35",
      url: "cat35.mp4",
      duration: 10.1,
    },
    {
      name: "cat36",
      url: "cat36.mp4",
      duration: 17.32,
    },
    {
      name: "cat37",
      url: "cat37.mp4",
      duration: 7.52,
    },
    {
      name: "cat38",
      url: "cat38.mp4",
      duration: 4.55,
    },
    {
      name: "cat39",
      url: "cat39.mp4",
      duration: 5.79,
    },
    {
      name: "cat40",
      url: "cat40.mp4",
      duration: 5.57,
    },
    {
      name: "cat41",
      url: "cat41.mp4",
      duration: 4.09,
    },
    {
      name: "cat42",
      url: "cat42.mp4",
      duration: 18.82,
    },
    {
      name: "cat43",
      url: "cat43.mp4",
      duration: 7.11,
    },
    {
      name: "cat44",
      url: "cat44.mp4",
      duration: 15.65,
    },
    {
      name: "cat45",
      url: "cat45.mp4",
      duration: 12.35,
    },
    {
      name: "cat46",
      url: "cat46.mp4",
      duration: 11.33,
    },
    {
      name: "cat47",
      url: "cat47.mp4",
      duration: 10.96,
    },
    {
      name: "cat8",
      url: "cat8.mp4",
      duration: 42.21,
    },
    {
      name: "cat9",
      url: "cat9.mp4",
      duration: 7.67,
    },
  ]
  for (let i = 0; i < catvideo.length; i++) {
    catvideo[i].url = CLOUD + `/catvideo/cat${i + 1}.mp4`
  }

  return catvideo
}

function getSadMovie() {
  const movie: MovieParams[] = [
    {
      name: "The Pursit of Happyness",
      url: "ThreeIdiots.mkv",
      duration: 7044,
    },
  ]
  for (let i = 0; i < movie.length; i++) {
    movie[i].url = CLOUD + `/movies/${movie[i].url}`
  }

  return movie
}
function getHappyMovie() {
  const movie: MovieParams[] = [
    {
      name: "3 Idiots",
      url: "https://pub-5028b4904eef4a52961fb036dec5fe6d.r2.dev/movies/3Idiots.mkv",
      duration: 10267,
    },
  ]


  return movie
}

function getSadSongs() {
  const song: MovieParams[] = [
    {
      name: "3 am",
      url: "3am.mp3",
      duration: 15,
    },
    {
      name: "Tumi",
      url: "TUMI.mp3",
      duration: 15,
    },
  ]

  for (let i = 0; i < song.length; i++) {
    song[i].url = CLOUD + `/music/${song[i].url}`
  }

  return song
}
function getHappySongs() {
  const song: MovieParams[] = [
    {
      name: "Wildest Dreams",
      url: "Wildest_Dream.mp3",
      duration: 15,
    },
    {
      name: "Satellite",
      url: "Satellite.mp3",
      duration: 15,
    },
  ]
  for (let i = 0; i < song.length; i++) {
    song[i].url = CLOUD + `/music/${song[i].url}`
  }

  return song
}

export function getRandomIndex<T>(arr: T[]): number {
  return Math.floor(Math.random() * arr.length)
}

export const catVideoQueue: CatVideoParams[] = getCatVideos()
export const sadMovieQueue: MovieParams[] = getSadMovie()
export const happyMovieQueue: MovieParams[] = getHappyMovie()
export const sadSongQueue: SongParams[] = getSadSongs()
export const happySongQueue: SongParams[] = getHappySongs()
export const allSongQueue: SongParams[] = sadSongQueue.concat(happySongQueue)
export const allMovieQueue: MovieParams[] =
  sadMovieQueue.concat(happyMovieQueue)
