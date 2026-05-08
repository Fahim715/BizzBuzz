import React, { useEffect, useState } from "react";
import { apiUrl } from "../../api";

export default function Complaint() {
  const userType = localStorage.getItem("userType");
  const buyerId = localStorage.getItem("userId");
  const [question, setQuestion] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const fetchComplaints = async () => {
    if (!buyerId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl(`/complaints/buyer/${buyerId}`));
      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      setError("Failed to load complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [buyerId]);

  const submitComplaint = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!question.trim()) {
      setStatus({ ok: false, message: "Please enter a complaint." });
      return;
    }

    try {
      const response = await fetch(apiUrl("/complaints"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, buyerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit complaint.");
      }

      setQuestion("");
      setStatus({ ok: true, message: "Complaint submitted." });
      fetchComplaints();
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    }
  };

  if (!buyerId) {
    return <div className="text-center p-8">Please sign in to view complaints.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Complaints</h1>

      {userType === "Buyer" && (
        <form
          onSubmit={submitComplaint}
          className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow mb-6"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Submit a complaint
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border rounded p-3"
            rows="4"
            placeholder="Describe your issue..."
          />
          {status && (
            <div
              className={`mt-2 ${status.ok ? "text-green-600" : "text-red-500"}`}
            >
              {status.message}
            </div>
          )}
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit Complaint
          </button>
        </form>
      )}

      {loading && <div className="text-center p-4">Loading...</div>}
      {error && <div className="text-center p-4 text-red-500">{error}</div>}

      {!loading && complaints.length === 0 && (
        <div className="text-center text-gray-500">No complaints yet.</div>
      )}

      <div className="max-w-3xl mx-auto space-y-4">
        {complaints.map((complaint) => (
          <div key={complaint.COMPLAINT_ID} className="bg-white p-4 rounded shadow">
            <div className="font-semibold">Question</div>
            <div className="text-gray-700 mb-3">{complaint.QUESTION}</div>
            <div className="font-semibold">Answer</div>
            <div className="text-gray-600">
              {complaint.ANSWER || "Awaiting response"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}