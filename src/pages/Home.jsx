import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrendingMovies, searchMovies, searchPeople } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';

const SKELETON_COUNT = 12;

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [people, setPeople] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState("movies"); // "movies" | "actors"
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const loadTrending = async () => {
      setLoading(true);
      const trending = await getTrendingMovies();
      setMovies(trending);
      setLoading(false);
    };
    loadTrending();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    setHasSearched(true);

    if (searchMode === "movies") {
      const results = await searchMovies(searchTerm);
      setMovies(results);
      setPeople([]);
    } else {
      const results = await searchPeople(searchTerm);
      setPeople(results);
      setMovies([]);
    }

    setLoading(false);
  };

  const clearSearch = async () => {
    setSearchTerm("");
    setHasSearched(false);
    setPeople([]);
    setLoading(true);
    const trending = await getTrendingMovies();
    setMovies(trending);
    setLoading(false);
  };

  const switchMode = (mode) => {
    setSearchMode(mode);
    // If there's already a search term, re-search with the new mode
    if (searchTerm.trim() && hasSearched) {
      setLoading(true);
      if (mode === "movies") {
        searchMovies(searchTerm).then(results => {
          setMovies(results);
          setPeople([]);
          setLoading(false);
        });
      } else {
        searchPeople(searchTerm).then(results => {
          setPeople(results);
          setMovies([]);
          setLoading(false);
        });
      }
    }
  };

  const showingActors = hasSearched && searchMode === "actors" && people.length > 0;

  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/" className="nav-logo">Between Takes</Link>
        <div className="nav-search-group">
          {/* Search mode toggle */}
          <div className="search-mode-toggle">
            <button
              type="button"
              className={`search-mode-btn ${searchMode === 'movies' ? 'active' : ''}`}
              onClick={() => switchMode('movies')}
            >
              🎬 Movies
            </button>
            <button
              type="button"
              className={`search-mode-btn ${searchMode === 'actors' ? 'active' : ''}`}
              onClick={() => switchMode('actors')}
            >
              🎭 Actors
            </button>
          </div>
          <form onSubmit={handleSearch} className="nav-search">
            <input
              type="text"
              placeholder={searchMode === 'movies' ? 'Search for movies...' : 'Search for actors...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="search-input"
            />
            <button type="submit" id="search-btn">Search</button>
          </form>
        </div>
        {/* Auth Button */}
        <div className="nav-auth">
          {user ? (
            <div className="nav-user">
              <div className="nav-user-avatar">{user.username.charAt(0).toUpperCase()}</div>
              <span className="nav-user-name">{user.username}</span>
              <button onClick={logout} className="nav-signout-btn" id="signout-btn">Sign Out</button>
            </div>
          ) : (
            <Link to="/auth" className="nav-signin-btn" id="signin-btn">Sign In</Link>
          )}
        </div>
      </nav>

      <main className="main-content">
        <header className="hero">
          <div className="hero-content">
            {hasSearched ? (
              <>
                <h1>
                  {searchMode === 'actors' ? '🎭 ' : ''}
                  Results for "<span className="accent">{searchTerm}</span>"
                </h1>
                <div className="search-status">
                  <span className="hero-tagline">
                    {searchMode === 'movies'
                      ? `${movies.length} movies found`
                      : `${people.length} actors found`
                    }
                  </span>
                  <button onClick={clearSearch} className="clear-search-btn" type="button" id="clear-search">
                    ✕ Clear Search
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1><span className="accent">Trending</span> Today</h1>
                <p className="hero-tagline">
                  Discover what everyone's watching — powered by real-time data
                </p>
              </>
            )}
          </div>
        </header>

        {loading ? (
          <div className="skeleton-grid">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div className="skeleton-card" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="skeleton-poster" />
                <div className="skeleton-info">
                  <div className="skeleton-title" />
                  <div className="skeleton-year" />
                </div>
              </div>
            ))}
          </div>
        ) : showingActors ? (
          /* ====== ACTOR RESULTS GRID ====== */
          <div className="actor-grid">
            {people
              .filter(p => p.known_for_department === "Acting")
              .map((person, index) => (
              <Link
                to={`/actor/${person.id}`}
                key={person.id}
                className="movie-grid-link"
              >
                <div
                  className="actor-card"
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <div className="actor-card-photo">
                    <img
                      src={
                        person.profile_path
                          ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=110f24&color=a78bfa&size=300&bold=true`
                      }
                      alt={person.name}
                      loading="lazy"
                    />
                    <div className="actor-card-overlay">
                      <span className="movie-card-overlay-text">View Profile →</span>
                    </div>
                  </div>
                  <div className="actor-card-info">
                    <h3 className="actor-card-name">{person.name}</h3>
                    {person.known_for && person.known_for.length > 0 && (
                      <p className="actor-card-known">
                        Known for: {person.known_for.slice(0, 2).map(m => m.title || m.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* ====== MOVIE RESULTS GRID ====== */
          <div className="movie-grid">
            {movies.map((movie, index) => (
              <Link
                to={`/movie/${movie.id}`}
                key={movie.id}
                className="movie-grid-link"
              >
                <MovieCard movie={movie} index={index} />
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <span className="footer-brand">Between Takes</span> — Cinematic ratings at a glance
      </footer>
    </div>
  );
};

export default Home;