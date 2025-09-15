import './ResumeUpload.css';
const ResumeUpload = ({ resume, setResume }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setResume(file);
  };

  return (
    <div className="resume-upload">
      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
      {resume && <p>Uploaded: {resume.name}</p>}
    </div>
  );
};

export default ResumeUpload;
