import type { ChatMessage } from '@/components/editor/use-chat';
import type { SlateEditor } from 'platejs';

import { getMarkdown } from '@platejs/ai';
import dedent from 'dedent';

import {
  addSelection,
  buildStructuredPrompt,
  formatTextFromMessages,
  getMarkdownWithSelection,
  isMultiBlocks,
} from './utils';

// Rehab/Real Estate context for AI prompts
export const REHAB_CONTEXT = {
  domain: 'real estate renovation and fix-and-flip investing',
  expertise: [
    'renovation cost estimation',
    'ROI analysis for property improvements',
    'contractor management',
    'permit requirements',
    'material selection',
    'timeline planning',
    'budget tracking',
    'investment strategy (flip vs rental vs Airbnb)',
  ],
  terminology: {
    ARV: 'After Repair Value - estimated market value after renovations',
    ROI: 'Return on Investment',
    scopeItem: 'A specific renovation task or work item',
    punchList: 'Final walkthrough items to complete before project close',
    changeOrder: 'A modification to the original scope of work',
    holdingCosts: 'Monthly costs while property is being renovated',
  },
};

/**
 * Get rehab-specific system context to inject into prompts
 */
export function getRehabSystemContext(projectContext?: {
  projectName?: string;
  location?: string;
  investmentStrategy?: string;
  budget?: number;
  currentPhase?: string;
}): string {
  let context = dedent`
    You are an AI assistant specialized in ${REHAB_CONTEXT.domain}.
    You have expertise in: ${REHAB_CONTEXT.expertise.join(', ')}.
    
    Key terminology you should understand:
    ${Object.entries(REHAB_CONTEXT.terminology)
      .map(([term, def]) => `- ${term}: ${def}`)
      .join('\n')}
  `;

  if (projectContext) {
    context += '\n\nCurrent project context:';
    if (projectContext.projectName) {
      context += `\n- Project: ${projectContext.projectName}`;
    }
    if (projectContext.location) {
      context += `\n- Location: ${projectContext.location}`;
    }
    if (projectContext.investmentStrategy) {
      context += `\n- Investment strategy: ${projectContext.investmentStrategy}`;
    }
    if (projectContext.budget) {
      context += `\n- Budget: $${projectContext.budget.toLocaleString()}`;
    }
    if (projectContext.currentPhase) {
      context += `\n- Current phase: ${projectContext.currentPhase}`;
    }
  }

  return context;
}

export function getChooseToolPrompt({ messages }: { messages: ChatMessage[] }) {
  return buildStructuredPrompt({
    examples: [
      // GENERATE
      'User: "Write a paragraph about AI ethics" → Good: "generate" | Bad: "edit"',
      'User: "Create a short poem about spring" → Good: "generate" | Bad: "comment"',

      // EDIT
      'User: "Please fix grammar." → Good: "edit" | Bad: "generate"',
      'User: "Improving writing style." → Good: "edit" | Bad: "generate"',
      'User: "Making it more concise." → Good: "edit" | Bad: "generate"',
      'User: "Translate this paragraph into French" → Good: "edit" | Bad: "generate"',

      // COMMENT
      'User: "Can you review this text and give me feedback?" → Good: "comment" | Bad: "edit"',
      'User: "Add inline comments to this code to explain what it does" → Good: "comment" | Bad: "generate"',
    ],
    history: formatTextFromMessages(messages),
    rules: dedent`
      - Default is "generate". Any open question, idea request, or creation request → "generate".
      - Only return "edit" if the user provides original text (or a selection of text) AND asks to change, rephrase, translate, or shorten it.
      - Only return "comment" if the user explicitly asks for comments, feedback, annotations, or review. Do not infer "comment" implicitly.
      - Return only one enum value with no explanation.
    `,
    task: `You are a strict classifier. Classify the user's last request as "generate", "edit", or "comment".`,
  });
}

