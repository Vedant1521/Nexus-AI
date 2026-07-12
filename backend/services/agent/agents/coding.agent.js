import { checkAgentLimit } from "../config/agentRateLimit.js";
import { deductCredits } from "../utils/deductCredits.js";
import { getModel } from "../utils/model.js";
import { getConversationHistory } from "../utils/getConv.js";

export const codingAgent = async (state) => {

await checkAgentLimit(
    state.userId,
    "coding"
  );
 await deductCredits(

        state.userId,

        "coding"

    );

function cleanCode(code = "") {
  return code
    .replace(/```[\w-]*\n?/g, "")
    .replace(/```/g, "")
    .trim();
}

  const llm = getModel("coding");

  let history = [];
  try {
    history = await getConversationHistory(state.conversationId);
  } catch (err) {
    console.error("Failed to load conversation history for coding agent:", err);
  }

  // Find the latest assistant message containing code artifacts
  const lastArtifactMessage = [...history]
    .reverse()
    .find(msg => msg.role === "assistant" && msg.artifacts && msg.artifacts.length > 0);

  let previousCodeContext = "";
  if (lastArtifactMessage && lastArtifactMessage.artifacts && lastArtifactMessage.artifacts.length > 0) {
    const lastArtifact = lastArtifactMessage.artifacts[0];
    previousCodeContext = lastArtifact.files.map(f => `FILE: ${f.name}\n${f.content}`).join("\n\n");
  }

  let promptMessages = `You are NexusAI Coding Agent.

Your first task is to identify the user's intent.

=========================
INTENT DETECTION
=========================

Classify the request into ONE of these:

1. CODE_GENERATION
2. CODE_REVIEW
3. CODE_EXPLANATION
4. DEBUGGING
5. OPTIMIZATION
6. CONVERSION
7. DOCUMENTATION

=========================
CODE REVIEW vs UPDATE INTENT
=========================

If the user asks to review, explain, find bugs, or analyze code without modifying the active application:
- DO NOT generate code files.
- Return Markdown only.
- Include:
  # Overview
  ## What this code does
  ## Problems
  ## Improvements
  ## Best Practices
  ## Optimized snippets (if required)

HOWEVER, if the user asks to edit, modify, update, change styling/colors, add features, or refactor the live preview codebase:
- You MUST treat this as CODE_GENERATION.
- Do NOT return markdown explanations alone.
- You MUST return the updated code files using the 'FILE: filename' format so they can be compiled and previewed.

For explanations:

- Never wrap variable names in triple backticks.
- Use single backticks only for inline code.
- Use triple backticks ONLY for complete code blocks.


=========================
CODE GENERATION
=========================

Default stack:

HTML
CSS
JavaScript

Do NOT use any framework unless explicitly requested.

Examples:

"Build portfolio"
→ HTML CSS JS

"Create ecommerce"
→ HTML CSS JS

"Create dashboard"
→ HTML CSS JS

"React dashboard"
→ React

"Next.js blog"
→ Next.js

=========================
WEBSITE RULE
=========================

Unless the user explicitly requests multiple pages,

ALWAYS build a SINGLE PAGE website.

Use sections:

Home
About
Services
Features
Pricing
Testimonials
Contact
Footer

Navigation should smoothly scroll.

Do NOT generate:

about.html
contact.html
pricing.html

unless the user explicitly asks.

=========================
PROJECT FILES
=========================

For default websites generate only:

FILE: index.html

FILE: style.css

FILE: script.js

Generate extra files ONLY if necessary.

=========================
DESIGN
=========================

Modern UI

Glassmorphism when suitable

Responsive

CSS Variables

Grid

Flexbox

Smooth Scroll

Hover Effects

Subtle Animations

Professional spacing

Compact CSS

=========================
IMAGES
=========================

Always use real Unsplash images.

Never use placeholders.

=========================
JAVASCRIPT
=========================

Keep JS minimal.

Only interactive logic.

No unnecessary functions.

=========================
OUTPUT
=========================

If intent is CODE_GENERATION

Return ONLY the code files using the FILE: filename format. 
DO NOT include any conversational text or markdown outside of the files.
Example output:
FILE: index.html
<html>...</html>

FILE: style.css
body {...}

If intent is REVIEW / EXPLAIN / DEBUG

Return Markdown only.

Do NOT generate project files.

=========================
TOKEN BUDGET
=========================

Maximum ~2000 output tokens.

Prefer concise but beautiful code.

Generate only what is required.
`;

  if (previousCodeContext) {
    promptMessages += `
=========================
EXISTING CODEBASE
=========================
Here is the current code of the project. When updating or editing, you MUST modify this code. Keep the structure intact and only apply the requested edits. Return the FULL files including the edits.

${previousCodeContext}
`;
  }

  if (history && history.length > 0) {
    promptMessages += `
=========================
CONVERSATION HISTORY
=========================
Here are the previous messages in this chat conversation:
`;
    history.forEach(msg => {
      promptMessages += `\n[${msg.role.toUpperCase()}]: ${msg.content}\n`;
    });
  }

  promptMessages += `
=========================
LATEST USER REQUEST
=========================
Modify the existing codebase (if provided above) or build a new project according to this prompt:
"${state.prompt}"
`;

  const response = await llm.invoke(promptMessages);

  const content =
    response.content?.trim();
console.log(content)
  const files = [];

  const matches = [
    ...content.matchAll(
      /FILE:\s*([^\n]+)\n([\s\S]*?)(?=\nFILE:\s*[^\n]+\n|$)/g
    )
  ];

  if(matches.length){

    matches.forEach(match => {

      files.push({
  name: match[1].trim(),
  content: cleanCode(match[2]),
});

    });

  }else{

    let fileName = "main.js";

    const prompt =
      state.prompt.toLowerCase();

    if(prompt.includes("html")){
      fileName = "index.html";
    }
    else if(prompt.includes("css")){
      fileName = "style.css";
    }
    else if(prompt.includes("python")){
      fileName = "main.py";
    }
    else if(prompt.includes("java")){
      fileName = "Main.java";
    }
    else if(prompt.includes("c++")){
      fileName = "main.cpp";
    }
  }

  // Merge unmodified files from the previous version if they are missing in the new generation
  if (lastArtifactMessage && lastArtifactMessage.artifacts && lastArtifactMessage.artifacts.length > 0) {
    const lastArtifact = lastArtifactMessage.artifacts[0];
    lastArtifact.files.forEach(oldFile => {
      const isFileGenerated = files.some(f => f.name === oldFile.name);
      if (!isFileGenerated) {
        files.push({
          name: oldFile.name,
          content: oldFile.content
        });
      }
    });
  }

  if (!content.includes("FILE:")) {
  return {
    ...state,
    response: content,
    artifacts: []
  };
}

  return {

    ...state,

    response:
      "Code generated successfully.",

    artifacts:[
      {
        id:Date.now(),
        type:"project",
        title:state.prompt,
        files,
        createdAt:
          new Date().toISOString()
      }
    ]

  };

};