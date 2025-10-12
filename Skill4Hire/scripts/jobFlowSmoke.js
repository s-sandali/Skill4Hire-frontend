#!/usr/bin/env node
/* eslint-env node */
import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL;
const COMPANY_PASSWORD = process.env.COMPANY_PASSWORD;
const CANDIDATE_EMAIL = process.env.CANDIDATE_EMAIL;
const CANDIDATE_PASSWORD = process.env.CANDIDATE_PASSWORD;
const KEEP_JOB = process.env.KEEP_JOB === 'true';

function assertEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createAuthenticatedClient() {
  const jar = new CookieJar();
  const client = wrapper(
    axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      jar,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
  );
  return client;
}

async function login(client, urlPath, credentials, actorLabel) {
  const endpoint = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  const { data } = await client.post(endpoint, credentials);
  console.log(`✅ Logged in as ${actorLabel}`);
  if (data) {
    console.log(`ℹ️  ${actorLabel} login payload:`, data);
    if (data.success === false || data.token === null) {
      throw new Error(`Login for ${actorLabel} did not succeed: ${data.message ?? 'unknown error'}`);
    }
  }
  await logCookies(client, actorLabel);
  await ensureXsrfToken(client);
  return data;
}

async function ensureXsrfToken(client) {
  const jar = client.defaults.jar;
  if (!jar) return;

  let token = await getXsrfFromJar(jar);
  if (!token) {
    try {
      await client.get('/csrf');
    } catch (error) {
      console.warn('⚠️  Unable to fetch csrf endpoint:', error?.response?.status ?? error.message);
    }
    token = await getXsrfFromJar(jar);
  }

  if (!token) {
    try {
      await client.get('/api/jobposts/my-jobs', { params: { size: 1 } });
    } catch (error) {
      console.warn('⚠️  Probe request failed while trying to obtain XSRF token:', error?.response?.status ?? error.message);
    }
    token = await getXsrfFromJar(jar);
  }

  if (token) {
    client.defaults.headers.common['X-XSRF-TOKEN'] = token;
  } else {
    console.warn('⚠️  Proceeding without XSRF token; subsequent POST/DELETE may fail.');
  }
}

async function getXsrfFromJar(jar) {
  const cookies = await jar.getCookies(`${API_BASE_URL}/`);
  return cookies.find((cookie) => cookie.key === 'XSRF-TOKEN')?.value ?? null;
}

async function logCookies(client, label) {
  const jar = client.defaults.jar;
  if (!jar) {
    console.log(`(no cookie jar available for ${label})`);
    return;
  }
  const cookies = await jar.getCookies(`${API_BASE_URL}/`);
  const printable = cookies.map((cookie) => `${cookie.key}=${cookie.value}`);
  console.log(`🍪 Cookies after ${label} login:`, printable.join('; ') || '(none)');
}

function buildJobPayload(uniqueTag) {
  const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return {
    title: `Automation QA ${uniqueTag}`,
    description: 'Automated smoke-test posting created by jobFlowSmoke.js',
    type: 'FULL_TIME',
    location: 'Remote',
    salary: 90000,
    experience: 3,
    deadline,
    skills: ['Automation', 'Testing', 'JavaScript']
  };
}

async function createJob(client, payload) {
  const { data } = await client.post('/api/jobposts', payload);
  const jobId = data?.id ?? data?._id ?? data?.jobPostId;
  if (!jobId) {
    throw new Error('Create job response did not include an id/jobPostId');
  }
  console.log(`🆕 Created job ${jobId} (${payload.title})`);
  return { jobId, job: data };
}

async function searchForJob(client, keyword) {
  try {
    const { data } = await client.get('/api/jobposts/search/with-matching', {
      params: { keyword }
    });
    console.log('🔍 /search/with-matching returned', summarizeJobs(data));
    return data;
  } catch (primaryError) {
    console.warn('⚠️  Matching search failed, falling back to public search:', primaryError.message);
    const { data } = await client.get('/api/jobposts/search', {
      params: { keyword }
    });
    console.log('🔍 /search fallback returned', summarizeJobs(data));
    return data;
  }
}

function summarizeJobs(payload) {
  const jobs = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.content)
      ? payload.content
      : Array.isArray(payload?.jobs)
        ? payload.jobs
        : [];
  const titles = jobs
    .slice(0, 5)
  .map((job) => job.title || job.jobTitle || job.role || job.id || job._id || 'Untitled');
  return {
    count: jobs.length,
    sample: titles
  };
}

async function deleteJob(client, jobId) {
  await client.delete(`/api/jobposts/${jobId}`);
  console.log(`🗑️  Deleted job ${jobId}`);
}

async function main() {
  try {
    assertEnv('COMPANY_EMAIL', COMPANY_EMAIL);
    assertEnv('COMPANY_PASSWORD', COMPANY_PASSWORD);
    assertEnv('CANDIDATE_EMAIL', CANDIDATE_EMAIL);
    assertEnv('CANDIDATE_PASSWORD', CANDIDATE_PASSWORD);

    console.log(`Base URL: ${API_BASE_URL}`);
    const uniqueTag = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

    // Company session
    const companyClient = createAuthenticatedClient();
    await login(
      companyClient,
      '/api/companies/auth/login',
      { email: COMPANY_EMAIL, password: COMPANY_PASSWORD },
      'company'
    );

    const { jobId, job } = await createJob(companyClient, buildJobPayload(uniqueTag));

    // Candidate session
    const candidateClient = createAuthenticatedClient();
    await login(
      candidateClient,
      '/api/candidates/auth/login',
      { email: CANDIDATE_EMAIL, password: CANDIDATE_PASSWORD },
      'candidate'
    );

    await searchForJob(candidateClient, job.title);

    if (!KEEP_JOB) {
      await deleteJob(companyClient, jobId);
    } else {
      console.log(`ℹ️  KEEP_JOB=true, job ${jobId} left in system.`);
    }

    console.log('✅ Smoke test completed');
  } catch (error) {
    console.error('❌ Smoke test failed:', error?.response?.data ?? error);
    process.exitCode = 1;
  }
}

await main();