export function getCommentPrompt(
  editor: SlateEditor,
  {
    messages,
  }: {
    messages: ChatMessage[];
  }
) {
  const selectingMarkdown = getMarkdown(editor, {
    type: 'blockWithBlockId',
  });

  return buildStructuredPrompt({
    backgroundData: selectingMarkdown,
    examples: [
      // 1) Basic single-block comment
      `User: Review this paragraph.

    backgroundData:
  <block id="1">AI systems are transforming modern workplaces by automating routine tasks.</block>

  Output:
  [
    {
      "blockId": "1",
      "content": "AI systems are transforming modern workplaces",
      "comments": "Clarify what types of systems or provide examples."
    }
  ]`,

      // 2) Multiple comments within one long block
      `User: Add comments for this section.

  backgroundData:
  <block id="2">AI models can automate customer support. However, they may misinterpret user intent if training data is biased.</block>

  Output:
  [
    {
      "blockId": "2",
      "content": "AI models can automate customer support.",
      "comments": "Consider mentioning limitations or scope of automation."
    },
    {
      "blockId": "2",
      "content": "they may misinterpret user intent if training data is biased",
      "comments": "Good point—expand on how bias can be detected or reduced."
    }
  ]`,

      // 3) Multi-block comment (span across two related paragraphs)
      `User: Provide comments.

  backgroundData:
  <block id="3">This policy aims to regulate AI-generated media.</block>
  <block id="4">Developers must disclose when content is synthetically produced.</block>

  Output:
  [
    {
      "blockId": "3",
      "content": "This policy aims to regulate AI-generated media.\\n\\nDevelopers must disclose when content is synthetically produced.",
      "comments": "You could combine these ideas into a single, clearer statement on transparency."
    }
  ]`,

      // 4) With <Selection> – user highlighted part of a sentence
      `User: Give feedback on this highlighted phrase.

  backgroundData:
  <block id="5">AI can <Selection>replace human creativity</Selection> in design tasks.</block>

  Output:
  [
    {
      "blockId": "5",
      "content": "replace human creativity",
      "comments": "Overstated claim—suggest using 'assist' instead of 'replace'."
    }
  ]`,

      // 5) With long <Selection> → multiple comments
      `User: Review the highlighted section.

  backgroundData:
  <block id="6">
  <Selection>
  AI tools are valuable for summarizing information and generating drafts.
  Still, human review remains essential to ensure accuracy and ethical use.
  </Selection>
  </block>

  Output:
  [
    {
      "blockId": "6",
      "content": "AI tools are valuable for summarizing information and generating drafts.",
      "comments": "Solid statement—consider adding specific examples of tools."
    },
    {
      "blockId": "6",
      "content": "human review remains essential to ensure accuracy and ethical use",
      "comments": "Good caution—explain briefly why ethics require human oversight."
    }
  ]`,
    ],
    history: formatTextFromMessages(messages),
    rules: dedent`
      - IMPORTANT: If a comment spans multiple blocks, use the id of the **first** block.
      - The **content** field must be the original content inside the block tag. The returned content must not include the block tags, but should retain other MDX tags.
      - IMPORTANT: The **content** field must be flexible:
        - It can cover one full block, only part of a block, or multiple blocks.
        - If multiple blocks are included, separate them with two \\n\\n.
        - Do NOT default to using the entire block—use the smallest relevant span instead.
      - At least one comment must be provided.
      - If a <Selection> exists, Your comments should come from the <Selection>, and if the <Selection> is too long, there should be more than one comment.
    `,
    task: dedent`
      You are a document review assistant.
      You will receive an MDX document wrapped in <block id="..."> content </block> tags.
      <Selection> is the text highlighted by the user.

      Your task:
      - Read the content of all blocks and provide comments.
      - For each comment, generate a JSON object:
        - blockId: the id of the block being commented on.
        - content: the original document fragment that needs commenting.
        - comments: a brief comment or explanation for that fragment.
    `,
  });
}

