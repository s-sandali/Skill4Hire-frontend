import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
} from 'react-icons/fi';
import Applications from './components/Applications';
import JobMatches from './components/JobMatches';
import ProfileSetupForm from './components/ProfileSetupForm';
import { candidateService } from '../services/candidateService';
import { jobService } from '../services/jobService';
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
		location: profile.location || '',
		title: profile.title || profile.headline || '',
		headline: profile.headline || '',
		skills,
		resumeFileName: profile.resumeFileName || profile.resume || '',
	};
};

const buildFormCandidate = (profile, summary) => ({
	name: (profile?.name || `${summary.firstName} ${summary.lastName}`).trim(),
	email: profile?.email || summary.email,
	phoneNumber: profile?.phoneNumber || profile?.phone || summary.phoneNumber,
	location: profile?.location || summary.location,
	title: profile?.title || profile?.headline || summary.title,
	headline: profile?.headline || summary.headline,
	experience: profile?.experience || {
		isExperienced: false,
		role: '',
		company: '',
		yearsOfExperience: 0,
	},
	education: profile?.education || {
		degree: '',
		institution: '',
		graduationYear: null,
	},
	skills: Array.isArray(profile?.skills) ? profile.skills : summary.skills,
	linkedin: profile?.linkedin || '',
	github: profile?.github || '',
	portfolio: profile?.portfolio || '',
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
							<div
								className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
								style={{ width: `${completenessValue}%` }}
							></div>
						</div>
						<p className="text-xs text-gray-500 mt-3">
							Complete your profile to increase visibility to employers.
						</p>
					</div>
				</div>
			</div>

			<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-gray-900">Profile Completeness</h2>
					<span className="text-sm text-gray-600">{Math.round(completenessValue)}%</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-3">
					<div
						className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
						style={{ width: `${completenessValue}%` }}
					></div>
				</div>
				<p className="text-sm text-gray-600 mt-3">
					Add more details to your profile to increase your ranking in recruiter searches.
				</p>
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

DashboardView.propTypes = {
	applications: PropTypes.arrayOf(PropTypes.object).isRequired,
	jobMatchesPreview: PropTypes.arrayOf(PropTypes.object).isRequired,
	profileCompleteness: PropTypes.number.isRequired,
};

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
	};

	const firstInitial = (profileSummary.firstName || 'U').charAt(0).toUpperCase();
	const lastInitial = (profileSummary.lastName || '').charAt(0).toUpperCase();
	const initials = `${firstInitial}${lastInitial}`.trim() || 'U';

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
							<button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
								<Bell className="w-5 h-5 text-gray-600" />
								{notifications.some((notification) => !notification.read) && (
									<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
								)}
							</button>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
									{initials}
								</div>
								<div className="hidden md:block">
									<p className="text-sm font-medium text-gray-900">{`${profileSummary.firstName} ${profileSummary.lastName}`.trim() || 'Candidate'}</p>
									<p className="text-xs text-gray-600">{profileSummary.title}</p>
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
								{applications.some((application) => application.status === 'SHORTLISTED') && (
									<span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span>
								)}
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
							<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
								<ProfileSetupForm
									candidate={buildFormCandidate(profile, profileSummary)}
									onUpdate={refreshProfile}
								/>
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
