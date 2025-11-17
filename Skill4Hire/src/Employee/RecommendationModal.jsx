// RecommendationModal.jsx
"use client";
import { useState, useEffect } from "react";
import { RiCloseLine, RiSendPlaneLine } from "react-icons/ri";
import Portal from "../components/Portal.jsx";

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
        <Portal>
            <div className="modal-overlay modal-overlay--center" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
            }}>
                <div className="modal-content modal-content--narrow" style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div className="modal-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.5rem',
                        borderBottom: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: '#1e293b'
                        }}>
                            Recommend {candidate?.name}
                        </h3>
                        <button className="close-btn" onClick={onClose} style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <RiCloseLine />
                        </button>
                    </div>

                    <div className="modal-body" style={{
                        padding: '1.5rem',
                        flex: 1,
                        overflowY: 'auto'
                    }}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 500,
                                color: '#374151'
                            }}>
                                Select Job:
                            </label>
                            <select
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                                className="select"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    backgroundColor: 'white',
                                    cursor: 'pointer'
                                }}
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
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 500,
                                color: '#374151'
                            }}>
                                Recommendation Note:
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add a note about why this candidate is a good fit..."
                                rows="4"
                                className="textarea"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                    </div>

                    <div className="modal-actions" style={{
                        padding: '1.5rem',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.75rem'
                    }}>
                        <button className="btn btn-secondary" onClick={onClose} style={{
                            padding: '10px 20px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={loading || !selectedJobId}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '8px',
                                backgroundColor: loading || !selectedJobId ? '#9ca3af' : '#2563eb',
                                color: 'white',
                                cursor: loading || !selectedJobId ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <RiSendPlaneLine />
                            {loading ? "Recommending..." : "Recommend Candidate"}
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default RecommendationModal;