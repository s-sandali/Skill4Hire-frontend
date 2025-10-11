"use client";
import { useState, useEffect } from "react";
import { RiCloseLine, RiSendPlaneLine } from "react-icons/ri";

const RecommendationModal = ({
                                 isOpen,
                                 onClose,
                                 candidate,
                                 jobs,
                                 onSubmit
                             }) => {
    const [selectedJobId, setSelectedJobId] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (jobs.length > 0 && !selectedJobId) {
            setSelectedJobId(jobs[0].id);
        }
    }, [jobs, selectedJobId]);

    const handleSubmit = async () => {
        if (!selectedJobId) {
            alert("Please select a job");
            return;
        }

        setLoading(true);
        try {
            await onSubmit(selectedJobId, note);
            setNote("");
            setSelectedJobId("");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Recommend {candidate?.name}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <RiCloseLine />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label>Select Job:</label>
                        <select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="select"
                        >
                            <option value="">Choose a job...</option>
                            {jobs.map(job => (
                                <option key={job.id} value={job.id}>
                                    {job.title} - {job.department}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Recommendation Note:</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a note about why this candidate is a good fit..."
                            rows="4"
                            className="textarea"
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={loading || !selectedJobId}
                    >
                        <RiSendPlaneLine />
                        {loading ? "Recommending..." : "Recommend Candidate"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecommendationModal;