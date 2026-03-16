import { useState, useEffect } from 'react'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY

const SELECTED_FONT = 'Outfit'

function App() {
  const [hasStarted, setHasStarted] = useState(false)
  const [mediaType, setMediaType] = useState('movie')
  const [movieName, setMovieName] = useState('')
  const [submittedMovie, setSubmittedMovie] = useState('')
  const [movieData, setMovieData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imdbRating, setImdbRating] = useState(null)
  const [imdbVotes, setImdbVotes] = useState(null)
  const [directorOrCreator, setDirectorOrCreator] = useState(null)
  const [genres, setGenres] = useState([])
  const [cast, setCast] = useState([])
  const [overview, setOverview] = useState('')

  const generateVerdict = (tmdb, imdb, votes, popularity) => {
    let lines = []
    if (tmdb && imdb) {
      const diff = imdb - tmdb
      if (diff > 0.5) lines.push('IMDb rates this higher than TMDb.')
      else if (diff < -0.5) lines.push('TMDb rates this higher than IMDb.')
      else lines.push('IMDb and TMDb ratings are closely aligned.')
    }
    if (votes) {
      const v = parseInt(votes.replace(/,/g, ''))
      if (v > 1_000_000) lines.push('Very strong audience consensus.')
      else if (v > 100_000) lines.push('Solid audience reception.')
    }
    if (popularity && popularity < 30) {
      lines.push('Lower current mainstream buzz.')
    }
    return lines.join(' ')
  }

  const fetchDetails = async (id) => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )
      const data = await res.json()
      setGenres(data.genres?.map((g) => g.name) || [])
      setOverview(data.overview || '')
      if (mediaType === 'tv' && data.created_by?.length) {
        setDirectorOrCreator(data.created_by.map((c) => c.name).join(', '))
      }
      let imdbId = data.imdb_id
      if (!imdbId && mediaType === 'tv') {
        const ext = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/external_ids`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_TOKEN}`,
            },
          }
        )
        const extData = await ext.json()
        imdbId = extData.imdb_id
      }
      if (imdbId) {
        const omdb = await fetch(
          `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`
        )
        const omdbData = await omdb.json()
        if (omdbData.imdbRating !== 'N/A') setImdbRating(omdbData.imdbRating)
        if (omdbData.imdbVotes !== 'N/A') setImdbVotes(omdbData.imdbVotes)
      }
    } catch (err) {
      setError('Could not load details')
    }
  }

  const fetchCredits = async (id) => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${id}/credits`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_TOKEN}`,
          },
        }
      )
      const data = await res.json()
      if (mediaType === 'movie') {
        const director = data.crew?.find((c) => c.job === 'Director')
        if (director) setDirectorOrCreator(director.name)
      }
      setCast(
        data.cast?.filter((a) => a.profile_path).slice(0, 10) || []
      )
    } catch (err) {
      console.error('Credits failed')
    }
  }

  useEffect(() => {
    if (!submittedMovie) return
    const run = async () => {
      setLoading(true)
      setError('')
      setMovieData(null)
      setImdbRating(null)
      setImdbVotes(null)
      setDirectorOrCreator(null)
      setGenres([])
      setCast([])
      setOverview('')
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/${mediaType}?query=${encodeURIComponent(
            submittedMovie
          )}`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_TOKEN}`,
            },
          }
        )
        const data = await res.json()
        if (data.results?.length) {
          const item = data.results[0]
          setMovieData(item)
          fetchDetails(item.id)
          fetchCredits(item.id)
        } else {
          setError('No results found')
        }
      } catch (err) {
        setError('Search failed')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [submittedMovie, mediaType])

  const handleSearch = () => {
    if (movieName.trim()) setSubmittedMovie(movieName)
  }

  return (
    <>
      {/* Import Multiple Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      {!hasStarted && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: 'url("/landing-bg.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 20,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(20,20,20,0.75) 50%, rgba(0,0,0,0.85) 100%)',
              backdropFilter: 'blur(8px)',
            }}
          />
          
          <div
            style={{
              position: 'relative',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#fff',
              textAlign: 'center',
              animation: 'fadeIn 1s ease-out',
            }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              padding: '60px 80px',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              animation: 'scaleIn 0.8s ease-out'
            }}>
              <h1 style={{ 
                fontSize: '72px', 
                margin: '0 0 16px 0',
                fontFamily: `${SELECTED_FONT}, sans-serif`,
                fontWeight: '800',
                letterSpacing: '-2px',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}>
                🎬 Between Takes
              </h1>
              <p style={{ 
                opacity: 0.95, 
                fontSize: '22px', 
                margin: '0 0 40px 0',
                fontFamily: `${SELECTED_FONT}, sans-serif`,
                fontWeight: '400',
                letterSpacing: '0.5px'
              }}>
                Where ratings meet perspective
              </p>
              <button
                onClick={() => setHasStarted(true)}
                style={{
                  padding: '18px 48px',
                  fontSize: '18px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  border: 'none',
                  background: '#fff',
                  color: '#000',
                  fontFamily: `${SELECTED_FONT}, sans-serif`,
                  fontWeight: '600',
                  boxShadow: '0 8px 25px rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 35px rgba(255,255,255,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 25px rgba(255,255,255,0.3)'
                }}
              >
                Start Exploring
              </button>
            </div>
            
            <div style={{
              position: 'absolute',
              bottom: '40px',
              fontSize: '14px',
              opacity: 0.6,
              fontFamily: `${SELECTED_FONT}, sans-serif`,
              animation: 'fadeIn 2s ease-out'
            }}>
              Discover the true story behind the ratings
            </div>
          </div>
        </div>
      )}

      {hasStarted && (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            background: '#000',
            padding: '0',
            fontFamily: `${SELECTED_FONT}, sans-serif`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            animation: 'fadeIn 0.5s ease-out',
            overflow: 'auto'
          }}
        >
          {/* Top Header - Full Viewport */}
          <div style={{
            width: '100vw',
            background: '#111',
            padding: 'clamp(20px, 4vw, 40px) clamp(40px, 6vw, 80px)',
            textAlign: 'center',
            borderBottom: '1px solid #222',
            animation: 'slideDown 0.6s ease-out',
            boxSizing: 'border-box'
          }}>
            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#fff',
              margin: '0 0 8px 0',
              letterSpacing: '-1px'
            }}>
              🎬 Between Takes
            </h1>
            <p style={{ 
              color: '#888', 
              fontSize: '16px',
              margin: 0,
              fontWeight: '400'
            }}>
              Discover the rating gap
            </p>
          </div>

          {/* Hero Search Section - Full Viewport */}
          <div style={{
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: movieData ? 'flex-start' : 'center',
            padding: 'clamp(20px, 3vh, 40px) clamp(40px, 6vw, 80px)',
            flex: movieData ? '0' : '1',
            transition: 'all 0.5s ease',
            minHeight: movieData ? 'auto' : '70vh',
            boxSizing: 'border-box'
          }}>
            
            {/* Toggle Buttons - HIGHER POSITION */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px',
              width: '100%',
              animation: 'fadeInUp 0.7s ease-out'
            }}>
              <div style={{
                display: 'inline-flex',
                background: '#111',
                borderRadius: '10px',
                padding: '4px',
                border: '1px solid #222',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}>
                <button
                  onClick={() => setMediaType('movie')}
                  style={{
                    padding: '8px 24px',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: mediaType === 'movie' ? '#fff' : 'transparent',
                    color: mediaType === 'movie' ? '#000' : '#666',
                    transition: 'all 0.3s ease',
                  }}
                >
                  🎬 Movies
                </button>
                <button
                  onClick={() => setMediaType('tv')}
                  style={{
                    padding: '8px 24px',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: mediaType === 'tv' ? '#fff' : 'transparent',
                    color: mediaType === 'tv' ? '#000' : '#666',
                    transition: 'all 0.3s ease',
                  }}
                >
                  📺 TV Shows
                </button>
              </div>
            </div>

            {/* Search Bar - SMALLER SIZE */}
            <div style={{
              display: 'flex',
              gap: 'clamp(10px, 1.5vw, 16px)',
              width: 'clamp(280px, 70vw, 800px)',
              maxWidth: '85vw',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 auto',
              animation: 'fadeInUp 0.8s ease-out'
            }}>
              <input
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Search ${mediaType === 'movie' ? 'movies' : 'TV shows'}...`}
                style={{
                  flex: 1,
                  padding: 'clamp(12px, 2vw, 18px) clamp(16px, 3vw, 24px)',
                  fontSize: 'clamp(13px, 2vw, 16px)',
                  background: '#111',
                  border: '2px solid #222',
                  borderRadius: 'clamp(8px, 1.5vw, 12px)',
                  color: '#fff',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontWeight: '400'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#fff'
                  e.target.style.boxShadow = '0 0 0 4px rgba(255,255,255,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#222'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  padding: 'clamp(12px, 2vw, 18px) clamp(24px, 4vw, 40px)',
                  fontSize: 'clamp(13px, 2vw, 15px)',
                  fontWeight: '600',
                  borderRadius: 'clamp(8px, 1.5vw, 12px)',
                  border: 'none',
                  background: loading ? '#333' : '#fff',
                  color: loading ? '#666' : '#000',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 8px 24px rgba(255,255,255,0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 16px rgba(255,255,255,0.2)'
                }}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 'clamp(20px, 3vw, 25px)',
                padding: 'clamp(14px, 2vw, 20px) clamp(20px, 3vw, 30px)',
                background: '#1a0000',
                border: '1px solid #330000',
                borderRadius: 'clamp(10px, 2vw, 12px)',
                color: '#ff6b6b',
                fontSize: 'clamp(14px, 2vw, 15px)',
                width: 'clamp(300px, 80vw, 900px)',
                maxWidth: '90vw',
                textAlign: 'center',
                margin: 'clamp(20px, 3vw, 25px) auto 0',
                animation: 'shake 0.5s ease-out'
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Content Area - Full Viewport */}
          <div style={{ 
            width: '100vw',
            padding: '0 clamp(20px, 4vw, 60px) clamp(40px, 6vw, 80px)',
            boxSizing: 'border-box'
          }}>
            
            {/* Loading Spinner */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '80px 0', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  border: '4px solid #222',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <p style={{ color: '#666', fontSize: '16px' }}>
                  Loading {mediaType}...
                </p>
              </div>
            )}

            {/* Results */}
            {movieData && !loading && (
              <div style={{
                background: '#111',
                borderRadius: '16px',
                padding: '50px',
                border: '1px solid #222',
                maxWidth: '1600px',
                margin: '0 auto',
                animation: 'fadeInUp 0.6s ease-out'
              }}>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '300px 1fr',
                  gap: '50px'
                }}>
                  
                  {/* Poster */}
                  <div style={{ animation: 'fadeInLeft 0.7s ease-out' }}>
                    {movieData.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movieData.poster_path}`}
                        alt={movieData.title || movieData.name}
                        style={{
                          width: '100%',
                          borderRadius: '12px',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        aspectRatio: '2/3',
                        background: '#000',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#444',
                        border: '2px dashed #222'
                      }}>
                        No Poster
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ animation: 'fadeInRight 0.7s ease-out' }}>
                    <h2 style={{
                      fontSize: '38px',
                      fontWeight: '700',
                      margin: '0 0 12px 0',
                      color: '#fff',
                      letterSpacing: '-0.5px'
                    }}>
                      {movieData.title || movieData.name}
                    </h2>

                    {directorOrCreator && (
                      <p style={{
                        fontSize: '16px',
                        color: '#888',
                        margin: '0 0 24px 0',
                        fontStyle: 'italic',
                        fontWeight: '400'
                      }}>
                        {mediaType === 'movie' ? 'Directed by' : 'Created by'} {directorOrCreator}
                      </p>
                    )}

                    {/* Genres */}
                    {genres.length > 0 && (
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
                        {genres.map((g, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '6px 14px',
                              background: '#000',
                              border: '1px solid #222',
                              borderRadius: '20px',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: '#aaa',
                              animation: `fadeInUp ${0.5 + i * 0.1}s ease-out`
                            }}
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Overview */}
                    <p style={{
                      fontSize: '15px',
                      lineHeight: '1.8',
                      color: '#bbb',
                      marginBottom: '40px',
                      fontWeight: '400'
                    }}>
                      {overview || 'No overview available.'}
                    </p>

                    {/* Rating Cards - SMALLER */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '16px',
                      marginBottom: '28px'
                    }}>
                      
                      <div style={{
                        background: '#fff',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        color: '#000',
                        boxShadow: '0 6px 16px rgba(255,255,255,0.1)',
                        animation: 'fadeInUp 0.8s ease-out',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(255,255,255,0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,255,255,0.1)'
                      }}
                      >
                        <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          TMDb
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: '700' }}>
                          {movieData.vote_average?.toFixed(1)}
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.6 }}>
                          / 10
                        </div>
                      </div>

                      <div style={{
                        background: '#fff',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        color: '#000',
                        boxShadow: '0 6px 16px rgba(255,255,255,0.1)',
                        animation: 'fadeInUp 0.9s ease-out',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(255,255,255,0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,255,255,0.1)'
                      }}
                      >
                        <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          IMDb
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: '700' }}>
                          {imdbRating || '...'}
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.6 }}>
                          / 10
                        </div>
                      </div>

                      {imdbVotes && (
                        <div style={{
                          background: '#fff',
                          padding: '20px',
                          borderRadius: '12px',
                          textAlign: 'center',
                          color: '#000',
                          boxShadow: '0 6px 16px rgba(255,255,255,0.1)',
                          animation: 'fadeInUp 1s ease-out',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          cursor: 'default'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)'
                          e.currentTarget.style.boxShadow = '0 12px 24px rgba(255,255,255,0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,255,255,0.1)'
                        }}
                        >
                          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Votes
                          </div>
                          <div style={{ fontSize: '24px', fontWeight: '700' }}>
                            {imdbVotes}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Verdict */}
                    {imdbRating && (
                      <div style={{
                        background: '#000',
                        padding: '20px',
                        borderRadius: '12px',
                        borderLeft: '4px solid #fff',
                        animation: 'fadeInUp 1.1s ease-out'
                      }}>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#fff',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>
                          Analysis
                        </div>
                        <div style={{
                          fontSize: '15px',
                          color: '#bbb',
                          lineHeight: '1.7',
                          fontWeight: '400'
                        }}>
                          {generateVerdict(
                            movieData.vote_average,
                            parseFloat(imdbRating),
                            imdbVotes,
                            movieData.popularity
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cast Section */}
                {cast.length > 0 && (
                  <div style={{ marginTop: '50px' }}>
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      marginBottom: '25px',
                      color: '#fff',
                      animation: 'fadeIn 1.2s ease-out'
                    }}>
                      Featured Cast
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                      gap: '24px'
                    }}>
                      {cast.map((actor, idx) => (
                        <div 
                          key={actor.id} 
                          style={{ 
                            textAlign: 'center',
                            animation: `fadeInUp ${1.3 + idx * 0.1}s ease-out`,
                            transition: 'transform 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <img
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            style={{
                              width: '100%',
                              borderRadius: '10px',
                              marginBottom: '12px',
                              boxShadow: '0 6px 16px rgba(0,0,0,0.6)'
                            }}
                          />
                          <p style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#fff',
                            margin: '0 0 4px 0'
                          }}>
                            {actor.name}
                          </p>
                          <p style={{
                            fontSize: '13px',
                            color: '#888',
                            margin: 0,
                            fontWeight: '400'
                          }}>
                            {actor.character}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fadeInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
        `}
      </style>
    </>
  )
}

export default App
