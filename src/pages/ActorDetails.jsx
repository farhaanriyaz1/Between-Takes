import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPersonDetails } from '../services/api';

const ActorDetails = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    const fetchPerson = async () => {
      setPerson(null);
      const data = await getPersonDetails(id);
      setPerson(data);
    };
    fetchPerson();
    window.scrollTo(0, 0);
  }, [id]);

  if (!person) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span className="loading-text">Loading actor profile...</span>
      </div>
    );
  }

  // Get movies sorted by popularity, deduplicated
  const allMovies = person.movie_credits?.cast || [];
  const seenIds = new Set();
  const uniqueMovies = allMovies
    .filter(m => {
      if (seenIds.has(m.id)) return false;
      seenIds.add(m.id);
      return m.poster_path; // only show movies with posters
    })
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  const age = person.birthday
    ? (() => {
        const birth = new Date(person.birthday);
        const ref = person.deathday ? new Date(person.deathday) : new Date();
        let a = ref.getFullYear() - birth.getFullYear();
        const m = ref.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) a--;
        return a;
      })()
    : null;

  const biography = person.biography || "No biography available for this person.";
  const shortBio = biography.length > 400 ? biography.slice(0, 400) + "..." : biography;

  return (
    <div className="details-page">
      {/* Ambient Background */}
      <div className="actor-bg-glow" />

      <div className="details-content">
        <Link to="/" className="details-back-btn" id="back-btn">
          ← Back to Home
        </Link>

        {/* Actor Header */}
        <div className="actor-header">
          <div className="actor-photo-col">
            <div className="actor-photo">
              <img
                src={
                  person.profile_path
                    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=110f24&color=a78bfa&size=400&bold=true`
                }
                alt={person.name}
              />
            </div>
          </div>

          <div className="actor-info-col">
            <h1 className="actor-name">{person.name}</h1>

            <div className="actor-meta">
              {person.known_for_department && (
                <span className="actor-meta-tag actor-meta-tag--role">
                  {person.known_for_department}
                </span>
              )}
              {person.birthday && (
                <span className="actor-meta-tag">
                  Born {new Date(person.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              {age !== null && !person.deathday && (
                <span className="actor-meta-tag">
                  Age {age}
                </span>
              )}
              {person.deathday && (
                <span className="actor-meta-tag actor-meta-tag--muted">
                  Died {new Date(person.deathday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} (age {age})
                </span>
              )}
              {person.place_of_birth && (
                <span className="actor-meta-tag">
                  📍 {person.place_of_birth}
                </span>
              )}
            </div>

            {/* Bio */}
            <div className="actor-bio">
              <p>{showFullBio ? biography : shortBio}</p>
              {biography.length > 400 && (
                <button
                  className="actor-bio-toggle"
                  onClick={() => setShowFullBio(!showFullBio)}
                  type="button"
                >
                  {showFullBio ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="actor-stats">
              <div className="actor-stat">
                <span className="actor-stat-value">{uniqueMovies.length}</span>
                <span className="actor-stat-label">Movies</span>
              </div>
              {person.popularity && (
                <div className="actor-stat">
                  <span className="actor-stat-value">{person.popularity.toFixed(0)}</span>
                  <span className="actor-stat-label">Popularity</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filmography */}
        <section className="actor-filmography">
          <h2 className="actor-section-header">
            Filmography
            <span className="actor-section-count">{uniqueMovies.length} movies</span>
          </h2>

          <div className="movie-grid">
            {uniqueMovies.map((movie, index) => (
              <Link
                to={`/movie/${movie.id}`}
                key={movie.id}
                className="movie-grid-link"
              >
                <div
                  className="movie-card"
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <div className="movie-card-poster">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      loading="lazy"
                    />
                    <div className="movie-card-overlay">
                      <span className="movie-card-overlay-text">
                        {movie.character ? `as ${movie.character}` : 'View Details →'}
                      </span>
                    </div>
                    {movie.vote_average > 0 && (
                      <div className="movie-card-rating">
                        ⭐ {movie.vote_average?.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="movie-card-info">
                    <h3 className="movie-card-title">{movie.title}</h3>
                    <p className="movie-card-year">
                      {movie.release_date?.split('-')[0] || "Upcoming"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ActorDetails;
