import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import "./InternshipApplicationPage.css";

const InternshipApplicationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { internship } = location.state || {};

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    qualification: "",
    screenshot: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!internship) {
    return <div>Internship not found. Please go back and try again.</div>;
  }

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "screenshot") {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("internship_id", internship.id);
      formDataToSend.append("internship_title", internship.title);
      formDataToSend.append("company", internship.company);
      formDataToSend.append("location", internship.location);
      formDataToSend.append("duration", internship.duration);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("qualification", formData.qualification);
      if (formData.screenshot) {
        formDataToSend.append("screenshot", formData.screenshot);
      }

      await axios.post("/premium/apply-internship", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Successfully applied!");
      navigate("/premium/internships");
    } catch (error) {
      alert("Application failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="application-container">
      <h2>Apply for {internship.title}</h2>
      <div className="internship-info">
        <img
          src={internship.image}
          alt={internship.title}
          className="internship-info-image"
        />
        <div className="internship-info-details">
          <p>
            <strong>Description:</strong> {internship.desc}
          </p>
          <p>
            <strong>Company:</strong> {internship.company}
          </p>
          <p>
            <strong>Location:</strong> {internship.location}
          </p>
          <p>
            <strong>Duration:</strong> {internship.duration}
          </p>
          <p>
            <strong>Application Fee:</strong> ₹499
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Address:</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleFormChange}
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>Qualification:</label>
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleFormChange}
            placeholder="e.g., B.Tech Computer Science"
          />
        </div>
        <div className="form-group">
          <label>Payment Screenshot:</label>
          <input
            type="file"
            name="screenshot"
            accept="image/*"
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="qr-section">
          <p>Scan QR code to pay application fee:</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=merchant@upi&pn=Internship%20Application&am=499&cu=INR`}
            alt="QR Code"
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Applying..." : "Complete Application"}
        </button>
      </form>
    </div>
  );
};

export default InternshipApplicationPage;
