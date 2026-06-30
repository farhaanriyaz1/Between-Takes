const MovieCard = ({ movie, index = 0 }) => {
  return (
    <div
      className="movie-card"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Poster */}
      <div className="movie-card-poster">
        <img
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : 'https://via.placeholder.com/500x750?text=No+Poster'
          }
          alt={movie.title}
          loading="lazy"
        />

        {/* Gradient Overlay on hover */}
        <div className="movie-card-overlay">
          <span className="movie-card-overlay-text">View Details →</span>
        </div>

        {/* Rating Badge */}
        {movie.vote_average > 0 && (
          <div className="movie-card-rating">
            ⭐ {movie.vote_average?.toFixed(1)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        <p className="movie-card-year">
          {movie.release_date?.split('-')[0] || "Upcoming"}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;