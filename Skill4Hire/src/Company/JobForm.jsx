import { useState, useEffect } from "react";
import { jobService } from "../services/jobService";
import { useNavigate, useParams } from "react-router-dom";

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState({
    title: "",
    description: "",
    type: "",
    location: "",
    salary: "",
    experience: "",
    deadline: "",
  });

  useEffect(() => {
    if (id) {
      jobService.getById(id).then(setJob);
    }
  }, [id]);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await jobService.update(id, job);
      } else {
        await jobService.create(job);
      }
      navigate("/jobs");
    } catch (err) {
      console.error("Failed to save job:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-900 text-white rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">{id ? "Edit Job" : "Create Job"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={job.title}
          onChange={handleChange}
          placeholder="Job Title"
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          required
        />
        <textarea
          name="description"
          value={job.description}
          onChange={handleChange}
          placeholder="Job Description"
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          required
        />
        <input
          name="type"
          value={job.type}
          onChange={handleChange}
          placeholder="Job Type"
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          required
        />
        <input
          name="location"
          value={job.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          required
        />
        <input
          type="number"
          name="salary"
          value={job.salary}
          onChange={handleChange}
          placeholder="Salary"
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          required
        />
        <input
          type="number"
          name="experience"
          value={job.experience}
          onChange={handleChange}
          placeholder="Experience (years)"
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        />
        <input
          type="date"
          name="deadline"
          value={job.deadline}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          required
        />
        <button
          type="submit"
          className="bg-green-600 px-4 py-2 rounded text-white font-semibold"
        >
          {id ? "Update Job" : "Create Job"}
        </button>
      </form>
    </div>
  );
};

export default JobForm;
