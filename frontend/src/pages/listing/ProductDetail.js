import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ChatWidget from "../../components/ChatWidget";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price,
  );

const conditionLabel = {
  new: "Brand New",
  like_new: "Like New",
  good: "Good",
  acceptable: "Acceptable",
};

function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await api.get(`/listings/${id}`);
      setListing(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-screen-2xl mx-auto px-6 py-10 animate-pulse">
          <div className="grid grid-cols-2 gap-10">
            <div className="bg-gray-200 rounded-xl h-[600px]" />
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 rounded w-3/4" />
              <div className="bg-gray-200 h-6 rounded w-1/2" />
              <div className="bg-gray-200 h-10 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">😕</p>
          <p>Listing not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-4 flex gap-2">
          <Link to="/" className="hover:underline text-blue-600">
            Home
          </Link>
          <span>›</span>
          <Link to="/listings" className="hover:underline text-blue-600">
            All Listings
          </Link>
          <span>›</span>
          <span className="text-gray-700 line-clamp-1">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-xl p-6 shadow-sm mb-6">
          {/* Left - Images */}
          <div className="flex flex-col">
            <div className="relative w-full h-[520px] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center mb-3">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[selectedImage]}
                  alt={listing.title}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="text-gray-400 text-sm">No image</div>
              )}
              <div className="absolute top-3 left-3 bg-white bg-opacity-90 rounded-full px-3 py-1 text-xs text-gray-600 flex items-center gap-1">
                <span>👁</span>
                <span>{listing.stats?.watchers || 0} watching</span>
              </div>
              <button className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </button>
            </div>

            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {listing.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 ${
                      selectedImage === i
                        ? "border-blue-500"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <button className="mt-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </button>
          </div>

          {/* Right - Info */}
          <div className="flex flex-col gap-4">
            {/* Condition */}
            <span className="text-xs text-gray-500">
              Condition:{" "}
              <span className="font-semibold text-gray-700">
                {conditionLabel[listing.condition] || listing.condition}
              </span>
            </span>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">
              {listing.title}
            </h1>

            {/* Stats */}
            <div className="flex gap-4 text-xs text-gray-400">
              <span>👁 {listing.stats?.views || 0} views</span>
              <span>❤️ {listing.stats?.watchers || 0} watchers</span>
              <span>📦 {listing.stats?.soldQuantity || 0} sold</span>
            </div>

            {/* Seller info - ngay dưới tên sp */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {listing.sellerId?.username?.charAt(0)?.toUpperCase() ||
                      "S"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">
                      {listing.sellerId?.username || "seller"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="text-yellow-500">★</span>
                      <span>100% positive</span>
                    </div>
                  </div>
                </div>
                <ChatWidget
                  sellerId={listing.sellerId?._id}
                  sellerName={listing.sellerId?.username}
                  listingId={listing._id}
                  listingTitle={listing.title}
                  buttonStyle="small"
                />
              </div>
              <div className="flex gap-3 text-xs text-blue-600">
                <span className="hover:underline cursor-pointer">
                  Seller's other items
                </span>
                <span className="text-gray-300">|</span>
                <span className="hover:underline cursor-pointer">
                  Save seller
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="py-2">
              <p className="text-3xl font-bold text-gray-900">
                {formatPrice(listing.pricing.fixedPrice)}
              </p>
            </div>

            {/* Shipping */}
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600 font-semibold">Shipping:</span>
                <span className="text-green-600 font-semibold">
                  Free shipping
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Returns:</span>
                <span>30 days returns</span>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600"
                >
                  −
                </button>
                <span className="px-4 py-2 text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(listing.totalQuantity, q + 1))
                  }
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-gray-400">
                {listing.totalQuantity} available
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate(`/checkout/${listing._id}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-semibold text-sm transition"
              >
                Buy It Now
              </button>
              <button className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-full font-semibold text-sm transition">
                Add to cart
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Item description
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {listing.description || "No description provided."}
          </p>
        </div>

        {/* Reviews section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Reviews & Ratings
          </h2>
          <p className="text-sm text-gray-400">No reviews yet.</p>
        </div>
      </main>
    </div>
  );
}

export default ProductDetail;
