"use client";
import { useEffect, useState } from "react";
import {
    RiMailLine,
    RiPhoneLine,
    RiMapPinLine,
    RiBuildingLine,
    RiEditLine,
    RiSaveLine,
} from "react-icons/ri";
import PortalLogoBadge from "../components/PortalLogoBadge.jsx";

import "../Candidate/base.css";
import "../Candidate/buttons.css";
import "./EmployeeProfile.css";
import apiClient from "../utils/axiosConfig";
import { employeeService } from "../services/employeeService.jsx";

const getAssetBaseUrl = () => {
    const base = apiClient?.defaults?.baseURL || "";
    return base.endsWith("/") ? base.slice(0, -1) : base;
};

const resolveAssetUrl = (raw, folder = "profile-pictures") => {
    if (!raw) return "";

    const stringValue = String(raw).trim();
    if (!stringValue) return "";

    const normalized = stringValue.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(normalized)) {
        return normalized;
    }

    const base = getAssetBaseUrl();

    if (normalized.startsWith("/api/uploads/")) {
        const stripped = normalized.replace(/^\/api/, "");
        return base ? `${base}${stripped}` : stripped;
    }

    if (normalized.startsWith("/uploads/")) {
        return base ? `${base}${normalized}` : normalized;
    }

    if (normalized.startsWith("uploads/")) {
        return base ? `${base}/${normalized}` : `/${normalized}`;
    }

    if (normalized.startsWith(`${folder}/`)) {
        const path = `/uploads/${normalized}`;
        return base ? `${base}${path}` : path;
    }

    if (normalized.startsWith("/")) {
        return base ? `${base}${normalized}` : normalized;
    }

    const suffix = normalized.replace(/^\/+/g, "");
    const path = `/uploads/${folder}/${suffix}`;
    return base ? `${base}${path}` : path;
};

const resolveUploadedPath = (payload) => {
    if (!payload) return null;
    if (typeof payload === "string") return payload;

    const directPath =
        payload.profilePicturePath ||
        payload.profilePictureUrl ||
        payload.fileDownloadUri ||
        payload.url ||
        payload.path ||
        payload.location ||
        payload.fileName;

    if (directPath) return directPath;

    if (payload.data) {
        return resolveUploadedPath(payload.data);
    }

    if (Array.isArray(payload) && payload.length > 0) {
        return resolveUploadedPath(payload[0]);
    }

    return null;
};

const toDateInputValue = (d) => {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(date?.getTime?.())) return (d || "").slice(0, 10);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

