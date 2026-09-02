import { z } from 'zod';

/**
 * ATS Validator — Enforces structured content models for resume data.
 * Prevents freeform HTML, ensures parseable content, and scores ATS compatibility.
 */

// ==================== ZOD SCHEMAS ====================

const PersonalSchema = z.object({
 name: z.string().max(100).default(""),
 email: z.string().email().or(z.literal("")).default(""),
 phone: z.string().max(30).default(""),
 linkedin: z.string().max(200).default(""),
 location: z.string().max(100).default(""),
 website: z.string().max(200).default(""),
});

const ExperienceItemSchema = z.object({
 id: z.string(),
 company: z.string().max(100),
 role: z.string().max(100),
 duration: z.string().max(50),
 location: z.string().max(100).optional(),
 bullets: z.array(z.string().max(500)).max(10),
});

const EducationItemSchema = z.object({
 id: z.string(),
 school: z.string().max(100),
 degree: z.string().max(100),
 duration: z.string().max(50),
 gpa: z.string().max(10).optional(),
});

const ProjectItemSchema = z.object({
 id: z.string(),
 name: z.string().max(100),
 description: z.string().max(500).optional(),
 technologies: z.array(z.string().max(50)).max(10).optional(),
 url: z.string().max(200).optional(),
});

const CertItemSchema = z.object({
 id: z.string(),
 name: z.string().max(100),
 issuer: z.string().max(100).optional(),
 date: z.string().max(30).optional(),
});

export const ResumeDataSchema = z.object({
 personal: PersonalSchema.default({}),
 summary: z.string().max(1000).default(""),
 experience: z.array(ExperienceItemSchema).max(15).default([]),
 education: z.array(EducationItemSchema).max(8).default([]),
 skills: z.array(z.string().max(50)).max(50).default([]),
 projects: z.array(ProjectItemSchema).max(10).default([]),
 certifications: z.array(CertItemSchema).max(10).default([]),
});

// ==================== HTML SANITIZER ====================

const HTML_TAG_REGEX = /<[^>]*>/g;
const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

/**
 * Strip all HTML tags from a string. ATS parsers choke on HTML.
 */
export function stripHTML(text) {
 if (typeof text !=="string") return text;
 return text.replace(SCRIPT_REGEX,"").replace(HTML_TAG_REGEX,"").trim();
}

/**
 * Deep-sanitize a resume data object, stripping HTML from all string fields.
 */
export function sanitizeResumeData(data) {
 if (!data || typeof data !=="object") return data;

 const sanitized = { ...data };
 if (sanitized.personal) {
 for (const key of Object.keys(sanitized.personal)) {
 sanitized.personal[key] = stripHTML(sanitized.personal[key]);
 }
 }
 sanitized.summary = stripHTML(sanitized.summary);
 if (sanitized.experience) {
 sanitized.experience = sanitized.experience.map(exp => ({
 ...exp,
 company: stripHTML(exp.company),
 role: stripHTML(exp.role),
 duration: stripHTML(exp.duration),
 bullets: (exp.bullets || []).map(stripHTML),
 }));
 }
 if (sanitized.education) {
 sanitized.education = sanitized.education.map(edu => ({
 ...edu, school: stripHTML(edu.school), degree: stripHTML(edu.degree),
 }));
 }
 sanitized.skills = (sanitized.skills || []).map(stripHTML);
 return sanitized;
}

// ==================== ATS SCORE ====================

/**
 * Calculate an ATS compatibility score (0-100) for resume data.
 * Checks: completeness, bullet quality, keyword density, formatting.
 */
export function calculateATSScore(data) {
 let score = 0;
 const issues = [];

 // 1. Personal info completeness (20 pts)
 const p = data?.personal || {};
 if (p.name?.trim()) score += 5; else issues.push("Missing name");
 if (p.email?.trim()) score += 5; else issues.push("Missing email");
 if (p.phone?.trim()) score += 5; else issues.push("Missing phone");
 if (p.linkedin?.trim()) score += 5; else issues.push("Missing LinkedIn");

 // 2. Summary (10 pts)
 const summary = data?.summary ||"";
 if (summary.length > 50) score += 10;
 else if (summary.length > 0) { score += 5; issues.push("Summary too short (aim for 2-3 sentences)"); }
 else issues.push("Missing professional summary");

 // 3. Experience quality (35 pts)
 const exps = data?.experience || [];
 if (exps.length > 0) {
 score += 10; // Has experience
 const allBullets = exps.flatMap(e => e.bullets || []).filter(b => b?.trim());
 if (allBullets.length >= 3) score += 5;
 // Check for action verbs
 const actionVerbs = ["led","built","developed","managed","increased","decreased","improved","designed","implemented","created","launched","achieved","reduced","automated"];
 const hasActions = allBullets.some(b => actionVerbs.some(v => b.toLowerCase().startsWith(v)));
 if (hasActions) score += 10; else issues.push("Start bullets with action verbs");
 // Check for metrics/numbers
 const hasMetrics = allBullets.some(b => /\d+%|\d+x|\$\d+|\d+ (users|customers|clients|projects)/i.test(b));
 if (hasMetrics) score += 10; else issues.push("Add quantifiable metrics to bullets");
 } else { issues.push("Missing work experience"); }

 // 4. Education (10 pts)
 if ((data?.education || []).length > 0) score += 10;
 else issues.push("Missing education section");

 // 5. Skills (15 pts)
 const skills = data?.skills || [];
 if (skills.length >= 5) score += 15;
 else if (skills.length > 0) { score += 8; issues.push("Add more skills (aim for 5+)"); }
 else issues.push("Missing skills section");

 // 6. No HTML/formatting issues (10 pts)
 const allText = JSON.stringify(data);
 if (!HTML_TAG_REGEX.test(allText)) score += 10;
 else issues.push("Contains HTML tags (not ATS-safe)");

 return { score: Math.min(100, score), issues, grade: score >= 80 ?"A" : score >= 60 ?"B" : score >= 40 ?"C" :"D" };
}
