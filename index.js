const http = require("node:http");
const fs = require("node:fs");

const { resUtil, getNewId } = require("./utils/utils.js");
let books = require("./database/data.json");

const PORT = process.env.PORT || 5000;

const server = http.createServer(function (req, res) {
    const { url, method } = req;

    if (url === "/") {
        // Root Path
        switch (method) {
            case "GET":
                resUtil(res, 200, "json", {
                    status: true,
                    message: "Root route",
                });
                break;
            default:
                resUtil(res, 404, "json", {
                    status: false,
                    message: "Invalid method",
                });
                break;
        }
    } else if (url === "/books") {
        // Get Books
        let body;
        switch (method) {
            case "GET":
                resUtil(res, 200, "json", {
                    status: true,
                    message: "Books found",
                    data: books,
                });
                break;

            case "POST":
                body = "";
                req.on("data", function (chunk) {
                    body += chunk;
                });
                req.on("end", function () {
                    body = JSON.parse(body);
                    if (Array.isArray(body) && body.length > 1) {
                        let newId = getNewId(books) - 1;
                        body = body.map((book) => {
                            newId += 1;
                            return {
                                _id: newId,
                                ...book,
                            };
                        });
                    } else if (Array.isArray(body) && body.length === 1) {
                        body = {
                            _id: getNewId(books),
                            ...body[0],
                        };
                    } else {
                        body = {
                            _id: getNewId(books),
                            ...body,
                        };
                    }

                    if (body.length > 1) {
                        body.forEach((book) => {
                            books.push(book);
                        });
                    } else {
                        books.push(body);
                    }

                    fs.writeFileSync(
                        "./database/data.json",
                        JSON.stringify(books, null, 4)
                    );

                    resUtil(res, 201, "json", {
                        status: true,
                        message: "New book added",
                        data: body,
                    });
                });
                break;

            case "DELETE":
                body = "";
                req.on("data", function (chunk) {
                    body += chunk;
                }).on("end", function () {
                    body = JSON.parse(body);
                    let remainingBooks;
                    let booksToRemove;
                    if (Array.isArray(body._id)) {
                        booksToRemove = books.filter((book) =>
                            body._id.includes(book._id)
                        );

                        if (!booksToRemove) {
                            resUtil(res, 404, "json", {
                                status: false,
                                message: "Books not found",
                            });
                            return;
                        }
                        remainingBooks = books.filter(
                            (book) => !body._id.includes(book._id)
                        );
                    } else {
                        booksToRemove = books.filter(
                            (book) => book._id === body._id
                        );

                        if (!booksToRemove) {
                            resUtil(res, 404, "json", {
                                status: false,
                                message: "Book not found",
                            });
                            return;
                        }
                        remainingBooks = books.filter(
                            (book) => book._id !== body._id
                        );
                    }

                    books = remainingBooks;
                    fs.writeFileSync(
                        "./database/data.json",
                        JSON.stringify(books, null, 4)
                    );

                    resUtil(res, 200, "json", {
                        status: true,
                        message: "Deleted successfully",
                        data: booksToRemove,
                    });
                });
                break;

            case "PUT":
                body = "";
                req.on("data", function (chunk) {
                    body += chunk;
                }).on("end", function () {
                    body = JSON.parse(body);
                    const isBookAvailable = books.find(
                        (book) => book._id === body._id
                    );
                    if (!isBookAvailable) {
                        resUtil(res, 404, "json", {
                            status: false,
                            message: "Book not found",
                        });
                        return;
                    }
                    let updatedBook;
                    const updatedBooksArr = books.map((book) => {
                        if (book._id === body._id) {
                            updatedBook = {
                                ...book,
                                ...body,
                            };
                            return updatedBook;
                        }
                        return book;
                    });
                    books = updatedBooksArr;

                    fs.writeFileSync(
                        "./database/data.json",
                        JSON.stringify(books, null, 4)
                    );

                    resUtil(res, 200, "json", {
                        status: true,
                        message: "Updated successfully",
                        data: updatedBook,
                    });
                });
                break;
            default:
                resUtil(res, 404, "json", {
                    status: false,
                    message: "Invalid method",
                });
                break;
        }
    } else {
        // Invalid Path
        resUtil(res, 404, "json", {
            status: true,
            message: "Route not found",
        });
    }
});

server.listen(PORT, function () {
    console.log("Server running on, http://localhost:" + PORT);
});
