"use client"

import { useState, useRef } from "react"
import "./FileUpload.css"

export default function FileUpload({
  onFileSelect,
  accept = "*/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = "Choose File",
  description = "Drag and drop or click to select",
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return false
    }

    if (accept !== "*/*") {
      const acceptedTypes = accept.split(",").map((type) => type.trim())
      const fileType = file.type
      const fileExtension = "." + file.name.split(".").pop().toLowerCase()

      const isValidType = acceptedTypes.some(
        (type) =>
          type === fileType ||
          type === fileExtension ||
          (type.endsWith("/*") && fileType.startsWith(type.replace("/*", ""))),
      )

      if (!isValidType) {
        setError(`File type not supported. Accepted types: ${accept}`)
        return false
      }
    }

    setError("")
    return true
  }

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      onFileSelect(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${isDragOver ? "drag-over" : ""} ${error ? "error" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          style={{ display: "none" }}
        />

        <div className="file-upload-content">
          <div className="file-upload-icon">📁</div>
          <div className="file-upload-text">
            <div className="file-upload-label">{label}</div>
            <div className="file-upload-description">{description}</div>
          </div>
        </div>
      </div>

      {error && <div className="file-upload-error">{error}</div>}
    </div>
  )
}
