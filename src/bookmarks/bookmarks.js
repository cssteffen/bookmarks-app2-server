const express = require("express");
//const uuid = require("uuid/v4");
const logger = require("../logger");
//const { bookmarks } = require("../store");
const xss = require("xss");
const BookmarksService = require("./bookmarks-service");

const bookmarkRouter = express.Router();
const bodyParser = express.json();

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating)
});
/*========ENDPOINT /bookmarks ==========*/
bookmarkRouter
  .route("/bookmarks")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    //res.json(bookmarks);
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { title, url, rating, description } = req.body;
    const newBookmark = { title, url, rating, description };

    for (const [key, value] of Object.entries(newBookmark)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    //const { title, url, rating, description } = req.body;
    /*
    if (!title) {
      logger.error("Title is required");
      return res.status(400).send("Invalid data");
    }

    if (!url) {
      logger.error("URL is required");
      return res.status(400).send("Invalid data");
    }
*/
    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`Invalid rating ${rating} supplied`);
      return res.status(400).send(`Rating must be a number between 0 and 5.`);
    }
    const knexInstance = req.app.get("db");

    BookmarksService.insertBookmakr(knexInstance, newBookmark)
      .then(bookmark => {
        logger.info(`Bookmark with id ${bookmark.id} created.`);
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(serializeBookmark(bookmark));
      })
      .catch(next);
    /*
    //get an id
    const id = uuid();

    const bookmark = {
      id,
      title,
      url,
      rating,
      description
    };

    bookmarks.push(bookmark);

    logger.info(`Bookmark with id ${id} created`);

    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark);
      */
  });

/*========ENDPOINT /bookmarks/:id ==========*/
bookmarkRouter
  .route("/bookmarks/:id")
  .all((req, res, next) => {
    const { id } = req.params;
    const knexInstance = req.app.get("db");
    BookmarksService.getById(knexInstance, id)
      .then(bookmark => {
        //make sure we found a bookmark
        if (!bookmark) {
          logger.error(`Bookmark with id ${id} not found.`);
          return res.status(404).json({
            error: { message: "Bookmark Not Found" }
          });
        }
        res.json(bookmark);
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeBookmark(res.bookmark));
  })
  /*
  .get((req, res, next) => {
    const { id } = req.params;
    const knexInstance = req.app.get("db");
    BookmarksService.getById(knexInstance, id)
      .then(bookmark => {
        //make sure we found a bookmark
        if (!bookmark) {
          logger.error(`Bookmark with id ${id} not found.`);
          return res.status(404).json({
            error: { message: "Bookmark Not Found" }
          });
        }
        res.json(bookmark);
        next();
      })
      .catch(next);
  })
  */
  .delete((req, res, next) => {
    const { id } = req.params;
    const knexInstance = req.app.get("db");

    BookmarksService.deleteBookmark(knexInstance, id)
      .then(numRowsAffected => {
        res.status(204).end();
        logger.info(`Bookmark with id ${id} deleted.`);
      })
      .catch(next);

    //const listIndex = bookmarks.findIndex(li => li.id == id);
    /*
    if (listIndex === -1) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send("Bookmark Not Found");
    }
    bookmarks.splice(listIndex, 1);

    logger.info(`Bookmark with id ${id} deleted.`);
    res.status(204).end();
    */
  });

module.exports = bookmarkRouter;

//const bookmarks = [
// {
//   id: 0,
//   title: 'Google',
//   url: 'http://www.google.com',
//   rating: '3',
//   desc: 'Internet-related services and products.'
// },
