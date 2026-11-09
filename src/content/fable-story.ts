import type { BlogEntry } from './blogs';

const faqs = [
  { question: 'How much does Claude Fable 5.2 cost?', answer: 'Standard API rates are $8 per million input tokens and $40 per million output tokens. Fast mode is $16 and $80 respectively. These are token rates, not a subscription price or guaranteed cost per completed task; tools, caching and reasoning usage also matter.' },
  { question: 'Is Claude Fable 5.2 better than GPT-6 Astra or Gemini 4 Carbon?', answer: 'It leads some reported evaluations, but there is no universal winner. Anthropic reports a higher FrontierCode 2.0 result for Fable 5.2 at Xhigh effort, while Zapier reports Gemini 4 Carbon ahead on AutomationBench. Compare the same benchmark, effort, tools and fallback policy before drawing a conclusion.' },
  { question: 'Should I replace my current coding model with Fable 5.2?', answer: 'Test a bounded set of representative tasks first. Compare accepted solutions, retries, total cost and completion time, and review the migration and retention requirements. An upgrade is useful when it improves your actual workload enough to justify its operational cost.' },
];

export const fableStory: BlogEntry = {
  slug: 'claude-fable-5-2-benchmarks-pricing-coding', number: '107',
  title: 'Claude Fable 5.2: Coding Benchmarks, Pricing and Upgrades',
  excerpt: 'Claude Fable 5.2 specs, API pricing, coding benchmarks and migration limits: what changed, where rivals lead, and how to decide whether to upgrade.',
  category: 'gaming', coverLabel: 'FABLE 5.2 / CODE & COST',
  isPreview: false, publishedOn: '2026-11-10', reviewedOn: '2026-11-10', readingTime: '12 min',
  keywords: ['Claude Fable 5.2', 'Fable 5.2 pricing', 'Fable 5.2 coding benchmarks', 'Fable 5.2 vs GPT-6 Astra', 'Fable 5.2 vs Gemini 4 Carbon', 'Claude Fable 5.2 migration'],
  cover: {
    src: '/blog-images/claude-fable-5-2-benchmarks-pricing-coding.webp',
    thumbnail: '/blog-images/claude-fable-5-2-benchmarks-pricing-coding-720.webp',
    width: 1200, height: 800,
    alt: 'Pixel-art 5.2 processor at a futuristic New York rooftop arcade with separate Code, Cost and Speed comparison displays',
    caption: 'AI-generated pixel-art editorial illustration. The processor and arcade displays are conceptual, not hardware specifications, a product screenshot or a measured ranking. Verified benchmark tables appear below.',
  },
  intro: 'Claude Fable 5.2 is available, with a 1M-token context window, lower standard token prices than Fable 5.1, and new coding and agent benchmarks to examine. Anthropic released it on 9 November 2026. The useful question is whether those changes justify replacing the model in your workflow. This guide separates documented specifications, vendor-reported results, independent evaluations and practical upgrade decisions. Sources were checked on 10 November 2026; I have not run a hands-on Fable 5.2 evaluation, and the examples below are teaching examples rather than private project results.',
  journalNote: 'Building AI features and web and mobile interfaces makes me interested in the gap between a benchmark score and a dependable product. For this release, I am looking at accepted code, failure recovery, cost and data boundaries. This is a sourced launch analysis, not an account of deploying Fable 5.2 in UltraFit360 or testing it against a private repository.',
  sections: [
    {
      id: 'what-is-fable-5-2', heading: 'What is Claude Fable 5.2 designed to do?',
      paragraphs: [
        'Anthropic positions Fable 5.2 for demanding reasoning and long-horizon agentic work. Think of a task with several dependent steps: understanding a codebase, planning a change, using tools and revising the result after feedback. That positioning describes the intended workload. It does not guarantee that an agent will finish any arbitrary repository change without supervision.',
        'An API model, the agent around it and an IDE assistant are different parts of the experience. The model proposes output or tool calls; the surrounding application decides which files it can read, which commands it can run and what counts as completion. A capable model inside a poorly constrained agent can still make an unsafe change. A careful agent can also fail because its tools or context are incomplete.',
        'That distinction is useful for frontend work. A screenshot can show whether a layout resembles a design, while a build checks a different property and an interaction test checks another. No model release removes the need to choose those checks. The best coding workflow gives the agent a clear task, bounded access and evidence it must collect before reporting success.',
      ],
      links: [{ label: 'Official Fable 5.2 model overview', href: 'https://platform.claude.com/docs/en/models/fable-5-2/overview' }],
    },
    {
      id: 'specifications', heading: 'Claude Fable 5.2 specifications at launch',
      paragraphs: [
        'The published context and output limits describe capacity, not a promise of perfect recall or a recommended request size. A large context can be useful when evidence is genuinely relevant. It can also contain stale requirements, duplicated code and contradictory instructions. The task is to supply the material needed to make a correct change, rather than fill the window because space is available.',
        'Parameter count and internal architecture are not disclosed in the sources reviewed. Fable 5.2 is not a downloadable local model. There is no verified consumer GPU or RAM requirement to list for running its weights yourself. Keep those fields unknown instead of borrowing speculative specifications from a rumor page.',
      ],
      table: { columns: ['Specification', 'Documented value'], rows: [
        ['Claude API model ID', 'claude-fable-5-2'],
        ['Context window', '1 million tokens'],
        ['Maximum output', '128K tokens'],
        ['Input and output', 'Text and images in; text out'],
        ['Thinking', 'Adaptive and always on'],
        ['API default effort', 'High'],
        ['Knowledge cutoff', 'June 2026'],
        ['Release date', '9 November 2026'],
      ] },
      links: [{ label: 'Official specifications and availability', href: 'https://platform.claude.com/docs/en/models/fable-5-2/overview' }],
    },
    {
      id: 'pricing', heading: 'Pricing: 20% lower token rates than Fable 5.1',
      paragraphs: [
        'The standard input and output rates each fall by 20% from Fable 5.1. That is arithmetic on the published rates, not a measured reduction in every application’s bill. Output volume, reasoning, repeated attempts, caching and tool charges can change the total. API rates also should not be described as the price of a Claude subscription.',
        'For a transparent fictional example, suppose a workload uses 100,000 uncached input tokens and 20,000 billed output tokens, with no extra tool charges. At standard Fable 5.2 rates that is $0.80 plus $0.80, or $1.60. The same token counts at Fable 5.1 rates cost $2.00. Fast-mode Fable 5.2 costs $3.20 for those counts. These are calculations, not observed runs or forecasts.',
        'The engineering decision is cost per accepted result. A cheaper attempt can become expensive if it needs repeated repairs. A more expensive attempt can be worthwhile if it reliably handles the task that the cheaper option cannot. Record the full attempt sequence and the acceptance decision, rather than comparing only the final successful API call.',
      ],
      table: { columns: ['Model or mode', 'Input USD / 1M tokens', 'Output USD / 1M tokens'], rows: [
        ['Fable 5.1 standard', '$10', '$50'],
        ['Fable 5.2 standard', '$8', '$40'],
        ['Fable 5.2 fast mode', '$16', '$80'],
        ['Opus 5.5 standard', '$4', '$20'],
        ['Sonnet 5.5 standard', '$2', '$10'],
      ] },
      links: [
        { label: 'Fable 5.2 pricing and changes', href: 'https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2' },
        { label: 'Fable 5.1 documented rates', href: 'https://platform.claude.com/docs/en/models/fable-5-1/overview' },
      ],
    },
    {
      id: 'coding-benchmarks', heading: 'Coding ranking: what FrontierCode 2.0 actually shows',
      paragraphs: [
        'The ranked table below reproduces a narrow comparison from Anthropic’s release report. It is not a ranking of overall intelligence, every coding assistant or the quality of a particular IDE. The effort labels are part of the result. Unless otherwise labelled, the announcement uses each model’s highest available effort; the Claude entries are reported with safeguards on.',
        'Fable 5.2 and Fable 5.1 are both explicitly labelled Xhigh in this comparison. Their difference is 16.7 percentage points. That is a difference on this evaluation under the published conditions, not a claim that every developer becomes 16.7% more productive. A score improvement and a person’s time saved are different measurements.',
        'A repository evaluation is more relevant to code changes than a generic trivia score, but you still need to understand the environment. Tool access, task selection, retry budget and grading determine what an agent can demonstrate. A patch that passes one suite might still miss a visual requirement, introduce a dependency problem or misunderstand a product constraint.',
      ],
      table: { columns: ['FrontierCode 2.0 comparison', 'Effort shown by source', 'Reported score'], rows: [
        ['Claude Fable 5.2', 'Xhigh', '49.1%'],
        ['Claude Opus 5.5', 'Highest available; see methodology', '45.5%'],
        ['GPT-6 Astra', 'Highest available; see methodology', '42.8%'],
        ['Gemini 4 Carbon', 'Medium', '41.1%'],
        ['Claude Fable 5.1', 'Xhigh', '32.4%'],
      ] },
      links: [{ label: 'Anthropic launch report and evaluation methodology link', href: 'https://www.anthropic.com/claude-fable-and-mythos-5-2' }],
    },
    {
      id: 'independent-evaluations', heading: 'Independent results: different tests produce different leaders',
      paragraphs: [
        'Zapier’s AutomationBench 1.0.6 report evaluates business workflows, with 657 tasks per effort setting. It reports Fable 5.2 at 51.4% at Max effort, behind Gemini 4 Carbon at 53.9% at High. The same report gives Fable 5.1 at 22.4% at Max. Its Fable 5.2 run uses default fallbacks; some comparison entries use different fallback policies. Those details prevent a clean model-only conclusion.',
        'Anthropic’s launch table lists a different Fable 5.1 AutomationBench baseline, 31.4%. Do not silently combine it with Zapier’s baseline to calculate one universal improvement figure. These are different reported comparisons, and I have not reproduced or reconciled their evaluation setups. Keep the source, benchmark version, effort and fallback conditions attached to every result.',
        'Vals AI’s separate High-effort evaluation reports Fable 5.2 at 71.31% on Vals Index v2.2, ranked first of 36 at the captured release snapshot. Its listed uncertainty is ±0.96. The same model page reports weaker results on HLAB-Vals-1.1 and Tax Agent Bench. An aggregate lead does not establish superiority on every component.',
        'The practical lesson is to ask what your application actually needs. A system that must finish a business workflow, produce a maintainable patch or answer a specialist question should be tested on that job. Combining unrelated percentages into one homemade “best AI” score would hide the distinctions the reader needs to choose well.',
      ],
      links: [
        { label: 'Zapier AutomationBench release report', href: 'https://zapier.com/benchmarks/claude-fable5_2-report' },
        { label: 'Vals AI model results and evaluation details', href: 'https://www.vals.ai/models/anthropic_claude-fable-5-2' },
      ],
      diagrams: [{
        id: 'comparison-contract', title: 'Read the benchmark label before the leaderboard', kind: 'flow',
        summary: 'A comparison needs enough context to explain what the score measures.',
        groups: [
          { label: 'Define the run', steps: [{ title: 'Task and version', detail: 'Name the benchmark and its exact release.' }, { title: 'Execution settings', detail: 'Record effort, tools, retries and fallback behavior.' }] },
          { label: 'Interpret the outcome', steps: [{ title: 'Accuracy and cost', detail: 'Keep the denominator and cost accounting visible.' }, { title: 'Your workload', detail: 'Check whether the tested task resembles your application.' }] },
        ],
        takeaway: 'Two percentages are comparable only to the extent their test conditions are comparable.',
        caption: 'Original explanatory diagram; it adds no benchmark scores or measured product results.',
      }],
    },
    {
      id: 'speed-and-effort', heading: 'Speed, effort and completed work are separate measurements',
      paragraphs: [
        'Anthropic claims up to 30% faster output than Fable 5.1 and up to 2.5 times faster token generation with optional fast mode. These are vendor claims about output generation, not a guarantee that a repository migration finishes at those multiples. Fast mode also carries premium rates, so a faster stream is not automatically the lower-cost option.',
        'For a coding task, total time includes understanding context, tool execution, waiting for builds, test failures and review. If an agent streams quickly but spends more attempts repairing its patch, the experience may be slower. Conversely, a longer first attempt can be useful when it produces a correct result that needs less supervision. Measure the complete job rather than a visually impressive typing speed.',
        'Effort is another variable to fix before comparison. An accidental change in reasoning depth can change both the bill and the quality of an answer. Keep the chosen effort in your experiment record and compare it with a suitable baseline. A chart that hides this setting turns a configurable system into an apparently fixed score.',
      ],
      links: [{ label: 'Anthropic’s speed and efficiency claims', href: 'https://www.anthropic.com/claude-fable-and-mythos-5-2' }],
    },
    {
      id: 'migration-checks', heading: 'Migration checks that matter more than changing a model name',
      paragraphs: [
        'Anthropic’s migration guide documents several compatibility boundaries. Earlier-turn edits can invalidate preserved thinking, older models cannot read Fable 5.2’s thinking blocks, and advisor configurations need a compatible model. Rate limits also need checking. A router that switches between models is handling state, not merely substituting a string.',
        'Review the supported request settings in the current guide rather than copying an older example unchanged. Always-on adaptive thinking, tool-choice restrictions and sampling controls affect the request contract. Treat an unsupported-parameter error as a configuration problem to investigate, not as proof that the model failed the task.',
        'There is also a data-handling decision: the documentation requires 30-day retention unless Anthropic expressly authorizes a zero-retention arrangement. A team handling private code or sensitive documents should settle that requirement before routing production input to the model. This article is not permission to change a workspace’s data policy or send private repository contents to a new provider.',
        'Migration instructions can vary by hosting platform and are updated independently of a blog. Use the linked guide for the exact model identifier, tool version and availability on your chosen platform. A successful request on one platform does not verify every other hosting option. Test the configuration you actually plan to operate.',
      ],
      links: [{ label: 'Official Fable 5.2 migration guide', href: 'https://platform.claude.com/docs/en/models/fable-5-2/migration-guide' }],
    },
    {
      id: 'coding-evaluation', heading: 'A coding evaluation you can run on your own work',
      paragraphs: [
        'Start with a small set of permitted, representative tasks and a fixed acceptance rule. For a React interface, one task could be a keyboard-accessible filter with an empty state. Another could be correcting a loading-state bug without changing the public API. These are invented examples, not tasks or incidents disclosed from UltraFit360’s private repositories.',
        'Give each candidate the same starting files, task description and allowed tools. Use isolated branches or temporary copies so one model cannot inherit another model’s solution. Keep the retry policy consistent and record every attempt. If a human supplies an extra hint, record it; hidden intervention makes an automated success rate misleading.',
        'Review the final diff as well as the tests. Does the solution preserve existing behavior? Did it expose a secret, remove a check or change an unrelated component? A build can pass even when the product behavior is wrong. For visual work, examine the rendered result at relevant widths and interact with it using the input methods the feature promises to support.',
        'The first experiment does not need a grand leaderboard. It needs a trustworthy record of what happened. If the model wins on one task and loses on another, keep that result. A useful conclusion might be to reserve it for difficult migrations while retaining a cheaper model for bounded extraction. The point is an evidence-based routing decision, not proving a favorite model right.',
      ],
      table: { columns: ['Evaluation field', 'What to record'], rows: [
        ['Configuration', 'Model ID, effort, tools, version and allowed context'],
        ['Acceptance', 'Task-specific tests and human review criteria chosen beforehand'],
        ['Reliability', 'Accepted results, failures, retries and additional human hints'],
        ['Cost', 'All attempts, billed token categories and tool charges'],
        ['Completion time', 'Full task duration, including builds, fixes and review'],
        ['Regression review', 'Behavior, scope, secrets, dependencies and visual checks'],
      ] },
      links: [
        { label: 'Related: evaluating AI agent tool calls', href: '/blogs/ai-agent-evaluations-tool-calls' },
        { label: 'Related: LLM token accounting and cost dashboards', href: '/blogs/llm-token-accounting-cost-dashboard' },
      ],
    },
    {
      id: 'upgrade-decision', heading: 'Should you upgrade to Fable 5.2?',
      paragraphs: [
        'There is enough evidence to justify evaluating it, particularly when a difficult reasoning or coding workload is not meeting its acceptance criteria. There is not enough evidence to say every developer should move every request to it. The price table alone shows why the cheaper alternatives still deserve a role; a benchmark lead does not erase a workload’s budget.',
        'My recommendation is to keep the existing baseline, test a bounded cohort and decide from accepted outcomes. If Fable 5.2 reduces expensive retries or succeeds on tasks your baseline cannot complete, it may earn its place. If it produces equivalent results at a higher total cost, the more practical decision may be to keep the current route. Retention and operational requirements can determine the answer before model quality does.',
        'First published 10 November 2026. This article uses documented launch information and attributed evaluation results. Benchmark rankings, availability and prices can change. Update the comparison when its sources change materially, and keep any future hands-on evaluation clearly separate from the launch analysis presented here.',
      ],
      diagrams: [{
        id: 'upgrade-gate', title: 'An upgrade needs a workload-level reason', kind: 'flow',
        summary: 'An illustrative decision process for a team evaluating a model change.',
        groups: [
          { label: 'Before testing', steps: [{ title: 'Check the boundary', detail: 'Confirm data policy, platform support and budget.' }, { title: 'Choose acceptance', detail: 'Select permitted tasks and a consistent retry policy.' }] },
          { label: 'Before adopting', steps: [{ title: 'Measure the job', detail: 'Compare correctness, total cost and completion time.' }, { title: 'Review and decide', detail: 'Adopt only where the observed result justifies the change.' }] },
        ],
        takeaway: 'The strongest model for your workflow is the one that meets its requirements with acceptable tradeoffs.',
        caption: 'Original decision diagram, not a claim that a production migration has been performed.',
      }],
    },
    { id: 'frequently-asked-questions', heading: 'Frequently asked questions', paragraphs: faqs.map(({question, answer}) => `${question} ${answer}`) },
  ],
  faqs,
  references: [
    { label: 'Anthropic: introducing Fable 5.2 and Mythos 5.2', href: 'https://www.anthropic.com/claude-fable-and-mythos-5-2' },
    { label: 'Official Fable 5.2 specifications', href: 'https://platform.claude.com/docs/en/models/fable-5-2/overview' },
    { label: 'Official pricing and release changes', href: 'https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2' },
    { label: 'Fable 5.1 specifications and rates', href: 'https://platform.claude.com/docs/en/models/fable-5-1/overview' },
    { label: 'Official migration guide', href: 'https://platform.claude.com/docs/en/models/fable-5-2/migration-guide' },
    { label: 'Zapier AutomationBench 1.0.6 results', href: 'https://zapier.com/benchmarks/claude-fable5_2-report' },
    { label: 'Vals AI: Fable 5.2 evaluation', href: 'https://www.vals.ai/models/anthropic_claude-fable-5-2' },
  ],
};