export function getGeneratePrompt(
  editor: SlateEditor,
  { messages }: { messages: ChatMessage[] }
) {
  if (!isMultiBlocks(editor)) {
    addSelection(editor);
  }

  const selectingMarkdown = getMarkdownWithSelection(editor);

  return buildStructuredPrompt({
    backgroundData: selectingMarkdown,
    examples: [
      // 1) Summarize content
      'User: Summarize the following text.\nBackground data:\nArtificial intelligence has transformed multiple industries, from healthcare to finance, improving efficiency and enabling data-driven decisions.\nOutput:\nAI improves efficiency and decision-making across many industries.',

      // 2) Generate key takeaways
      'User: List three key takeaways from this text.\nBackground data:\nRemote work increases flexibility but also requires better communication and time management.\nOutput:\n- Remote work enhances flexibility.\n- Communication becomes critical.\n- Time management determines success.',

      // 3) Generate a title
      'User: Generate a short, catchy title for this section.\nBackground data:\nThis section explains how machine learning models are trained using large datasets to recognize patterns.\nOutput:\nTraining Machines to Recognize Patterns',

      // 4) Generate action items
      'User: Generate actionable next steps based on the paragraph.\nBackground data:\nThe report suggests improving documentation and conducting user interviews before the next release.\nOutput:\n- Update all technical documentation.\n- Schedule user interviews before the next release.',

      // 5) Generate a comparison table
      'User: Generate a comparison table of the tools mentioned.\nBackground data:\nTool A: free, simple UI\nTool B: paid, advanced analytics\nOutput:\n| Tool  | Pricing | Features         |\n|-------|----------|-----------------|\n| A     | Free     | Simple UI        |\n| B     | Paid     | Advanced analytics |',

      // 6) Generate a summary table of statistics
      'User: Create a summary table of the following statistics.\nBackground data:\nSales Q1: 1200 units\nSales Q2: 1500 units\nSales Q3: 900 units\nOutput:\n| Quarter | Sales (units) |\n|----------|---------------|\n| Q1       | 1200          |\n| Q2       | 1500          |\n| Q3       | 900           |',

      // 7) Generate a question list
      'User: Generate three reflection questions based on the paragraph.\nBackground data:\nThe article discusses the role of creativity in problem-solving and how diverse perspectives enhance innovation.\nOutput:\n1. How can creativity be encouraged in structured environments?\n2. What role does diversity play in innovative teams?\n3. How can leaders balance creativity and efficiency?',

      // 8) Explain a concept (selected phrase)
      'User: Explain the meaning of the selected phrase.\nBackground data:\nDeep learning relies on neural networks to automatically extract patterns from data, a process called <Selection>feature learning</Selection>.\nOutput:\n"Feature learning" means automatically discovering useful representations or characteristics from raw data without manual intervention.',
    ],
    history: formatTextFromMessages(messages),
    rules: dedent`
      - <Selection> is the text highlighted by the user.
      - backgroundData represents the user's current Markdown context.
      - You may only use backgroundData and <Selection> as input; never ask for more data.
      - CRITICAL: DO NOT remove or alter custom MDX tags such as <u>, <callout>, <kbd>, <toc>, <sub>, <sup>, <mark>, <del>, <date>, <span>, <column>, <column_group>, <file>, <audio>, <video> unless explicitly requested.
      - CRITICAL: when writing Markdown or MDX, do NOT wrap output in code fences.
      - Preserve indentation and line breaks when editing within columns or structured layouts.
    `,
    task: dedent`
      You are an advanced content generation assistant.
      Generate content based on the user's instructions, using the background data as context.
      If the instruction requests creation or transformation (e.g., summarize, translate, rewrite, create a table), directly produce the final result using only the provided background data.
      Do not ask the user for additional content.
    `,
  });
}