export default function EmployeeProfile() {
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [uploadError, setUploadError] = useState("");
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const [profile, setProfile] = useState({
        id: null,
        name: "",
        email: "email@example.com",
        phoneNumber: "",
        location: "Location not specified",
        dateOfBirth: null,
        department: "Human Resources",
        position: "Professional",
        employeeId: "",
        joinDate: null,
        active: true,
        profilePicturePath: null,
        profileCompleteness: 0,
        createdAt: null,
        updatedAt: null,
        // UI-only
        bio: "",
        skills: [],
        photoPreviewUrl: null,
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await employeeService.getProfile(); // GET /me
                if (!cancelled && data) {
                    const rawPath = data.profilePicturePath || data.profilePictureUrl || null;
                    setProfile((p) => ({
                        ...p,
                        ...data,
                        profilePicturePath: rawPath ?? p.profilePicturePath,
                        photoPreviewUrl: rawPath ? resolveAssetUrl(rawPath) : p.photoPreviewUrl,
                    }));
                }
            } catch {
                /* keep defaults */
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const onChange = (key) => (e) =>
        setProfile((prev) => ({ ...prev, [key]: e.target.value }));

    useEffect(() => {
        const currentUrl = profile.photoPreviewUrl;
        return () => {
            if (currentUrl && currentUrl.startsWith("blob:")) {
                URL.revokeObjectURL(currentUrl);
            }
        };
    }, [profile.photoPreviewUrl]);

    const handlePhotoUpload = async (e) => {
        const inputEl = e.target;
        const file = inputEl.files?.[0];
        if (!file) return;

        if (!file.type?.startsWith("image/")) {
            setUploadError("Please select a valid image file.");
            return;
        }

        setUploadError("");
        const previousPreview = profile.photoPreviewUrl;
        const previousPath = profile.profilePicturePath;
        const previewUrl = URL.createObjectURL(file);
        setProfile((p) => ({ ...p, photoPreviewUrl: previewUrl }));
        setUploadingPhoto(true);
        try {
            const uploadResponse = await employeeService.uploadProfilePicture(file);
            const uploadedPath = resolveUploadedPath(uploadResponse);

            if (uploadedPath) {
                if (previousPreview && previousPreview.startsWith("blob:")) {
                    URL.revokeObjectURL(previousPreview);
                }
                const previewUrlFinal = resolveAssetUrl(uploadedPath);
                setProfile((p) => ({
                    ...p,
                    profilePicturePath: uploadedPath,
                    photoPreviewUrl: previewUrlFinal || uploadedPath,
                }));
            } else {
                setUploadError("Upload succeeded, but no image path was returned.");
            }
        } catch (err) {
            setUploadError(err.message || "Failed to upload profile photo.");
            setProfile((p) => ({
                ...p,
                photoPreviewUrl: previousPreview,
                profilePicturePath: previousPath,
            }));
        } finally {
            setUploadingPhoto(false);
            if (inputEl) {
                inputEl.value = "";
            }
            if (previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        }
    };

    const handleSave = async () => {
        if (uploadingPhoto) {
            setError("Please wait for the profile photo upload to finish before saving.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const payload = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                phoneNumber: profile.phoneNumber,
                location: profile.location,
                dateOfBirth: profile.dateOfBirth || null,
                department: profile.department,
                position: profile.position,
                employeeId: profile.employeeId,
                joinDate: profile.joinDate || null,
                active: !!profile.active,
                profilePicturePath: profile.profilePicturePath,
                profileCompleteness: profile.profileCompleteness ?? 0,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt,
                bio: profile.bio,
            };
            const saved = await employeeService.updateProfile(payload); // PUT /me
            setProfile((prev) => ({
                ...prev,
                ...saved,
                profilePicturePath: saved?.profilePicturePath ?? saved?.profilePictureUrl ?? prev.profilePicturePath,
                photoPreviewUrl: resolveAssetUrl(saved?.profilePicturePath || saved?.profilePictureUrl) || prev.photoPreviewUrl,
            }));
            setEditing(false);
            setUploadError("");
        } catch (e) {
            setError(e.message || "Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading)
        return (
            <div className="profile-page">
                <div className="profile-section">Loading profile…</div>
            </div>
        );

    return (
        <div className="profile-page">
            {error && (
                <div
                    className="profile-section"
                    style={{ color: "#ff6b6b", fontWeight: 700 }}
                >
                    {error}
                </div>
            )}

            {/* Header Card */}
            <section className="profile-card">
                {/* Left: progress/photo */}
                <div className="avatar-block">
                    {profile.photoPreviewUrl || profile.profilePicturePath ? (
                        <img
                            src={profile.photoPreviewUrl || resolveAssetUrl(profile.profilePicturePath)}
                            alt="Profile"
                            className="avatar-img"
                        />
                    ) : (
                        <div className="progress-wrap">
                            <div className="progress-outer">
                                <PortalLogoBadge size={88} imageScale={0.72} />
                            </div>
                            <div className="progress-inner">
                                <div className="pct">
                                    {Math.round(profile.profileCompleteness || 0)}%
                                </div>
                                <div className="small">Complete</div>
                            </div>
                        </div>
                    )}

                    {editing && (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="upload-input"
                            title="Upload photo"
                        />
                    )}
                    {uploadingPhoto && <p className="upload-status">Uploading photo…</p>}
                    {uploadError && <p className="error-message">{uploadError}</p>}
                </div>

                {/* Middle: name, role, rows */}
                <div className="profile-fields">
                    {!editing ? (
                        <>
                            <h2 className="profile-name">
                                {profile.name || "First Last"}
                            </h2>
                            <div className="profile-title">
                                {profile.position || "Professional"}
                            </div>

                            <div className="rows">
                                <div className="row">
                                    <RiMapPinLine className="icon" />
                                    <span>{profile.location || "Location not specified"}</span>
                                </div>
                                <div className="row">
                                    <RiMailLine className="icon" />
                                    <span>{profile.email || "email@example.com"}</span>
                                </div>
                                <div className="row">
                                    <RiPhoneLine className="icon" />
                                    <span>{profile.phoneNumber || "Phone not provided"}</span>
                                </div>
                                {/* Optional extra line like screenshot theme */}
                                <div className="row">
                                    <RiBuildingLine className="icon" />
                                    <span>{profile.department || "—"}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <input
                                className="input"
                                placeholder="Full Name"
                                value={profile.name}
                                onChange={onChange("name")}
                            />
                            <div className="grid-two">
                                <input
                                    className="input"
                                    placeholder="Position"
                                    value={profile.position}
                                    onChange={onChange("position")}
                                />
                                <input
                                    className="input"
                                    placeholder="Department"
                                    value={profile.department}
                                    onChange={onChange("department")}
                                />
                            </div>
                            <div className="grid-two">
                                <input
                                    className="input"
                                    placeholder="Location"
                                    value={profile.location}
                                    onChange={onChange("location")}
                                />
                                <input
                                    className="input"
                                    type="email"
                                    placeholder="Email"
                                    value={profile.email}
                                    onChange={onChange("email")}
                                />
                            </div>
                            <div className="grid-two">
                                <input
                                    className="input"
                                    placeholder="Phone Number"
                                    value={profile.phoneNumber}
                                    onChange={onChange("phoneNumber")}
                                />
                                <input
                                    className="input"
                                    placeholder="Employee ID"
                                    value={profile.employeeId || ""}
                                    onChange={onChange("employeeId")}
                                />
                            </div>
                            <div className="grid-two">
                                <input
                                    className="input"
                                    type="date"
                                    placeholder="Date of Birth"
                                    value={toDateInputValue(profile.dateOfBirth)}
                                    onChange={(e) =>
                                        setProfile((p) => ({ ...p, dateOfBirth: e.target.value }))
                                    }
                                />
                                <input
                                    className="input"
                                    type="date"
                                    placeholder="Join Date"
                                    value={toDateInputValue(profile.joinDate)}
                                    onChange={(e) =>
                                        setProfile((p) => ({ ...p, joinDate: e.target.value }))
                                    }
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Edit / Save */}
                <div className="profile-actions">
                    {!editing ? (
                        <button
                            className="btn btn-primary pill"
                            onClick={() => setEditing(true)}
                        >
                            <RiEditLine /> Edit Profile
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button
                                className="btn btn-primary pill"
                                onClick={handleSave}
                                disabled={saving || uploadingPhoto}
                            >
                                <RiSaveLine /> {saving ? "Saving…" : "Save"}
                            </button>
                            <button
                                className="btn btn-secondary pill"
                                onClick={() => setEditing(false)}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* About section – big title with underline, editable */}
            <section className="profile-section">
                <h3 className="section-title underlined">About</h3>
                {!editing ? (
                    <p className="body-text">
                        {profile.bio || "Complete your profile to tell employers about yourself."}
                    </p>
                ) : (
                    <textarea
                        className="textarea"
                        rows={5}
                        value={profile.bio}
                        onChange={onChange("bio")}
                        placeholder="Write a short summary about yourself, experience, and interests."
                    />
                )}
            </section>

            {/* (Optional) add Skills or other sections below if you already had them) */}
        </div>
    );
}
//error fixed//