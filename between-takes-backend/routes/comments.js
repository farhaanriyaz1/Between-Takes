const express = require('express');
const router = express.Router();
const {
  getCommentsByMovie,
  createComment,
  deleteComment
} = require('../controllers/commentsController');

router.get('/:movieId', getCommentsByMovie);
router.post('/', createComment);
router.delete('/:commentId', deleteComment);

module.exports = router;