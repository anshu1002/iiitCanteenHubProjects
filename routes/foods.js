
const express = require("express");
const crypto = require("crypto");
const { XMLBuilder } = require("fast-xml-parser");

const router = express.Router();
const Ajv = require("ajv");

const {
    foodSchema,
    foodPatchSchema
} = require("../schemas/foodSchema");

const ajv = new Ajv();
const validateFood = ajv.compile(foodSchema);
const validateFoodPatch = ajv.compile(foodPatchSchema);

const xmlBuilder = new XMLBuilder({ format: true });

// Temporary in-memory food data
const foods = [
    { id: 1, name: "Classic Burger", category: "Burger", price: 129, rating: 4.8 },
    { id: 2, name: "Cheese Pizza", category: "Pizza", price: 179, rating: 4.7 },
    { id: 3, name: "Spicy Noodles", category: "Noodles", price: 99, rating: 4.6 },
    { id: 4, name: "Fresh Sandwich", category: "Sandwich", price: 89, rating: 4.5 },
    { id: 5, name: "French Fries", category: "Burger", price: 69, rating: 4.7 },
    { id: 6, name: "Cold Coffee", category: "Drinks", price: 79, rating: 4.6 },
    { id: 7, name: "Chocolate Cake", category: "Dessert", price: 99, rating: 4.9 },
    { id: 8, name: "Loaded Pizza", category: "Pizza", price: 119, rating: 4.8 }
];

const idempotencyStore = new Map();

function getResponseFormat(req) {
    return req.accepts(["application/json", "application/xml"]);
}

function serializeResponse(data, format) {
    if (format === "application/xml") {
        return xmlBuilder.build({ response: data });
    }

    return JSON.stringify(data);
}

function sendResponse(req, res, status, data, format) {
    format = format || getResponseFormat(req);

    if (!format) {
        return sendNotAcceptable(res);
    }

    res.status(status);
    res.set("Vary", "Accept");

    if (format === "application/xml") {
        res.type("application/xml");
        return res.send(serializeResponse(data, format));
    }

    return res.status(status).json(data);
}

function sendNotAcceptable(res) {
    return res.status(406).json({
        success: false,
        error: {
            code: "NOT_ACCEPTABLE",
            message: "Supported formats are application/json and application/xml."
        }
    });
}

function sendError(req, res, status, code, message) {
    return sendResponse(req, res, status, {
        success: false,
        error: { code, message }
    });
}

function validateFoodData(req, res) {
    if (!validateFood(req.body)) {
        const message = validateFood.errors
            .map(error => `${error.instancePath || "body"} ${error.message}`)
            .join("; ");

        sendError(req, res, 400, "INVALID_FOOD_DATA", message);
        return false;
    }

    return true;
}

function validateFoodPatchData(req, res) {
    if (!validateFoodPatch(req.body)) {
        const message = validateFoodPatch.errors
            .map(error => `${error.instancePath || "body"} ${error.message}`)
            .join("; ");

        sendError(req, res, 400, "INVALID_FOOD_DATA", message);
        return false;
    }

    return true;
}

function getValidId(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        sendError(req, res, 400, "INVALID_FOOD_ID",
            "Food ID must be a positive integer.");
        return null;
    }

    return id;
}

// GET all foods with cursor pagination, next link, ETag and JSON/XML
router.get("/", (req, res) => {
    res.set("Cache-Control", "private, no-cache");
    res.set("Vary", "Accept");

    const format = getResponseFormat(req);
    if (!format) return sendNotAcceptable(res);

    const limitValue = req.query.limit === undefined
        ? 3
        : Number(req.query.limit);

    if (
        !Number.isInteger(limitValue) ||
        limitValue < 1 ||
        limitValue > 100
    ) {
        return sendError(req, res, 400, "INVALID_LIMIT",
            "Limit must be an integer between 1 and 100.");
    }

    let cursor = 0;

    if (req.query.cursor !== undefined) {
        cursor = Number(req.query.cursor);

        if (!Number.isSafeInteger(cursor) || cursor < 0) {
            return sendError(req, res, 400, "INVALID_CURSOR",
                "Cursor must be a non-negative integer.");
        }
    }

    // Cursor represents the last food ID returned
    const remainingFoods = foods
        .filter(food => food.id > cursor)
        .sort((a, b) => a.id - b.id);

    const pageFoods = remainingFoods.slice(0, limitValue);
    const hasMore = remainingFoods.length > pageFoods.length;

    let nextLink = null;

    if (hasMore && pageFoods.length > 0) {
        const nextCursor = pageFoods[pageFoods.length - 1].id;

        const nextUrl = new URL(
            `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`
        );

        nextUrl.searchParams.set("limit", String(limitValue));
        nextUrl.searchParams.set("cursor", String(nextCursor));

        nextLink = nextUrl.toString();
    }

    const responseData = {
        success: true,
        count: pageFoods.length,
        total: foods.length,
        data: pageFoods,
        pagination: {
            limit: limitValue,
            nextCursor: hasMore && pageFoods.length > 0
                ? pageFoods[pageFoods.length - 1].id
                : null,
            hasMore,
            next: nextLink
        }
    };

    const representation = serializeResponse(responseData, format);

    const etag = '"' + crypto
        .createHash("sha256")
        .update(representation)
        .digest("hex") + '"';

    res.set("ETag", etag);

    const incomingEtags = (req.get("If-None-Match") || "")
        .split(",")
        .map(value => value.trim());

    if (incomingEtags.includes(etag) || incomingEtags.includes("*")) {
        return res.status(304).end();
    }

    return sendResponse(req, res, 200, responseData, format);
});

