import { ultraFitStories } from './ultrafit-stories';
import { aiCoachStory } from './ai-coach-story';
import { expoProductionStory } from './expo-production-story';
export const blogCategories = [
  { id: 'all', label: 'All entries' },
  { id: 'build', label: 'Build logs' },
  { id: 'ai', label: 'AI & tools' },
  { id: 'founder', label: 'Founder notes' },
  { id: 'london', label: 'London' },
  { id: 'gaming', label: 'Gaming & tech' },
] as const;
export type BlogCategory = Exclude<typeof blogCategories[number]['id'], 'all'>;
export interface BlogLink { label: string; href: string }
export interface BlogScreen {
  src: string; alt: string; width: number; height: number;
  originalSrc: string; originalLabel?: string;
  /** Display position within the 1200 × 800 illustration; screenshot bytes stay unchanged. */
  x: number; y: number; displayWidth: number; displayHeight: number;
  transform?: string;
}
export interface BlogImage {
  src: string; alt: string; width: number; height: number;
  caption?: string; thumbnail?: string; screens?: BlogScreen[];
}
export interface BlogSection {
  id: string; heading: string; paragraphs: string[];
  image?: BlogImage; note?: string; list?: string[];
  table?: { columns: string[]; rows: string[][] };
  code?: { label: string; text: string };
  links?: BlogLink[];
}
export interface BlogEntry {
  slug: string; number: string; title: string; excerpt: string;
  category: BlogCategory; readingTime: string; cover: BlogImage; coverLabel: string;
  featured?: boolean;
  /** Written articles remain excluded from indexing until author approval. */
  isPreview: boolean;
  reviewedOn: string; publishedOn?: string; keywords: string[];
  intro: string; journalNote: string; sections: BlogSection[]; references: BlogLink[];
}
const art = (name: string, alt: string, caption: string, cover = false): BlogImage => ({
  src: `/blog-images/${name}.webp`, width: 1200, height: 800, alt, caption,
  ...(cover ? { thumbnail: `/blog-images/${name}-720.webp` } : {}),
});
const dashboard = { originalLabel: 'dashboard', src: '/blog-images/ultrafit-dashboard-screen.webp', originalSrc: '/blog-images/ultrafit-dashboard-screen.webp', alt: 'Original UltraFit360 dashboard showing nutrition, macro totals, workout summary, and the bottom navigation', width: 1170, height: 2532 };
const metrics = { originalLabel: 'metrics', src: '/blog-images/ultrafit-metrics-screen.webp', originalSrc: '/blog-images/ultrafit-metrics-screen.webp', alt: 'Original UltraFit360 health metrics screen with basal calories, flights climbed, VO2 max, and heart-rate cards', width: 735, height: 1600 };
const figmaCover = art('figma-cover', 'Night City pixel-art design studio with a wireframe canvas beside website and mobile layouts', 'GPT-generated Night City illustration of the design-to-frontend workflow; the screens are conceptual artwork.', true);
const appCover: BlogImage = {
  ...art('ultrafit-cover', 'Pixel-art Night City workbench connecting requirements and wireframes to a phone displaying the original UltraFit360 app', 'Original UltraFit360 dashboard inside a GPT-generated pixel-art phone and city setting. The app screenshot is preserved as a separate image layer.', true),
  screens: [{ ...dashboard, x: 736, y: 91, displayWidth: 234, displayHeight: 524 }],
};
const appDetail: BlogImage = {
  ...art('ultrafit-detail', 'Two pixel-art phones in a neon studio showing the original UltraFit360 dashboard and health metrics interfaces', 'Original dashboard and metrics screenshots from the UltraFit360 project website assets, inside GPT-generated pixel-art phones. Screen contents are unchanged.'),
  screens: [
    { ...dashboard, x: 282, y: 133, displayWidth: 228, displayHeight: 484 },
    { ...metrics, x: 690, y: 133, displayWidth: 228, displayHeight: 484 },
  ],
};
export const blogEntries: BlogEntry[] = [
  {
    journalNote: "This entry follows how I turn manually designed Figma interfaces into web and mobile products, and why layout, interaction states and implementation need to inform each other.",
    slug: 'figma-to-frontend-web-mobile-workflow', number: '01',
    title: 'Figma to Frontend: How I Design for Web and Mobile',
    excerpt: 'My Figma-first workflow for React and React Native: wireframes, UI/UX, reusable components, glassmorphism, and where Figma Make fits.',
    category: 'build', readingTime: '8 min', cover: figmaCover, coverLabel: 'FIGMA → FRONTEND', isPreview: false,
    reviewedOn: '2026-11-01', publishedOn: '2026-11-01', keywords: ['Figma to React', 'Figma to React Native', 'wireframing', 'UI/UX design', 'Figma Make', 'glassmorphism'],
    intro: 'I designed and built the frontends for the UltraFit360 mobile app, the UltraFit360 website, and Aptixlabs. The work started in Figma and continued in React Native, React, HTML, and animation code, with MCP tools helping carry design context into development. That overlap between drawing the interface and making it behave is the part I enjoy most.',
    sections: [
      {
        id: 'before-the-polish', heading: 'I start with the job the screen has to do',
        paragraphs: [
          'A blank Figma frame is inviting. It is also an easy place to spend an hour choosing a shadow before deciding what the screen is for. For me, the useful starting question is much smaller: what should someone understand here, and what should they be able to do next?',
          'On a website, that might mean understanding the product and finding the next useful link. In a fitness app, it might mean reading today’s nutrition summary or recording an activity. Those are different tasks. They need different amounts of information, different navigation, and different expectations about how often someone returns.',
          'UI is the visible interface: type, controls, spacing, colour, and feedback. UX includes the journey around it: finding a feature, making a decision, recovering from an error, and knowing whether an action worked. A beautiful card still needs an understandable place in that journey. I want the wireframe to answer that before the styling does.',
        ],
      },
      {
        id: 'wireframes-first', heading: 'Wireframes make the awkward questions visible',
        paragraphs: [
          'My Figma-first process puts the arrangement on the canvas before it becomes frontend code. Low-fidelity wireframes are useful because a rectangle is cheap to move. I can put the primary action in a different place, group related information, or remove a competing section without first untangling component logic.',
          'A wireframe becomes much more useful when it includes realistic content. A heading that says “Title” hides line wrapping. A card with “123” hides the difference between a short number and a long label. I think about empty, loading, error, disabled, and populated states as part of the interface, even when the first sketch only shows the main path.',
          'For mobile, the keyboard and bottom navigation change the available space. For the web, a narrow viewport can change a multi-column composition into a reading order. I want the same information hierarchy to survive both. The desktop frame is one example of the layout, rather than a coordinate map to shrink onto every device.',
        ],
        list: ['Identify the main task and the next action.', 'Sketch the screen hierarchy and the route into and out of it.', 'Try long labels, missing data, and a smaller viewport.', 'Resolve the confusing parts before adding decorative effects.'],
      },
      {
        id: 'components-and-layout', heading: 'Components turn a collection of screens into a system',
        paragraphs: [
          'Repeated visual decisions deserve names. A primary button, a metric card, and a navigation item should not become slightly different designs every time they appear. The same applies in code: I want a small family of reusable components with clear states, rather than a folder of almost identical screens.',
          'Figma Auto Layout describes relationships such as direction, spacing, padding, and alignment. It helps a frame respond when its content changes. I think of it as a way to make the design explain itself: which region grows, which element keeps its intrinsic size, and which gap should remain consistent?',
          'Variables and component variants can record decisions such as a colour role or an interaction state. In implementation, those decisions need a deliberate home in tokens, props, and styles. There is no automatic one-to-one conversion from every Figma feature to every framework. A clean design file makes that translation easier to reason about.',
        ],
        links: [{ label: 'Figma’s Auto Layout guide', href: 'https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout-in-Figma' }],
      },
      {
        id: 'morphisms-with-a-purpose', heading: 'Glassmorphism, neumorphism, and the surface beneath the trend',
        paragraphs: [
          'I like expressive interfaces. This portfolio is a fairly obvious confession. But a visual style is useful only when it helps someone read the screen. The word “morphism” can make a straightforward design choice sound more mysterious than it is: how do the surfaces communicate grouping, depth, and interaction?',
          'Skeuomorphism borrows cues from physical objects. Flat design reduces those cues. Material-style systems use layers and motion to make relationships clearer. Neumorphism uses gentle highlights and shadows to suggest a surface being pressed or raised. Glassmorphism lets a background show through a translucent, often blurred layer. Claymorphism uses rounded, inflated forms with a soft three-dimensional feel. Each treatment changes what competes with the content.',
          'My practical test is simple: can I still identify the action, read the label, and tell which state it is in? If the answer depends on a faint shadow or one particular wallpaper, the surface needs more work. An effect should survive a less flattering background and an ordinary screen brightness setting.',
        ],
        table: { columns: ['Surface idea', 'Where it can help', 'What I watch for'], rows: [
          ['Flat / minimal', 'Dense information and clear hierarchy', 'Controls still need visible states'],
          ['Skeuomorphic', 'Familiar physical cues or playful controls', 'Decoration should not obscure meaning'],
          ['Neumorphic', 'A restrained tactile accent', 'Soft edges can hide affordances'],
          ['Claymorphic', 'Playful illustrations and dimensional accents', 'Volume should not compete with the task'],
          ['Glassmorphic', 'A floating layer over changing content', 'Contrast, overlap, and compositing cost'],
          ['Neobrutalist', 'A strong editorial or playful voice', 'Hierarchy and readability still matter'],
        ] },
        image: art('figma-details', 'Pixel-art desk with wireframe, dimensional, and glass-like interface cards', 'GPT-generated conceptual artwork exploring interface surfaces. These are design illustrations, not screenshots from Figma or UltraFit360.'),
      },
      {
        id: 'web-and-native', heading: 'The same design idea needs different web and native code',
        paragraphs: [
          'React and React Native share a component mindset, but a browser page and a native screen have different constraints. On the web I can use semantic HTML, CSS layout, real links, and browser focus behaviour. In React Native I am working with native views, platform navigation, safe areas, gestures, and a different text and layout environment.',
          'That changes the implementation questions. Does a website card become a link or contain a separate action? Does the mobile action remain reachable above the keyboard? Should motion explain a transition, acknowledge input, or simply stop? The Figma frame supplies intent; the runtime decides whether the interaction actually holds together.',
          'I approach animation the same way I approach a visual surface: give it a job. A transition can show that a panel expanded from a card. Feedback can acknowledge an action. If motion delays a simple task or makes text harder to read, it needs restraint. Reduced-motion preferences and keyboard access belong in that conversation too.',
        ],
        note: 'The details between the frames are frontend work: scrolling, focus, navigation, loading states, touch behaviour, and how the layout responds when the content changes.',
      },
      {
        id: 'where-figma-make-fits', heading: 'Where Figma Make fits into this workflow',
        paragraphs: [
          'Figma Make is Figma’s AI-driven prompt-to-app environment. It can use an existing design as context and turn an idea into an interactive prototype that can be iterated through conversation. That makes it useful for exploring how a proposed interface might feel once it responds to input.',
          'I see a clear place for that kind of exploration: test a navigation idea, compare a few interactions, or discover which part of a static composition feels awkward in motion. A functional prototype gives a discussion something concrete to react to. Its generated implementation still needs to be assessed against the actual project.',
          'My work on these projects is the Figma-first design and frontend implementation, supported by coding and MCP tools. Make adds another possible exploration path to that wider toolset. The manually designed file gives the visual decisions a home; the maintained application gives them working behaviour.',
        ],
        links: [{ label: 'Explore Figma Make', href: 'https://help.figma.com/hc/en-us/articles/31304412302231-Explore-Figma-Make' }],
      },
      {
        id: 'the-handoff-is-a-loop', heading: 'The handoff is a loop I can keep improving',
        paragraphs: [
          'Designing and coding the frontend myself makes the feedback loop unusually direct. A spacing decision that looked tidy in Figma might feel cramped with real text. A code component might reveal that two apparently different cards are the same pattern. Those are useful discoveries to bring back into the design.',
          'The workflow I want to keep is straightforward: understand the task, wireframe the hierarchy, define the repeated pieces, build a working slice, and compare the result at real sizes. Tools can reduce the effort of carrying information between those steps. The judgement about what belongs on the screen remains mine.',
          'The next two entries go deeper into that journey: first the UltraFit360 mobile frontend built from an SRS, then the Figma MCP connection that helps take hand-made wireframes into the IDE. Together they show the relationship between the design file, the codebase, and the interface someone finally uses.',
        ],
        links: [{ label: 'Read the UltraFit360 build story', href: '/blogs/ultrafit360-srs-to-react-native-app' }, { label: 'Read my Figma MCP workflow', href: '/blogs/figma-mcp-ide-design-to-code' }],
      },
    ],
    references: [{ label: 'Figma: Auto Layout', href: 'https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout-in-Figma' }, { label: 'Figma: Figma Make', href: 'https://help.figma.com/hc/en-us/articles/31304412302231-Explore-Figma-Make' }, { label: 'Selected frontend projects', href: '/projects' }],
  },
  {
    journalNote: "This entry documents the mobile frontend work behind UltraFit360: translating requirements into wireframes, reusable React Native screens and platform-specific navigation.",
    slug: 'ultrafit360-srs-to-react-native-app', number: '02',
    title: 'From SRS to App: Building UltraFit360 in React Native',
    excerpt: 'How I wireframed and coded the UltraFit360 mobile frontend from a requirements document, designing for Android, iOS, and glass-style layouts.',
    category: 'build', readingTime: '8 min', cover: appCover, coverLabel: 'SRS → FIGMA → APP', isPreview: false,
    reviewedOn: '2026-11-01', publishedOn: '2026-11-01', keywords: ['React Native app development', 'SRS to app', 'Figma wireframe', 'UltraFit360', 'iOS glass UI', 'Android UI'],
    intro: 'UltraFit360 started for me with an SRS: a software requirements specification. I took that starting point, wireframed the mobile experience in Figma, and built the React Native frontend for Android and iOS. This is the frontend side of that story: turning requirements into screens, reusable components, navigation, and layouts that have to work on a real phone.',
    sections: [
      {
        id: 'reading-the-srs-as-a-designer', heading: 'A requirements document is the beginning of the interface',
        paragraphs: [
          'An SRS can tell you what a product must support without showing you what a person should see first. That gap is where the design work starts. A requirement becomes much easier to build when I can connect it to a user task, the information needed for that task, and an observable result.',
          'For a fitness app, the interface can quickly become a wall of numbers. Nutrition, workouts, activity, and progress all matter, but they do not all need equal emphasis at every moment. The question is which information helps someone make the next decision, and which detail belongs one level deeper.',
          'I began with requirements and made the wireframes and frontend from there. The process asks for two kinds of translation: first from a product requirement into an interface, then from that interface into a working screen. The first step decides what needs to be clear. The second decides how to keep it clear when the app runs.',
        ],
      },
      {
        id: 'wireframing-the-product', heading: 'I translated the product into connected screens',
        paragraphs: [
          'The useful unit of a mobile design is often a flow. A home screen leads into a detail screen; an entry action opens an input path; saving returns the person to a state that reflects what changed. Drawing those connections in Figma makes the interface more than a set of attractive frames.',
          'The current app source includes onboarding, dashboard, workout, nutrition, coaching, profile, and metrics screens. That gives the frontend a lot of different jobs. A summary needs scanning speed, a logging screen needs low-friction input, and a detailed analysis needs enough space to explain itself.',
          'I think of the wireframes as a way to keep those jobs separate while preserving a shared visual language. Cards can look related without carrying identical content. Navigation can stay familiar while the depth of information changes. A consistent shell gives the user a stable reference point as the product becomes more capable.',
        ],
        list: ['Summary: what is happening today?', 'Detail: what contributes to that result?', 'Action: what can I record or change?', 'Feedback: did the action complete, and what should I do next?'],
      },
      {
        id: 'figma-decisions-in-the-code', heading: 'The Figma decisions have a home in the code',
        paragraphs: [
          'The React Native repository makes the connection to the design file visible. Welcome-screen spacing comments refer to Figma, shared controls carry design dimensions, and the footer navigation refers to Figma metadata and SVG assets. Those are concrete traces of the design-to-code process.',
          'The frontend is organised into screens, components, hooks, constants, and shared styles. That separation matters when the same visual idea appears across many routes. A reusable button should carry its behaviour and states with it; a screen should mostly explain how those pieces combine for a particular task.',
          'The checked-out project uses React Native with Expo and TypeScript, alongside React Navigation, safe-area utilities, SVG support, gradients, and animation libraries. That is the current repository snapshot. My focus here is how the frontend design becomes a maintainable interface within that stack.',
        ],
        image: appDetail,
      },
      {
        id: 'one-product-two-platforms', heading: 'Android and iOS share the product, but not every layout rule',
        paragraphs: [
          'A shared React Native codebase still has to account for physical differences between phones. The status bar, home indicator, software navigation buttons, keyboard, and available content height all influence where controls can safely sit. Copying the same bottom offset everywhere is an easy way to make a polished design feel broken.',
          'The current navigation demonstrates this directly. App.tsx sends the main dashboard, coach, metrics, and profile routes through NativeTabsLayout. That component uses react-native-bottom-tabs on iOS and supplies a custom SVG-based FooterNavigation on Android. The custom footer calculates Android bottom padding through a safe-area hook. The visual intention stays shared, while each path accounts for its platform.',
          'That is the sort of work I mean by building for both platforms. The primary action must stay reachable, the last row must be scrollable above persistent navigation, and the keyboard must allow the form to be finished. These are practical layout checks that a static mockup cannot settle on its own.',
        ],
        note: 'A fixed footer creates a second layout boundary. The content needs room above it, and the footer needs room above the system gesture or navigation area.',
      },
      {
        id: 'glass-with-clear-boundaries', heading: 'The iOS glass-layout problem is about contrast and boundaries',
        paragraphs: [
          'Glass-style navigation looks simple in a still image: a translucent surface floating above content. In a working interface, the background changes as the screen scrolls. Text, icons, shadows, and content beneath the bar all compete. The difficult part is keeping the controls readable while making the layer feel separate.',
          'The original dashboard screenshot shows the visual direction clearly: a floating rounded bottom bar over the app content. The active main-tab path in NativeTabsLayout uses the native TabView on iOS, enables translucency, and uses SF Symbols. On Android it supplies its own footer renderer. That platform split is a concrete implementation decision behind the shared design.',
          'The library uses native platform primitives, including SwiftUI’s TabView on iOS. Its current documentation describes iOS 26 Liquid Glass behaviour and notes that some tint properties behave differently there. Using a native shell means checking the operating system’s material and interaction rules as well as the colours drawn in Figma. The exact appearance still depends on the OS and app build.',
          'There are other surface treatments in the repository too. The custom footer has a translucent variant whose native-effect comments remain unfinished, and loading and workout-summary overlays use expo-blur. Those comments describe that custom component; they do not describe the active native iOS TabView. Expo’s separate GlassView API is another option for native glass surfaces on supported iOS versions. I keep these paths distinct when reasoning about the layout.',
        ],
        list: ['Check the bar over light, dark, and visually busy content.', 'Reserve enough scroll space so the final content stays visible.', 'Keep the selected item understandable without depending on transparency.', 'Test the fallback surface and larger text as deliberately as the effect.'],
        code: { label: 'Main-tab platform split — shortened from NativeTabsLayout.tsx', text: '<TabView\n  navigationState={{ index, routes }}\n  onIndexChange={handleIndexChange}\n  renderScene={renderScene}\n  translucent={true}\n  tabBar={Platform.OS === \'android\'\n    ? renderAndroidTabBar\n    : undefined}\n/>' },
        links: [{ label: 'React Native Bottom Tabs: native platform primitives', href: 'https://oss.callstack.com/react-native-bottom-tabs/docs/getting-started/introduction' }, { label: 'TabView and iOS material behaviour', href: 'https://oss.callstack.com/react-native-bottom-tabs/docs/guides/standalone-usage' }, { label: 'Expo’s native GlassEffect API', href: 'https://docs.expo.dev/versions/latest/sdk/glass-effect/' }],
      },
      {
        id: 'building-beyond-the-happy-path', heading: 'The frontend has to work between the ideal screenshots',
        paragraphs: [
          'A dashboard screenshot usually captures a populated state. The app also needs to handle the time before the data arrives, the case where nothing has been logged, and the point where something goes wrong. I think those states deserve the same layout attention as the most polished screen.',
          'For a data-heavy interface, the important distinction is between a real zero, unavailable information, and a calculation that is still loading. Those need different visual treatments. Clear labels and stable card dimensions make it easier to understand what the interface actually knows.',
          'The repository includes local and realtime hooks, query caching, health-data integration, and many domain-specific screens. Those systems give the frontend changing information to present. My role in this story is designing and coding the mobile frontend from the requirements, with the wider application providing the services those screens connect to.',
        ],
      },
      {
        id: 'what-i-take-forward', heading: 'What I take from the SRS-to-app process',
        paragraphs: [
          'The part I value most is the continuity. I could connect a requirement to a wireframe, a wireframe to a component, and a component to the screen it supports. That makes a design decision easier to explain and a frontend problem easier to locate.',
          'It also changes how I think about “from scratch”. The work includes deciding what belongs together, making the first visual structure, giving repeated patterns a reusable form, and handling the parts that only become obvious once the app runs. A coherent set of screens can keep evolving beyond the first screenshot that looks right.',
          'The broader Figma article explains the visual approach behind that work. The MCP entry goes into the bridge between the hand-made design file and the IDE: how structured design context can help implementation while leaving the design and review decisions with me.',
        ],
        links: [{ label: 'My Figma-first frontend workflow', href: '/blogs/figma-to-frontend-web-mobile-workflow' }, { label: 'Figma MCP in the IDE', href: '/blogs/figma-mcp-ide-design-to-code' }, { label: 'Explore UltraFit360', href: 'https://ultrafit360.com' }],
      },
    ],
    references: [{ label: 'UltraFit360: public product overview', href: 'https://ultrafit360.com/' }, { label: 'React Native Bottom Tabs: introduction', href: 'https://oss.callstack.com/react-native-bottom-tabs/docs/getting-started/introduction' }, { label: 'React Native Bottom Tabs: TabView', href: 'https://oss.callstack.com/react-native-bottom-tabs/docs/guides/standalone-usage' }, { label: 'Expo: GlassEffect', href: 'https://docs.expo.dev/versions/latest/sdk/glass-effect/' }],
  },
  {
    journalNote: "This entry looks at the design-to-code workflow I use with Figma MCP, including the context an IDE needs and the implementation decisions I still review myself.",
    slug: 'figma-mcp-ide-design-to-code', number: '03',
    title: 'Figma MCP in the IDE: My Design-to-Code Workflow',
    excerpt: 'From hand-made Figma wireframes to React and React Native: the MCP tools, design context, and review loop that make the IDE workflow useful.',
    category: 'ai', readingTime: '8 min',
    cover: art('mcp-cover', 'Two pixel-art monitors in a Night City apartment linking a design canvas to an IDE with a matching interface', 'GPT-generated illustration of a Figma-to-IDE connection. The design canvas and code are conceptual, not recorded tool output.', true),
    coverLabel: 'DESIGN CONTEXT → CODE', isPreview: false, reviewedOn: '2026-11-01', publishedOn: '2026-11-01',
    keywords: ['Figma MCP', 'Figma MCP server', 'Figma to code', 'IDE', 'Cursor', 'Claude Code', 'React Native', 'design context'],
    intro: 'I made the wireframes in Figma by hand. MCP helped bring that design context into the IDE while I coded the frontend. That is the useful part of the workflow for me: the design decisions already exist, and the coding tools have a better way to inspect them than trying to guess everything from a flat screenshot.',
    sections: [
      {
        id: 'what-mcp-connects', heading: 'What Figma MCP actually connects',
        paragraphs: [
          'MCP stands for Model Context Protocol. In this workflow, Figma exposes structured design information to a compatible coding client. The agent can inspect the selected design while working with the repository. Figma supplies context; the coding agent uses that context to help write an implementation.',
          'That division matters. A design can express a component, layout, variable, and visual reference. The application still has routes, existing components, data contracts, platform constraints, and accessibility requirements. Those need to be understood together before a generated change belongs in the project.',
          'I care about the connection because it keeps my hand-made design relevant during implementation. The more precisely the IDE can inspect what I drew, the less the conversation has to rely on me repeatedly describing the same spacing, grouping, and component intent in prose.',
        ],
        links: [{ label: 'Figma: what the server and agent each do', href: 'https://developers.figma.com/docs/figma-mcp-server/mcp-vs-agent/' }],
      },
      {
        id: 'prepare-the-design', heading: 'The design file is part of the prompt',
        paragraphs: [
          'A useful prompt starts before I type into the IDE. I want the design to have an understandable hierarchy. A repeated button should look like a repeated component in the file, and the distinction between a label, a value, and an action should be visible in the structure.',
          'Figma’s current guidance recommends meaningful layer names, reusable components, variables, Auto Layout, and annotations. That is good preparation for the human reading the file as well as the agent inspecting it. A name such as “NutritionSummary” carries more intent than “Group 47”.',
          'I also want the codebase context to be explicit. If the project already has a primary button, a screen container, and shared typography, they should be part of the task. Otherwise an apparently accurate screen can quietly introduce a second design system inside the same app.',
        ],
        image: art('mcp-detail', 'Pixel-art workbench with hand-drawn wireframes, reusable component tiles, and a laptop showing the resulting interface', 'GPT-generated conceptual illustration: hand-made wireframes, structured components, and implementation belong in the same workflow.'),
        links: [{ label: 'Figma: structure a file for better code', href: 'https://developers.figma.com/docs/figma-mcp-server/structure-figma-file/' }],
      },
      {
        id: 'the-tools-that-matter', heading: 'The Figma MCP tool names worth knowing',
        paragraphs: [
          'These are current official tool names, with short descriptions of their role. The tools exposed in a particular IDE depend on its integration and whether it uses the remote or desktop server. This is a reference to the documented capabilities; individual projects only need the tools relevant to their task.',
        ],
        table: { columns: ['Tool', 'What it provides'], rows: [
          ['get_metadata', 'A lightweight XML outline of the selection.'],
          ['get_design_context', 'Design context and code-oriented information for a layer or selection.'],
          ['get_screenshot', 'A visual reference of the selection.'],
          ['get_variable_defs', 'Variables and styles used by the selection.'],
          ['get_code_connect_map', 'Mappings from design instances to code components.'],
          ['add_code_connect_map', 'A mapping between a Figma component and a code component.'],
        ] },
        links: [{ label: 'Official tool index and prompts', href: 'https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/' }],
      },
      {
        id: 'a-prompt-that-has-boundaries', heading: 'Give the IDE a task it can finish and you can review',
        paragraphs: [
          '“Build my Figma” leaves too much open. I want the prompt to say which frame matters, which framework the project uses, which existing components to reuse, and what a successful result looks like. The task should be small enough that I can compare the result with the original design.',
          'The template below is an example of how I would frame a focused implementation task. Replace the bracketed details with the actual design link and repository paths. A client can choose its own tool sequence; what matters here is giving it an unambiguous task and a result that can be checked.',
        ],
        code: { label: 'Example IDE prompt', text: 'Implement [Figma frame URL] in this existing React Native app.\n\nInspect the frame structure, design context, variables, and screenshot.\nRead the existing screen, shared styles, and components before editing.\nReuse [screen container], [primary button], and the existing tokens.\n\nKeep the navigation and data contracts already in the repository.\nHandle safe areas, long labels, keyboard overlap, and loading states.\nDo not add a new UI library to reproduce a single frame.\n\nCompare the running screen with the Figma reference at target sizes.\nExplain any platform-specific differences and anything still unverified.' },
        note: 'A useful implementation target is often one screen region with clear boundaries. A small, reviewed result gives the next task a better starting point.',
      },
      {
        id: 'react-is-not-always-the-target', heading: 'Why React-looking context can still support React Native',
        paragraphs: [
          'Figma explains that get_design_context can return a React-and-Tailwind-like representation because it is a format models can interpret. That representation is design context rather than production-ready code. The target language, framework, and repository conventions still need to be specified.',
          'That distinction is particularly useful when moving between my website and mobile work. A browser div and a native View have different responsibilities. A CSS effect and a native material have different APIs. A mobile input has to behave with the operating system keyboard. Similar-looking designs can require meaningfully different implementation choices.',
          'For a React website, I would look for semantic elements, links, responsive CSS, and focus behaviour. For React Native, I would look for the project’s view and text components, safe-area handling, navigation patterns, and platform behaviour. Matching the screenshot and fitting the application both matter.',
        ],
        links: [{ label: 'Figma: why the server returns React-looking code', href: 'https://developers.figma.com/docs/figma-mcp-server/server-returning-web-code/' }],
      },
      {
        id: 'components-before-duplicates', heading: 'Code Connect helps the design point to real components',
        paragraphs: [
          'Code Connect can attach implementation details to design components so the agent has a stronger reference for reuse. Figma’s documentation describes design properties, imports, usage snippets, and instructions being included in the supplied context when the appropriate connections exist.',
          'I treat that as a useful option for a growing component system. Even without a mapping, the task can explicitly tell the agent where the existing component lives and which props it supports. The important goal is to keep one coherent family of controls as more screens are implemented.',
          'A component relationship also needs maintenance. If the code changes and the guidance stays stale, an agent can follow an outdated example very consistently. The design file, its documentation, and the implementation need to describe the same behaviour for the connection to stay useful.',
        ],
        links: [{ label: 'Figma: Code Connect integration', href: 'https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/' }],
      },
      {
        id: 'smaller-context-better-review', heading: 'When the output drifts, reduce the scope and compare',
        paragraphs: [
          'A large frame can contain far more context than the current change needs. Figma recommends smaller selections for heavy designs, with metadata inspection as a way to find the relevant part. That gives the implementation a tighter boundary and makes the result easier to inspect.',
          'My review questions are practical: is the reading order right, are the repeated gaps consistent, does the text wrap sensibly, and can I still reach the action on a smaller device? I also want to know whether the change reused the project’s components or quietly duplicated them. These checks connect visual fidelity to code quality.',
          'If the result is wrong, I want to identify the missing decision. The prompt might have omitted the platform, the design might not show an important state, or the codebase might already contain a pattern the agent did not inspect. Tightening that context gives the next pass a specific problem to solve.',
        ],
        links: [{ label: 'Figma: avoid large, heavy selections', href: 'https://developers.figma.com/docs/figma-mcp-server/avoid-large-frames/' }],
      },
      {
        id: 'what-to-connect-next', heading: 'Connect the tools; keep ownership of the result',
        paragraphs: [
          'Figma’s remote MCP endpoint is https://mcp.figma.com/mcp, with sign-in through the supported client workflow. The official setup page maintains the current client instructions. That is the place to check when connecting an IDE or choosing between remote and desktop integrations.',
          'The current toolset also extends beyond reading designs: remote capabilities include generate_figma_design for bringing live web UI into design layers, generate_diagram for FigJam, and send_code_to_figma for importing a local project. Availability varies. These are additional documented options in the wider workflow.',
          'For my frontend work, the central idea remains simple. I make the design, connect the relevant context to the IDE, build within the project’s constraints, and review the working interface. The useful shortcut is carrying information accurately between tools. The responsibility for deciding what belongs on the screen stays with me.',
        ],
        links: [{ label: 'Official remote-server setup', href: 'https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/' }, { label: 'See the UltraFit360 frontend case study', href: '/blogs/ultrafit360-srs-to-react-native-app' }, { label: 'Start with my Figma design workflow', href: '/blogs/figma-to-frontend-web-mobile-workflow' }],
      },
    ],
    references: [{ label: 'Figma MCP: tools and prompts', href: 'https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/' }, { label: 'Figma MCP: server and agent responsibilities', href: 'https://developers.figma.com/docs/figma-mcp-server/mcp-vs-agent/' }, { label: 'Figma MCP: file structure', href: 'https://developers.figma.com/docs/figma-mcp-server/structure-figma-file/' }, { label: 'Figma MCP: target framework', href: 'https://developers.figma.com/docs/figma-mcp-server/server-returning-web-code/' }, { label: 'Figma MCP: Code Connect', href: 'https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/' }, { label: 'Figma MCP: selection size', href: 'https://developers.figma.com/docs/figma-mcp-server/avoid-large-frames/' }, { label: 'Figma MCP: remote setup', href: 'https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/' }],
  },
  ...ultraFitStories,
  aiCoachStory,
  expoProductionStory,
];
export function categoryLabel(category: BlogCategory) { return blogCategories.find(item => item.id === category)?.label || category; }
export function blogPath(entry: BlogEntry) { return `/blogs/${entry.slug}`; }
export function findBlogEntry(slug: string) { return blogEntries.find(entry => entry.slug === slug); }
export function blogWordCount(entry: BlogEntry) {
  return [entry.intro, ...entry.sections.flatMap(section => [section.heading, ...section.paragraphs, ...(section.list || []), ...(section.table?.rows.flat() || []), section.note || ''])].join(' ').trim().split(/\s+/).length;
}
