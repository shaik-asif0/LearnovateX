import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import "./PremiumInternshipsPage.css";

const internships = [
  {
    id: 1,
    title: "AI Research Intern",
    desc: "Work on real AI projects.",
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
    duration: "3 months",
    company: "TechCorp AI",
    location: "Remote",
  },
  {
    id: 2,
    title: "Web Dev Intern",
    desc: "Build and maintain web apps.",
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=200&fit=crop",
    duration: "6 months",
    company: "WebSolutions Inc.",
    location: "Bangalore",
  },
  {
    id: 3,
    title: "Data Analyst Intern",
    desc: "Analyze and visualize data.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
    duration: "4 months",
    company: "DataInsights Ltd.",
    location: "Mumbai",
  },
  {
    id: 4,
    title: "Cloud Intern",
    desc: "Deploy and manage cloud infra.",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop",
    duration: "5 months",
    company: "CloudTech",
    location: "Remote",
  },
  {
    id: 5,
    title: "Cybersecurity Intern",
    desc: "Assist in securing systems.",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop",
    duration: "4 months",
    company: "SecureNet",
    location: "Delhi",
  },
  {
    id: 6,
    title: "Mobile Dev Intern",
    desc: "Develop mobile applications.",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop",
    duration: "6 months",
    company: "AppWorks",
    location: "Chennai",
  },
  {
    id: 7,
    title: "Blockchain Intern",
    desc: "Explore blockchain solutions.",
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop",
    duration: "3 months",
    company: "BlockChain Co.",
    location: "Remote",
  },
  {
    id: 8,
    title: "UI/UX Intern",
    desc: "Design user interfaces.",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop",
    duration: "5 months",
    company: "DesignStudio",
    location: "Pune",
  },
  {
    id: 9,
    title: "DevOps Intern",
    desc: "Automate and optimize pipelines.",
    image:
      "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400&h=200&fit=crop",
    duration: "4 months",
    company: "DevOps Pro",
    location: "Hyderabad",
  },
  {
    id: 10,
    title: "AR/VR Intern",
    desc: "Create AR/VR experiences.",
    image:
      "https://www.gpstrategies.com/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2023/02/Blog-Viability-AR-VR-mod_02.04.21-web.jpg.webp",
    duration: "6 months",
    company: "ImmersiveTech",
    location: "Remote",
  },
  {
    id: 11,
    title: "Game Dev Intern",
    desc: "Support game development.",
    image:
      "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=200&fit=crop",
    duration: "5 months",
    company: "GameWorld",
    location: "Kolkata",
  },
];

const PremiumInternshipsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get("/premium/my-applications");
      setApplications(response.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const getApplicationStatus = (internshipId) => {
    const application = applications.find(
      (a) => a.internship_id === internshipId
    );
    return application ? application.status : null;
  };

  const handleApply = (internship) => {
    navigate(`/premium/internships/apply/${internship.id}`, {
      state: { internship },
    });
  };

  const handleOpen = (internship) => {
    // For now, just alert. Later can navigate to internship content.
    alert(`Opening internship: ${internship.title}`);
  };

  return (
    <div className="internships-container">
      <h2 className="internships-title">Premium Internships</h2>
      <div className="internships-list">
        {internships.map((intern) => (
          <div className="internship-card" key={intern.id}>
            <img
              src={intern.image}
              alt={intern.title}
              className="internship-image"
            />
            <h3>{intern.title}</h3>
            <p>{intern.desc}</p>
            <div className="internship-details">
              <span className="internship-detail">
                Duration: {intern.duration}
              </span>
              <span className="internship-detail">
                Company: {intern.company}
              </span>
              <span className="internship-detail">
                Location: {intern.location}
              </span>
            </div>
            <div className="internship-footer">
              <span className="internship-price">₹499</span>
              {(() => {
                const status = getApplicationStatus(intern.id);
                if (status === "approved") {
                  return (
                    <button
                      className="enroll-btn open-btn"
                      onClick={() => handleOpen(intern)}
                    >
                      Open
                    </button>
                  );
                } else if (status === "rejected") {
                  return (
                    <button
                      className="enroll-btn"
                      onClick={() => handleApply(intern)}
                    >
                      Apply
                    </button>
                  );
                } else if (status === "applied") {
                  return (
                    <span className="status-text pending">
                      Pending Approval
                    </span>
                  );
                } else {
                  return (
                    <button
                      className="enroll-btn"
                      onClick={() => handleApply(intern)}
                    >
                      Apply
                    </button>
                  );
                }
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumInternshipsPage;
