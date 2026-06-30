const Review = require("../models/Review");
const Order = require("../models/Order");
const Listing = require("../models/Listing");

const updateListingRating = async (listingId) => {
  const stats = await Review.aggregate([
    { $match: { listingId } },
    {
      $group: {
        _id: "$listingId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const ratingStats = stats[0] || { averageRating: 0, reviewCount: 0 };

  await Listing.findByIdAndUpdate(listingId, {
    "reviews.averageRating": Math.round(ratingStats.averageRating * 10) / 10,
    "reviews.reviewCount": ratingStats.reviewCount,
  });
};

exports.createReview = async (req, res) => {
  try {
    const { orderId, rating, comment, images = [] } = req.body;
    const numericRating = Number(rating);

    if (!orderId) {
      return res.status(400).json({ message: "Vui lòng chọn đơn hàng" });
    }
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating phải từ 1 đến 5 sao" });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập nhận xét" });
    }
    if (comment.trim().length > 1000) {
      return res.status(400).json({ message: "Nhận xét tối đa 1000 ký tự" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order không tồn tại" });
    }
    if (order.buyerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Bạn không có quyền đánh giá đơn này" });
    }
    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Chỉ có thể đánh giá sau khi đơn đã giao" });
    }
    if (order.isReviewed) {
      return res.status(400).json({ message: "Đơn hàng này đã được đánh giá" });
    }

    const review = await Review.create({
      orderId: order._id,
      listingId: order.listingId,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      rating: numericRating,
      comment: comment.trim(),
      images,
      isVerifiedPurchase: true,
    });

    order.isReviewed = true;
    await order.save();
    await updateListingRating(order.listingId);

    const populatedReview = await Review.findById(review._id)
      .populate("buyerId", "name username avatar")
      .populate("listingId", "title images");

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Đơn hàng này đã được đánh giá" });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getListingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ listingId: req.params.listingId })
      .populate("buyerId", "name username avatar")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderReview = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order không tồn tại" });
    }
    if (
      order.buyerId.toString() !== req.userId &&
      order.sellerId.toString() !== req.userId
    ) {
      return res.status(403).json({ message: "Không có quyền xem review này" });
    }

    const review = await Review.findOne({ orderId: req.params.orderId })
      .populate("buyerId", "name username avatar")
      .populate("listingId", "title images");

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
