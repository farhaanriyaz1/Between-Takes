const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const OMDB_BASE_URL = "https://www.omdbapi.com/";

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;
const OMDB_KEY = import.meta.env.VITE_OMDB_API_KEY;

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
};

// ========== MOVIE ENDPOINTS ==========

export const getTrendingMovies = async () => {
  const response = await fetch(`${TMDB_BASE_URL}/trending/movie/day?language=en-US`, options);
  const data = await response.json();
  return data.results;
};

export const searchMovies = async (query) => {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
    options
  );
  const data = await response.json();
  return data.results;
};

export const getMovieDetails = async (movieId) => {
  const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?language=en-US&append_to_response=credits`, options);
  return await response.json();
};

export const getImdbId = async (tmdbId) => {
  const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}/external_ids`, options);
  const data = await response.json();
  return data.imdb_id;
};

export const getExtraRatings = async (imdbId) => {
  if (!imdbId) return null;

  try {
    const response = await fetch(`${OMDB_BASE_URL}?apikey=${OMDB_KEY}&i=${imdbId}`);
    const data = await response.json();

    return {
      imdb: data.imdbRating,
      rt: data.Ratings?.find(r => r.Source === "Rotten Tomatoes")?.Value || "N/A",
      meta: data.Metascore
    };
  } catch (error) {
    console.error("OMDb fetch error:", error);
    return null;
  }
};

// ========== PERSON / ACTOR ENDPOINTS ==========

export const searchPeople = async (query) => {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/person?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
    options
  );
  const data = await response.json();
  return data.results;
};

export const getPersonDetails = async (personId) => {
  const response = await fetch(
    `${TMDB_BASE_URL}/person/${personId}?language=en-US&append_to_response=movie_credits,images`,
    options
  );
  return await response.json();
};