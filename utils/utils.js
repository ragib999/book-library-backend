function resUtil(res, statusCode, contentType, resContent) {
    const isJson = contentType === "json";

    res.writeHead(statusCode || 200, {
        "content-type": isJson
            ? "application/json"
            : contentType || "text/plain",
    });
    res.end(isJson ? JSON.stringify(resContent) : resContent);
}

function getNewId(books) {
    return Math.max(...books.map((book) => book._id)) + 1;
}

module.exports = {
    resUtil,
    getNewId,
};
