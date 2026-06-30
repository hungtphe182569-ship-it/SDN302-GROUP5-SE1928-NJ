require("dotenv").config({ path: ".env" });

const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const User = require("../models/User");
const Order = require("../models/Order");
const Review = require("../models/Review");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
};

const listings = [
  {
    title: "Apple iPhone 13 128GB Unlocked",
    subtitle: "Excellent - 90%+ Battery",
    description:
      "Apple iPhone 13 128GB Unlocked in excellent condition with 90%+ battery health.",
    condition: "like_new",
    images: [],
    pricing: { currency: "VND", fixedPrice: 8323071 },
    totalQuantity: 5,
    status: "active",
    isFeatured: true,
    stats: { views: 0, watchers: 0, soldQuantity: 3 },
  },
  {
    title: "Dyson UP30 Ball Animal 3 | Nickel/Silver | Refurbished",
    subtitle: "Certified Refurbished",
    description:
      "Dyson UP30 Ball Animal 3 vacuum cleaner in nickel/silver. Certified refurbished.",
    condition: "good",
    images: [],
    pricing: { currency: "VND", fixedPrice: 5531767 },
    totalQuantity: 3,
    status: "active",
    isFeatured: false,
    stats: { views: 0, watchers: 0, soldQuantity: 2 },
  },
  {
    title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    subtitle: "Black - Brand New",
    description: "Sony WH-1000XM5 industry leading noise canceling headphones.",
    condition: "new",
    images: [],
    pricing: { currency: "VND", fixedPrice: 6500000 },
    totalQuantity: 6,
    status: "active",
    isFeatured: true,
    stats: { views: 0, watchers: 0, soldQuantity: 4 },
  },
  {
    title: "Samsung Galaxy S23 Ultra 256GB",
    subtitle: "Phantom Black - Unlocked",
    description:
      "Samsung Galaxy S23 Ultra 256GB Phantom Black factory unlocked.",
    condition: "new",
    images: [],
    pricing: { currency: "VND", fixedPrice: 12000000 },
    totalQuantity: 3,
    status: "active",
    isFeatured: true,
    stats: { views: 0, watchers: 0, soldQuantity: 2 },
  },
  {
    title: "Nike Air Jordan 1 Retro High OG",
    subtitle: "Chicago - Size 42",
    description: "Nike Air Jordan 1 Retro High OG Chicago colorway size 42.",
    condition: "new",
    images: [],
    pricing: { currency: "VND", fixedPrice: 4800000 },
    totalQuantity: 1,
    status: "active",
    isFeatured: false,
    stats: { views: 0, watchers: 0, soldQuantity: 1 },
  },
  {
    title: "MacBook Pro 14 inch M3 Pro 2023",
    subtitle: "Space Black 18GB RAM 512GB SSD",
    description:
      "Apple MacBook Pro 14 inch with M3 Pro chip, 18GB RAM, 512GB SSD.",
    condition: "new",
    images: [],
    pricing: { currency: "VND", fixedPrice: 45000000 },
    totalQuantity: 2,
    status: "active",
    isFeatured: true,
    stats: { views: 0, watchers: 0, soldQuantity: 2 },
  },
  {
    title: "Canon EOS R6 Mark II Mirrorless Camera",
    subtitle: "Body Only",
    description: "Canon EOS R6 Mark II mirrorless camera body only.",
    condition: "new",
    images: [],
    pricing: { currency: "VND", fixedPrice: 52000000 },
    totalQuantity: 1,
    status: "active",
    isFeatured: true,
    stats: { views: 0, watchers: 0, soldQuantity: 0 },
  },
  {
    title: "Lego Technic Bugatti Chiron 42083",
    subtitle: "New Sealed Box",
    description: "Lego Technic Bugatti Chiron set 42083 new and sealed.",
    condition: "new",
    images: [],
    pricing: { currency: "VND", fixedPrice: 3200000 },
    totalQuantity: 7,
    status: "active",
    isFeatured: false,
    stats: { views: 0, watchers: 0, soldQuantity: 0 },
  },
];

