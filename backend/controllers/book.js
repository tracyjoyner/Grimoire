const Book = require("../models/book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  console.log(req.file);
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
    averageRating: req.body.book.averageRating,
  });
  book
    .save()
    .then(() => {
      res.status(201).json({
        message: "Book entered successfully!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
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
      averageRating: req.body.averageRating,
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
      averageRating: req.body.averageRating,
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
        error: new Error("Book not found!"),
      });
    }
    if (book.userId !== req.auth.userId) {
      return res.status(400).json({
        error: new Error("Request not authorized!"),
      });
    }
    const filename = book.imageUrl.split("/images/")[1];
    fs.unlink("images/" + filename, () => {
      Book.deleteOne({ _id: req.params.id })
        .then(() => {
          res.status(200).json({
            message: "Book Deleted!",
          });
        })
        .catch((error) => {
          res.status(400).json({
            error: error,
          });
        });
    });
  });
};

exports.bookRating = (req, res, next) => {
  const { userId, rating } = req.body;
  const user = req.body.userId;

  if (user !== req.auth.userId) {
    return res
      .status(401)
      .json({ error: new Error("Request not authorized!") });
  }
  if (rating < 0 || rating > 5) {
    return res
      .status(400)
      .json({ error: new Error("Must be a number from 0 to 5") });
  }
  Book.findById(req.params.id)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: new Error("Book not found") });
      }
      const userRating = book.ratings.find(
        (rating) => rating.userId === userId
      );
      if (userRating) {
        return res
          .status(400)
          .json({ error: new Error("User has already rated this book") });
      }
      book.ratings.push({ userId, grade: rating });

      const totalRatings = book.ratings.length;
      const sumRatings = book.ratings.reduce(
        (sum, rating) => sum + rating.grade,
        0
      );
      const averageRating = sumRatings / totalRatings;
      book.averageRating = averageRating;

      book
        .save()
        .then((updatedBook) => {
          res.status(200).json(updatedBook);
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
