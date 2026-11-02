import type { BlogDiagram } from './blogs';

type Step = BlogDiagram['groups'][number]['steps'][number];
const step = (title: string, detail: string, tone?: Step['tone']): Step => ({ title, detail, tone });
const group = (label: string, ...steps: Step[]) => ({ label, steps });
const figure = (section: number, id: string, title: string, kind: BlogDiagram['kind'], summary: string, groups: BlogDiagram['groups'], takeaway: string, caption: string) => ({
  section, diagram: { id, title, kind, summary, groups, takeaway, caption },
});

// Public teaching models derived from the article's reasoning. No production
// schema, private endpoint, customer record or internal prompt is reproduced.
export const journalDiagrams: Record<string, { section: number; diagram: BlogDiagram }[]> = {
  'agent-evaluation': [figure(4, 'agent-replay', 'Evaluate the action path, not just the final sentence', 'flow',
    'An invented approval test runs the real decision process against controlled tool results.', [
      group('Replay boundary', step('User request + pending proposal', 'Preserve what “yes, add it” refers to.'), step('Real agent chooses tools', 'Check routing, arguments and read-before-write ordering.'), step('Fixture returns a result', 'Simulate committed, failed or ambiguous outcomes. No live account changes.')),
      group('Independent assertions', step('Action contract', 'A permitted target and required approval must precede a write.', 'good'), step('Reply contract', 'Describe only the result established by the fixture.', 'good'), step('Hard failure', 'An unauthorised write fails the test even when the prose sounds excellent.', 'warn')),
    ], 'Passing this replay does not prove database writes or frontend refreshes work. Those need integration checks.',
    'Read the replay column top to bottom, then check both contracts. The fixture boundary isolates tool effects; it does not replace the agent’s decisions.')],
  'memory-context': [figure(1, 'context-authority', 'Two sources, two responsibilities', 'compare',
    'Current application facts and generated interpretation should retain separate authority.', [
      group('Authoritative facts', step('Confirmed training days', 'Read from the application record that owns the preference.'), step('Latest valid measurement', 'Resolve the most recent relevant record, not a convenient older profile field.'), step('Timestamp and missing-value policy', 'Make freshness and fallback rules explicit.')),
      group('Derived interpretation', step('Conversation summary', 'Describe the user’s situation without becoming a replacement for current facts.'), step('Coverage window', 'Record which conversation period the summary represents.'), step('Conflict rule', 'An older summary must not silently overwrite a newer authoritative fact.', 'warn')),
    ], 'Use a model to interpret information; do not pay it to recopy facts that the application can assemble directly.',
    'Teaching model: the two columns are sources, not a claimed production database schema.'),
    figure(3, 'context-selection', 'Select context around the task', 'flow',
      'A smaller prompt is useful only when it preserves the constraints that affect the answer.', [
        group('Selection path', step('Identify the specialist', 'Workout and nutrition questions need different context.'), step('Retain required constraints', 'Keep relevant injury restrictions or dietary exclusions, even across categories.'), step('Attach relevant evidence', 'Add current facts and the necessary summary; omit unrelated history.')),
      ], 'Check answer quality and constraint coverage before calling fewer tokens an improvement.',
      'Conceptual request assembly. An injury or dietary example here is fictional and contains no customer information.')],
  'honest-actions': [figure(2, 'write-evidence', 'What the interface can safely claim', 'states',
    'Approval permits an attempt. A committed result is the evidence for a saved change.', [
      group('Transaction vocabulary', step('Proposed', '“Review this proposal.” No change has been saved.'), step('Approved', '“Applying your change.” Permission exists; success does not yet.', 'neutral'), step('Committed', '“Saved the specified change.” The operation established success.', 'good'), step('Failed or uncertain', 'State the failure, or check the outcome before claiming completion.', 'warn')),
    ], 'A well-worded confirmation is not a substitute for an enforced operation contract and a known result.',
    'These are distinct evidence states. An uncertain operation must be reconciled rather than blindly repeated.')],
  'missing-traces': [figure(3, 'telemetry-ownership', 'Own initialization; verify the connected trace', 'flow',
    'An illustrative startup lifecycle and a separate request-level verification path.', [
      group('Application startup', step('Establish logging deliberately', 'Check handlers rather than assuming later basic configuration will apply.'), step('Configure one provider owner', 'Let integrations attach without competing to replace the global provider.'), step('Instrument actual dependencies', 'Cover the HTTP client, async driver and model library the route uses.')),
      group('Synthetic request check', step('HTTP request span', 'Use a harmless labelled request with known start and end.'), step('Dependency + model spans', 'Verify shared context, including the exception path.'), step('Correlated log', 'Find the trace from the request’s log, not from an unrelated dashboard count.')),
    ], 'Logs arriving proves a logging path works. It does not prove request spans are emitted or connected.',
    'Conceptual lifecycle, not SDK-specific setup instructions. Exact initialization calls depend on the installed integrations.')],
  'token-accounting': [figure(2, 'usage-ledger', 'One task can contain several billable calls', 'schema',
    'A minimal fictional accounting model keeps task outcomes separate from per-call evidence.', [
      group('Logical task · one record', step('Task reference', 'Groups the initial attempt, tool rounds and retries.'), step('Completion outcome', 'Completed, failed, abandoned or unknown under a stated definition.'), step('Aggregate', 'Sum related call records without rebuilding usage from the final transcript.')),
      group('Model call · many records per task', step('Model + operation', 'Identify which provider call actually processed the input.'), step('Usage + source', 'Provider-reported, labelled estimate or unknown; unknown is not zero.'), step('Modality + outcome', 'Preserve text/image context and failed calls in the ledger.')),
    ], 'Compare usage per successful task as well as per call. A cheap failed attempt may increase the cost of completion.',
    'Illustrative record relationships, not UltraFit360’s private tables or a pricing formula. Provider billing rules still apply.')],
  'mcp-permissions': [figure(3, 'operation-access', 'A login is the start of the permission check', 'sequence',
    'Resolve business permissions when the operation runs, not only when the credential was issued.', [
      group('Operation-time checks', step('Identify the caller', 'Establish the authenticated identity.'), step('Resolve role and relationship', 'A pending invitation is not an accepted coaching relationship.'), step('Bound the visible records', 'Apply the permitted history window and resource scope.'), step('Enforce the operation', 'Reject unauthorised reads or writes even if a tool was visible to the model.', 'warn')),
    ], 'Tool discovery helps usability; the server must enforce access. Recheck relevant conditions before committing a change.',
    'A public teaching flow. It deliberately omits internal role names, payloads, identifiers and permission-query details.')],
  'query-cache': [figure(3, 'cache-identity', 'The response can be right while its cache address is wrong', 'compare',
    'The article’s independent JavaScript example shows how shared options can overwrite a local query key.', [
      group('Collision', step('Intended resource: meals', 'The local options start with the meals key.'), step('Shared object spread last', 'A shared workouts key replaces that local identity.', 'warn'), step('Wrong cache slot', 'A correct response is now associated with the wrong resource.')),
      group('Explicit resource identity', step('Shared freshness options first', 'Share stale time and retry behaviour without an accidental resource key.'), step('Resource key set last', 'Include the resource and relevant owner or scope.'), step('Matching invalidation', 'Mutations must invalidate the same identity model.', 'good')),
    ], 'Inspect the final assembled options. A longer cache lifetime cannot fix a resource-identity collision.',
    'Compare the two option-assembly paths with the code example above. Labels describe the generic reproduction, not private query keys.')],
  'theme-scope': [figure(3, 'token-boundaries', 'A CSS scope follows the DOM, not the React component tree', 'compare',
    'A portaled dialog can sit outside the ancestor that supplies workspace tokens.', [
      group('Scoped workspace', step('Workspace root', 'Defines the new meaning of its design tokens.'), step('Descendant components', 'Inherit the workspace palette while marketing keeps its own contract.'), step('Dialog content inside this scope', 'Receives those tokens when rendered under the intended DOM ancestor.', 'good')),
      group('Portal outside the scope', step('Document-level container', 'May inherit the page’s default palette instead.'), step('Same dialog component', 'React ownership alone does not restore CSS ancestry.', 'warn'), step('Explicit boundary', 'Use a scoped portal container or apply the intended theme at that boundary.')),
    ], 'Review dialogs, mobile menus and legacy utilities alongside the main page; a component screenshot misses these boundaries.',
    'DOM inheritance model, not a screenshot. The appropriate portal strategy depends on the dialog implementation.')],
  'react-seo': [figure(2, 'route-identity', 'One published route, one consistent URL identity', 'flow',
    'A content record should drive the URLs that readers, crawlers and metadata encounter.', [
      group('Published content', step('Route + article content', 'Choose the final public address and rendering path.'), step('Readable HTML response', 'Return the heading, body and actual links before client JavaScript runs.'), step('Consistent identity', 'Use the final address in navigation, canonical metadata, social URLs and the sitemap.')),
    ], 'A canonical is a preference signal. It does not manufacture a page or replace correct redirects and response codes.',
    'Conceptual publication path for the article’s React rendering approach.'),
    figure(4, 'response-routing', 'A page request and an asset request need different handlers', 'compare',
    'A catch-all app response must not turn missing pages or WebP URLs into successful HTML.', [
      group('Known published route', step('Request article', 'Return 200 with the article document and self-canonical.'), step('Old moved route', 'Redirect to the final public route with a permanent redirect.'), step('Unknown article', 'Return a genuine 404 and exclude it from the sitemap.', 'warn')),
      group('Static image', step('Request WebP path', 'Serve actual image bytes and the matching content type.'), step('Route isolation', 'Keep image URLs outside a forced article-rendering catch-all.'), step('Verify deployment', 'Check the real response, not just whether the file exists locally.', 'good')),
    ], 'Test the deployed article, missing slug and image URL separately. A 200 status alone is not a health check.',
    'Response contracts, not measured crawl results or a guarantee of indexing.')],
  'image-publishing': [figure(3, 'visual-publication', 'Give every visual a teaching job before giving it a filename', 'flow',
    'A useful image starts with the question the reader needs answered.', [
      group('Editorial decision', step('Choose the evidence', 'Use a real screen for interface behaviour, a diagram for a mechanism, or no image when text is clearer.'), step('Check semantic relevance', 'Can a reader say what the visual explains without relying on the brand logo?'), step('Keep claims honest', 'Label conceptual diagrams and invented examples; preserve genuine interface details.')),
      group('Publishing contract', step('One asset identity', 'Update article, card and social placements from the intended source.'), step('Accessible delivery', 'Use descriptive alt text, useful captions and reserved dimensions for raster artwork.'), step('Deployed-path audit', 'Verify MIME type, image bytes, responsive variants and the actual published URL.')),
    ], 'WebP makes an image deliverable. It cannot make an irrelevant screenshot informative.',
    'The editorial branch is deliberately separate from file delivery. Neither passing an asset check nor adding a product logo establishes relevance.')],
  'notification-race': [figure(1, 'claim-race', 'Two workers can both pass a read-before-write check', 'compare',
    'This ordering explains why a non-atomic throttle can allow duplicate work.', [
      group('Worker A', step('1 · Read eligibility', 'No existing claim is visible.'), step('3 · Decide to send', 'Its earlier read still looked clear.'), step('5 · Write the marker', 'The marker arrives after the decision.', 'warn')),
      group('Worker B', step('2 · Read eligibility', 'A has not written its marker yet.'), step('4 · Decide to send', 'B also considers the event eligible.'), step('6 · Write the marker', 'Both decisions have already passed.', 'warn')),
    ], 'Read the numbered steps across both workers. A later marker cannot retroactively make those decisions exclusive.',
    'Illustrative interleaving of two workers. The timing is explanatory, not a production trace.'),
    figure(2, 'claim-delivery', 'An atomic claim protects the decision boundary', 'flow',
    'The database resolves competing claims; external delivery remains a separate failure boundary.', [
      group('Claim outcome', step('Workers attempt the same unique claim', 'The event identity and calendar scope must match the intended policy.'), step('Only a returned claim may enqueue', 'A conflicting attempt does not create another queued send.', 'good'), step('Worker calls the delivery provider', 'Track attempts and decide what recovery means after an ambiguous response.')),
    ], 'One successful claim is not proof of exactly-once delivery. A crash after provider acceptance still needs an explicit recovery policy.',
    'Companion to the generic SQL above. This model does not claim all duplicate-notification causes were fixed.')],
  'database-migration': [figure(3, 'replication-boundary', 'Logical replication does not copy every kind of database state', 'compare',
    'Treat row transfer, schema compatibility and identifier state as separate checks.', [
      group('Replication path', step('Source PostgreSQL', 'Existing rows and subsequent row changes feed the configured replication path.'), step('Target PostgreSQL', 'Observe synchronisation progress and lag under the actual supported configuration.'), step('Application behaviour', 'Representative reads and writes must work on the destination.')),
      group('Separate verification', step('Schema and roles', 'Coordinate DDL, privileges, constraints and required extensions.'), step('Sequences', 'Verify the next generated identifier separately from copied row counts.', 'warn'), step('Real network caller', 'Test subscriber-to-source and application-to-target connectivity.')),
    ], 'Matching row counts alone does not prove the target can accept the next application write.',
    'Sanitised PostgreSQL teaching model. No hosts, cloud-account details, credentials or actual production schema are shown.'),
    figure(5, 'cutover-gates', 'Cutover is a sequence of evidence gates', 'sequence',
    'Agree on the owner and abort point before the migration window.', [
      group('Controlled transition', step('Rehearse and verify compatibility', 'Check supported features, roles, connectivity and representative product operations.'), step('Control source writers', 'Coordinate the final pause and establish the synchronisation evidence.'), step('Switch and verify', 'Validate application reads, writes and scheduled work on the target.'), step('Reassess rollback after new writes', 'Returning to the source now requires a plan for target-side changes.', 'warn')),
    ], 'Rollback is a data-consistency decision once new target writes exist, not just a connection-string toggle.',
    'A conceptual gate sequence, not a migration command list or an assertion of zero downtime.')],
  'photo-permissions': [figure(3, 'manifest-layers', 'The submitted native artifact is the result of several inputs', 'flow',
    'A working photo-picker interaction does not establish which permissions are declared in the installed build.', [
      group('Build inputs', step('Application configuration', 'Review the explicit declarations and intended user task.'), step('Plugins + dependency manifests', 'Inspect what generation and manifest merging add.'), step('Built native artifact', 'Verify the final declarations and the picker flow on the actual release path.')),
    ], 'Fix the source, regenerate, inspect and test. An over-the-air JavaScript update cannot remove a native manifest declaration.',
    'Build-layer model for the article’s permission issue, not a screenshot of the permission dialog or a policy guarantee.')],
  'first-schedule': [figure(1, 'first-occurrence', 'Seed the first event before relying on recurrence', 'flow',
    'A healthy worker cannot process a relationship whose next occurrence was never set.', [
      group('Creation path', step('Create or reactivate relationship', 'Resolve defaults deliberately; an explicit null may bypass a column default.'), step('Seed the first eligible occurrence', 'Apply the product’s timezone and same-day policy.'), step('Worker finds due work', 'After processing, calculate the next occurrence under the missed-event policy.')),
      group('Repair path', step('Find existing unseeded rows', 'Review the eligible set before backfill.'), step('Preserve valid clocks', 'An idempotent repair must not keep moving working schedules.'), step('Handle stale clocks deliberately', 'Choose whether to catch up or jump to a future occurrence; do not let restart frequency decide.')),
    ], '“Worker healthy” and “work eligible” are separate states. Test the first occurrence independently of later repeats.',
    'Generic lifecycle, not a repair instruction for a live database. No real schedules or account records are included.')],
  'dashboard-states': [figure(1, 'interface-evidence', 'Render the state the interface actually knows', 'states',
    'These compact wireframe specifications describe evidence and actions, rather than pretending to be product screenshots.', [
      group('View-state contract', step('Loading first result', 'Show progress without asserting that records are absent.'), step('Successful empty result', 'Explain first use or a restrictive filter; offer create or reset.'), step('Initial load failed', 'The data is unknown. Offer retry rather than an empty-state claim.', 'warn'), step('Refresh failed; old result exists', 'Keep safe context, label it as stale and offer retry.')),
    ], 'Do not make a network error look like deleted data. Whether stale records remain safe depends on the action.',
    'Conceptual state cards, not UltraFit360 screens. The table above separates first-use empty from filtered empty in more detail.')],
  'activation-metrics': [figure(2, 'event-provenance', 'Count the person’s action, not the system’s output', 'compare',
    'Different event origins answer different business questions.', [
      group('Possible activation evidence', step('Person saves a meal', 'A deliberate core task, under the chosen activation definition.'), step('Person completes a workout', 'Another explicit product action; track it as a defined milestone.'), step('Person asks the coach', 'Count user-authored turns when measuring people seeking help.')),
      group('Different evidence', step('Automatic setup record', 'Proves the system created initial data, not that the person returned.', 'warn'), step('Assistant reply', 'Measures generated output, not another user-authored turn.'), step('Device sync', 'May prove a process ran; it does not by itself prove intentional feature use.')),
    ], 'Keep event origin and cohort windows visible. A rising record count can be automation rather than stronger adoption.',
    'Fictional event examples. No conversion rates, customer activity or measured product outcomes are implied.')],
  // These two articles already explain the decisions with focused comparison
  // tables. Do not add a diagram just to satisfy a picture-per-post quota.
  'lifecycle-restraint': [],
  'reversible-startup': [],
  'read-only-ai': [figure(4, 'human-decision', 'Separate the brief from the action', 'sequence',
    'An illustrative design boundary for a read-only assistant; the article distinguishes proposals from shipped features.', [
      group('Decision support', step('Rules identify attention signals', 'Use inspectable conditions such as an overdue task.'), step('Model explains relevant evidence', 'Summarise known facts and expose missing or stale inputs.'), step('Human chooses the response', 'Reading a brief does not authorise a client-facing message or plan edit.'), step('Application enforces any later action', 'A separate authorised operation must establish what was actually committed.', 'warn')),
    ], 'A model asking another model for confirmation is not an independent human approval boundary.',
    'Conceptual design flow, not a claim that every morning-brief rule or scheduled process is deployed.')],
  'seo-outcomes': [figure(4, 'discovery-outcomes', 'Keep the discovery and enquiry stages distinct', 'funnel',
    'Each transition needs its own evidence and can fail for a different reason.', [
      group('Measurement chain · not a volume chart', step('Indexed page', 'The URL is eligible to appear. This does not establish demand.'), step('Relevant impression → click', 'Interpret query fit, position, country and device before judging CTR.'), step('Contact attempt → saved enquiry', 'A CTA click or opened email client does not establish a successful submission.'), step('Qualified enquiry', 'Audience fit and business relevance require a separate assessment.')),
    ], 'Find the weakest meaningful transition instead of treating more indexed URLs as the same thing as business growth.',
    'Conceptual measurement chain with no invented traffic, conversion rate or revenue attribution.')],
};
