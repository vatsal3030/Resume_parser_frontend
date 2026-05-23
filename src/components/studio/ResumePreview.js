"use client";

export function ResumePreview({ data = {}, sectionOrder = [], styleConfig = {} }) {
  const font = styleConfig.fontFamily || "Georgia";
  const fontSize = styleConfig.fontSize || 11;
  const accent = styleConfig.accentColor || "#2563EB";
  const primary = styleConfig.primaryColor || "#1A1A1A";

  const renderSection = (key) => {
    switch (key) {
      case "personal": return <PreviewPersonal data={data.personal} accent={accent} />;
      case "summary": return <PreviewSummary text={data.summary} />;
      case "experience": return <PreviewExperience items={data.experience} />;
      case "education": return <PreviewEducation items={data.education} />;
      case "skills": return <PreviewSkills items={data.skills} />;
      case "projects": return <PreviewProjects items={data.projects} />;
      case "certifications": return <PreviewCerts items={data.certifications} />;
      default: return null;
    }
  };

  return (
    <div id="resume-preview" style={{ fontFamily: font, fontSize: `${fontSize}pt`, color: primary }}
      className="w-full max-w-[210mm] bg-white shadow-2xl p-[20mm] origin-top text-gray-800 border border-gray-300 min-h-[297mm]">
      {sectionOrder.map(key => <div key={key}>{renderSection(key)}</div>)}
    </div>
  );
}

function PreviewPersonal({ data, accent }) {
  if (!data) return null;
  const renderLink = (url) => {
    if (!url) return null;
    const href = url.startsWith('http') ? url : `https://${url}`;
    return <a href={href} target="_blank" rel="noreferrer" className="hover:underline">{url.replace(/^https?:\/\//, '')}</a>;
  };
  return (
    <div className="text-center mb-5 border-b-2 pb-3" style={{ borderColor: accent }}>
      <h1 className="text-2xl font-bold uppercase tracking-widest">{data.name || "Your Name"}</h1>
      <div className="text-[10pt] mt-1 flex justify-center gap-3 text-gray-600 flex-wrap">
        {data.email && <span><a href={`mailto:${data.email}`} className="hover:underline">{data.email}</a></span>}
        {data.phone && <><span>•</span><span>{data.phone}</span></>}
        {data.linkedin && <><span>•</span><span>{renderLink(data.linkedin)}</span></>}
        {data.website && <><span>•</span><span>{renderLink(data.website)}</span></>}
        {data.location && <><span>•</span><span>{data.location}</span></>}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-[12pt] font-bold uppercase border-b border-gray-400 mb-2 mt-4">{children}</h2>;
}

function PreviewSummary({ text }) {
  if (!text) return null;
  return <div className="mb-4"><SectionTitle>Professional Summary</SectionTitle><p className="text-[10pt] leading-relaxed">{text}</p></div>;
}

function PreviewExperience({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="mb-4">
      <SectionTitle>Experience</SectionTitle>
      {items.map((exp, i) => (
        <div key={i} className="mb-3">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold">{exp.role} <span className="font-normal italic">at {exp.company}</span></h3>
            <span className="text-[9pt] text-gray-600">{exp.duration}</span>
          </div>
          <ul className="list-disc pl-5 text-[10pt] space-y-0.5 mt-1">
            {(exp.bullets || []).filter(b => b?.trim()).map((b, bi) => <li key={bi}>{b}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PreviewEducation({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="mb-4">
      <SectionTitle>Education</SectionTitle>
      {items.map((edu, i) => (
        <div key={i} className="flex justify-between items-baseline mb-1">
          <span className="font-bold">{edu.degree} — {edu.school} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}</span>
          <span className="text-[9pt] text-gray-600">{edu.duration}</span>
        </div>
      ))}
    </div>
  );
}

function PreviewSkills({ items = [] }) {
  if (!items.length) return null;
  return <div className="mb-4"><SectionTitle>Skills</SectionTitle><p className="text-[10pt]">{items.join(" • ")}</p></div>;
}

function PreviewProjects({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="mb-4">
      <SectionTitle>Projects</SectionTitle>
      {items.map((p, i) => (
        <div key={i} className="mb-2">
          <span className="font-bold">{p.name}</span>
          {p.description && <p className="text-[10pt]">{p.description}</p>}
        </div>
      ))}
    </div>
  );
}

function PreviewCerts({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="mb-4">
      <SectionTitle>Certifications</SectionTitle>
      {items.map((c, i) => (
        <div key={i} className="text-[10pt]"><span className="font-bold">{c.name}</span> — {c.issuer} {c.date ? `(${c.date})` : ""}</div>
      ))}
    </div>
  );
}
