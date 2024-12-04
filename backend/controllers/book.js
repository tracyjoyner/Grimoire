const Book = require("../models/book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  req.body.book = JSON.parse(req.body.book);
  const url = req.protocol + "://" + req.get("host");
  const book = new Book({
    userId: req.body.book.userId,
    title: req.body.book.title,
    author: req.body.book.author,
    imageUrl: url + "/images/" + req.file.filename,
    year: req.body.book.year,
    genre: req.body.book.genre,
    ratings: req.body.book.ratings,
    avergeRating: req.body.book.avergeRating,
  });
  book
    .save()
    .then(() => {
      res.status(201).json({
        message: "Post saved successfully!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.updateBook = (req, res, next) => {
  let book = new Book({ _id: req.params._id });
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    req.body.book = JSON.parse(req.body.book);
    book = {
      _id: req.params.id,
      userId: req.body.userId,
      title: req.body.title,
      author: req.body.author,
      imageUrl: url + "/images/" + req.file.filename,
      year: req.body.year,
      genre: req.body.genre,
      ratings: req.body.ratings,
      avergeRating: req.body.avergeRating,
    };
  } else {
    book = {
      _id: req.params.id,
      userId: req.body.userId,
      title: req.body.title,
      author: req.body.author,
      imageUrl: req.body.imageUrl,
      year: req.body.year,
      genre: req.body.genre,
      ratings: req.body.ratings,
      avergeRating: req.body.avergeRating,
    };
  }
  Book.updateOne({ _id: req.params.id }, book)
    .then(() => {
      res.status(201).json({
        message: "Book updated successfully!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }).then((book) => {
    if (!book) {
      return res.status(404).json({
        error: new Error("Item not found!"),
      });
    }
    if (book.userId !== req.auth.userId) {
      return res.status(400).json({
        error: new Error("Request not authorized!"),
      });
    }
    const filename = book.imageUrl.split("/images/")[1];
    fs.unlink("images/" + filename, () => {
      Book.deleteOne({ _id: req.params.id }).then(() => {
        res.status(200).json({
          message: "Book Deleted!",
        });
      });
    }).catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
  });
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};
