export type ToolId =
  | 'caption_generator'
  | 'hook_generator'
  | 'reel_script'
  | 'tiktok_script'
  | 'youtube_script'
  | 'youtube_title'
  | 'youtube_description'
  | 'content_ideas'
  | 'hashtag_generator'
  | 'cta_generator'
  | 'bio_generator'
  | 'carousel_generator'
  | 'ad_copy_generator'
  | 'product_description'
  | 'storytelling_generator'
  | 'content_repurposer';

export interface ToolField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'chips' | 'number';
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: string;
  required?: boolean;
  helpText?: string;
  rows?: number;
}

export interface AIToolConfig {
  id: ToolId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  category: 'Social Media' | 'Video & Scripts' | 'Growth & Strategy' | 'Sales & Copy';
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'LinkedIn' | 'X' | 'Facebook' | 'Cross-Platform';
  creditCost: number;
  outputFormat: 'markdown' | 'variations' | 'script' | 'json';
  fields: ToolField[];
  systemPrompt: string;
}

export const AI_TOOLS: AIToolConfig[] = [
  {
    id: 'caption_generator',
    name: 'AI Caption Generator',
    tagline: 'High-engagement captions with hooks, body, and CTA variations',
    description: 'Generates scroll-stopping social media captions structured with a punchy hook, body copy, strategic hashtags, and conversion-focused call to action.',
    icon: 'MessageSquare',
    category: 'Social Media',
    platform: 'Cross-Platform',
    creditCost: 1,
    outputFormat: 'markdown',
    fields: [
      { name: 'topic', label: 'Post Topic or Core Message', type: 'textarea', placeholder: 'e.g., 5 lessons learned from failing our first product launch and turning it into $50k MRR', required: true, rows: 3 },
      { name: 'platform', label: 'Primary Platform', type: 'select', defaultValue: 'Instagram', options: [
        { label: 'Instagram', value: 'Instagram' },
        { label: 'LinkedIn', value: 'LinkedIn' },
        { label: 'Facebook', value: 'Facebook' },
        { label: 'Threads', value: 'Threads' },
        { label: 'X (Twitter)', value: 'X' },
      ]},
      { name: 'tone', label: 'Tone of Voice', type: 'select', defaultValue: 'Engaging & Authentic', options: [
        { label: 'Engaging & Authentic', value: 'Engaging & Authentic' },
        { label: 'Witty & Conversational', value: 'Witty & Conversational' },
        { label: 'Authoritative & Expert', value: 'Authoritative & Expert' },
        { label: 'Inspiring & Motivational', value: 'Inspiring & Motivational' },
        { label: 'Direct & Action-Oriented', value: 'Direct & Action-Oriented' },
      ]},
      { name: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Early-stage founders, B2B marketers, agency owners' },
      { name: 'length', label: 'Caption Length', type: 'select', defaultValue: 'Medium (150-250 words)', options: [
        { label: 'Short & Punchy (<100 words)', value: 'Short' },
        { label: 'Medium (150-250 words)', value: 'Medium' },
        { label: 'Long-Form Storytelling (300+ words)', value: 'Long' },
      ]},
      { name: 'callToAction', label: 'Desired Call To Action (CTA)', type: 'text', placeholder: 'e.g., Comment "GUIDE" to get the free checklist, Link in bio' },
    ],
    systemPrompt: `You are an elite social media copywriter. Generate 3 complete, distinct, and high-converting caption variations based on the user's inputs. Format clearly with Hook, Value Body, Call to Action, and relevant hashtags.`
  },
  {
    id: 'hook_generator',
    name: 'Viral Hook Generator',
    tagline: 'Catchy 3-second openers that stop the feed scroll instantly',
    description: 'Crafts 5 psychological hook styles (Curiosity, Contrarian, Question, Numbered/List, Bold Statement) engineered for viral retention.',
    icon: 'Sparkles',
    category: 'Growth & Strategy',
    platform: 'Cross-Platform',
    creditCost: 1,
    outputFormat: 'variations',
    fields: [
      { name: 'topic', label: 'Topic or Niche Angle', type: 'textarea', placeholder: 'e.g., How most people waste 3 hours a day on meaningless tasks instead of deep work', required: true, rows: 2 },
      { name: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Remote software engineers, college students, freelancers' },
      { name: 'contentFormat', label: 'Format Intended For', type: 'select', defaultValue: 'Reels / TikTok Video', options: [
        { label: 'Reels / TikTok Video', value: 'Reels / TikTok Video' },
        { label: 'LinkedIn Post Opener', value: 'LinkedIn Post Opener' },
        { label: 'X / Twitter Thread Hook', value: 'X / Twitter Thread Hook' },
        { label: 'YouTube Video Intro', value: 'YouTube Video Intro' },
      ]},
    ],
    systemPrompt: `You are an expert retention analyst and viral script doctor. Generate 5 distinct, high-impact hook variations categorized into: 1. Contrarian/Unpopular Opinion, 2. High Curiosity/Mystery, 3. Relatable Pain Point, 4. Data/Numbered Proof, 5. Bold Provocative Statement. Explain briefly why each hooks viewers.`
  },
  {
    id: 'reel_script',
    name: 'Instagram Reel Script Generator',
    tagline: 'Scene-by-scene Reel scripts with visuals, audio, and text overlays',
    description: 'Builds complete short-form video scripts structured into 15s, 30s, or 60s formats with visual instructions, spoken audio, and on-screen graphics.',
    icon: 'Clapperboard',
    category: 'Video & Scripts',
    platform: 'Instagram',
    creditCost: 1,
    outputFormat: 'script',
    fields: [
      { name: 'topic', label: 'Reel Topic / Concept', type: 'textarea', placeholder: 'e.g., 3 hidden AI tools that feel illegal to know for designers', required: true, rows: 2 },
      { name: 'duration', label: 'Target Duration', type: 'select', defaultValue: '30 seconds', options: [
        { label: '15 seconds (Micro-burst)', value: '15 seconds' },
        { label: '30 seconds (Sweet spot)', value: '30 seconds' },
        { label: '60 seconds (Deep breakdown)', value: '60 seconds' },
      ]},
      { name: 'style', label: 'Filming Style', type: 'select', defaultValue: 'Talking Head + B-Roll', options: [
        { label: 'Talking Head + B-Roll', value: 'Talking Head + B-Roll' },
        { label: 'Screen Recording / Demo Walkthrough', value: 'Screen Recording' },
        { label: 'Point of View (POV) / Skit', value: 'POV / Skit' },
        { label: 'Voiceover over Aesthetic Visuals', value: 'Voiceover Aesthetic' },
      ]},
      { name: 'keyTakeaway', label: 'Single Main Value / Action', type: 'text', placeholder: 'e.g., Save this Reel for your next Figma sprint' },
    ],
    systemPrompt: `You are a viral Instagram Reel director. Create a structured table/markdown script containing: [Timestamp] | [Visual Cue & Camera Angle] | [Spoken Audio / Voiceover] | [On-Screen Text & Sound Effects]. Ensure a sub-2-second hook and a fast-paced payout.`
  },
  {
    id: 'tiktok_script',
    name: 'TikTok Viral Script Generator',
    tagline: 'High-retention TikTok scripts with trending audio suggestions',
    description: 'Designed specifically for the TikTok algorithm: instant visual hooks, high emotional retention pacing, and sound/vibe recommendations.',
    icon: 'Flame',
    category: 'Video & Scripts',
    platform: 'TikTok',
    creditCost: 1,
    outputFormat: 'script',
    fields: [
      { name: 'topic', label: 'TikTok Video Concept', type: 'textarea', placeholder: 'e.g., Why 90% of students fail their driver test on the first try', required: true, rows: 2 },
      { name: 'vibe', label: 'Content Vibe', type: 'select', defaultValue: 'Storytime & Unfiltered', options: [
        { label: 'Storytime & Unfiltered', value: 'Storytime & Unfiltered' },
        { label: 'Fast Educational & Hacks', value: 'Fast Educational & Hacks' },
        { label: 'Humorous & Sarcastic', value: 'Humorous & Sarcastic' },
        { label: 'Relatable Day-in-the-Life', value: 'Relatable' },
      ]},
      { name: 'ctaType', label: 'Call To Action', type: 'text', placeholder: 'e.g., Tell me in the comments if this happened to you' },
    ],
    systemPrompt: `You are a seasoned TikTok growth architect. Write a complete TikTok script with [0-3s Visual Hook], [3-15s Retaining Tension], [15-30s The Reveal/Payoff], and [Comment-bait CTA]. Include sound suggestion and text sticker placement.`
  },
  {
    id: 'youtube_script',
    name: 'YouTube Long-Form Script Generator',
    tagline: 'Full-length video outlines and scripts with pacing markers',
    description: 'Generates comprehensive YouTube scripts including 30-second cold open, intro hook, core chapter breakdown, re-engagement pattern interrupts, and outro.',
    icon: 'Video',
    category: 'Video & Scripts',
    platform: 'YouTube',
    creditCost: 2,
    outputFormat: 'markdown',
    fields: [
      { name: 'topic', label: 'Video Title or Topic', type: 'textarea', placeholder: 'e.g., The Ultimate 2026 Guide to Building SaaS as a Solo Developer', required: true, rows: 2 },
      { name: 'videoLength', label: 'Estimated Video Duration', type: 'select', defaultValue: '8 to 12 minutes', options: [
        { label: '5 to 8 minutes', value: '5-8 mins' },
        { label: '8 to 12 minutes (Mid-roll optimal)', value: '8-12 mins' },
        { label: '15 to 20 minutes (In-depth masterclass)', value: '15-20 mins' },
      ]},
      { name: 'skillLevel', label: 'Viewer Knowledge Level', type: 'select', defaultValue: 'Beginner to Intermediate', options: [
        { label: 'Complete Beginner', value: 'Beginner' },
        { label: 'Beginner to Intermediate', value: 'Intermediate' },
        { label: 'Advanced Practitioners', value: 'Advanced' },
      ]},
      { name: 'mainChapters', label: 'Key Points / Chapters to Cover (Optional)', type: 'textarea', placeholder: 'e.g., Tech stack, finding your first 100 users, pricing models, failure pitfalls', rows: 2 },
    ],
    systemPrompt: `You are a top YouTube creator and script consultant. Write a high-retention YouTube script structured into: 1. Cold Open (First 15s), 2. Title Card / Value Proposition, 3. Chapter Breakdown with visual B-roll cues, 4. Mid-Video Retention Re-hook, 5. Powerful Outro directing to another video.`
  },
  {
    id: 'youtube_title',
    name: 'YouTube Title Generator',
    tagline: '10 High-CTR title variations ranked by psychology and SEO',
    description: 'Generates 10 YouTube video title options categorized into Curiosity, SEO-Ranked, Contrarian, Extreme Value, and Question-based styles.',
    icon: 'Heading',
    category: 'Growth & Strategy',
    platform: 'YouTube',
    creditCost: 1,
    outputFormat: 'variations',
    fields: [
      { name: 'topic', label: 'What is your video about?', type: 'textarea', placeholder: 'e.g., Testing 10 productivity apps for 30 days and throwing 8 in the trash', required: true, rows: 2 },
      { name: 'keywords', label: 'Primary Target Keyword (Optional)', type: 'text', placeholder: 'e.g., productivity apps, Notion vs Obsidian' },
      { name: 'channelNiche', label: 'Channel Niche', type: 'text', placeholder: 'e.g., Tech & Productivity, Solo Entrepreneurship' },
    ],
    systemPrompt: `Generate 10 viral YouTube titles for the provided topic under 60 characters each (optimized for mobile display). Group them into categories: Curiosity Gap, SEO Search-Optimized, Contrarian/Shock, and List/Challenge. Add an estimated CTR rationale for each.`
  },
  {
    id: 'youtube_description',
    name: 'YouTube SEO Description Generator',
    tagline: 'Search-optimized descriptions with timestamps, tags, and links',
    description: 'Creates YouTube video descriptions designed to rank in search and suggested feeds, with auto-formatted chapter timestamps, links block, and keywords.',
    icon: 'FileText',
    category: 'Video & Scripts',
    platform: 'YouTube',
    creditCost: 1,
    outputFormat: 'markdown',
    fields: [
      { name: 'title', label: 'Final Video Title', type: 'text', placeholder: 'e.g., I Built a $10k/Month App in 14 Days (Full Blueprint)', required: true },
      { name: 'summary', label: 'What happens in the video?', type: 'textarea', placeholder: 'Summarize the core story, steps, and tools mentioned...', rows: 3, required: true },
      { name: 'timestamps', label: 'Timestamps / Chapters (Optional)', type: 'textarea', placeholder: 'e.g., 0:00 Intro, 1:15 Ideation, 4:20 Coding the MVP, 8:40 Launch Day', rows: 2 },
      { name: 'linksToInclude', label: 'Links & Socials to Include', type: 'text', placeholder: 'e.g., Newsletter link, Twitter/X handle, Discord community' },
    ],
    systemPrompt: `You are a YouTube SEO engineer. Write a rich, search-optimized YouTube description. Include: 1. Compelling 2-sentence hook above the "Show More" fold, 2. Detailed video summary packed with natural keywords, 3. Formatted timestamps chapter list, 4. Resource links block, 5. 3 relevant hashtags.`
  },
  {
    id: 'content_ideas',
    name: 'Content Idea & Brainstorm Generator',
    tagline: '10 fresh content angles and 7-day posting themes',
    description: 'Unlocks endless inspiration with structured content pillars, trend hooks, and format suggestions tailored to your niche.',
    icon: 'Lightbulb',
    category: 'Growth & Strategy',
    platform: 'Cross-Platform',
    creditCost: 1,
    outputFormat: 'markdown',
    fields: [
      { name: 'niche', label: 'Your Niche / Industry', type: 'text', placeholder: 'e.g., B2B SaaS Growth, Personal Finance for Millennials, Plant-based Nutrition', required: true },
      { name: 'audiencePains', label: 'Audience Biggest Pain Points', type: 'textarea', placeholder: 'e.g., Not enough time, confused by confusing tax laws, overwhelmed by options', rows: 2 },
      { name: 'goal', label: 'Primary Goal for this Batch', type: 'select', defaultValue: 'Audience Growth & Virality', options: [
        { label: 'Audience Growth & Virality', value: 'Growth' },
        { label: 'Authority & Industry Trust', value: 'Authority' },
        { label: 'Lead Generation & Sales', value: 'Sales' },
        { label: 'High Community Engagement', value: 'Engagement' },
      ]},
    ],
    systemPrompt: `You are a senior social media content strategist. Brainstorm 10 unique, non-generic content ideas across 4 proven pillars: 1. Educational / How-To, 2. Contrarian / Hot Take, 3. Behind-the-Scenes / Proof, 4. Relatable / Story. Provide for each: Hook headline, Content format recommendation (e.g. Carousel, Reel, Text), and the core takeaway.`
  },
  {
    id: 'hashtag_generator',
    name: 'Tiered Hashtag Generator',
    tagline: 'Curated hashtag sets organized by reach tier for maximum discoverability',
    description: 'Generates 3 tiers of hashtags (Broad Reach, Niche Specific, and Community Focused) to avoid shadowbans and maximize algorithmic indexing.',
    icon: 'Hash',
    category: 'Social Media',
    platform: 'Cross-Platform',
    creditCost: 1,
    outputFormat: 'markdown',
    fields: [
      { name: 'topic', label: 'Post Topic or Image Subject', type: 'textarea', placeholder: 'e.g., Specialty coffee brewing guide using Aeropress at home', required: true, rows: 2 },
      { name: 'platform', label: 'Platform', type: 'select', defaultValue: 'Instagram', options: [
        { label: 'Instagram', value: 'Instagram' },
        { label: 'TikTok', value: 'TikTok' },
        { label: 'LinkedIn', value: 'LinkedIn' },
        { label: 'YouTube Shorts', value: 'YouTube' },
      ]},
      { name: 'location', label: 'Specific Target Location (Optional)', type: 'text', placeholder: 'e.g., Global, New York, London, Remote' },
    ],
    systemPrompt: `Generate an optimized hashtag strategy grouped into: 1. Mega/Broad Reach (500k+ posts, 5 tags), 2. Mid-Tier Niche (50k-500k posts, 10 tags), 3. Micro/Community Specific (5k-50k posts, 10 tags). Provide a clean one-click copy block of all 25 tags.`
  },
  {
    id: 'cta_generator',
    name: 'Call-To-Action (CTA) Generator',
    tagline: 'High-converting closing lines for captions, bio links, and end-screens',
    description: 'Generates 10 high-conversion CTAs categorized by conversion goal: comments, saves, shares, bio link clicks, and newsletter signups.',
    icon: 'MousePointerClick',
    category: 'Sales & Copy',
    platform: 'Cross-Platform',
    creditCost: 1,
    outputFormat: 'variations',
    fields: [
      { name: 'offer', label: 'What are you promoting or asking for?', type: 'textarea', placeholder: 'e.g., Free 10-page cheat sheet on prompt engineering, booking a 15-min discovery call', required: true, rows: 2 },
      { name: 'goal', label: 'Action Desired', type: 'select', defaultValue: 'Comment a trigger word', options: [
        { label: 'Comment a trigger word for DM automation', value: 'Comment Trigger' },
        { label: 'Click link in bio / website', value: 'Bio Link' },
        { label: 'Save post for later reference', value: 'Save Post' },
        { label: 'Share with a friend / colleague', value: 'Share' },
        { label: 'Direct Message (DM) to start conversation', value: 'Send DM' },
      ]},
      { name: 'tone', label: 'CTA Tone', type: 'select', defaultValue: 'Urgent yet natural', options: [
        { label: 'Urgent yet natural', value: 'Urgent' },
        { label: 'Low friction / Casual', value: 'Casual' },
        { label: 'Direct B2B Professional', value: 'Professional' },
      ]},
    ],
    systemPrompt: `You are a direct-response conversion specialist. Generate 10 magnetic CTAs tailored to the desired action. Include emotional triggers, clear instruction, and friction-reducing language.`
  },
  {
    id: 'bio_generator',
    name: 'Social Media Bio Generator',
    tagline: 'High-impact profile bios optimized for follower conversion',
    description: 'Creates 4 distinct profile bio styles (Punchy One-Liner, Value Credibility, Bulleted Persona, and Direct-Offer) respecting platform character limits.',
    icon: 'UserCheck',
    category: 'Social Media',
    platform: 'Cross-Platform',
    creditCost: 1,
    outputFormat: 'variations',
    fields: [
      { name: 'whoYouAre', label: 'Who are you and what do you do?', type: 'text', placeholder: 'e.g., Ex-Google PM helping solo founders scale to $10k MRR', required: true },
      { name: 'targetAudience', label: 'Who do you help?', type: 'text', placeholder: 'e.g., Aspiring indie hackers and bootstrap founders' },
      { name: 'credibility', label: 'Key Credibility / Proof Point', type: 'text', placeholder: 'e.g., Scaled 3 products to $1M+, Forbes 30u30' },
      { name: 'callToAction', label: 'Bio Link / Freebie', type: 'text', placeholder: 'e.g., Grab my free Founder OS template below' },
      { name: 'platform', label: 'Target Platform', type: 'select', defaultValue: 'Instagram (150 chars)', options: [
        { label: 'Instagram (150 chars limit)', value: 'Instagram' },
        { label: 'Twitter / X (160 chars limit)', value: 'X' },
        { label: 'LinkedIn Headline (220 chars)', value: 'LinkedIn' },
        { label: 'TikTok (80 chars limit)', value: 'TikTok' },
      ]},
    ],
    systemPrompt: `Write 4 distinct bio options for the specified platform: 1. Clean & Minimalist, 2. Value & Credibility Focused, 3. Emoji Bulleted Structure, 4. Conversational Story-Led. Strictly respect the platform character limit and display exact character count for each.`
  },
  {
    id: 'carousel_generator',
    name: 'Instagram & LinkedIn Carousel Generator',
    tagline: 'Slide-by-slide multi-frame layout with hook, slides, and recap',
    description: 'Structures an 8-slide educational or storytelling carousel with cover hook, swipe triggers, concise slide body points, and final save/share slide.',
    icon: 'Layers',
    category: 'Social Media',
    platform: 'Cross-Platform',
    creditCost: 2,
    outputFormat: 'markdown',
    fields: [
      { name: 'topic', label: 'Carousel Topic / Guide', type: 'textarea', placeholder: 'e.g., The 7 Golden Rules of High-Converting Landing Pages in 2026', required: true, rows: 2 },
      { name: 'targetPlatform', label: 'Platform Layout', type: 'select', defaultValue: 'LinkedIn PDF / Instagram Carousel', options: [
        { label: 'LinkedIn PDF Document (Professional)', value: 'LinkedIn' },
        { label: 'Instagram Multi-Image Carousel (Visual & Punchy)', value: 'Instagram' },
      ]},
      { name: 'numberOfSlides', label: 'Slide Count', type: 'select', defaultValue: '7 Slides', options: [
        { label: '5 Slides (Quick Bite)', value: '5 Slides' },
        { label: '7 Slides (Standard Guide)', value: '7 Slides' },
        { label: '10 Slides (Comprehensive Masterclass)', value: '10 Slides' },
      ]},
      { name: 'authorBrand', label: 'Author / Brand Tag (Footer)', type: 'text', placeholder: 'e.g., @sarahdev / sarahcodes.com' },
    ],
    systemPrompt: `You are an elite carousel content designer. Provide a complete slide-by-slide plan: Slide 1 (Cover Hook + Subheadline), Slides 2-(N-1) (One single clear idea per slide with Big Bold Header, 2-3 concise punchy sentences, and Visual Design Direction), and Final Slide (Summary checklist + Save & Share CTA).`
  },
  {
    id: 'ad_copy_generator',
    name: 'High-Converting Ad Copy Generator',
    tagline: 'Paid social ad variations in proven AIDA and PAS frameworks',
    description: 'Generates ad copy variations for Meta, Google, and LinkedIn ads structured around Attention-Interest-Desire-Action and Problem-Agitate-Solve models.',
    icon: 'Target',
    category: 'Sales & Copy',
    platform: 'Cross-Platform',
    creditCost: 1,
    outputFormat: 'markdown',
    fields: [
      { name: 'productService', label: 'Product or Service Being Advertised', type: 'textarea', placeholder: 'e.g., AI workflow automation tool for marketing agencies that saves 15 hours per client weekly', required: true, rows: 2 },
      { name: 'painPoint', label: 'Primary Pain Point Solved', type: 'text', placeholder: 'e.g., Drowning in repetitive manual reporting and missed deadlines' },
      { name: 'adPlatform', label: 'Ad Platform', type: 'select', defaultValue: 'Meta (Facebook & Instagram)', options: [
        { label: 'Meta (Facebook & Instagram)', value: 'Meta' },
        { label: 'Google Search / Performance Max', value: 'Google' },
        { label: 'LinkedIn Sponsored Content', value: 'LinkedIn' },
        { label: 'TikTok Spark Ads', value: 'TikTok' },
      ]},
      { name: 'offerDiscount', label: 'Special Offer / Angle', type: 'text', placeholder: 'e.g., 14-day free trial, no credit card required' },
    ],
    systemPrompt: `You are a world-class direct-response copywriter. Write 3 distinct ad copy variations: Variation 1 using the PAS (Problem, Agitate, Solve) framework; Variation 2 using the AIDA (Attention, Interest, Desire, Action) framework; Variation 3 using Social Proof / Customer Transformation. Include Primary Text, Headline (under 40 chars), and CTA button recommendation.`
  },
  {
    id: 'product_description',
    name: 'E-Commerce Product Description Generator',
    tagline: 'Feature-to-benefit descriptions that convert casual browsers into buyers',
    description: 'Transforms dry specifications into irresistible product narratives highlighting sensory details, customer benefits, and purchase triggers.',
    icon: 'ShoppingBag',
    category: 'Sales & Copy',
    platform: 'Cross-Platform',
    creditCost: 1,
    outputFormat: 'markdown',
    fields: [
      { name: 'productName', label: 'Product Name', type: 'text', placeholder: 'e.g., Aeroflow Ergonomic Standing Desk Mat', required: true },
      { name: 'features', label: 'Key Features & Materials', type: 'textarea', placeholder: 'e.g., High-density memory foam, waterproof vegan leather surface, anti-fatigue massage ridges, non-slip base', rows: 3, required: true },
      { name: 'targetCustomer', label: 'Target Customer Persona', type: 'text', placeholder: 'e.g., Remote professionals with chronic lower back stiffness' },
      { name: 'brandVibe', label: 'Brand Tone', type: 'select', defaultValue: 'Premium & Wellness Focused', options: [
        { label: 'Premium & Wellness Focused', value: 'Premium Wellness' },
        { label: 'Modern Minimalist & Tech', value: 'Modern Minimalist' },
        { label: 'Friendly, Warm & Approachable', value: 'Friendly Warm' },
        { label: 'Bold, Energetic & Performance', value: 'Bold Performance' },
      ]},
    ],
    systemPrompt: `You are an expert e-commerce copywriter. Write a high-converting product page description including: 1. Irresistible Headline, 2. Emotional Story/Problem Hook (Why this matters for your day), 3. Feature-to-Benefit Bullet Points (translating each spec into a tangible daily benefit), 4. Key Specifications Box, 5. Reassurance & Guarantee statement.`
  },
  {
    id: 'storytelling_generator',
    name: 'Brand Storytelling & Narrative Generator',
    tagline: 'Transform raw anecdotes into captivating narrative arcs',
    description: 'Turns personal reflections, business lessons, and case studies into compelling stories using the Hero\'s Journey and Before-After-Bridge frameworks.',
    icon: 'BookOpen',
    category: 'Growth & Strategy',
    platform: 'Cross-Platform',
    creditCost: 1,
    outputFormat: 'markdown',
    fields: [
      { name: 'coreIncident', label: 'The Raw Incident or Milestone', type: 'textarea', placeholder: 'e.g., We had $400 left in the company bank account 3 years ago and our lead investor backed out on a Friday afternoon', required: true, rows: 3 },
      { name: 'theTransformation', label: 'What Changed & The Lesson Learned', type: 'textarea', placeholder: 'e.g., We pre-sold 50 lifetime accounts over that weekend through honest emails, survived, and reached profitability', rows: 2, required: true },
      { name: 'framework', label: 'Storytelling Arc', type: 'select', defaultValue: 'Before - After - Bridge', options: [
        { label: 'Before - After - Bridge (Classic Transformation)', value: 'BAB' },
        { label: 'Hero\'s Journey (Struggle, Guide, Breakthrough)', value: 'HerosJourney' },
        { label: 'Vulnerable Confession to Triumphant Lesson', value: 'VulnerabilityLesson' },
      ]},
    ],
    systemPrompt: `You are a master storyteller for personal brands and founders. Craft an emotionally gripping narrative post. Maintain conversational pacing, authentic vulnerability, sharp sentence rhythm, and conclude with a universal business or life takeaway.`
  },
  {
    id: 'content_repurposer',
    name: 'Multi-Format Content Repurposer',
    tagline: 'Repurpose one piece of content into 5 platform-native formats',
    description: 'Takes existing text, articles, or transcripts and safely converts them into platform-specific LinkedIn posts, X threads, Reel scripts, or carousels.',
    icon: 'Repeat',
    category: 'Growth & Strategy',
    platform: 'Cross-Platform',
    creditCost: 2,
    outputFormat: 'markdown',
    fields: [
      { name: 'sourceContent', label: 'Paste Original Text or Transcript', type: 'textarea', placeholder: 'Paste your blog post, newsletter article, podcast excerpt, or customer case study...', required: true, rows: 5 },
      { name: 'targetFormat', label: 'Desired Repurposed Format', type: 'select', defaultValue: 'Long-form Blog to LinkedIn Thought Leadership Post', options: [
        { label: 'Blog / Article -> LinkedIn Thought Leadership Post', value: 'BlogToLinkedIn' },
        { label: 'Article -> 5-Tweet Viral X Thread', value: 'ArticleToXThread' },
        { label: 'Transcript / Notes -> 30s Short-Form Video Script', value: 'TranscriptToReel' },
        { label: 'Long Caption -> 6-Slide Carousel Summary', value: 'PostToCarousel' },
        { label: 'Full Conversion Pack (LinkedIn + X + Reel Script)', value: 'FullPack' },
      ]},
      { name: 'toneAdaptation', label: 'Tone Adjustment', type: 'select', defaultValue: 'Preserve Original Voice', options: [
        { label: 'Preserve Original Voice', value: 'Preserve' },
        { label: 'Make More Punchy & Direct', value: 'Punchy' },
        { label: 'Make More Professional & Data-Driven', value: 'Professional' },
      ]},
    ],
    systemPrompt: `You are an expert content repurposing engineer. Analyze the source text, extract the highest-value insights, and synthesize them natively into the target format. Never mention the phrase "here is the repurposed content"; directly output the polished, platform-ready asset.`
  },
];