// GET one food
router.get("/:id", (req, res) => {
    res.set("Cache-Control", "private, no-cache");

    const id = getValidId(req, res);
    if (id === null) return;

    const food = foods.find(item => item.id === id);

    if (!food) {
        return sendError(req, res, 404, "FOOD_NOT_FOUND",
            "Food item not found.");
    }

    return sendResponse(req, res, 200, {
        success: true,
        data: food
    });
});

// POST with Idempotency-Key
router.post("/", (req, res) => {
    const key = req.get("Idempotency-Key");

    if (!key || !key.trim()) {
        return sendError(req, res, 400, "IDEMPOTENCY_KEY_REQUIRED",
            "Provide an Idempotency-Key request header.");
    }

    if (key.length > 200) {
        return sendError(req, res, 400, "INVALID_IDEMPOTENCY_KEY",
            "Idempotency-Key must be at most 200 characters.");
    }

    if (!validateFoodData(req, res)) return;

    const requestHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(req.body))
        .digest("hex");

    const previous = idempotencyStore.get(key);

    if (previous) {
        if (previous.requestHash !== requestHash) {
            return sendError(req, res, 409, "IDEMPOTENCY_KEY_REUSED",
                "This key was already used with a different request body.");
        }

        res.set("Idempotency-Replayed", "true");
        return sendResponse(req, res, previous.status, previous.response);
    }

    const { name, category, price, rating } = req.body;

    const newFood = {
        id: Math.max(0, ...foods.map(food => food.id)) + 1,
        name: name.trim(),
        category: category.trim(),
        price,
        rating
    };

    foods.push(newFood);

    const response = { success: true, data: newFood };

    idempotencyStore.set(key, {
        requestHash,
        status: 201,
        response
    });

    return sendResponse(req, res, 201, response);
});

// PUT: replace all fields
router.put("/:id", (req, res) => {
    const id = getValidId(req, res);
    if (id === null) return;

    const food = foods.find(item => item.id === id);

    if (!food) {
        return sendError(req, res, 404, "FOOD_NOT_FOUND",
            "Food item not found.");
    }

    if (!validateFoodData(req, res)) return;

    const { name, category, price, rating } = req.body;

    food.name = name.trim();
    food.category = category.trim();
    food.price = price;
    food.rating = rating;

    return sendResponse(req, res, 200, {
        success: true,
        data: food
    });
});

// PATCH: update selected fields
router.patch("/:id", (req, res) => {
    const id = getValidId(req, res);
    if (id === null) return;

    const food = foods.find(item => item.id === id);

    if (!food) {
        return sendError(req, res, 404, "FOOD_NOT_FOUND",
            "Food item not found.");
    }

    if (!validateFoodPatchData(req, res)) return;

    const { name, category, price, rating } = req.body;

    if (name !== undefined) food.name = name.trim();
    if (category !== undefined) food.category = category.trim();
    if (price !== undefined) food.price = price;
    if (rating !== undefined) food.rating = rating;

    return sendResponse(req, res, 200, {
        success: true,
        data: food
    });
});

// DELETE one food
router.delete("/:id", (req, res) => {
    const id = getValidId(req, res);
    if (id === null) return;

    const index = foods.findIndex(item => item.id === id);

    if (index === -1) {
        return sendError(req, res, 404, "FOOD_NOT_FOUND",
            "Food item not found.");
    }

    const deletedFood = foods.splice(index, 1)[0];

    return sendResponse(req, res, 200, {
        success: true,
        message: "Food item deleted successfully.",
        data: deletedFood
    });
});

module.exports = router;
