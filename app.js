const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");
const path = require("path");

const app = express();
mongoose.connect("mongodb://127.0.0.1:27017/iiitCanteenHub")
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.error("MongoDB connection error:", err.message));
const apiLimiter = require("./middleware/rateLimiter");

const openapiDocument = YAML.parse(
    fs.readFileSync(
        path.join(__dirname, "docs", "openapi.yaml"),
        "utf8"
    )
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/v1", apiLimiter);
app.use("/v1/foods", require("./routes/foods"));

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("home");
});

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument)
);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: "ROUTE_NOT_FOUND",
            message: `Route ${req.method} ${req.originalUrl} not found.`
        }
    });
});

app.use((err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || "INTERNAL_SERVER_ERROR",
            message: err.status && err.status < 500
                ? err.message
                : "An unexpected server error occurred."
        }
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});