export function getEditPrompt(
  editor: SlateEditor,
  { isSelecting, messages }: { isSelecting: boolean; messages: ChatMessage[] }
) {
  if (!isSelecting)
    throw new Error('Edit tool is only available when selecting');
  if (isMultiBlocks(editor)) {
    const selectingMarkdown = getMarkdownWithSelection(editor);

    return buildStructuredPrompt({
      backgroundData: selectingMarkdown,
      examples: [
        // 1) Fix grammar
        'User: Fix grammar.\nbackgroundData: # User Guide\nThis guide explain how to install the app.\nOutput:\n# User Guide\nThis guide explains how to install the application.',

        // 2) Make the tone more formal and professional
        "User: Make the tone more formal and professional.\nbackgroundData: ## Intro\nHey, here's how you can set things up quickly.\nOutput:\n## Introduction\nThis section describes the setup procedure in a clear and professional manner.",

        // 3) Make it more concise without losing meaning
        'User: Make it more concise without losing meaning.\nbackgroundData: The purpose of this document is to provide an overview that explains, in detail, all the steps required to complete the installation.\nOutput:\nThis document provides a detailed overview of the installation steps.',
      ],
      history: formatTextFromMessages(messages),
      outputFormatting: 'markdown',
      rules: dedent`
        - Do not Write <backgroundData> tags in your response.
        - <backgroundData> represents the full blocks of text the user has selected and wants to modify or ask about.
        - Your response should be a direct replacement for the entire <backgroundData>.
        - Maintain the overall structure and formatting of the background data, unless explicitly instructed otherwise.
        - CRITICAL: Provide only the content to replace <backgroundData>. Do not add additional blocks or change the block structure unless specifically requested.
      `,
      task: `The following <backgroundData> is user-provided Markdown content that needs improvement. Modify it according to the user's instruction.
      Unless explicitly stated otherwise, your output should be a seamless replacement of the original content.`,
    });
  }

  addSelection(editor);

  const selectingMarkdown = getMarkdownWithSelection(editor);
  const endIndex = selectingMarkdown.indexOf('<Selection>');
  const prefilledResponse = selectingMarkdown.slice(0, endIndex);

  return buildStructuredPrompt({
    backgroundData: selectingMarkdown,
    examples: [
      // 1) Improve word choice
      'User: Improve word choice.\nbackgroundData: This is a <Selection>nice</Selection> person.\nOutput: great',

      // 2) Fix grammar
      'User: Fix grammar.\nbackgroundData: He <Selection>go</Selection> to school every day.\nOutput: goes',

      // 3) Make tone more polite
      'User: Make tone more polite.\nbackgroundData: <Selection>Give me</Selection> the report.\nOutput: Please provide',

      // 4) Make tone more confident
      'User: Make tone more confident.\nbackgroundData: I <Selection>think</Selection> this might work.\nOutput: believe',

      // 5) Simplify language
      'User: Simplify the language.\nbackgroundData: The results were <Selection>exceedingly</Selection> positive.\nOutput: very',

      // 6) Translate into French
      'User: Translate into French.\nbackgroundData: <Selection>Hello</Selection>\nOutput: Bonjour',

      // 7) Expand description
      'User: Expand the description.\nbackgroundData: The view was <Selection>beautiful</Selection>.\nOutput: breathtaking and full of vibrant colors',

      // 8) Make it sound more natural
      'User: Make it sound more natural.\nbackgroundData: She <Selection>did a party</Selection> yesterday.\nOutput: had a party',
    ],
    history: formatTextFromMessages(messages),
    outputFormatting: 'markdown',
    prefilledResponse,
    rules: dedent`
      - <Selection> contains the text segment selected by the user and allowed to be modified.
      - Your response will be directly concatenated with the prefilledResponse, so please make sure the result is smooth and coherent.
      - You may only edit the content inside <Selection> and must not reference or retain any external context.
      - The output must be text that can directly replace <Selection>.
      - Do not include the <Selection> tags or any surrounding text in the output.
      - Ensure the replacement is grammatically correct and reads naturally.
      - If the input is invalid or cannot be improved, return it unchanged.
    `,
    task: dedent`
      The following background data is user-provided text that contains one or more <Selection> tags marking the editable parts.
      You must only modify the text inside <Selection>.
      Your output should be a direct replacement for the selected text, without including any tags or surrounding content.
      Ensure the replacement is grammatically correct and fits naturally when substituted back into the original text.
    `,
  });
}

// ============================================================================
// REHAB-SPECIFIC AI PROMPTS
// ============================================================================

/**
 * Rehab-focused generate prompt with real estate renovation examples
 */
