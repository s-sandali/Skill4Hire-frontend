import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
	FiSearch as Search,
	FiBell as Bell,
	FiBriefcase as Briefcase,
	FiUser as User,
	FiFileText as FileText,
	FiSettings as Settings,
	FiTrendingUp as TrendingUp,
	FiClock as Clock,
	FiCheckCircle as CheckCircle,
	FiXCircle as XCircle,
	FiAlertCircle as AlertCircle,
	FiStar as Star,
	FiLogOut as LogOut,
	FiMapPin as MapPin,
	FiMail as Mail,
	FiPhone as Phone,
	FiLinkedin as Linkedin,
	FiGithub as Github,
	FiExternalLink as ExternalLink,
	FiDownload as Download,
} from 'react-icons/fi';
import Applications from './components/Applications';
import JobMatches from './components/JobMatches';
import ProfileSetupForm from './components/ProfileSetupForm';
import { candidateService } from '../services/candidateService';
import { jobService } from '../services/jobService';
import { authService } from '../services/authService';
import './Profile.css';

const defaultProfileSummary = {
	firstName: 'User',
	lastName: '',
	email: '',
	phoneNumber: '',
	location: '',
	title: '',
	headline: '',
	skills: [],
	resumeFileName: '',
	resumeUrl: '',
	profilePictureUrl: '',
	linkedin: '',
	github: '',
	portfolio: '',
	experience: null,
	education: null,
	bio: '',
};

