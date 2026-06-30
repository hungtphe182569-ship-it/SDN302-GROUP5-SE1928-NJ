const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createReview,
  getListingReviews,
  getOrderReview,
} = require("../controllers/reviewController");

router.post("/", auth, createReview);
router.get("/listing/:listingId", getListingReviews);
router.get("/order/:orderId", auth, getOrderReview);

module.exports = router;
