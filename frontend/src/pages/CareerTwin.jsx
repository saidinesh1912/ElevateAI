
import { useEffect, useState } from "react";
import {
  Upload,
  FileText,
  BriefcaseBusiness,
  Brain,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Target,
} from "lucide-react";

import {
  analyzeCareerTwin,
  getCareerTwinHistory,
} from "../services/api";

function CareerTwin() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [history, setHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [expandedCareer, setExpandedCareer] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadHistory = async () => {
    setIsLoadingHistory(true);

    try {
      const response = await getCareerTwinHistory();
      setHistory(response.analyses || []);
    } catch (err) {
      console.error("Career Twin history error:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFileChange = (file) => {
    setError("");
    setSuccess("");

    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileChange(event.dataTransfer.files?.[0]);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select your resume first.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setSuccess("");
    setCurrentResult(null);
    setExpandedCareer(null);

    try {
      const response = await analyzeCareerTwin(selectedFile);

      if (!response.success) {
        throw new Error(response.message || "Career analysis failed.");
      }

      const result = response.analysis;

      setCurrentResult({
        ...result,
        career_matches: result.career_matches || [],
        identified_skills: result.identified_skills || [],
      });

      setSelectedFile(null);
      setSuccess("Your Career Digital Twin analysis is complete!");

      await loadHistory();
    } catch (err) {
      console.error("Career Twin analysis error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to analyze your resume. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openHistoryResult = (record) => {
    setCurrentResult({
      ...record,
      career_matches: record.career_matches || [],
      identified_skills: record.identified_skills || [],
    });

    setExpandedCareer(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const careerMatches = currentResult?.career_matches || [];
  const identifiedSkills = currentResult?.identified_skills || [];

  return (
    <div className="career-twin-page min-h-screen w-full min-w-0 bg-black py-7 text-white">
      <div className="career-twin-container mx-auto w-full max-w-[1680px]">

      {/* PAGE HEADER */}

      <header className="career-twin-header mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-400">
          <Sparkles size={15} />
          AI Career Intelligence
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Career Digital Twin
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-400">
          Discover career paths that match your skills, projects and
          professional experience through AI-powered resume analysis.
        </p>
      </header>

      {/* UPLOAD SECTION */}

      <section className="career-twin-upload mb-14 overflow-hidden rounded-2xl border border-neutral-800 bg-[#111111] shadow-[0_18px_60px_rgba(0,0,0,0.22)]">

        <div className="career-twin-upload-heading flex items-center gap-4 border-b border-neutral-800 px-5 py-5 sm:px-7">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
            <Upload size={22} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white sm:text-xl">Upload Your Resume</h2>
            <p className="mt-1 text-xs text-neutral-500 sm:text-sm">PDF or DOCX · Maximum file size: 5 MB</p>
          </div>
        </div>

        <div className="career-twin-upload-body p-4 sm:p-6">
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`career-twin-dropzone group flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-12 text-center transition duration-200 sm:min-h-[320px] ${
            isDragging
              ? "border-orange-400 bg-orange-500/10"
              : "border-neutral-700 bg-[#090909] hover:border-orange-500/60 hover:bg-orange-500/[0.04]"
          }`}
        >

          <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-[26px] border border-orange-500/20 bg-orange-500/10 text-orange-400 transition duration-200 group-hover:scale-105 group-hover:bg-orange-500/15"><Upload size={42} strokeWidth={1.8} /></div>

          <span className="text-xl font-bold text-white sm:text-2xl">
            {isDragging ? "Drop your resume here" : "Choose your resume"}
          </span>
          <span className="mt-2 text-sm text-neutral-500">
            Drag and drop your file here, or click to browse
          </span>
          <span className="mt-5 inline-flex min-h-12 min-w-[190px] items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-7 py-3 text-sm font-bold text-orange-300 transition group-hover:border-orange-400 group-hover:bg-orange-500/20 group-hover:text-white">
            <FileText size={17} /> Browse Resume
          </span>

          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(event) =>
              handleFileChange(event.target.files?.[0])
            }
          />
        </label>

        {selectedFile && (
          <div className="career-twin-selected-file mt-4 flex items-center justify-between gap-3 rounded-xl border border-orange-500/20 bg-orange-500/[0.06] p-4">
            <div className="flex min-w-0 items-center gap-3">
              <FileText className="shrink-0 text-orange-400" />

              <div className="min-w-0">
                <p className="truncate text-base font-bold text-white sm:text-lg">
                  {selectedFile.name}
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              aria-label="Remove selected resume"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!selectedFile || isAnalyzing}
          className="career-twin-analyze-button mt-7 mb-2 inline-flex min-h-16 w-full min-w-0 items-center justify-center gap-3 whitespace-normal rounded-xl bg-orange-500 px-7 py-4 text-center text-base font-extrabold leading-snug text-white shadow-lg shadow-orange-950/30 transition duration-200 hover:-translate-y-0.5 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:w-auto sm:min-w-[320px] sm:whitespace-nowrap"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analyze Career Matches
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-900 bg-green-950/30 p-4 text-sm text-green-300">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}
        </div>
      </section>

      {/* CURRENT ANALYSIS */}

      {currentResult && (
        <section className="career-twin-results mb-10 space-y-6">

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2 text-orange-400">
                <Target size={19} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Analysis Results
                </span>
              </div>

              <h2 className="text-2xl font-bold">
                Your Career Matches
              </h2>

              <p className="mt-2 text-xs text-neutral-500">
                Resume: {currentResult.filename}
              </p>
            </div>

            <span className="rounded-full border border-green-800 bg-green-950/30 px-3 py-1.5 text-xs text-green-400">
              Analysis Complete
            </span>
          </div>

          {/* IDENTIFIED SKILLS */}

          <div className="career-twin-skills-panel rounded-2xl border border-neutral-800 bg-[#111111] p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Brain size={19} className="text-orange-400" />
              <h3 className="font-semibold">
                Skills Identified
              </h3>

              <span className="ml-auto text-xs text-neutral-500">
                {identifiedSkills.length} skills
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {identifiedSkills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="max-w-full break-words rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* CAREER MATCH CARDS */}

          <div className="space-y-4">
            {careerMatches.map((career, index) => {
              const isExpanded = expandedCareer === index;

              const score = Number(career.match_percentage) || 0;

              return (
                <article
                  key={`${career.career}-${index}`}
                  className="career-twin-match-card overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 transition hover:border-neutral-700"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedCareer(isExpanded ? null : index)
                    }
                    aria-expanded={isExpanded}
                    className="flex min-h-[92px] w-full flex-wrap items-center gap-4 p-5 text-left sm:min-h-[104px] sm:p-6"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
                      <BriefcaseBusiness size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-semibold text-white sm:text-lg">
                        {career.career}
                      </h3>

                      <p className="mt-1 text-xs text-neutral-500">
                        AI-estimated career suitability
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-orange-400">
                        {score}%
                      </span>

                      {isExpanded ? (
                        <ChevronUp size={20} className="text-neutral-400" />
                      ) : (
                        <ChevronDown size={20} className="text-neutral-400" />
                      )}
                    </div>
                  </button>

                  <div className="px-5 pb-4 sm:px-6">
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.max(0, score))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-5 border-t border-neutral-800 p-5 sm:p-6">

                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-orange-400">
                          Why this career matches
                        </h4>

                        <p className="text-sm leading-7 text-neutral-300">
                          {career.reason}
                        </p>
                      </div>

                      <div>
                        <h4 className="mb-3 text-sm font-semibold text-orange-400">
                          Matching Skills
                        </h4>

                        <div className="flex flex-wrap gap-2">
                          {(career.matching_skills || []).map(
                            (skill, skillIndex) => (
                              <span
                                key={`${skill}-${skillIndex}`}
                                className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs text-orange-300"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <p className="text-xs leading-6 text-neutral-500">
            Suitability percentages are AI-generated estimates based on
            the information available in your uploaded resume. They are
            not statistically validated probabilities or guarantees of
            employment.
          </p>
        </section>
      )}

      {/* PREVIOUS ANALYSES */}

      <section className="career-twin-history mt-2 space-y-6 pb-10">

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Previous Career Analyses
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Select an analysis to revisit your saved career recommendations.
            </p>
          </div>

          <button
            type="button"
            onClick={loadHistory}
            disabled={isLoadingHistory}
            className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-neutral-300 transition hover:border-orange-500/40 hover:bg-neutral-800 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={isLoadingHistory ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {isLoadingHistory ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-center text-sm text-neutral-400">
            Loading your career history...
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950 p-8 text-center">
            <Clock size={30} className="mx-auto mb-3 text-neutral-600" />

            <p className="font-medium text-neutral-300">
              No previous career analyses
            </p>

            <p className="mt-2 text-xs text-neutral-500">
              Your saved career matches will appear here after your
              first analysis.
            </p>
          </div>
        ) : (
          <div className="career-history-list flex flex-col gap-5 sm:gap-6">
            {history.map((record) => {
              const isOpen = expandedHistory === record.id;

              return (
                <div
                  key={record.id}
                  className="career-twin-history-card w-full overflow-hidden rounded-2xl border border-neutral-800 bg-[#171717] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition duration-200 hover:border-orange-500/30 hover:bg-[#1b1b1b]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedHistory(isOpen ? null : record.id)
                    }
                    className="flex min-h-[92px] w-full flex-wrap items-center gap-4 p-5 text-left sm:min-h-[104px] sm:p-6"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-500/10 bg-orange-500/10 text-orange-400"><FileText size={25} /></div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {record.filename}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {record.created_at
                          ? new Date(record.created_at).toLocaleString()
                          : "Previous analysis"}
                      </p>
                    </div>

                    {isOpen ? (
                      <ChevronUp size={19} />
                    ) : (
                      <ChevronDown size={19} />
                    )}
                  </button>

                  {isOpen && (
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800 bg-black/20 px-5 py-4 sm:px-6">
                      <span className="text-xs text-neutral-400">
                        {record.career_matches?.length || 0} career matches
                      </span>

                      <button
                        type="button"
                        onClick={() => openHistoryResult(record)}
                        className="inline-flex min-h-11 min-w-[150px] items-center justify-center whitespace-nowrap rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold leading-none text-white transition hover:bg-orange-400"
                      >
                        View Analysis
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}

export default CareerTwin;
