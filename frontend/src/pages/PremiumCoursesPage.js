import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import "./PremiumCoursesPage.css";

const courses = [
  {
    id: 1,
    title: "AI & Machine Learning",
    desc: "Master AI concepts and ML algorithms.",
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
    duration: "8 weeks",
    level: "Intermediate",
    instructor: "Dr. Sarah Chen",
  },
  {
    id: 2,
    title: "Full Stack Web Dev",
    desc: "Become a MERN stack expert.",
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=200&fit=crop",
    duration: "12 weeks",
    level: "Beginner",
    instructor: "Mike Johnson",
  },
  {
    id: 3,
    title: "Data Science Pro",
    desc: "Data analysis, visualization, and more.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
    duration: "10 weeks",
    level: "Advanced",
    instructor: "Lisa Wong",
  },
  {
    id: 4,
    title: "Cloud Computing",
    desc: "AWS, Azure, and cloud architecture.",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop",
    duration: "6 weeks",
    level: "Intermediate",
    instructor: "Alex Rodriguez",
  },
  {
    id: 5,
    title: "Cybersecurity",
    desc: "Protect systems and networks.",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop",
    duration: "9 weeks",
    level: "Advanced",
    instructor: "Emma Davis",
  },
  {
    id: 6,
    title: "Mobile App Dev",
    desc: "iOS & Android with React Native.",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop",
    duration: "11 weeks",
    level: "Intermediate",
    instructor: "Raj Patel",
  },
  {
    id: 7,
    title: "Blockchain Basics",
    desc: "Learn blockchain and crypto tech.",
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop",
    duration: "7 weeks",
    level: "Beginner",
    instructor: "Tom Wilson",
  },
  {
    id: 8,
    title: "UI/UX Design",
    desc: "Design beautiful, usable apps.",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop",
    duration: "8 weeks",
    level: "Beginner",
    instructor: "Anna Kim",
  },
  {
    id: 9,
    title: "DevOps Mastery",
    desc: "CI/CD, Docker, Kubernetes.",
    image:
      "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400&h=200&fit=crop",
    duration: "10 weeks",
    level: "Advanced",
    instructor: "Carlos Martinez",
  },
  {
    id: 10,
    title: "AR/VR Development",
    desc: "Build immersive experiences.",
    image:
      "https://www.gpstrategies.com/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2023/02/Blog-Viability-AR-VR-mod_02.04.21-web.jpg.webp",
    duration: "12 weeks",
    level: "Advanced",
    instructor: "Sophie Lee",
  },
  {
    id: 11,
    title: "Game Development",
    desc: "Unity, Unreal, and game design.",
    image:
      "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=200&fit=crop",
    duration: "14 weeks",
    level: "Intermediate",
    instructor: "David Brown",
  },
];

const PremiumCoursesPage = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get("/premium/my-enrollments");
      setEnrollments(response.data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    }
  };

  const getEnrollmentStatus = (courseId) => {
    const enrollment = enrollments.find((e) => e.course_id === courseId);
    return enrollment ? enrollment.status : null;
  };

  const handleEnroll = (course) => {
    navigate(`/premium/courses/enroll/${course.id}`, { state: { course } });
  };

  const handleOpen = (course) => {
    // Navigate to CourseLearnPage (replace with dynamic id if needed)
    navigate("/course-learn", { state: { courseId: course.id } });
  };

  return (
    <div className="courses-container">
      <h2 className="courses-title">Premium Courses</h2>
      <div className="courses-list">
        {courses.map((course) => (
          <div className="course-card" key={course.id}>
            <img
              src={course.image}
              alt={course.title}
              className="course-image"
            />
            <h3>{course.title}</h3>
            <p>{course.desc}</p>
            <div className="course-details">
              <span className="course-detail">Duration: {course.duration}</span>
              <span className="course-detail">Level: {course.level}</span>
              <span className="course-detail">
                Instructor: {course.instructor}
              </span>
            </div>
            <div className="course-footer">
              <span className="course-price">₹499</span>
              {(() => {
                const status = getEnrollmentStatus(course.id);
                if (status === "approved") {
                  return (
                    <button
                      className="enroll-btn open-btn"
                      onClick={() => handleOpen(course)}
                    >
                      Open
                    </button>
                  );
                } else if (status === "rejected") {
                  return (
                    <button
                      className="enroll-btn"
                      onClick={() => handleEnroll(course)}
                    >
                      Enroll
                    </button>
                  );
                } else if (status === "enrolled") {
                  return (
                    <span className="status-text pending">
                      Pending Approval
                    </span>
                  );
                } else {
                  return (
                    <button
                      className="enroll-btn"
                      onClick={() => handleEnroll(course)}
                    >
                      Enroll
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

export default PremiumCoursesPage;
