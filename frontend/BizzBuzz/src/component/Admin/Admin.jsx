import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../api";

export default function Admin() {
  const navigate = useNavigate();
  const adminId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [carts, setCarts] = useState([]);
  const [answers, setAnswers] = useState({});

  const [usersLoading, setUsersLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [cartsLoading, setCartsLoading] = useState(true);

  const [usersError, setUsersError] = useState(null);
  const [productsError, setProductsError] = useState(null);
  const [complaintsError, setComplaintsError] = useState(null);
  const [cartsError, setCartsError] = useState(null);

  useEffect(() => {
    if (userType !== "Admin") {
      navigate("/");
    }
  }, [userType, navigate]);

  useEffect(() => {
    if (userType !== "Admin") {
      return;
    }
    fetchUsers();
    fetchProducts();
    fetchComplaints();
    fetchCarts();
  }, [userType]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await fetch(apiUrl("/users"));
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setUsersError("Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const response = await fetch(apiUrl("/products"));
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setProductsError("Failed to load products.");
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    setComplaintsError(null);
    try {
      const response = await fetch(apiUrl("/complaints"));
      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      setComplaintsError("Failed to load complaints.");
    } finally {
      setComplaintsLoading(false);
    }
  };

  const fetchCarts = async () => {
    setCartsLoading(true);
    setCartsError(null);
    try {
      const response = await fetch(apiUrl("/carts"));
      const data = await response.json();
      setCarts(data);
    } catch (err) {
      setCartsError("Failed to load carts.");
    } finally {
      setCartsLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) {
      return;
    }
    try {
      await fetch(apiUrl(`/users/${userId}`), { method: "DELETE" });
      setUsers((prev) => prev.filter((user) => user.USER_ID !== userId));
    } catch (err) {
      setUsersError("Failed to delete user.");
    }
  };

  const submitAnswer = async (complaintId) => {
    const answer = answers[complaintId];
    if (!answer || !answer.trim()) {
      setComplaintsError("Answer cannot be empty.");
      return;
    }

    try {
      const response = await fetch(apiUrl("/complaints/answer"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId, answer, adminId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit answer.");
      }

      setComplaints((prev) =>
        prev.map((item) =>
          item.COMPLAINT_ID === complaintId
            ? { ...item, ANSWER: answer, ADMIN_ID: adminId }
            : item
        )
      );
      setAnswers((prev) => ({ ...prev, [complaintId]: "" }));
      setComplaintsError(null);
    } catch (err) {
      setComplaintsError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>

      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {[
          { id: "users", label: "Users" },
          { id: "products", label: "Products" },
          { id: "complaints", label: "Complaints" },
          { id: "carts", label: "Carts" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <div className="bg-white rounded shadow p-4">
          {usersLoading && <div className="p-4">Loading...</div>}
          {usersError && <div className="p-4 text-red-500">{usersError}</div>}
          {!usersLoading && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">User Type</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.USER_ID} className="border-b">
                    <td className="p-2">{user.NAME}</td>
                    <td className="p-2">{user.EMAIL}</td>
                    <td className="p-2">{user.PHONE_NO}</td>
                    <td className="p-2">{user.USER_TYPE}</td>
                    <td className="p-2">
                      <button
                        onClick={() => deleteUser(user.USER_ID)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "products" && (
        <div className="bg-white rounded shadow p-4">
          {productsLoading && <div className="p-4">Loading...</div>}
          {productsError && (
            <div className="p-4 text-red-500">{productsError}</div>
          )}
          {!productsLoading && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Thumbnail</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Seller ID</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.PRODUCT_ID} className="border-b">
                    <td className="p-2">
                      {product.PICTURE ? (
                        <img
                          src={product.PICTURE}
                          alt={product.NAME}
                          className="w-14 h-14 object-cover rounded"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-200 rounded" />
                      )}
                    </td>
                    <td className="p-2">{product.NAME}</td>
                    <td className="p-2">${product.PRICE}</td>
                    <td className="p-2">{product.QUANTITY}</td>
                    <td className="p-2">{product.SELLER_ID}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "complaints" && (
        <div className="bg-white rounded shadow p-4">
          {complaintsLoading && <div className="p-4">Loading...</div>}
          {complaintsError && (
            <div className="p-4 text-red-500">{complaintsError}</div>
          )}
          {!complaintsLoading && (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.COMPLAINT_ID}
                  className="border rounded p-4"
                >
                  <div className="font-semibold">Question</div>
                  <div className="text-gray-700 mb-2">{complaint.QUESTION}</div>
                  <div className="text-sm text-gray-500 mb-2">
                    Buyer ID: {complaint.BUYER_ID}
                  </div>
                  <div className="font-semibold">Answer</div>
                  <div className="text-gray-700 mb-2">
                    {complaint.ANSWER || "Awaiting response"}
                  </div>
                  <textarea
                    value={answers[complaint.COMPLAINT_ID] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [complaint.COMPLAINT_ID]: e.target.value,
                      }))
                    }
                    className="w-full border rounded p-2 mb-2"
                    rows="2"
                    placeholder="Write an answer..."
                  />
                  <button
                    onClick={() => submitAnswer(complaint.COMPLAINT_ID)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Submit Answer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "carts" && (
        <div className="bg-white rounded shadow p-4">
          {cartsLoading && <div className="p-4">Loading...</div>}
          {cartsError && <div className="p-4 text-red-500">{cartsError}</div>}
          {!cartsLoading && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Cart ID</th>
                  <th className="p-2">Buyer ID</th>
                  <th className="p-2">Checkout Date</th>
                </tr>
              </thead>
              <tbody>
                {carts.map((cart) => (
                  <tr key={cart.CART_ID} className="border-b">
                    <td className="p-2">{cart.CART_ID}</td>
                    <td className="p-2">{cart.BUYER_ID}</td>
                    <td className="p-2">{cart.CHECKOUT_DATE}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
