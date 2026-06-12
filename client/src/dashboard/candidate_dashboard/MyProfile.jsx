import { FileText, Trash2, UploadCloud } from "lucide-react";
import { useState } from "react";
import api from "../../api/axiosClient";

const MyProfile = ({ user }) => {
  const [resume, setResume] = useState(null);

  const [profileData, setProfileData] = useState({
  name: "",
  phone: "",
  email: "",

  skills: [],

  education: {
    institution: "",
    degree: "",
    years: "",
    location: "",
    gpa: "",
  },

  projects: {
    title: "",
    technologies: [],
    description: "",
  },

  experience: {
    designation: "",
    company: "",
    dates: "",
    description: "",
  },

  certifications: [],
});

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setResume(file);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const token = localStorage.getItem("token");

      const response = await api.post(
        "/candidate/upload-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      const parsedData = response.data?.profileData;

      setProfileData({
  name: parsedData.name || "",
  phone: parsedData.phone || "",
  email: parsedData.email || "",

  skills: parsedData.skills || [],

  education:
    parsedData.education || {
      institution: "",
      degree: "",
      years: "",
      location: "",
      gpa: "",
    },

  projects:
    parsedData.projects || {
      title: "",
      technologies: [],
      description: "",
    },

  experience:
    parsedData.experience || {
      designation: "",
      company: "",
      dates: "",
      description: "",
    },

  certifications:
    parsedData.certifications || [],
});

      alert("Resume parsed successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to parse resume.");
    }
  };

  const removeResume = () => {
    setResume(null);
  };

  const handlePersonalChange = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value,
    });
  };

  const handleSaveProfile = () => {
    localStorage.setItem(
      "candidateProfile",
      JSON.stringify(profileData)
    );

    alert("Profile Saved Successfully!");
  };

  return (
    <div className="space-y-6">


      {/* Resume Upload */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">

        <h1 className="text-3xl font-bold text-white mb-2">
          My Profile
        </h1>

        <p className="text-slate-400 text-sm mb-6">
          Upload your latest resume for AI-powered analysis.
        </p>

        <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all">

          <UploadCloud className="w-10 h-10 text-indigo-400" />

          <div className="text-center">
            <p className="text-slate-300 font-medium">
              Drag & Drop Resume
            </p>

            <p className="text-slate-500 text-sm">
              PDF , DOCX , JPEG , JPG , PNG(Max 10MB)
            </p>
          </div>

          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpeg,.jpg,.png"
            className="hidden"
            onChange={handleResumeUpload}
          />
        </label>

        {resume && (
          <div className="mt-6 flex items-center justify-between bg-slate-800/50 rounded-lg p-4">

            <div className="flex items-center gap-3">
              <FileText className="text-green-400" />

              <span className="text-slate-200">
                {resume.name}
              </span>
            </div>

            <button
              onClick={removeResume}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 />
            </button>

          </div>
        )}
      </div>

      {/* Personal Details */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Personal Details
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Full Name"
            value={profileData.name}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                name: e.target.value,
              })
            }
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />

          <input
            type="email"
            placeholder="Email"
            value={profileData.email}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                email: e.target.value,
              })
            }
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={profileData.phone}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                phone: e.target.value,
              })
            }
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />

        </div>
      </div>

      {/* Skills */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Skills
        </h2>

        <textarea
          rows="4"
          placeholder="React, Node.js, Python, AWS, Docker"
          value={profileData.skills.join(", ")}
          onChange={(e) =>
  setProfileData({
    ...profileData,
    skills: e.target.value.split(",").map(s => s.trim())
  })
}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
        />
      </div>

      {/* Work Experience */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">

        <h2 className="text-xl font-semibold text-white mb-4">
          Work Experience
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="designation"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
            value={profileData.experience.designation}
onChange={(e) =>
  setProfileData({
    ...profileData,
    experience: {
      ...profileData.experience,
      designation: e.target.value,
    },
  })
}
          />

          <input
            type="text"
            placeholder="company"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
            value={profileData.experience.company}
onChange={(e) =>
  setProfileData({
    ...profileData,
    experience: {
      ...profileData.experience,
      company: e.target.value,
    },
  })
}
          />

          <input
            type="text"
            placeholder="dates"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
            value={profileData.experience.dates}
onChange={(e) =>
  setProfileData({
    ...profileData,
    experience: {
      ...profileData.experience,
      dates: e.target.value,
    },
  })
}
          />

          <input
            type="text"
            placeholder="description"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
           value={profileData.experience.description}
onChange={(e) =>
  setProfileData({
    ...profileData,
    experience: {
      ...profileData.experience,
      description: e.target.value,
    },
  })
}
          />

        </div>
      </div>

      {/* Projects */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">

        <h2 className="text-xl font-semibold text-white mb-4">
          Projects
        </h2>

        <input
          type="text"
          placeholder="Title"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white mb-4"
          value={profileData.projects.title}
onChange={(e) =>
  setProfileData({
    ...profileData,
    projects: {
      ...profileData.projects,
      title: e.target.value,
    },
  })
}

        />

        <input
          type="text"
          placeholder="Technologies Used"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white mb-4"
          value={profileData.projects.technologies?.join(",")}
onChange={(e) =>
  setProfileData({
    ...profileData,
    projects: {
      ...profileData.projects,
      technologies: e.target.value
        .split(",")
        .map((t) => t.trim()),
    },
  })
}
        />

        <textarea
          rows="4"
          placeholder="Project Description"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          value={profileData.projects.description}
onChange={(e) =>
  setProfileData({
    ...profileData,
    projects: {
      ...profileData.projects,
      description: e.target.value,
    },
  })
}
        />

      </div>

      {/* Education */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">

        <h2 className="text-xl font-semibold text-white mb-4">
          Education
        </h2>

        <div className="grid md:grid-cols-3 gap-4">


          <input
            type="text"
            placeholder="Institution"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
            value={profileData.education.institution}
            onChange={(e) =>
  setProfileData({
    ...profileData,
    education: {
      ...profileData.education,
      institution: e.target.value,
    },
  })
}
          />

          <input
            type="text"
            placeholder="Degree"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
            value={profileData.education.degree}
            onChange={(e) =>
  setProfileData({
    ...profileData,
    education: {
      ...profileData.education,
      degree: e.target.value,
    },
  })
}
          />

          <input
            type="text"
            placeholder="Location"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
            value={profileData.education.location}
            onChange={(e) =>
  setProfileData({
    ...profileData,
    education: {
      ...profileData.education,
      location: e.target.value,
    },
  })
}
          />

          <input
            type="text"
            placeholder="Graduation Year"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
            value={profileData.education.years}
            onChange={(e) =>
  setProfileData({
    ...profileData,
    education: {
      ...profileData.education,
      years: e.target.value,
    },
  })
}
          />


          <input
            type="text"
            placeholder="GPA"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
            value={profileData.education.gpa}
            onChange={(e) =>
  setProfileData({
    ...profileData,
    education: {
      ...profileData.education,
      gpa: e.target.value,
    },
  })
}
          />


        </div>
      </div>

      {/* Certifications */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">

        <h2 className="text-xl font-semibold text-white mb-4">
          Certifications
        </h2>

        <input
          type="text"
          placeholder="Professional Certifications"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white mb-4"
          value={profileData.certifications.join(",")}
          onChange={(e) =>
  setProfileData({
    ...profileData,
      certifications: e.target.value,

  })
}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">

        <button
          onClick={handleSaveProfile}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium"
        >
          Save Profile
        </button>

      </div>

    </div>
  )
};

export default MyProfile;