const reviewComments = [
  "Item arrived quickly and matched the description. Very happy with this purchase.",
  "Good seller, careful packaging, and the product condition is accurate.",
  "Smooth transaction. The item works well and delivery was on time.",
  "Exactly as listed. I would buy from this seller again.",
  "Great value for the price. Communication was clear.",
  "Product is clean, shipped safely, and feels reliable.",
];

const buildOrderData = ({ buyer, seller, listing, isReviewed }) => ({
  buyerId: buyer._id,
  sellerId: seller._id,
  listingId: listing._id,
  listingTitle: listing.title,
  listingImage: listing.images?.[0] || "",
  quantity: 1,
  pricing: {
    itemPrice: listing.pricing.fixedPrice,
    quantity: 1,
    subtotal: listing.pricing.fixedPrice,
    shippingCost: 30000,
    total: listing.pricing.fixedPrice + 30000,
    currency: "VND",
  },
  shippingAddress: {
    fullName: buyer.name,
    phone: "0900000000",
    street: "1 Demo Street",
    city: "Ho Chi Minh City",
    country: "Vietnam",
  },
  status: "delivered",
  paymentStatus: "paid",
  paymentMethod: "COD",
  isReviewed,
});

const seed = async () => {
  try {
    await connectDB();

    await User.deleteMany({
      email: { $in: ["seller.demo@ebay.local", "buyer.demo@ebay.local"] },
    });

    const seller = await User.create({
      email: "seller.demo@ebay.local",
      password: "123456",
      name: "Demo Seller",
      username: "demo_seller",
      role: "seller",
    });

    const buyer = await User.create({
      email: "buyer.demo@ebay.local",
      password: "123456",
      name: "Demo Buyer",
      username: "demo_buyer",
      role: "buyer",
    });

    await Review.deleteMany({});
    await Order.deleteMany({});
    await Listing.deleteMany({});
    console.log("Deleted old listings, orders, and reviews");

    const insertedListings = await Listing.insertMany(
      listings.map((listing) => ({
        ...listing,
        sellerId: seller._id,
        reviews: { averageRating: 0, reviewCount: 0 },
      })),
    );

    const reviewedOrders = await Order.insertMany(
      insertedListings.slice(0, 6).map((listing) =>
        buildOrderData({ buyer, seller, listing, isReviewed: true }),
      ),
    );

    const reviewsToInsert = reviewedOrders.map((order, index) => ({
      orderId: order._id,
      listingId: order.listingId,
      buyerId: buyer._id,
      sellerId: seller._id,
      rating: [5, 4, 5, 4, 5, 5][index],
      comment: reviewComments[index],
      images: [],
      isVerifiedPurchase: true,
    }));
    await Review.insertMany(reviewsToInsert);

    for (const listing of insertedListings) {
      const listingReviews = reviewsToInsert.filter(
        (review) => review.listingId.toString() === listing._id.toString(),
      );
      if (listingReviews.length > 0) {
        const averageRating =
          listingReviews.reduce((total, review) => total + review.rating, 0) /
          listingReviews.length;
        listing.reviews = {
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: listingReviews.length,
        };
        await listing.save();
      }
    }

    const testListing = insertedListings[6] || insertedListings[0];
    const reviewTestOrder = await Order.create(
      buildOrderData({ buyer, seller, listing: testListing, isReviewed: false }),
    );

    console.log(`Inserted ${insertedListings.length} listings`);
    console.log(`Inserted ${reviewsToInsert.length} sample reviews`);
    console.log("Demo accounts:");
    console.log("  buyer.demo@ebay.local / 123456");
    console.log("  seller.demo@ebay.local / 123456");
    console.log(`Review test URL: http://localhost:3000/review/${reviewTestOrder._id}`);

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seed();
