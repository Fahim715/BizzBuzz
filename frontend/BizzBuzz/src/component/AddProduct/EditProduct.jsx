import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import placeholderImg from "./placeholder.jpg";
import { apiUrl } from "../../api";

export default function EditProduct() {
  const userId = localStorage.getItem("userId");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch products by seller ID
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          apiUrl(`/products/seller/${userId}`)
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userId]);
  
  console.log(products);

  const handleEdit = (productId) => {
    navigate(`/edit_product/${productId}`);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) {
      return;
    }
    try {
      await axios.delete(apiUrl(`/products/${productId}`));
      setProducts((prev) => prev.filter((item) => item.PRODUCT_ID !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Your Products</h1>
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.PRODUCT_ID}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center"
          >
            <img
              src={product.PICTURE || placeholderImg}
              alt={product.NAME}
              className="w-full h-48 object-cover rounded"
            />
            <h2 className="text-xl font-semibold mt-4">{product.NAME}</h2>
            <p className="text-gray-600 mt-2">{product.DESCRIPTION}</p>
            <p className="text-gray-800 mt-2 font-bold">${product.PRICE}</p>
            <p className="text-gray-600 mt-2">Quantity: {product.QUANTITY}</p>
            <p className="text-gray-600 mt-2">Available: {product.AVAILABLE}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleEdit(product.PRODUCT_ID)}
            >
              Edit
            </button>
            <button
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => handleDelete(product.PRODUCT_ID)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
