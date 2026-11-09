
const CAREER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const CAREER_MODEL =
  process.env.CAREER_OPENROUTER_MODEL || "openai/gpt-4o-mini";

const analyzeCareerProfile = async (studentProfile) => {
  const apiKey = process.env.CAREER_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("Career Twin OpenRouter API key is not configured.");
  }

  const prompt = `
You are an expert AI career guidance assistant.

Analyze the following student's professional profile and generate
a personalized Career Digital Twin assessment.

STUDENT PROFILE:
${JSON.stringify(studentProfile, null, 2)}

TASK:
1. Identify the student's strongest professional areas.
2. Predict 3 to 5 suitable career paths.
3. Give each career a suitability score between 0 and 100.
4. Explain why each career suits the student.
5. Identify supporting skills and experience.
6. Provide a practical development roadmap for each career.
7. Identify the student's major professional strengths.

IMPORTANT:
- Base your analysis only on the supplied profile.
- Never invent qualifications, skills or experience.
- Clearly identify missing information.
- Scores represent AI-estimated suitability, not statistical probabilities.
- Return valid JSON only.
- Do not include Markdown code fences.

REQUIRED JSON FORMAT:
{
  "profile_summary": "Short professional summary",
  "strongest_areas": [
    "Area 1",
    "Area 2"
  ],
  "career_predictions": [
    {
      "career": "Career title",
      "suitability_score": 85,
      "reason": "Why this career is suitable",
      "supporting_skills": [
        "Skill 1",
        "Skill 2"
      ],
      "development_roadmap": [
        "Step 1",
        "Step 2",
        "Step 3"
      ]
    }
  ],
  "professional_strengths": [
    "Strength 1",
    "Strength 2"
  ],
  "missing_information": [
    "Information that would improve the assessment"
  ]
}
`;

  const response = await fetch(CAREER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "Elevate AI Career Digital Twin"
    },
    body: JSON.stringify({
      model: CAREER_MODEL,
      temperature: 0.3,
      response_format: {
        type: "json_object"
      },
      messages: [
        {
          role: "system",
          content: "You are a professional career analysis AI. Return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Career Twin API error:", response.status, errorText);
    throw new Error("Career analysis service is currently unavailable.");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("The AI service returned an empty response.");
  }

  let result;

  try {
    result = JSON.parse(content);
  } catch {
    throw new Error("The AI service returned an invalid JSON response.");
  }

  if (
    !Array.isArray(result.career_predictions) ||
    result.career_predictions.length === 0
  ) {
    throw new Error("No career predictions were generated.");
  }

  return result;
};

module.exports = { analyzeCareerProfile };

