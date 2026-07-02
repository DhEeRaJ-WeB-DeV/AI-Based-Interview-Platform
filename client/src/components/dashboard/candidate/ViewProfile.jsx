import { useEffect, useState } from "react";
import api from "../../../api/axiosClient";

const ViewProfile = ({onEdit}) => {

  const [profile, setProfile] = useState(null);
  const [resumeUrl, setresumeUrl] = useState("");

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const response =
          await api.get(
            "/candidate/profile"
          );
          console.log(response.data.profile);

        setProfile(
          response.data.profile
        );

        setresumeUrl(response.data.url)
        
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();

  }, []);



  if (!profile) {
    return (
      <div className="text-white">
        Loading...
      </div>
    );
  }

  return (

    <div className="space-y-6">

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">

        <h1 className="text-3xl font-bold text-white mb-6">
          My profile
        </h1>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <p className="text-slate-400">
              Name
            </p>

            <p className="text-white">
              {profile.name}
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Email
            </p>

            <p className="text-white">
              {profile.email}
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Phone
            </p>

            <p className="text-white">
              {profile.ph_no}
            </p>
          </div>

        </div>

      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">

        <h2 className="text-xl font-semibold text-white mb-4">
          Skills
        </h2>

        <div className="flex flex-wrap gap-2">

          {profile.skills?.map((skill,index)=>(
            <span
              key={index}
              className="px-3 py-1 bg-indigo-600 rounded-full text-white text-sm"
            >
              {skill}
            </span>
          ))}

        </div>

      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">

        <h2 className="text-xl font-semibold text-white mb-4">
          Education
        </h2>

       {profile.education?.map((edu, index) => (
  <div
    key={index}
    className="mb-4 border-b border-slate-700 pb-3"
  >
    <p className="text-white font-medium">{edu.degree}</p>
    <p className="text-slate-300">{edu.institution}</p>
    <p className="text-slate-400">
      {edu.location} • {edu.years}
    </p>
    {edu.gpa && (
      <p className="text-slate-400">
        GPA: {edu.gpa}
      </p>
    )}
  </div>
))}

      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">

        <h2 className="text-xl font-semibold text-white mb-4">
          Experience
        </h2>

        {profile.experience?.map((exp, index) => (
  <div
    key={index}
    className="mb-4 border-b border-slate-700 pb-3"
  >
    <p className="text-white font-medium">
      {exp.designation}
    </p>

    <p className="text-slate-300">
      {exp.company}
    </p>

    <p className="text-slate-400">
      {exp.dates}
    </p>

    {exp.description?.length > 0 && (
      <ul className="list-disc ml-5 mt-2 text-slate-300">
        {exp.description.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
    )}
  </div>
))}

      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">

        <h2 className="text-xl font-semibold text-white mb-4">
          Projects
        </h2>

       {profile.projects?.map((project, index) => (
  <div
    key={index}
    className="mb-4 border-b border-slate-700 pb-3"
  >
    <h3 className="text-white font-medium">
      {project.title}
    </h3>

    <p className="text-slate-300 mt-2">
      {project.description}
    </p>

    {project.technologies?.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-3">
        {project.technologies.map((tech, i) => (
          <span
            key={i}
            className="px-2 py-1 bg-slate-700 rounded text-sm text-white"
          >
            {tech}
          </span>
        ))}
      </div>
    )}
  </div>
))}

      </div>
      <button
  onClick={onEdit}
  className="px-4 py-2 bg-indigo-600 rounded-lg text-white"
>
  Update Profile
</button>
<button
  onClick={() => window.open(resumeUrl.resumeUrl, "_blank")}
  className="px-4 py-2 bg-indigo-600 rounded-lg text-white"
>
  View Resume
</button>

    </div>
  );
};

export default ViewProfile;
