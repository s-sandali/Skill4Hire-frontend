"use client"

import { useState, useRef } from "react"
import "./FileUpload.css"

export default function FileUpload({
  onFileSelect,
  accept = "*/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = "Choose File",
  description = "Drag and drop or click to select",
  allowedTypes = [], // Add allowed types for better validation
  multiple = false,
  showSelected = true,
  clearable = true
}) {
  const [error, setError] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const [selectedFiles, setSelectedFiles] = useState([])

  const deriveAllowedFromAccept = (acceptValue) => {
    if (!acceptValue || acceptValue === "*/*") return []
    return acceptValue
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  }
  const validateFile = (file) => {
    // Size validation
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return false
    }

    // Type validation
    const listToCheck = allowedTypes.length > 0 ? allowedTypes.map(t => t.toLowerCase()) : deriveAllowedFromAccept(accept)
    if (accept !== "*/*" && listToCheck.length > 0) {
      const fileExtension = "." + file.name.split(".").pop().toLowerCase()
      const mimeType = (file.type || "").toLowerCase()
      const isValidType = listToCheck.some((type) => {
        if (type.endsWith("/*")) {
          const prefix = type.replace("/*", "")
          return mimeType.startsWith(prefix + "/")
        }
        return type === mimeType || type === fileExtension
      })

      if (!isValidType) {
        setError(`File type not supported. Accepted types: ${listToCheck.join(", ")}`)
        return false
      }
    }

    setError("")
    return true
  }
  const handleFileSelect = (fileOrFiles) => {
    const filesArray = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles]
    const validFiles = []
    for (const f of filesArray) {
      if (validateFile(f)) validFiles.push(f)
    }

    if (validFiles.length === 0) return

    if (multiple) {
      setSelectedFiles(validFiles)
      onFileSelect(validFiles)
    } else {
      setSelectedFiles([validFiles[0]])
      onFileSelect(validFiles[0])
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
      handleFileSelect(multiple ? files : files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFileSelect(multiple ? files : files[0])
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setSelectedFiles([])
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onFileSelect(multiple ? [] : null)
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
          multiple={multiple}
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
      {showSelected && selectedFiles.length > 0 && (
        <div className="file-upload-selected">
          {multiple ? (
            <ul className="file-upload-list">
              {selectedFiles.map((f, idx) => (
                <li key={idx} className="file-upload-item">{f.name}</li>
              ))}
            </ul>
          ) : (
            <div className="file-upload-name">{selectedFiles[0].name}</div>
          )}
          {clearable && (
            <button type="button" className="btn btn-secondary btn-small file-upload-clear" onClick={handleClear}>
              Clear
            </button>
          )}
        </div>
      )}

      {error && <div className="file-upload-error">{error}</div>}
    </div>
  )
}
