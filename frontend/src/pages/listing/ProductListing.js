import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import StarRating from "../../components/StarRating";
import api from "../../services/api";

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

function ProductCard({ listing }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer group">
      <Link to={`/listing/${listing._id}`}>
        <div className="relative w-full h-52 bg-gray-100 flex items-center justify-center">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
              No image
            </div>
          )}
          {listing.isFeatured && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <button
          onClick={() => setLiked((p) => !p)}
          className={`float-right text-lg ${liked ? "text-red-500" : "text-gray-300"} hover:text-red-500`}
        >
          {liked ? "♥" : "♡"}
        </button>
        <Link to={`/listing/${listing._id}`}>
          <p className="text-sm text-gray-800 font-medium line-clamp-2 mb-1 hover:text-blue-600">
            {listing.title}
          </p>
        </Link>
        {listing.subtitle && (
          <p className="text-xs text-gray-500 mb-2">{listing.subtitle}</p>
        )}
        <p className="text-lg font-bold text-gray-900 mb-1">
          {formatPrice(listing.pricing.fixedPrice)}
        </p>
        {listing.reviews?.reviewCount > 0 ? (
          <div className="flex items-center gap-1 mb-1">
            <StarRating value={listing.reviews.averageRating} />
            <span className="text-xs text-gray-500">
              ({listing.reviews.reviewCount})
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mb-1">No reviews yet</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {conditionLabel[listing.condition] || listing.condition}
          </span>
          {listing.totalQuantity <= 2 && (
            <span className="text-xs text-red-500 font-semibold">
              Only {listing.totalQuantity} left!
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          by {listing.sellerId?.username || "seller"}
        </p>
      </div>
    </div>
  );
}

function ProductListing() {
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const page = Number(searchParams.get("page")) || 1;

  // Input state (chưa apply)
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);
  const [conditionInput, setConditionInput] = useState([]);
  const [featuredInput, setFeaturedInput] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Applied filter state (sau khi bấm Apply)
  const [appliedConditions, setAppliedConditions] = useState([]);
  const [appliedFeatured, setAppliedFeatured] = useState(false);

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, minPrice, maxPrice, page]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await api.get("/listings", { params });
      setListings(res.data.listings);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleConditionInput = (c) => {
    setConditionInput((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  // Bấm Apply — áp dụng tất cả filter cùng lúc
  const handleApply = () => {
    setAppliedConditions(conditionInput);
    setAppliedFeatured(featuredInput);
    // Price filter gọi API
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (minInput) params.minPrice = minInput;
    if (maxInput) params.maxPrice = maxInput;
    setSearchParams(params);
  };

  const handleClear = () => {
    setConditionInput([]);
    setFeaturedInput(false);
    setMinInput("");
    setMaxInput("");
    setAppliedConditions([]);
    setAppliedFeatured(false);
    setSearchParams({});
  };

  // Sort + filter chỉ chạy sau khi Apply
  const filteredListings = listings
    .filter(
      (l) =>
        appliedConditions.length === 0 ||
        appliedConditions.includes(l.condition),
    )
    .filter((l) => !appliedFeatured || l.isFeatured)
    .sort((a, b) => {
      if (sortBy === "price_asc")
        return a.pricing.fixedPrice - b.pricing.fixedPrice;
      if (sortBy === "price_desc")
        return b.pricing.fixedPrice - a.pricing.fixedPrice;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const hasActiveFilters =
    appliedConditions.length > 0 || appliedFeatured || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar hideCategories />
      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {search
                ? `Results for "${search}"`
                : category
                  ? category
                  : "All Listings"}
            </h1>
            <p className="text-sm text-gray-500">
              {total} results found
              {hasActiveFilters && ` · showing ${filteredListings.length}`}
              {hasActiveFilters && (
                <button
                  onClick={handleClear}
                  className="ml-2 text-blue-600 hover:underline text-xs"
                >
                  Clear all filters
                </button>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex gap-10">
          {/* Sidebar filter */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Filter</h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Condition */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Condition
                </h4>
                {["new", "like_new", "good", "acceptable"].map((c) => (
                  <label
                    key={c}
                    className="flex items-center gap-2 text-sm text-gray-600 mb-1 cursor-pointer hover:text-gray-800"
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-600"
                      checked={conditionInput.includes(c)}
                      onChange={() => toggleConditionInput(c)}
                    />
                    {conditionLabel[c]}
                  </label>
                ))}
              </div>

              {/* Price range */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Price Range
                </h4>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minInput}
                    onChange={(e) => setMinInput(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-400"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxInput}
                    onChange={(e) => setMaxInput(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Featured */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Other
                </h4>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                  <input
                    type="checkbox"
                    className="accent-blue-600"
                    checked={featuredInput}
                    onChange={(e) => setFeaturedInput(e.target.checked)}
                  />
                  Featured only
                </label>
              </div>

              {/* Apply button */}
              <button
                onClick={handleApply}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-lg h-72 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg">No listings found</p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClear}
                    className="mt-3 text-blue-600 hover:underline text-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredListings.map((listing) => (
                  <ProductCard key={listing._id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProductListing;