export function getRehabGeneratePrompt(
  editor: SlateEditor,
  {
    messages,
    projectContext,
  }: {
    messages: ChatMessage[];
    projectContext?: {
      projectName?: string;
      location?: string;
      investmentStrategy?: string;
      budget?: number;
      currentPhase?: string;
    };
  }
) {
  if (!isMultiBlocks(editor)) {
    addSelection(editor);
  }

  const selectingMarkdown = getMarkdownWithSelection(editor);
  const rehabContext = getRehabSystemContext(projectContext);

  return buildStructuredPrompt({
    backgroundData: selectingMarkdown,
    examples: [
      // Cost estimation
      'User: Estimate the cost for this renovation.\nBackground data:\nReplace kitchen cabinets - standard grade, 20 linear feet\nOutput:\nEstimated cost: $4,000 - $6,000\n- Cabinets (stock): $150-$200 per linear foot = $3,000-$4,000\n- Installation labor: $50-$100 per linear foot = $1,000-$2,000\n- Note: Premium or custom cabinets would increase cost 2-3x',

      // ROI analysis
      'User: How will this improvement impact ARV?\nBackground data:\nAdding a second full bathroom to a 3bed/1bath property.\nOutput:\n## ARV Impact Analysis\n\n**Estimated ARV Increase**: $15,000 - $25,000\n\n**ROI Calculation**:\n- Typical bathroom addition cost: $10,000-$15,000\n- Expected value add: $15,000-$25,000\n- Potential ROI: 50-100%\n\n**Market Considerations**:\n- 3bed/1bath to 3bed/2bath significantly improves marketability\n- Reduces days on market\n- Attracts larger buyer pool (families)',

      // Scope expansion
      'User: What related work might this renovation require?\nBackground data:\nReplacing the HVAC system\nOutput:\n## Related Work Items for HVAC Replacement\n\n**Likely Required**:\n- Electrical upgrade if adding capacity\n- Ductwork inspection/repair\n- Thermostat replacement\n- Permit fees\n\n**Potentially Required**:\n- Attic insulation upgrade (efficiency)\n- Vent/register replacement\n- Return air modifications\n- Gas line inspection\n\n**Consider Adding**:\n- Smart thermostat ($150-300)\n- Duct sealing for efficiency\n- Preventive maintenance plan',

      // Timeline suggestions
      'User: What is a realistic timeline for this work?\nBackground data:\nFull kitchen remodel including cabinets, countertops, flooring, and appliances\nOutput:\n## Realistic Timeline: Full Kitchen Remodel\n\n**Total Duration**: 4-6 weeks\n\n| Phase | Duration | Tasks |\n|-------|----------|-------|\n| Demo | 2-3 days | Remove cabinets, flooring, appliances |\n| Rough-in | 3-5 days | Electrical, plumbing updates |\n| Drywall | 2-3 days | Patch, texture, prime |\n| Cabinets | 2-3 days | Installation, leveling |\n| Countertops | 1-2 days | Template + install (may need 1 week lead time) |\n| Flooring | 2-3 days | Install LVP/tile |\n| Finish | 3-5 days | Backsplash, paint, fixtures |\n| Appliances | 1 day | Install and test |\n\n**Critical Path**: Countertop fabrication (7-10 day lead time after template)',

      // Vendor questions
      'User: What questions should I ask the contractor about this bid?\nBackground data:\nPlumbing bid for bathroom remodel: $3,500\nOutput:\n## Questions for Plumbing Contractor\n\n**Scope Clarification**:\n1. Does this include permit costs?\n2. Are fixture costs included or separate?\n3. Is demo and disposal included?\n\n**Quality & Warranty**:\n4. What brands/materials will you use?\n5. What warranty do you provide on labor?\n6. Are you licensed and insured? (verify)\n\n**Timeline & Logistics**:\n7. How long will the work take?\n8. Will water be shut off? For how long?\n9. Who will handle drywall patches after?\n\n**Payment Terms**:\n10. What is your payment schedule?\n11. Is there a discount for paying in full upfront?',

      // Budget variance
      'User: Analyze why we went over budget on this line item.\nBackground data:\nFlooring budget: $2,000\nActual spent: $3,200\nMaterial: LVP throughout main level\nOutput:\n## Budget Variance Analysis: Flooring\n\n**Variance**: $1,200 over (60% overage)\n\n**Likely Causes**:\n1. **Underestimated square footage** - Common in older homes with irregular layouts\n2. **Material upgrade** - May have chosen thicker/premium LVP\n3. **Subfloor issues** - Leveling or repairs not in original scope\n4. **Transition pieces** - Often underbudgeted\n5. **Waste factor** - Standard 10% may not have been included\n\n**Prevention for Next Project**:\n- Measure twice, add 15% waste factor\n- Get material costs locked before budgeting\n- Include $500 contingency for subfloor surprises\n- Price transitions and thresholds separately',
    ],
    history: formatTextFromMessages(messages),
    rules: dedent`
      ${rehabContext}
      
      - <Selection> is the text highlighted by the user.
      - backgroundData represents the user's current Markdown context.
      - Provide actionable, specific advice based on real estate renovation best practices.
      - Include cost estimates when relevant (use ranges to account for regional variation).
      - Consider ROI and investment strategy when making recommendations.
      - Be practical and focused on execution, not just theory.
      - CRITICAL: when writing Markdown or MDX, do NOT wrap output in code fences.
    `,
    task: dedent`
      You are an expert real estate renovation advisor helping an investor with their rehab project.
      Generate content based on the user's instructions, using the background data as context.
      Provide specific, actionable advice that considers cost, timeline, and ROI.
      Use your expertise in renovation cost estimation, contractor management, and investment strategy.
    `,
  });
}

