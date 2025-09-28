"use client"

import { useState, useRef } from "react"
import "./FileUpload.css"

export default function FileUpload({
  onFileSelect,
  accept = "*/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = "Choose File",
  description = "Drag and drop or click to select"
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  // Map file extensions to MIME types
  const getMimeTypes = (acceptString) => {
    const types = [];
    const parts = acceptString.split(',');
    
    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.startsWith('.')) {
        // Handle extensions like .pdf, .docx
        const extension = trimmed.toLowerCase();
        types.push(extension);
      } else {
        // Handle MIME types like image/*, application/pdf
        types.push(trimmed);
      }
    });
    
    return types;
  }

  const validateFile = (file) => {
    // Clear previous errors
    setError("")

    // Size validation
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024)
      setError(`File size must be less than ${maxSizeMB}MB`)
      return false
    }

    // Type validation only if not accepting all files
    if (accept !== "*/*") {
      const allowedTypes = getMimeTypes(accept);
      let isValidType = false;

      // Check by MIME type
      if (file.type) {
        isValidType = allowedTypes.some(type => {
          if (type.includes('*')) {
            // Handle wildcard MIME types like image/*, application/*
            const [category] = type.split('/');
            const fileCategory = file.type.split('/')[0];
            return category === fileCategory;
          }
          return type === file.type;
        });
      }

      // Check by file extension if MIME type check fails
      if (!isValidType) {
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        isValidType = allowedTypes.some(type => type === fileExtension);
      }

      if (!isValidType) {
        setError(`File type not supported. Accepted: ${allowedTypes.join(', ')}`)
        return false
      }
    }

    return true
  }

  const handleFileSelect = (file) => {
    console.log("File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeMB: (file.size / 1024 / 1024).toFixed(2) + 'MB'
    });
    
    if (validateFile(file)) {
      console.log("File validation passed, calling onFileSelect");
      onFileSelect(file);
    } else {
      console.log("File validation failed:", error);
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
      // Clear the input to allow selecting the same file again
      e.target.value = ''
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