import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieDetails, getImdbId, getExtraRatings } from '../services/api';
import { fetchMovieComments, createMovieComment, deleteMovieComment } from '../services/comments';
import { useAuth } from '../context/AuthContext';

const MovieDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [extraRatings, setExtraRatings] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState(() => localStorage.getItem('bt_guest_name') || '');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState('');

  const activeUsername = user?.username || guestName.trim();

  useEffect(() => {
    const fetchDetails = async () => {
      setMovie(null);
      setExtraRatings(null);

      const tmdbData = await getMovieDetails(id);
      setMovie(tmdbData);

      const imdbId = await getImdbId(id);
      if (imdbId) {
        const ratings = await getExtraRatings(imdbId);
        setExtraRatings(ratings);
      }
    };
    fetchDetails();
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true);
      setCommentsError('');

      try {
        const data = await fetchMovieComments(id);
        setComments(data);
      } catch (error) {
        setCommentsError(error.message || 'Unable to load comments');
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [id]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('bt_guest_name', guestName.trim());
    }
  }, [guestName, user]);

  const handleAddComment = async (event) => {
    event.preventDefault();
    setCommentsError('');

    const trimmedText = commentText.trim();
    if (!activeUsername || !trimmedText) {
      setCommentsError('Please enter your name and comment text.');
      return;
    }

    try {
      setIsSubmittingComment(true);
      const createdComment = await createMovieComment({
        movieId: id,
        username: activeUsername,
        text: trimmedText
      });

      setComments((previous) => [createdComment, ...previous]);
      setCommentText('');
    } catch (error) {
      setCommentsError(error.message || 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user?.username) return;

    try {
      setDeletingCommentId(commentId);
      await deleteMovieComment({
        commentId,
        username: user.username
      });
      setComments((previous) => previous.filter((comment) => comment._id !== commentId));
    } catch (error) {
      setCommentsError(error.message || 'Failed to delete comment');
    } finally {
      setDeletingCommentId('');
    }
  };

  if (!movie) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span className="loading-text">Loading the magic...</span>
      </div>
    );
  }

  const director = movie.credits?.crew?.find(person => person.job === "Director")?.name || "Unknown";
  const topCast = movie.credits?.cast?.slice(0, 8) || [];

  // Calculate the "Between Takes" Custom Average Score
  let btScore = "N/A";
  if (extraRatings) {
    let total = 0;
    let count = 0;
    if (movie.vote_average) { total += movie.vote_average; count++; }
    if (extraRatings.imdb && extraRatings.imdb !== "N/A") { total += parseFloat(extraRatings.imdb); count++; }
    if (extraRatings.rt && extraRatings.rt !== "N/A") { total += parseFloat(extraRatings.rt) / 10; count++; }
    if (count > 0) btScore = (total / count).toFixed(1);
  }

  return (
    <div className="details-page">
      {/* Cinematic Backdrop */}
      {movie.backdrop_path && (
        <div className="details-backdrop">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt=""
          />
          <div className="details-backdrop-gradient" />
        </div>
      )}

      {/* Content */}
      <div className="details-content">
        <Link to="/" className="details-back-btn" id="back-btn">
          ← Back to Home
        </Link>

        <div className="details-layout">
          {/* Left Column: Poster */}
          <div className="details-poster-col">
            <div className="details-poster">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
              />
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="details-info-col">
            <h1 className="details-title">{movie.title}</h1>

            <div className="details-meta">
              <span>{movie.release_date?.split('-')[0]}</span>
              <span className="details-meta-divider">•</span>
              <span>{movie.runtime} min</span>
              <span className="details-meta-divider">•</span>
              <span>Directed by {director}</span>
            </div>

            {/* Genre Pills */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="details-genres">
                {movie.genres.map(genre => (
                  <span key={genre.id} className="genre-pill">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <p className="details-overview">{movie.overview}</p>

            {/* Ratings Dashboard */}
            <h3 className="details-ratings-header">Rating Breakdown</h3>
            <div className="details-ratings-grid">
              <div className="rating-card rating-card--bt">
                <span className="rating-card-label">Between Takes Score</span>
                <span className="rating-card-value">{btScore}</span>
              </div>
              <div className="rating-card rating-card--tmdb">
                <span className="rating-card-label">TMDB</span>
                <span className="rating-card-value">
                  ⭐ {movie.vote_average?.toFixed(1)}
                </span>
              </div>
              <div className="rating-card rating-card--imdb">
                <span className="rating-card-label">IMDb</span>
                <span className="rating-card-value">
                  🎬 {extraRatings ? extraRatings.imdb : '...'}
                </span>
              </div>
              <div className="rating-card rating-card--rt">
                <span className="rating-card-label">Rotten Tomatoes</span>
                <span className="rating-card-value">
                  🍅 {extraRatings ? extraRatings.rt : '...'}
                </span>
              </div>
            </div>

            {/* Cast Section */}
            {topCast.length > 0 && (
              <>
                <h3 className="details-cast-header">Top Cast</h3>
                <div className="details-cast-grid">
                  {topCast.map(actor => (
                    <Link to={`/actor/${actor.id}`} key={actor.id} className="cast-member cast-member--link">
                      <img
                        className="cast-avatar"
                        src={
                          actor.profile_path
                            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name)}&background=110f24&color=a78bfa&size=100&bold=true`
                        }
                        alt={actor.name}
                        loading="lazy"
                      />
                      <span className="cast-name">{actor.name}</span>
                      <span className="cast-character">{actor.character}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}

            <section className="details-comments-section">
              <h3 className="details-comments-header">Comments</h3>

              <form className="details-comment-form" onSubmit={handleAddComment}>
                {!user && (
                  <input
                    type="text"
                    className="details-comment-input"
                    placeholder="Your name"
                    maxLength={60}
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                  />
                )}

                <textarea
                  className="details-comment-textarea"
                  placeholder="Share your take on this movie..."
                  maxLength={1000}
                  rows={3}
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                />

                <button className="details-comment-submit" type="submit" disabled={isSubmittingComment}>
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              {commentsError && <p className="details-comments-error">{commentsError}</p>}

              {commentsLoading ? (
                <p className="details-comments-state">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="details-comments-state">No comments yet. Be the first to comment.</p>
              ) : (
                <div className="details-comments-list">
                  {comments.map((comment) => {
                    const canDelete = Boolean(user?.username && comment.username === user.username);

                    return (
                      <article key={comment._id} className="details-comment-card">
                        <div className="details-comment-meta">
                          <span className="details-comment-author">{comment.username}</span>
                          <span className="details-comment-date">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="details-comment-text">{comment.text}</p>
                        {canDelete && (
                          <button
                            className="details-comment-delete"
                            type="button"
                            onClick={() => handleDeleteComment(comment._id)}
                            disabled={deletingCommentId === comment._id}
                          >
                            {deletingCommentId === comment._id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;