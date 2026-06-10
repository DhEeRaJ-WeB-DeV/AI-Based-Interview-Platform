import React, { useState } from "react";
import { UploadCloud, FileText, Trash2 } from "lucide-react";

const MyProfile = ({ user }) => {
  const [resume, setResume] = useState(null);

 const [profileData, setProfileData] = useState({
  personalDetails: {
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  },

  skills: "",

  workExperience: {
    designation: "",
    company: "",
    dates: "",
    description: "",
    responsibilities: "",
  },

  projects: {
    title: "",
    technologiesUsed: "",
    description: "",
  },

  education: {
    institution: "",
    degree: "",
    location: "",
    graduationYear: "",
    gpa: "",
  },

  certifications: {
    professionalCertification: "",
  },
});

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setResume(file);

      console.log("Resume Uploaded:", file.name);

      // Later:
      // Send file to backend
      // Parse Resume
      // Auto fill profileData
    }
  };

  const removeResume = () => {
    setResume(null);
  };

  const handlePersonalChange = (field, value) => {
    setProfileData({
      ...profileData,
      personalDetails: {
        ...profileData.personalDetails,
        [field]: value,
      },
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
            value={profileData.personalDetails.name}
            onChange={(e) =>
              handlePersonalChange("name", e.target.value)
            }
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />

          <input
            type="email"
            placeholder="Email"
            value={profileData.personalDetails.email}
            onChange={(e) =>
              handlePersonalChange("email", e.target.value)
            }
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={profileData.personalDetails.phone}
            onChange={(e) =>
              handlePersonalChange("phone", e.target.value)
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
          value={profileData.skills}
          onChange={(e) =>
            setProfileData({
              ...profileData,
              skills: e.target.value,
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
          />

          <input
            type="text"
            placeholder="company"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />

          <input
            type="text"
            placeholder="dates"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />

           <input
            type="text"
            placeholder="description"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />

        </div>

        <textarea
          rows="4"
          placeholder="Responsibilities"
          className="w-full mt-4 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
        />
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
        />

        <input
          type="text"
          placeholder="Technologies Used"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white mb-4"
        />

        <textarea
          rows="4"
          placeholder="Project Description"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
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
          />

          <input
            type="text"
            placeholder="Degree"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />

          <input
            type="text"
            placeholder="Location"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />

          <input
            type="text"
            placeholder="Graduation Year"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
          />

          
          <input
            type="text"
            placeholder="GPA"
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
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
  );
};

export default MyProfile;