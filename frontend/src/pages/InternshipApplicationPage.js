import React, { useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
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

  const { t } = useI18n();

  if (!internship) {
    return (
      <div>
        {t(
          "internship.notFound",
          "Internship not found. Please go back and try again."
        )}
      </div>
    );
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
      alert(t("internship.apply.success", "Successfully applied!"));
      navigate("/premium/internships");
    } catch (error) {
      alert(
        t("internship.apply.failed", "Application failed. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="application-container">
      <h2>
        {t("internship.applyFor", "Apply for")} {internship.title}
      </h2>
      <div className="internship-info">
        <img
          src={internship.image}
          alt={internship.title}
          className="internship-info-image"
        />
        <div className="internship-info-details">
          <p>
            <strong>{t("internship.label.description", "Description:")}</strong>{" "}
            {internship.desc}
          </p>
          <p>
            <strong>{t("internship.label.company", "Company:")}</strong>{" "}
            {internship.company}
          </p>
          <p>
            <strong>{t("internship.label.location", "Location:")}</strong>{" "}
            {internship.location}
          </p>
          <p>
            <strong>{t("internship.label.duration", "Duration:")}</strong>{" "}
            {internship.duration}
          </p>
          <p>
            <strong>{t("internship.label.fee", "Application Fee:")}</strong>{" "}
            ₹499
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-group">
          <label>{t("internship.form.label.name", "Name")}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t("internship.form.label.email", "Email")}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t("internship.form.label.phone", "Phone")}</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t("internship.form.label.address", "Address")}</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleFormChange}
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>
            {t("internship.form.label.qualification", "Qualification")}
          </label>
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleFormChange}
            placeholder={t(
              "internship.placeholder.qualification",
              "e.g., B.Tech Computer Science"
            )}
          />
        </div>
        <div className="form-group">
          <label>
            {t("internship.form.label.screenshot", "Payment Screenshot")}
          </label>
          <input
            type="file"
            name="screenshot"
            accept="image/*"
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="qr-section">
          <p>
            {t("internship.qr.scan", "Scan QR code to pay application fee:")}
          </p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=merchant@upi&pn=Internship%20Application&am=499&cu=INR`}
            alt="QR Code"
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("internship.applying", "Applying...")
            : t("internship.completeApplication", "Complete Application")}
        </button>
      </form>
    </div>
  );
};

export default InternshipApplicationPage;
