import { useEffect, useState } from "react";
import { jobService } from "../services/jobService";

const JobPostings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    try {
      const data = await jobService.getAll();
      setJobs(data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await jobService.remove(id);
      setJobs(jobs.filter((job) => job.id !== id));
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-300">Loading jobs...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Job Postings</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
          + New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <p className="text-gray-400">No jobs available.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-gray-900 border border-gray-700 rounded-lg p-5 shadow hover:shadow-lg"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-white">
                  {job.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    new Date(job.deadline) > new Date()
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {new Date(job.deadline) > new Date()
                    ? "Active"
                    : "Closed"}
                </span>
              </div>

              <p className="text-gray-400 mt-2 text-sm">{job.description}</p>

              <div className="mt-3 text-sm text-gray-300">
                <p>📍 {job.location}</p>
                <p>💼 {job.type}</p>
                <p>💰 ${job.salary}</p>
                <p>⚡ {job.experience} years exp</p>
                <p>⏳ Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
              </div>

              <div className="flex gap-3 mt-4">
                <button className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobPostings;
