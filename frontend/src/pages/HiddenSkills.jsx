
import { useEffect, useMemo, useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FolderKanban,
  Layers3,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  analyzeResume,
  getResumeAnalyses,
} from "../services/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Read saved analysis safely
function getResult(record) {
  const data = record?.analysis_result;

  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  return data || {};
}

function getSkillName(skill) {
  if (typeof skill === "string") return skill;

  return (
    skill?.skill ||
    skill?.name ||
    skill?.skill_name ||
    "Unnamed Skill"
  );
}

function getEvidence(skill) {
  if (typeof skill === "string") return "";

  const evidence = skill?.evidence || "";

  return typeof evidence === "string"
    ? evidence
    : JSON.stringify(evidence);
}

function getReason(skill) {
  if (typeof skill === "string") return "";

  return (
    skill?.reason ||
    skill?.explanation ||
    skill?.inference_reason ||
    ""
  );
}

function getProjectName(project, index) {
  return (
    project.project_name ||
    project.project_title ||
    project.name ||
    project.title ||
    `Project ${index + 1}`
  );
}

function getProjectDescription(project) {
  return (
    project.description ||
    project.project_description ||
    project.summary ||
    project.project_summary ||
    "Project description is not available in the extracted analysis."
  );
}

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Individual skill section
function SkillSection({ title, skills = [], hidden = false }) {
  const items = Array.isArray(skills) ? skills : [];

  return (
    <section className="skill-section min-w-0 space-y-5">

      <div className="skill-section-heading flex w-full min-w-0 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {hidden ? (
            <Lightbulb className="h-6 w-6 text-orange-500" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-neutral-300" />
          )}

          <h4 className="text-lg font-semibold text-white">
            {title}
          </h4>
        </div>

        <span className="shrink-0 rounded-full bg-neutral-800 px-3 py-1.5 text-sm font-semibold text-neutral-300">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
          <p className="text-sm text-neutral-500">
            No skills identified for this category.
          </p>
        </div>
      ) : (
        <div className="skill-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((skill, index) => (
            <div
              key={`${getSkillName(skill)}-${index}`}
              className={`skill-card min-w-0 rounded-xl border p-5 transition ${
                hidden
                  ? "border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50"
                  : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
              }`}
            >
              <span
                className={`inline-flex max-w-full whitespace-normal break-words rounded-lg px-3 py-2 text-sm font-semibold leading-6 ${
                  hidden
                    ? "bg-orange-500/15 text-orange-400"
                    : "bg-neutral-800 text-white"
                }`}
              >
                {getSkillName(skill)}
              </span>

              {getEvidence(skill) && (
                <p className="mt-4 min-w-0 whitespace-normal break-words text-sm leading-7 text-neutral-400">
                  <span className="font-semibold text-neutral-200">
                    Evidence:{" "}
                  </span>
                  {getEvidence(skill)}
                </p>
              )}

              {getReason(skill) && (
                <p className="mt-3 min-w-0 whitespace-normal break-words text-sm leading-7 text-neutral-400">
                  <span className="font-semibold text-neutral-200">
                    Explanation:{" "}
                  </span>
                  {getReason(skill)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Overview statistics card
function StatCard({ icon: Icon, value, label, description }) {
  return (
    <div className="flex min-h-52 min-w-0 flex-col rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-7 transition duration-300 hover:border-orange-500/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/10">
        <Icon className="h-7 w-7 text-orange-500" />
      </div>

      <p className="mt-7 text-4xl font-bold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-3 text-base font-semibold text-neutral-300">
        {label}
      </p>

      <p className="mt-2 text-sm text-neutral-500">
        {description}
      </p>
    </div>
  );
}

export default function HiddenSkills() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [history, setHistory] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load only the authenticated user's saved analyses
  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      setIsLoadingHistory(true);

      try {
        const response = await getResumeAnalyses();

        if (active) {
          setHistory(
            Array.isArray(response.analyses)
              ? response.analyses
              : []
          );
        }
      } catch (err) {
        console.error("History loading error:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load your previous analyses."
          );
        }
      } finally {
        if (active) {
          setIsLoadingHistory(false);
        }
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  // Convert saved analyses into project records
  const projectRecords = useMemo(() => {
    return history.flatMap((record) => {
      const result = getResult(record);

      const projects = Array.isArray(result.projects)
        ? result.projects
        : [];

      return projects.map((project, index) => ({
        ...project,
        recordId: record.id,
        filename: record.filename,
        createdAt: record.created_at,
        projectId: `${record.id}-${index}`,
        displayName: getProjectName(project, index),
      }));
    });
  }, [history]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const explicit = new Set();
    const hidden = new Set();

    projectRecords.forEach((project) => {
      (project.explicit_skills || []).forEach((skill) => {
        explicit.add(getSkillName(skill).toLowerCase());
      });

      (project.potential_hidden_skills || []).forEach((skill) => {
        hidden.add(getSkillName(skill).toLowerCase());
      });
    });

    return {
      projects: projectRecords.length,
      skills: new Set([...explicit, ...hidden]).size,
      hidden: hidden.size,
    };
  }, [projectRecords]);

  const totalExplicit = projectRecords.reduce(
    (sum, project) =>
      sum + (project.explicit_skills?.length || 0),
    0
  );

  const totalHidden = projectRecords.reduce(
    (sum, project) =>
      sum + (project.potential_hidden_skills?.length || 0),
    0
  );

  // File validation
  const validateFile = (file) => {
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Resume size must not exceed 5 MB.");
      return;
    }

    setSelectedFile(file);
    setError("");
    setSuccessMessage("");
  };

  const handleFileChange = (event) => {
    validateFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    validateFile(event.dataTransfer.files?.[0]);
  };

  // Analyze and save resume
  const handleAnalyze = async () => {
    if (!selectedFile || isAnalyzing) return;

    setIsAnalyzing(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await analyzeResume(selectedFile);

      if (!response?.success || !response?.results) {
        throw new Error(
          response?.message || "Resume analysis failed."
        );
      }

      const newRecord = {
        ...response.analysis,
        analysis_result: response.results,
      };

      setHistory((previous) => [newRecord, ...previous]);
      setSelectedFile(null);

      setSuccessMessage(
        "Resume analyzed and saved successfully."
      );

      if (
        Array.isArray(response.results.projects) &&
        response.results.projects.length > 0
      ) {
        setExpandedProject(`${response.analysis.id}-0`);
      }
    } catch (err) {
      console.error("Analysis error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to analyze the resume."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="hidden-skills-page">

      {/* PAGE HEADER */}
      <header className="hidden-skills-header">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-bold tracking-wider text-orange-400">
          <Sparkles size={16} />
          AI-POWERED ANALYSIS
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Hidden Skill{" "}
          <span className="text-orange-500">
            Discovery
          </span>
        </h1>

        <p className="max-w-3xl text-base leading-8 text-neutral-400">
          Discover the technical and practical skills demonstrated
          through your projects. Upload your resume and explore
          your project-wise analysis.
        </p>
      </header>

      {/* RESUME UPLOAD */}
      <section className="hidden-skills-upload-panel rounded-2xl border border-neutral-800 bg-neutral-900">
        <div className="hidden-skills-upload-heading">
          <h2 className="text-2xl font-bold text-white">
            Upload Resume
          </h2>

          <p className="mt-2 text-sm text-neutral-400">
            Supported formats: PDF and DOCX · Maximum file size: 5 MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleFileChange}
        />

        {!selectedFile ? (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload resume"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`hidden-skills-dropzone flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-16 text-center transition duration-300 ${
              isDragging
                ? "border-orange-500 bg-orange-500/10"
                : "border-neutral-700 bg-neutral-950 hover:border-orange-500/70 hover:bg-neutral-900"
            }`}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500/10">
              <UploadCloud className="h-10 w-10 text-orange-500" />
            </div>

            <p className="mt-6 text-lg font-semibold text-white">
              Drop your resume here
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              Or click anywhere in this area to browse
            </p>
          </div>
        ) : (
          <div className="hidden-skills-selected-file flex flex-wrap items-center justify-between gap-5 rounded-xl border border-neutral-700 bg-neutral-950 p-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                <FileText className="h-7 w-7 text-orange-500" />
              </div>

              <div className="min-w-0">
                <p className="break-all text-base font-semibold text-white">
                  {selectedFile.name}
                </p>

                <p className="mt-2 text-sm text-neutral-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              disabled={isAnalyzing}
              aria-label="Remove resume"
              className="rounded-lg p-3 text-neutral-400 transition hover:bg-neutral-800 hover:text-orange-500"
            >
              <X size={21} />
            </button>
          </div>
        )}

        {selectedFile && (
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="hidden-skills-analyze-button mt-7 inline-flex items-center gap-3 rounded-xl bg-orange-500 px-8 py-4 text-sm font-bold text-black transition hover:bg-orange-400 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <Sparkles size={20} className="shrink-0" />
                <span className="min-w-0 whitespace-normal break-words">Discover Hidden Skills</span>
              </>
            )}
          </button>
        )}

        {isAnalyzing && (
          <p className="mt-5 text-sm text-neutral-400">
            Extracting projects and analyzing skill evidence...
          </p>
        )}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 p-5 text-sm text-orange-300">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            {successMessage}
          </div>
        )}
      </section>

      {/* DISCOVERY OVERVIEW */}
      <section className="hidden-skills-content-section space-y-7">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Discovery Overview
          </h2>

          <p className="mt-3 text-base text-neutral-400">
            Your saved project analysis at a glance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <StatCard
            icon={FolderKanban}
            value={statistics.projects}
            label="Projects Analyzed"
            description="Projects identified in your resumes"
          />

          <StatCard
            icon={Layers3}
            value={statistics.skills}
            label="Unique Skills Discovered"
            description="Consolidated skills across projects"
          />

          <StatCard
            icon={Lightbulb}
            value={statistics.hidden}
            label="Potential Hidden Skills"
            description="Skills inferred from project evidence"
          />
        </div>

        {!isLoadingHistory && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-6 py-5">
            <p className="text-sm text-neutral-400">
              <span className="font-bold text-white">
                {totalExplicit}
              </span>{" "}
              explicit skill mentions
              <span className="mx-3 text-neutral-700">|</span>
              <span className="font-bold text-orange-400">
                {totalHidden}
              </span>{" "}
              potential hidden skill mentions
            </p>
          </div>
        )}
      </section>

      {/* PREVIOUSLY ANALYZED PROJECTS */}
      <section className="hidden-skills-content-section space-y-7">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Previously Analyzed Projects
          </h2>

          <p className="mt-3 text-base text-neutral-400">
            Select a project to explore its description and discovered skills.
          </p>
        </div>

        {isLoadingHistory ? (
          <div className="flex items-center justify-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-14 text-sm text-neutral-400">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            Loading your saved projects...
          </div>
        ) : projectRecords.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-8 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500/10">
              <FolderKanban className="h-10 w-10 text-orange-500" />
            </div>

            <h3 className="mt-6 text-xl font-semibold text-white">
              No analyzed projects yet
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-500">
              Upload your resume above to discover your project skills.
              Your analyzed projects will appear here.
            </p>
          </div>
        ) : (
          <div className="project-list">
            {projectRecords.map((project) => {
              const isExpanded =
                expandedProject === project.projectId;

              const explicitCount =
                project.explicit_skills?.length || 0;

              const hiddenCount =
                project.potential_hidden_skills?.length || 0;

              return (
                <article
                  key={project.projectId}
                  className="project-card min-w-0 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:border-neutral-700"
                >
                  {/* PROJECT HEADER */}
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedProject(
                        isExpanded ? null : project.projectId
                      )
                    }
                    className="project-card-trigger flex w-full min-w-0 items-center gap-5 px-5 py-5 text-left transition hover:bg-neutral-800/50 sm:px-7"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                      <FolderKanban className="h-7 w-7 text-orange-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-white sm:text-xl">
                        {project.displayName}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
                        <span>
                          {explicitCount} explicit skills
                        </span>

                        <span className="text-orange-400">
                          {hiddenCount} potential hidden skills
                        </span>
                      </div>
                    </div>

                    <div className="hidden shrink-0 text-sm text-neutral-500 md:block">
                      {formatDate(project.createdAt)}
                    </div>

                    <div className="shrink-0 rounded-xl bg-neutral-800 p-3 text-orange-500">
                      {isExpanded ? (
                        <ChevronUp size={23} />
                      ) : (
                        <ChevronDown size={23} />
                      )}
                    </div>
                  </button>

                  {/* PROJECT DETAILS */}
                  {isExpanded && (
                    <div className="project-details border-t border-neutral-800">

                      {/* DESCRIPTION */}
                      <div className="project-description min-w-0 rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
                        <p className="mb-5 text-xs font-bold uppercase tracking-widest text-orange-500">
                          Project Description
                        </p>

                        <p className="min-w-0 whitespace-normal break-words text-base leading-8 text-neutral-300">
                          {getProjectDescription(project)}
                        </p>
                      </div>

                      {/* EXPLICIT SKILLS */}
                      <SkillSection
                        title="Explicit Skills"
                        skills={project.explicit_skills}
                      />

                      <div className="h-px bg-neutral-800" />

                      {/* HIDDEN SKILLS */}
                      <SkillSection
                        title="Potential Hidden Skills"
                        skills={project.potential_hidden_skills}
                        hidden
                      />

                      {/* RESUME DETAILS */}
                      <div className="project-meta border-t border-neutral-800 pt-6">
                        <p className="text-sm text-neutral-500">
                          Analyzed resume:{" "}
                          <span className="text-neutral-300">
                            {project.filename || "Uploaded resume"}
                          </span>
                        </p>

                        <p className="mt-3 text-sm text-neutral-500">
                          Analysis date:{" "}
                          {formatDate(project.createdAt) || "Unavailable"}
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-800 pt-8 text-center text-sm text-neutral-600">
        Elevate AI · Your Personal Skill Discovery Workspace
      </footer>
    </div>
  );
}
