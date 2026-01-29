import { useState, useEffect } from 'react'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY

function App() {
  const [movieName, setMovieName] = useState('')
  const [submittedMovie, setSubmittedMovie] = useState('')
  const [movieData, setMovieData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imdbRating, setImdbRating] = useState(null)
  const [imdbVotes, setImdbVotes] = useState(null)

  // Generate verdict text
  const generateVerdict = (tmdbRating, imdbRating, imdbVotes, popularity) => {
    let lines = []

    if (imdbRating && tmdbRating) {
      const diff = imdbRating - tmdbRating

      if (diff > 0.5) {
        lines.push(
          'IMDb rates this significantly higher than TMDb, suggesting stronger Western audience appreciation.'
        )
      } else if (diff < -0.5) {
        lines.push(
          'TMDb rates this higher than IMDb, indicating broader international appeal.'
        )
      } else {
        lines.push(
          'IMDb and TMDb ratings are closely aligned, showing consistent audience reception.'
        )
      }
    }

    if (imdbVotes) {
      const votes = parseInt(imdbVotes.replace(/,/g, ''))

      if (votes > 1000000) {
        lines.push('Very high IMDb vote count indicates strong audience consensus.')
      } else if (votes > 100000) {
        lines.push('Moderate IMDb vote count suggests reliable audience feedback.')
      } else {
        lines.push('Lower IMDb vote count suggests a more niche audience.')
      }
    }

    if (popularity) {
      if (popularity > 80) {
        lines.push('High TMDb popularity shows the film is currently widely relevant.')
      } else if (popularity < 30) {
        lines.push(
          'Lower TMDb popularity suggests limited current mainstream attention.'
        )
      }
    }

    return lines.join(' ')
  }

  // Fetch IMDb rating + votes
  const fetchImdbRating = async (tmdbMovieId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbMovieId}`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()
      const imdbId = data.imdb_id
      if (!imdbId) return

      const omdbResponse = await fetch(
        `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`
      )

      const omdbData = await omdbResponse.json()

      if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
        setImdbRating(omdbData.imdbRating)
      }

      if (omdbData.imdbVotes && omdbData.imdbVotes !== 'N/A') {
        setImdbVotes(omdbData.imdbVotes)
      }
    } catch (err) {
      console.error('IMDb fetch failed')
    }
  }

  // Fetch movie from TMDb
  useEffect(() => {
    if (!submittedMovie) return

    const fetchMovie = async () => {
      setLoading(true)
      setError('')
      setMovieData(null)
      setImdbRating(null)
      setImdbVotes(null)

      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
            submittedMovie
          )}`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        )

        const data = await response.json()

        if (data.results && data.results.length > 0) {
          const movie = data.results[0]
          setMovieData(movie)
          fetchImdbRating(movie.id)
        } else {
          setError('No movie found.')
        }
      } catch (err) {
        setError('Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [submittedMovie])

  return (
    <div
      style={{
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <h1>🎬 Between Takes</h1>
      <p>Where ratings meet perspective.</p>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Enter a movie name"
          value={movieName}
          onChange={(e) => setMovieName(e.target.value)}
          style={{ padding: '8px', width: '250px' }}
        />

        <button
          onClick={() => setSubmittedMovie(movieName)}
          style={{ marginLeft: '10px', padding: '8px 12px' }}
        >
          Search
        </button>
      </div>

      {loading && <p style={{ marginTop: '20px' }}>Loading...</p>}

      {error && (
        <p style={{ marginTop: '20px', color: 'red' }}>{error}</p>
      )}

      {movieData && (
        <div
          style={{
            marginTop: '32px',
            padding: '24px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.04)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            gap: '32px',
            alignItems: 'flex-start',
          }}
        >
          {/* Poster */}
          <div style={{ flexShrink: 0 }}>
            {movieData.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w300${movieData.poster_path}`}
                alt={movieData.title}
                style={{
                  width: '220px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
                }}
              />
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: '6px' }}>{movieData.title}</h2>

            <p style={{ opacity: 0.7 }}>
              Release Year:{' '}
              {movieData.release_date
                ? movieData.release_date.split('-')[0]
                : 'N/A'}
            </p>

            <div style={{ marginTop: '16px', lineHeight: '1.7' }}>
              <p><strong>TMDb Rating:</strong> {movieData.vote_average}/10</p>
              <p>
                <strong>IMDb Rating:</strong>{' '}
                {imdbRating ? `${imdbRating}/10` : 'Loading...'}
              </p>
              <p>
                <strong>IMDb Votes:</strong>{' '}
                {imdbVotes ? imdbVotes : 'Loading...'}
              </p>
              <p>
                <strong>TMDb Popularity:</strong>{' '}
                {Math.round(movieData.popularity)}
              </p>
            </div>

            {imdbRating && (
              <div
                style={{
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <h3 style={{ marginBottom: '8px' }}>Verdict</h3>
                <p style={{ lineHeight: '1.6' }}>
                  {generateVerdict(
                    movieData.vote_average,
                    parseFloat(imdbRating),
                    imdbVotes,
                    movieData.popularity
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
