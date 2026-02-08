import React, { useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import "./CourseEnrollmentPage.css";

const CourseEnrollmentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { course } = location.state || {};

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

  if (!course) {
    return (
      <div>
        {t(
          "courseEnrollment.notFound",
          "Course not found. Please go back and try again."
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
      formDataToSend.append("course_id", course.id);
      formDataToSend.append("course_title", course.title);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("qualification", formData.qualification);
      if (formData.screenshot) {
        formDataToSend.append("screenshot", formData.screenshot);
      }

      await axios.post("/premium/enroll-course", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert(t("courseEnrollment.enrollSuccess", "Successfully enrolled!"));
      navigate("/premium/courses");
    } catch (error) {
      alert(
        t(
          "courseEnrollment.enrollFailed",
          "Enrollment failed. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="enrollment-container">
      <h2>
        {t("courseEnrollment.title", "Enroll in")} {course.title}
      </h2>
      <div className="course-info">
        <img
          src={course.image}
          alt={course.title}
          className="course-info-image"
        />
        <div className="course-info-details">
          <p>
            <strong>
              {t("courseEnrollment.label.description", "Description:")}
            </strong>{" "}
            {course.desc}
          </p>
          <p>
            <strong>{t("courseEnrollment.label.duration", "Duration:")}</strong>{" "}
            {course.duration}
          </p>
          <p>
            <strong>{t("courseEnrollment.label.level", "Level:")}</strong>{" "}
            {course.level}
          </p>
          <p>
            <strong>
              {t("courseEnrollment.label.instructor", "Instructor:")}
            </strong>{" "}
            {course.instructor}
          </p>
          <p>
            <strong>{t("courseEnrollment.label.price", "Price:")}</strong> ₹499
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="enrollment-form">
        <div className="form-group">
          <label>{t("courseEnrollment.form.name", "Name:")}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t("courseEnrollment.form.email", "Email:")}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t("courseEnrollment.form.phone", "Phone:")}</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t("courseEnrollment.form.address", "Address:")}</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleFormChange}
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>
            {t("courseEnrollment.form.qualification", "Qualification:")}
          </label>
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleFormChange}
            placeholder={t(
              "courseEnrollment.placeholder.qualification",
              "e.g., B.Tech Computer Science"
            )}
          />
        </div>
        <div className="form-group">
          <label>
            {t("courseEnrollment.form.screenshot", "Payment Screenshot")}
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
          <p>{t("courseEnrollment.qrPrompt", "Scan QR code to pay:")}</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=merchant@upi&pn=Course%20Enrollment&am=499&cu=INR`}
            alt="QR Code"
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("courseEnrollment.enrolling", "Enrolling...")
            : t("courseEnrollment.complete", "Complete Enrollment")}
        </button>
      </form>
    </div>
  );
};

export default CourseEnrollmentPage;
