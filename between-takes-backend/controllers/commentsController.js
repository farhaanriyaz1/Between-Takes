const mongoose = require('mongoose');
const Comment = require('../models/Comment');

const inMemoryComments = new Map();
const isDatabaseReady = () => mongoose.connection.readyState === 1;

const getMovieBucket = (movieId) => {
  if (!inMemoryComments.has(movieId)) {
    inMemoryComments.set(movieId, []);
  }
  return inMemoryComments.get(movieId);
};

const getCommentsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({ error: 'movieId is required' });
    }

    if (isDatabaseReady()) {
      const comments = await Comment.find({ movieId }).sort({ createdAt: -1 });
      return res.json(comments);
    }

    const comments = [...getMovieBucket(movieId)].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return res.json(comments);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

const createComment = async (req, res) => {
  try {
    const { movieId, username, text } = req.body;

    if (!movieId || !username || !text) {
      return res.status(400).json({ error: 'movieId, username, and text are required' });
    }

    const normalizedMovieId = String(movieId).trim();
    const normalizedUsername = String(username).trim();
    const normalizedText = String(text).trim();

    if (isDatabaseReady()) {
      const comment = await Comment.create({
        movieId: normalizedMovieId,
        username: normalizedUsername,
        text: normalizedText
      });

      return res.status(201).json(comment);
    }

    const comment = {
      _id: new mongoose.Types.ObjectId().toString(),
      movieId: normalizedMovieId,
      username: normalizedUsername,
      text: normalizedText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const bucket = getMovieBucket(normalizedMovieId);
    bucket.unshift(comment);
    return res.status(201).json(comment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to create comment' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { username } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ error: 'Invalid comment id' });
    }

    if (!username) {
      return res.status(400).json({ error: 'username is required to delete comment' });
    }

    if (isDatabaseReady()) {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.username !== String(username).trim()) {
        return res.status(403).json({ error: 'You can only delete your own comments' });
      }

      await comment.deleteOne();
      return res.status(204).send();
    }

    const normalizedUsername = String(username).trim();
    const allMovies = [...inMemoryComments.keys()];

    for (const movieId of allMovies) {
      const bucket = getMovieBucket(movieId);
      const index = bucket.findIndex((item) => item._id === commentId);

      if (index === -1) continue;

      if (bucket[index].username !== normalizedUsername) {
        return res.status(403).json({ error: 'You can only delete your own comments' });
      }

      bucket.splice(index, 1);
      return res.status(204).send();
    }

    return res.status(404).json({ error: 'Comment not found' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
};

module.exports = {
  getCommentsByMovie,
  createComment,
  deleteComment
};
