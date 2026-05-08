import React, { useEffect, useState } from "react";
import { apiUrl } from "../../api";

function Homepage() {
  const [products, setProducts] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [reviewForm, setReviewForm] = useState({ starRating: 5, reviewText: "" });
  const [reviewStatus, setReviewStatus] = useState(null);
  const userType = localStorage.getItem("userType");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetch(apiUrl("/products"))
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch(() => setError("Failed to load products. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (productId) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find((item) => item.productId === productId);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({ productId, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setSuccessMessage("Product added to cart successfully!");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const loadReviews = async (product) => {
    setSelectedProduct(product);
    setReviews([]);
    setReviewsError(null);
    setReviewsLoading(true);
    setReviewStatus(null);
    try {
      const response = await fetch(apiUrl(`/reviews/product/${product.PRODUCT_ID}`));
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setReviewsError("Failed to load reviews.");
    } finally {
      setReviewsLoading(false);
    }
  };

  const closeReviews = () => {
    setSelectedProduct(null);
    setReviews([]);
    setReviewForm({ starRating: 5, reviewText: "" });
    setReviewStatus(null);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (userType !== "Buyer") {
      setReviewStatus({ ok: false, message: "Only buyers can submit reviews." });
      return;
    }

    try {
      const response = await fetch(apiUrl("/reviews"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          starRating: Number(reviewForm.starRating),
          reviewText: reviewForm.reviewText,
          buyerId: userId,
          productId: selectedProduct.PRODUCT_ID,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit review.");
      }

      setReviewStatus({ ok: true, message: "Review submitted." });
      setReviewForm({ starRating: 5, reviewText: "" });
      await loadReviews(selectedProduct);
    } catch (err) {
      setReviewStatus({ ok: false, message: err.message });
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-bold text-center text-slate-800 mb-8">
        Our Products
      </h1>

      {successMessage && (
        <div className="text-green-600 font-bold text-center mb-4">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.PRODUCT_ID}
            className="bg-slate-800 text-white shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-lg p-6"
          >
            <div className="mb-4">
              {product.PICTURE ? (
                <img
                  src={product.PICTURE}
                  alt={product.NAME}
                  className="w-full h-48 object-cover rounded"
                />
              ) : (
                <div className="w-full h-48 bg-slate-600 rounded flex items-center justify-center text-slate-300">
                  No Image Available
                </div>
              )}
            </div>
            <h2 className="text-2xl font-semibold mb-2">{product.NAME}</h2>
            <p className="text-slate-300 mb-4">{product.DESCRIPTION}</p>
            <div className="text-white font-bold text-xl mb-2">
              ${product.PRICE}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => addToCart(product.PRODUCT_ID)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Add to Cart
              </button>
              <button
                onClick={() => loadReviews(product)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Reviews
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-6">
          <div className="bg-white max-w-2xl w-full rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                Reviews for {selectedProduct.NAME}
              </h3>
              <button
                onClick={closeReviews}
                className="text-gray-500 hover:text-gray-800"
              >
                Close
              </button>
            </div>

            {reviewsLoading && <div className="p-4">Loading reviews...</div>}
            {reviewsError && (
              <div className="p-4 text-red-500">{reviewsError}</div>
            )}
            {!reviewsLoading && reviews.length === 0 && (
              <div className="p-4 text-gray-500">No reviews yet.</div>
            )}

            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.REVIEW_ID}
                  className="border rounded-md p-3"
                >
                  <div className="font-semibold">
                    {review.BUYER_NAME || "Anonymous"}
                  </div>
                  <div className="text-yellow-600">Rating: {review.STAR_RATING}</div>
                  {review.REVIEW_TEXT && (
                    <div className="text-gray-700 mt-1">{review.REVIEW_TEXT}</div>
                  )}
                </div>
              ))}
            </div>

            {userType === "Buyer" && (
              <form onSubmit={submitReview} className="mt-6 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <select
                    value={reviewForm.starRating}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        starRating: e.target.value,
                      }))
                    }
                    className="w-full border rounded p-2"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Review
                  </label>
                  <textarea
                    value={reviewForm.reviewText}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        reviewText: e.target.value,
                      }))
                    }
                    className="w-full border rounded p-2"
                    rows="3"
                  />
                </div>
                {reviewStatus && (
                  <div
                    className={
                      reviewStatus.ok ? "text-green-600" : "text-red-500"
                    }
                  >
                    {reviewStatus.message}
                  </div>
                )}
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;
