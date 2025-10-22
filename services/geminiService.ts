import { GoogleGenAI, Type } from "@google/genai";
import { Source, NewsletterDraft, SourceType, GroundingChunk } from '../types';

export const generateNewsletterDraft = async (
  apiKey: string, 
  sources: Source[], 
  writingStyleSamples: string[], 
  tone: string
): Promise<{ draft: NewsletterDraft, groundingMetadata: GroundingChunk[] }> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please enter it in the application.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-pro";

  const sourceDescriptions = sources.map(source => {
    switch (source.type) {
      case SourceType.TWITTER:
        return `trending topics on Twitter about "${source.value}"`;
      case SourceType.YOUTUBE:
        return `latest popular videos from YouTube channel "${source.value}"`;
      case SourceType.RSS:
        return `top stories from the RSS feed "${source.value}"`;
      default:
        return '';
    }
  }).filter(Boolean).join(', ');

  const writingStyle = writingStyleSamples.join('\n\n---\n\n');

  let toneInstruction = '';
  if (tone !== 'Default (from Style)') {
    toneInstruction = `4. **Tone Adjustment**: For this specific draft, adjust the writing tone to be more "${tone}". This should be a subtle shift that complements the user's primary writing style, not replace it.`;
  }

  const prompt = `
    You are CreatorPulse, an expert content curator and newsletter writer. Your task is to perform a real-time web search, analyze the results, and then draft a newsletter in a specific user's voice.

    1. **Research Task**: First, use Google Search to find the most recent, interesting, and trending content based on these topics: ${sourceDescriptions}. Focus on content suitable for a tech, business, or creator-focused newsletter.

    2. **Analyze Writing Style**: Next, deeply understand the user's tone, voice, and formatting from these examples. This is the primary style you must replicate. Each sample is separated by '---'.
        ---
        WRITING STYLE SAMPLES:
        ${writingStyle}
        ---

    3. **Generate Newsletter Draft**: Based on your search results and the user's style, generate a complete newsletter draft. It MUST include:
        - A compelling subject line.
        - An engaging introduction paragraph.
        - A list of 3 curated links, each with a short, insightful summary written in the user's voice. Use the real URLs from your search results.
        - A "Trends to Watch" section with the top 2 emerging trends, each with a title, a one-sentence explainer, and a relevant link from your search results.
    
    ${toneInstruction}

    5. **Output Format**: Return the draft as a single, valid JSON object matching the provided schema. Do not include any markdown formatting like \`\`\`json.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: "A compelling email subject line." },
            introduction: { type: Type.STRING, description: "Engaging intro paragraph in the user's voice." },
            curatedLinks: {
              type: Type.ARRAY,
              description: "List of curated links with summaries.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING },
                  summary: { type: Type.STRING },
                },
                required: ["title", "url", "summary"],
              },
            },
            trendsToWatch: {
              type: Type.ARRAY,
              description: "List of emerging trends to watch.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  explainer: { type: Type.STRING },
                  link: { type: Type.STRING },
                },
                required: ["title", "explainer", "link"],
              },
            },
          },
          required: ["subject", "introduction", "curatedLinks", "trendsToWatch"],
        },
      },
    });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    let jsonString = response.text;

    // The model can sometimes wrap the JSON in markdown code fences. Let's try to extract it.
    const markdownMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        jsonString = markdownMatch[1];
    } else {
        // If not in a markdown block, find the first '{' and last '}' as a fallback.
        const startIndex = jsonString.indexOf('{');
        const endIndex = jsonString.lastIndexOf('}');
        if (startIndex !== -1 && endIndex > startIndex) {
            jsonString = jsonString.substring(startIndex, endIndex + 1);
        }
    }

    try {
        const draft = JSON.parse(jsonString) as NewsletterDraft;
        return { draft, groundingMetadata: groundingChunks };
    } catch (parseError) {
        console.error("Failed to parse JSON from the AI's response.");
        console.error("Raw response text:", response.text);
        console.error("Attempted to parse:", jsonString);
        throw new Error("The AI returned an invalid data format. This can happen with complex requests. Please try again or adjust your sources.");
    }

  } catch (error) {
    console.error("Error generating newsletter draft from Gemini:", error);
    if (error instanceof Error && error.message.includes("deadline")) {
        throw new Error("The request timed out. This can happen with complex queries. Please try simplifying your sources.");
    }
    throw new Error("An API error occurred while generating the draft. Please check your API key and network connection.");
  }
};