/**
 * Prompt for estimating renovation costs
 */
export function getCostEstimatePrompt(
  { messages, scopeItem, location }: {
    messages: ChatMessage[];
    scopeItem: string;
    location?: string;
  }
) {
  return buildStructuredPrompt({
    backgroundData: scopeItem,
    examples: [
      'User: Estimate cost for replacing a roof.\nBackground data: 2,000 sq ft single-story home, asphalt shingles\nOutput:\n## Roof Replacement Estimate\n\n**Material + Labor Range**: $8,000 - $15,000\n\n| Component | Low | Mid | High |\n|-----------|-----|-----|------|\n| Shingles (architectural) | $3,000 | $4,500 | $6,000 |\n| Underlayment | $500 | $800 | $1,200 |\n| Labor | $3,500 | $5,000 | $6,500 |\n| Permits | $200 | $400 | $600 |\n| Dump fees | $300 | $500 | $700 |\n\n**Factors Affecting Cost**:\n- Roof complexity (valleys, dormers add 20-40%)\n- Deck condition (may need repairs)\n- Multiple layers to remove\n- Regional labor rates',
    ],
    history: formatTextFromMessages(messages),
    rules: dedent`
      You are a renovation cost estimation expert.
      ${location ? `Location context: ${location} (adjust estimates for this market)` : ''}
      
      - Provide realistic cost ranges (low/mid/high)
      - Break down costs by component
      - List factors that could affect the estimate
      - Include labor, materials, permits, and disposal
      - Use 2024 pricing as a baseline
    `,
    task: 'Provide a detailed cost estimate for the renovation scope item described.',
  });
}

/**
 * Prompt for analyzing contractor bids
 */
export function getBidAnalysisPrompt(
  { messages, bids }: {
    messages: ChatMessage[];
    bids: string;
  }
) {
  return buildStructuredPrompt({
    backgroundData: bids,
    examples: [
      'User: Analyze these bids and recommend the best option.\nBackground data:\nContractor A: $5,000, 2 weeks\nContractor B: $4,200, 3 weeks  \nContractor C: $6,500, 10 days\nOutput:\n## Bid Analysis\n\n| Contractor | Price | Timeline | Value Score |\n|------------|-------|----------|-------------|\n| A | $5,000 | 2 weeks | ⭐⭐⭐⭐ |\n| B | $4,200 | 3 weeks | ⭐⭐⭐ |\n| C | $6,500 | 10 days | ⭐⭐ |\n\n**Recommendation**: Contractor A offers the best value\n- 16% more than lowest bid but 1 week faster\n- Middle ground on price and timeline\n- If holding costs are $200/day, the week saved = $1,400 value\n\n**Questions to Ask Before Deciding**:\n- Why is B significantly cheaper? (red flag?)\n- Can A match B\'s price?\n- What\'s C\'s reputation? Premium may be worth it.',
    ],
    history: formatTextFromMessages(messages),
    rules: dedent`
      You are a contractor bid analysis expert.
      
      - Compare bids on price, timeline, and implied quality
      - Consider holding costs when evaluating timelines
      - Flag potential red flags (too cheap, too long)
      - Provide a clear recommendation with reasoning
      - Suggest negotiation strategies
    `,
    task: 'Analyze the contractor bids provided and recommend the best option with reasoning.',
  });
}
