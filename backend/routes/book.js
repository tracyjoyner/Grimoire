const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book");

router.get("/", bookCtrl.getAllBooks);
router.post("/", auth, multer, bookCtrl.createBook);
router.get("/:id", bookCtrl.getOneBook);
router.put("/:id", auth, multer, bookCtrl.updateBook);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.post("/:id/rating", auth, bookCtrl.bookRating);
router.get("/", bookCtrl.getBestRating);

module.exports = router;
