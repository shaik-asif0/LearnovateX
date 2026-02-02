import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Briefcase } from "lucide-react";
import "./PremiumPage.css";

const PremiumPage = () => {
  const navigate = useNavigate();
  return (
    <div className="premium-container">
      <h1 className="premium-title">Premium</h1>
      <div className="premium-options">
        <div
          className="premium-card"
          onClick={() => navigate("/premium/courses")}
        >
          <BookOpen className="card-icon courses-icon" size={48} />
          <h2>Courses</h2>
          <p>
            Unlock premium courses with expert instructors, hands-on projects,
            and industry-recognized certifications to boost your career.
          </p>
          <ul className="card-features">
            <li>Expert-led video lessons</li>
            <li>Interactive coding challenges</li>
            <li>Certificate upon completion</li>
            <li>Lifetime access</li>
          </ul>
          <button className="explore-btn">Explore Courses</button>
        </div>
        <div
          className="premium-card"
          onClick={() => navigate("/premium/internships")}
        >
          <Briefcase className="card-icon internships-icon" size={48} />
          <h2>Internships</h2>
          <p>
            Gain real-world experience with premium internships at top
            companies, mentorship, and skill-building opportunities.
          </p>
          <ul className="card-features">
            <li>Mentorship from industry experts</li>
            <li>Real project assignments</li>
            <li>Networking opportunities</li>
            <li>Stipend and recommendations</li>
          </ul>
          <button className="explore-btn">Explore Internships</button>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