const buildProfileSummary = (profile) => {
	if (!profile) {
		return { ...defaultProfileSummary };
	}

	const fullName = (profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`).trim();
	const nameParts = fullName.split(' ').filter(Boolean);
	const firstName = nameParts[0] || defaultProfileSummary.firstName;
	const lastName = nameParts.slice(1).join(' ');

	let skills = [];
	if (Array.isArray(profile.skills)) {
		skills = profile.skills;
	} else if (typeof profile.skills === 'string') {
		skills = profile.skills
			.split(',')
			.map((skill) => skill.trim())
			.filter(Boolean);
	}

	return {
		firstName,
		lastName,
		email: profile.email || '',
		phoneNumber: profile.phoneNumber || profile.phone || '',
		location: profile.location || profile.city || profile.country || '',
		title: profile.title || profile.headline || '',
		headline: profile.headline || profile.title || '',
		skills,
		resumeFileName:
			profile.resumeFileName ||
			profile.resume ||
			profile.resumeOriginalName ||
			profile.resumeFilename ||
			'',
		resumeUrl:
			profile.resumeUrl ||
			profile.resumeDownloadUrl ||
			profile.resumeDownloadPath ||
			profile.resumePath ||
			profile.resumeLink ||
			'',
		profilePictureUrl:
			profile.profilePictureUrl ||
			profile.profilePicturePath ||
			profile.profilePicture ||
			profile.profileImageUrl ||
			profile.photoUrl ||
			profile.avatarUrl ||
			'',
		linkedin: profile.linkedin || profile.linkedinUrl || '',
		github: profile.github || profile.githubUrl || '',
		portfolio: profile.portfolio || profile.website || profile.portfolioUrl || '',
		experience: profile.experience || null,
		education: profile.education || null,
		bio: profile.bio || profile.summary || profile.about || '',
	};
};

const buildFormCandidate = (profile, summary) => ({
	name: (profile?.name || `${summary.firstName} ${summary.lastName}`).trim(),
	email: profile?.email || summary.email,
	phoneNumber: profile?.phoneNumber || profile?.phone || summary.phoneNumber,
	location: profile?.location || profile?.city || summary.location,
	title: profile?.title || profile?.headline || summary.title,
	headline: profile?.headline || summary.headline,
	experience:
		profile?.experience || {
			isExperienced: false,
			role: '',
			company: '',
			yearsOfExperience: 0,
		},
	education:
		profile?.education || {
			degree: '',
			institution: '',
			graduationYear: null,
		},
	skills: Array.isArray(profile?.skills) ? profile.skills : summary.skills,
	linkedin: profile?.linkedin || summary.linkedin,
	github: profile?.github || summary.github,
	portfolio: profile?.portfolio || profile?.website || summary.portfolio,
	resumeFileName: profile?.resumeFileName || profile?.resume || summary.resumeFileName,
	profilePictureUrl:
		profile?.profilePictureUrl ||
		profile?.profilePicturePath ||
		profile?.profilePicture ||
		profile?.profileImageUrl ||
		profile?.photoUrl ||
		summary.profilePictureUrl,
});

const normalizeApplications = (source) => {
	let list = [];
	if (Array.isArray(source)) {
		list = source;
	} else if (Array.isArray(source?.content)) {
		list = source.content;
	}
	return list.map((item, index) => ({
		id: item.id || item._id || `app-${index}`,
		jobId: item.jobId || item.jobPostId || item.job?.id,
		jobTitle: item.jobTitle || item.role || item.position || item.job?.title || 'Job',
		company: item.company || item.companyName || item.employer?.name || 'Company',
		status: item.status || item.applicationStatus || 'APPLIED',
		appliedDate: item.appliedDate || item.appliedAt || item.createdAt || '--',
		lastUpdate: item.updatedAt || item.lastUpdate || item.modifiedAt || '--',
	}));
};

const normalizeJobsPreview = (source) => {
	const list = Array.isArray(source) ? source : [];
	return list.map((entry, index) => {
		const job = entry?.job || entry;
		return {
			id: job?.id || job?.jobPostId || job?.jobId || `job-${index}`,
			title: job?.title || job?.jobTitle || job?.role || 'Role',
			company: job?.companyName || job?.company || job?.employer?.name || 'Company',
			location: job?.location || job?.jobLocation || job?.city || '',
			matchScore: entry?.matchScore ?? entry?.matchingScore ?? entry?.score ?? null,
		};
	});
};

const normalizeNotifications = (source) => {
	let list = [];
	if (Array.isArray(source)) {
		list = source;
	} else if (Array.isArray(source?.content)) {
		list = source.content;
	}
	return list.map((item, index) => ({
		id: item.id || `notification-${index}`,
		title: item.title || item.subject || 'Notification',
		message: item.message || item.body || '',
		time: item.createdAt || item.time || '',
		read: Boolean(item.read || item.isRead),
	}));
};

const getStatusColor = (status) => {
	const value = String(status || '').toUpperCase();
	const colors = {
		PENDING: 'bg-yellow-100 text-yellow-800',
		UNDER_REVIEW: 'bg-blue-100 text-blue-800',
		SHORTLISTED: 'bg-green-100 text-green-800',
		REJECTED: 'bg-red-100 text-red-800',
		ACCEPTED: 'bg-purple-100 text-purple-800',
		APPLIED: 'bg-gray-100 text-gray-800',
	};
	return colors[value] || 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status) => {
	const value = String(status || '').toUpperCase();
	const icons = {
		PENDING: <Clock className="w-4 h-4" />,
		UNDER_REVIEW: <AlertCircle className="w-4 h-4" />,
		SHORTLISTED: <CheckCircle className="w-4 h-4" />,
		REJECTED: <XCircle className="w-4 h-4" />,
		ACCEPTED: <CheckCircle className="w-4 h-4" />,
		APPLIED: <Clock className="w-4 h-4" />,
	};
	return icons[value] || <Clock className="w-4 h-4" />;
};

const Avatar = ({ url, initials, size = 'md' }) => {
	const sizeClass = size === 'lg' ? 'w-24 h-24' : size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
	return (
		<div className={`candidate-avatar ${sizeClass}`}>
			{url ? <img src={url} alt="Candidate avatar" /> : <span>{initials}</span>}
		</div>
	);
};

Avatar.propTypes = {
	url: PropTypes.string,
	initials: PropTypes.string.isRequired,
	size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

Avatar.defaultProps = {
	url: '',
	size: 'md',
};

const ProfileOverview = ({ summary, profile, initials, pendingAssets }) => {
	const profileImage =
		pendingAssets?.profilePictureUrl ||
		summary.profilePictureUrl ||
		profile?.profilePictureUrl ||
		profile?.profilePicture ||
		profile?.photoUrl ||
		profile?.avatarUrl ||
		'';
	const email = summary.email || profile?.email || '';
	const phoneNumber = summary.phoneNumber || profile?.phoneNumber || profile?.phone || '';
	const linkedinUrl = summary.linkedin || profile?.linkedin || profile?.linkedinUrl || '';
	const githubUrl = summary.github || profile?.github || profile?.githubUrl || '';
	const portfolioUrl = summary.portfolio || profile?.portfolio || profile?.website || '';
	const displayLocation = summary.location || profile?.location || profile?.city || '';
	const headline = summary.headline || profile?.headline || '';
	const bio = summary.bio || profile?.bio || '';
	const pendingResumeName = pendingAssets?.resumeName || '';
	const pendingResumeUrl = pendingAssets?.resumeUrl || '';
	const storedResumeUrl =
		summary.resumeUrl ||
		profile?.resumeUrl ||
		profile?.resumeDownloadUrl ||
		profile?.resumeLink ||
		'';
	const activeResumeUrl = pendingResumeUrl || storedResumeUrl;
	const resumeLabel =
		pendingResumeName ||
		summary.resumeFileName ||
		profile?.resumeFileName ||
		(storedResumeUrl ? 'View Resume' : '');
	const hasPendingResume = Boolean(pendingResumeName);
	const resumeHelperText = (() => {
		if (!activeResumeUrl && !resumeLabel) {
			return 'Upload your resume so recruiters can learn more about you.';
		}
		if (hasPendingResume && !storedResumeUrl) {
			return 'Your new resume will be attached once you save your profile.';
		}
		if (hasPendingResume && storedResumeUrl) {
			return 'New resume selected. Save your profile to replace the current resume.';
		}
		return '';
	})();
	const contactMethods = [
		email && {
			icon: <Mail className="w-4 h-4" />,
			label: email,
			key: 'email',
			href: `mailto:${email}`,
			external: false,
		},
		phoneNumber && {
			icon: <Phone className="w-4 h-4" />,
			label: phoneNumber,
			key: 'phone',
			href: `tel:${phoneNumber}`,
			external: false,
		},
		linkedinUrl && {
			icon: <Linkedin className="w-4 h-4" />,
			label: 'LinkedIn',
			key: 'linkedin',
			href: linkedinUrl,
			external: true,
		},
		githubUrl && {
			icon: <Github className="w-4 h-4" />,
			label: 'GitHub',
			key: 'github',
			href: githubUrl,
			external: true,
		},
		portfolioUrl && {
			icon: <ExternalLink className="w-4 h-4" />,
			label: 'Portfolio',
			key: 'portfolio',
			href: portfolioUrl,
			external: true,
		},
	].filter(Boolean);
	const experience = profile?.experience || summary.experience;
	const education = profile?.education || summary.education;
	const fullName = (`${summary.firstName || ''} ${summary.lastName || ''}`.trim() || profile?.name || '').trim();
	const displayTitle = summary.title || profile?.title || headline || 'Add your role';

	return (
		<section className="profile-overview">
			<div className="profile-overview__hero">
				<Avatar url={profileImage} initials={initials || 'U'} size="lg" />
				<div className="profile-overview__hero-text">
					<h2>{fullName || 'Candidate'}</h2>
					{displayTitle && <p className="profile-overview__title">{displayTitle}</p>}
					{displayLocation && (
						<div className="profile-overview__meta">
							<MapPin className="w-4 h-4" />
							<span>{displayLocation}</span>
						</div>
					)}
				</div>
			</div>

			{headline && <p className="profile-overview__headline">{headline}</p>}
			{bio && <p className="profile-overview__bio">{bio}</p>}

			<div className="profile-overview__panel">
				<div className="profile-overview__panel-header">
					<h3>Resume</h3>
					{activeResumeUrl && (
						<a
							href={activeResumeUrl}
							className="profile-overview__resume"
							target="_blank"
							rel="noreferrer"
							download={hasPendingResume ? pendingResumeName : undefined}
						>
							<Download className="w-4 h-4" />
							<span>{resumeLabel || 'View Resume'}</span>
						</a>
					)}
					{hasPendingResume && !activeResumeUrl && (
						<span className="profile-overview__pending-chip">{pendingResumeName}</span>
					)}
				</div>
				{resumeHelperText && <p className="profile-overview__empty">{resumeHelperText}</p>}
			</div>

			<div className="profile-overview__panel">
				<h3>Contact & Links</h3>
				{contactMethods.length === 0 ? (
					<p className="profile-overview__empty">No contact information added yet.</p>
				) : (
					<ul className="profile-overview__list">
						{contactMethods.map((method) => (
							<li key={method.key}>
								<a
									href={method.href}
									target={method.external ? '_blank' : undefined}
									rel={method.external ? 'noreferrer' : undefined}
								>
									{method.icon}
									<span>{method.label}</span>
								</a>
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="profile-overview__grid">
				<div className="profile-overview__panel">
					<h3>Skills</h3>
					{summary.skills.length === 0 ? (
						<p className="profile-overview__empty">Add your skills to highlight your strengths.</p>
					) : (
						<div className="profile-overview__tags">
							{summary.skills.map((skill) => (
								<span key={skill}>{skill}</span>
							))}
						</div>
					)}
				</div>
				<div className="profile-overview__panel">
					<h3>Experience</h3>
					{experience ? (
						<div className="profile-overview__section">
							<p className="profile-overview__section-title">{experience.role || 'Experience'}</p>
							{experience.company && <p className="profile-overview__section-subtitle">{experience.company}</p>}
							{experience.yearsOfExperience != null && (
								<p className="profile-overview__meta-row">{experience.yearsOfExperience} years</p>
							)}
						</div>
					) : (
						<p className="profile-overview__empty">Update your experience to help recruiters understand your background.</p>
					)}
				</div>
			</div>

			<div className="profile-overview__panel">
				<h3>Education</h3>
				{education ? (
					<div className="profile-overview__section">
						<p className="profile-overview__section-title">{education.degree || 'Education'}</p>
						{education.institution && <p className="profile-overview__section-subtitle">{education.institution}</p>}
						{education.graduationYear && <p className="profile-overview__meta-row">Class of {education.graduationYear}</p>}
					</div>
				) : (
					<p className="profile-overview__empty">Add your education details to complete your profile.</p>
				)}
			</div>
		</section>
	);
};

ProfileOverview.propTypes = {
	summary: PropTypes.shape({
		firstName: PropTypes.string,
		lastName: PropTypes.string,
		title: PropTypes.string,
		headline: PropTypes.string,
		location: PropTypes.string,
		email: PropTypes.string,
		phoneNumber: PropTypes.string,
		skills: PropTypes.arrayOf(PropTypes.string),
		resumeFileName: PropTypes.string,
		resumeUrl: PropTypes.string,
		profilePictureUrl: PropTypes.string,
		linkedin: PropTypes.string,
		github: PropTypes.string,
		portfolio: PropTypes.string,
		experience: PropTypes.object,
		education: PropTypes.object,
		bio: PropTypes.string,
	}).isRequired,
	profile: PropTypes.object,
	initials: PropTypes.string.isRequired,
	pendingAssets: PropTypes.shape({
		resumeName: PropTypes.string,
		resumeUrl: PropTypes.string,
		profilePictureUrl: PropTypes.string,
	}),
};

ProfileOverview.defaultProps = {
	profile: null,
	pendingAssets: null,
};

const DashboardView = ({ applications, jobMatchesPreview, profileCompleteness }) => {
	const topApplications = applications.slice(0, 3);
	const topMatches = jobMatchesPreview.slice(0, 3);
	const completenessValue = Math.min(100, Math.max(0, Number(profileCompleteness) || 0));

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">Profile Views</p>
							<p className="text-2xl font-bold text-gray-900 mt-1">234</p>
						</div>
						<div className="p-3 bg-blue-100 rounded-lg">
							<User className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">Applications</p>
							<p className="text-2xl font-bold text-gray-900 mt-1">{applications.length}</p>
						</div>
						<div className="p-3 bg-green-100 rounded-lg">
							<FileText className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">Job Matches</p>
							<p className="text-2xl font-bold text-gray-900 mt-1">{jobMatchesPreview.length}</p>
						</div>
						<div className="p-3 bg-purple-100 rounded-lg">
							<Briefcase className="w-6 h-6 text-purple-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">Profile Complete</p>
							<p className="text-2xl font-bold text-gray-900 mt-1">{Math.round(completenessValue)}%</p>
						</div>
						<div className="p-3 bg-orange-100 rounded-lg">
							<TrendingUp className="w-6 h-6 text-orange-600" />
						</div>
					</div>
					<div className="mt-4">
						<div className="w-full bg-gray-200 rounded-full h-3">
							<div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all" style={{ width: `${completenessValue}%` }}></div>
						</div>
						<p className="text-xs text-gray-500 mt-3">Complete your profile to increase visibility to employers.</p>
					</div>
				</div>
			</div>

			<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-gray-900">Profile Completeness</h2>
					<span className="text-sm text-gray-600">{Math.round(completenessValue)}%</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-3">
					<div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all" style={{ width: `${completenessValue}%` }}></div>
				</div>
				<p className="text-sm text-gray-600 mt-3">Add more details to your profile to increase your ranking in recruiter searches.</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Applications</h2>
					{topApplications.length === 0 ? (
						<p className="text-sm text-gray-500">You have not submitted any applications yet.</p>
					) : (
						<div className="space-y-3">
							{topApplications.map((application) => (
								<div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
									<div>
										<p className="font-medium text-gray-900">{application.jobTitle}</p>
										<p className="text-sm text-gray-600">{application.company}</p>
									</div>
									<span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(application.status)}`}>
										{getStatusIcon(application.status)}
										{application.status.replace('_', ' ')}
									</span>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">Top Job Matches</h2>
					{topMatches.length === 0 ? (
						<p className="text-sm text-gray-500">We are looking for opportunities that fit your profile.</p>
					) : (
						<div className="space-y-3">
							{topMatches.map((job) => (
								<div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
									<div>
										<p className="font-medium text-gray-900">{job.title}</p>
										<p className="text-sm text-gray-600">{job.company}</p>
										{job.location && <p className="text-xs text-gray-500 mt-1">{job.location}</p>}
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm font-semibold text-green-600">{job.matchScore == null ? '--' : `${job.matchScore}%`}</span>
										<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

DashboardView.propTypes = {
	applications: PropTypes.arrayOf(PropTypes.object).isRequired,
	jobMatchesPreview: PropTypes.arrayOf(PropTypes.object).isRequired,
	profileCompleteness: PropTypes.number.isRequired,
};

const NotificationsView = ({ notifications }) => (
	<div className="space-y-4">
		<h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
		{notifications.length === 0 ? (
			<p className="text-sm text-gray-500">You are all caught up. We will notify you when something new arrives.</p>
		) : (
			notifications.map((notification) => (
				<div
					key={notification.id}
					className={`bg-white p-6 rounded-lg shadow-sm border ${notification.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50'}`}
				>
					<div className="flex items-start gap-4">
						<div className={`p-3 rounded-full ${notification.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
							<Bell className={`w-5 h-5 ${notification.read ? 'text-gray-600' : 'text-blue-600'}`} />
						</div>
						<div className="flex-1">
							<h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
							<p className="text-gray-600 mb-2">{notification.message}</p>
							<p className="text-sm text-gray-500">{notification.time}</p>
						</div>
					</div>
				</div>
			))
		)}
	</div>
);

NotificationsView.propTypes = {
	notifications: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			title: PropTypes.string,
			message: PropTypes.string,
			time: PropTypes.string,
			read: PropTypes.bool,
		})
	).isRequired,
};

const CandidateProfileApp = () => {
	const [activeTab, setActiveTab] = useState('dashboard');
	const [profile, setProfile] = useState(null);
	const [profileSummary, setProfileSummary] = useState(defaultProfileSummary);
	const [applications, setApplications] = useState([]);
	const [jobMatchesPreview, setJobMatchesPreview] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [profileCompleteness, setProfileCompleteness] = useState(0);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [pendingAssets, setPendingAssets] = useState({
		resumeName: '',
		resumeUrl: '',
		profilePictureUrl: '',
	});
	const navigate = useNavigate();
	const previousResumeUrlRef = useRef('');
	const previousPictureUrlRef = useRef('');

	useEffect(() => {
		let cancelled = false;

		const fetchProfile = async () => {
			try {
				const data = await candidateService.getProfile();
				if (cancelled) return;
				setProfile(data);
				setProfileSummary(buildProfileSummary(data));
			} catch (err) {
				console.error('Failed to load profile', err);
			}
		};

		const fetchProfileCompleteness = async () => {
			try {
				const completeness = await candidateService.checkProfileCompleteness();
				if (cancelled) return;
				setProfileCompleteness(Number(completeness?.completeness || 0));
			} catch (err) {
				console.error('Failed to load profile completeness', err);
			}
		};

		const fetchApplications = async () => {
			try {
				const response = await candidateService.getApplications();
				if (cancelled) return;
				setApplications(normalizeApplications(response));
			} catch (err) {
				console.error('Failed to load applications', err);
			}
		};

		const fetchJobs = async () => {
			try {
				const matches = await jobService.searchWithMatching({});
				if (cancelled) return;
				setJobMatchesPreview(normalizeJobsPreview(matches));
			} catch (err) {
				console.error('Failed to load matched jobs, falling back to public list', err);
				try {
					const publicJobs = await jobService.listPublic();
					if (cancelled) return;
					setJobMatchesPreview(normalizeJobsPreview(publicJobs));
				} catch (fallbackError) {
					console.error('Failed to load public jobs', fallbackError);
				}
			}
		};

		const fetchNotifications = async () => {
			try {
				const response = await candidateService.getNotifications();
				if (cancelled) return;
				setNotifications(normalizeNotifications(response));
			} catch (err) {
				console.error('Failed to load notifications', err);
			}
		};

		const loadAll = async () => {
			await Promise.all([
				fetchProfile(),
				fetchProfileCompleteness(),
				fetchApplications(),
				fetchJobs(),
				fetchNotifications(),
			]);
		};

		loadAll();

		const handleApplicationsChanged = async () => {
			try {
				const updated = await candidateService.getApplications();
				if (cancelled) return;
				setApplications(normalizeApplications(updated));
			} catch (err) {
				console.error('Failed to refresh applications after change', err);
			}
		};

		const globalWindow = typeof globalThis === 'object' && globalThis ? globalThis.window : undefined;
		if (globalWindow) {
			globalWindow.addEventListener('applications:changed', handleApplicationsChanged);
		}

		return () => {
			cancelled = true;
			if (globalWindow) {
				globalWindow.removeEventListener('applications:changed', handleApplicationsChanged);
			}
		};
	}, []);

	const refreshProfile = async () => {
		try {
			const data = await candidateService.getProfile();
			setProfile(data);
			setProfileSummary(buildProfileSummary(data));
		} catch (err) {
			console.error('Failed to refresh profile', err);
		}
		try {
			const completeness = await candidateService.checkProfileCompleteness();
			setProfileCompleteness(Number(completeness?.completeness || 0));
		} catch (err) {
			console.error('Failed to refresh completeness', err);
		}
		setPendingAssets({ resumeName: '', resumeUrl: '', profilePictureUrl: '' });
		if (previousResumeUrlRef.current) {
			URL.revokeObjectURL(previousResumeUrlRef.current);
			previousResumeUrlRef.current = '';
		}
		if (previousPictureUrlRef.current) {
			URL.revokeObjectURL(previousPictureUrlRef.current);
			previousPictureUrlRef.current = '';
		}
	};

	useEffect(
		() => () => {
			if (previousResumeUrlRef.current) {
				URL.revokeObjectURL(previousResumeUrlRef.current);
			}
			if (previousPictureUrlRef.current) {
				URL.revokeObjectURL(previousPictureUrlRef.current);
			}
		},
		[]
	);

	const handleLocalResumeSelected = (payload) => {
		if (!payload) {
			if (previousResumeUrlRef.current) {
				URL.revokeObjectURL(previousResumeUrlRef.current);
				previousResumeUrlRef.current = '';
			}
			setPendingAssets((prev) => ({ ...prev, resumeName: '', resumeUrl: '' }));
			return;
		}

		if (previousResumeUrlRef.current) {
			URL.revokeObjectURL(previousResumeUrlRef.current);
		}

		previousResumeUrlRef.current = payload.previewUrl || '';
		setPendingAssets((prev) => ({
			...prev,
			resumeName: payload.fileName || '',
			resumeUrl: payload.previewUrl || '',
		}));
	};

	const handleLocalProfilePictureSelected = (payload) => {
		if (!payload) {
			if (previousPictureUrlRef.current) {
				URL.revokeObjectURL(previousPictureUrlRef.current);
				previousPictureUrlRef.current = '';
			}
			setPendingAssets((prev) => ({ ...prev, profilePictureUrl: '' }));
			return;
		}

		if (previousPictureUrlRef.current) {
			URL.revokeObjectURL(previousPictureUrlRef.current);
		}

		previousPictureUrlRef.current = payload.previewUrl || '';
		setPendingAssets((prev) => ({
			...prev,
			profilePictureUrl: payload.previewUrl || '',
		}));
	};

	const handleLogout = async () => {
		if (isLoggingOut) return;
		setIsLoggingOut(true);
		try {
			await authService.logout();
		} catch (err) {
			console.error('Failed to logout candidate', err);
		} finally {
			setIsLoggingOut(false);
			navigate('/login', { replace: true });
		}
	};

	const firstInitial = (profileSummary.firstName || 'U').charAt(0).toUpperCase();
	const lastInitial = (profileSummary.lastName || '').charAt(0).toUpperCase();
	const initials = `${firstInitial}${lastInitial}`.trim() || 'U';
	const avatarUrl =
		pendingAssets.profilePictureUrl ||
		profileSummary.profilePictureUrl ||
		profile?.profilePictureUrl ||
		profile?.profilePicture ||
		profile?.photoUrl ||
		profile?.avatarUrl ||
		'';

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
								<Briefcase className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-xl font-bold text-gray-900">Skill4Hire</h1>
								<p className="text-xs text-gray-600">Candidate Portal</p>
							</div>
						</div>

						<div className="flex items-center gap-4">
							<button type="button" className="relative p-2 hover:bg-gray-100 rounded-lg transition" aria-label="Notifications">
								<Bell className="w-5 h-5 text-gray-600" />
								{notifications.some((notification) => !notification.read) && (
									<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
								)}
							</button>
							<button
								type="button"
								className="btn btn-secondary btn-logout"
								onClick={handleLogout}
								disabled={isLoggingOut}
							>
								<LogOut className="w-4 h-4" />
								<span>{isLoggingOut ? 'Signing out…' : 'Logout'}</span>
							</button>
							<div className="candidate-header-card">
								<Avatar url={avatarUrl} initials={initials} size="sm" />
								<div>
									<p className="candidate-header-name">{`${profileSummary.firstName} ${profileSummary.lastName}`.trim() || 'Candidate'}</p>
									<p className="candidate-header-role">{profileSummary.title || 'Add your role'}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-6 py-8">
				<div className="flex gap-6">
					<aside className="w-64 flex-shrink-0">
						<nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sticky top-24">
							<button
								onClick={() => setActiveTab('dashboard')}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
									activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
								}`}
							>
								<TrendingUp className="w-5 h-5" />
								Dashboard
							</button>
							<button
								onClick={() => setActiveTab('profile')}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
									activeTab === 'profile' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
								}`}
							>
								<User className="w-5 h-5" />
								Profile
							</button>
							<button
								onClick={() => setActiveTab('jobs')}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
									activeTab === 'jobs' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
								}`}
							>
								<Search className="w-5 h-5" />
								Search Jobs
							</button>
							<button
								onClick={() => setActiveTab('applications')}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
									activeTab === 'applications' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
								}`}
							>
								<FileText className="w-5 h-5" />
								My Applications
								{applications.some((application) => application.status === 'SHORTLISTED') && <span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span>}
							</button>
							<button
								onClick={() => setActiveTab('notifications')}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
									activeTab === 'notifications' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
								}`}
							>
								<Bell className="w-5 h-5" />
								Notifications
								{notifications.some((notification) => !notification.read) && (
									<span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
										{notifications.filter((notification) => !notification.read).length}
									</span>
								)}
							</button>
							<div className="border-t border-gray-200 my-2"></div>
							<button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition">
								<Settings className="w-5 h-5" />
								Settings
							</button>
						</nav>
					</aside>

					<main className="flex-1 space-y-6">
						{activeTab === 'dashboard' && (
							<DashboardView
								applications={applications}
								jobMatchesPreview={jobMatchesPreview}
								profileCompleteness={profileCompleteness}
							/>
						)}

						{activeTab === 'profile' && (
							<div className="profile-tab-layout">
								<ProfileOverview summary={profileSummary} profile={profile} initials={initials} pendingAssets={pendingAssets} />
								<div className="profile-form-wrapper">
									<ProfileSetupForm
										candidate={buildFormCandidate(profile, profileSummary)}
										onUpdate={refreshProfile}
										onResumeSelected={handleLocalResumeSelected}
										onProfilePictureSelected={handleLocalProfilePictureSelected}
									/>
								</div>
							</div>
						)}

						{activeTab === 'jobs' && (
							<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
								<JobMatches />
							</div>
						)}

						{activeTab === 'applications' && (
							<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
								<Applications />
							</div>
						)}

						{activeTab === 'notifications' && <NotificationsView notifications={notifications} />}
					</main>
				</div>
			</div>
		</div>
	);
};

export default CandidateProfileApp;
