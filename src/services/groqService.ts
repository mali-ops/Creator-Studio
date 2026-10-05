import { Groq } from 'groq-sdk';
import { AI_TOOLS } from '../types/tools.js';

export interface GenerationRequestParams {
  toolId: string;
  params: Record<string, any>;
  brandVoice?: {
    name: string;
    targetAudience?: string;
    personality?: string;
    tone?: string;
    keywords?: string[];
    forbiddenWords?: string[];
    exampleWriting?: string;
  };
  language?: string;
  temperature?: number;
  modelOverride?: string;
  mockFailure?: string;
}

export interface GenerationResult {
  content: string;
  modelUsed: string;
  provider: 'groq';
  executionMs: number;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  isMocked: boolean;
}

// Configurable in memory / env
let currentGroqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
let providerMode: 'live' | 'simulation' = process.env.GROQ_API_KEY ? 'live' : 'simulation';
let emergencyKillSwitch = false;

export function getGroqConfig() {
  return {
    activeModel: currentGroqModel,
    providerMode,
    apiKeyConfigured: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 5),
    emergencyKillSwitch,
  };
}

export function updateGroqConfig(updates: { activeModel?: string; providerMode?: 'live' | 'simulation'; emergencyKillSwitch?: boolean }) {
  if (updates.activeModel) currentGroqModel = updates.activeModel;
  if (updates.providerMode) providerMode = updates.providerMode;
  if (updates.emergencyKillSwitch !== undefined) emergencyKillSwitch = updates.emergencyKillSwitch;
  return getGroqConfig();
}

/**
 * Builds a structured, specialized system prompt incorporating brand voice, forbidden words, and guidelines.
 */
export function buildGroqPrompt(req: GenerationRequestParams): { system: string; user: string } {
  const tool = AI_TOOLS.find((t) => t.id === req.toolId);
  const baseSystemPrompt = tool ? tool.systemPrompt : 'You are an expert AI content creator.';

  let brandContext = '';
  if (req.brandVoice) {
    brandContext = `\n\n--- BRAND VOICE PROFILE: "${req.brandVoice.name}" ---
- Target Audience: ${req.brandVoice.targetAudience || 'General'}
- Personality: ${req.brandVoice.personality || 'Engaging and helpful'}
- Tone: ${req.brandVoice.tone || 'Professional'}
- Required Brand Keywords: ${(req.brandVoice.keywords || []).join(', ') || 'None'}
- FORBIDDEN WORDS (Strictly Avoid These): ${(req.brandVoice.forbiddenWords || []).join(', ') || 'None'}
${req.brandVoice.exampleWriting ? `- Writing Style Reference:\n"${req.brandVoice.exampleWriting}"` : ''}
Please ensure the output strictly embodies this brand identity and NEVER uses any of the forbidden words.`;
  }

  const lang = req.language || 'English';
  const system = `${baseSystemPrompt}
Output Language: ${lang}.
Important Formatting Instructions:
- Output clean, actionable, production-ready markdown without conversational chatter (e.g. do not say "Sure, here are your options:").
- Provide clear headings and structured sections.
${brandContext}`;

  let user = `Generate high quality content for tool: ${tool?.name || req.toolId}\n\n`;
  user += `User Input Parameters:\n`;
  for (const [key, value] of Object.entries(req.params)) {
    if (value !== undefined && value !== null && value !== '') {
      user += `- ${key}: ${value}\n`;
    }
  }

  return { system, user };
}

/**
 * Generates content using the official Groq SDK with fallback and error simulation capabilities.
 */
export async function generateWithGroq(req: GenerationRequestParams): Promise<GenerationResult> {
  const startTime = Date.now();

  if (emergencyKillSwitch) {
    throw new Error('AI Content Generation is currently disabled by administrator emergency kill-switch.');
  }

  // Handle mock failure testing if requested by admin
  if (req.mockFailure) {
    await new Promise((r) => setTimeout(r, 600));
    if (req.mockFailure === 'mock_rate_limit_429') {
      const err = new Error('Groq API Error: Rate limit reached (429 - TPM exceeded). Retry after 20s.');
      (err as any).statusCode = 429;
      throw err;
    }
    if (req.mockFailure === 'mock_server_error_500') {
      const err = new Error('Groq Provider Error: 500 Internal Server Error in model inference.');
      (err as any).statusCode = 500;
      throw err;
    }
    if (req.mockFailure === 'mock_timeout_504') {
      const err = new Error('Groq Provider Gateway Timeout (504): The model took longer than 30s to respond.');
      (err as any).statusCode = 504;
      throw err;
    }
  }

  const { system, user } = buildGroqPrompt(req);
  const modelToUse = req.modelOverride || currentGroqModel;

  const apiKey = process.env.GROQ_API_KEY;

  // Use official Groq SDK if configured and not explicitly forced to simulation
  if (apiKey && apiKey.length > 5 && providerMode === 'live') {
    try {
      const groq = new Groq({ apiKey });

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        model: modelToUse,
        temperature: req.temperature ?? 0.7,
        max_tokens: 2048,
      });

      const content = completion.choices[0]?.message?.content || 'No content generated.';
      const executionMs = Date.now() - startTime;

      return {
        content,
        modelUsed: modelToUse,
        provider: 'groq',
        executionMs,
        tokensUsed: {
          prompt: completion.usage?.prompt_tokens || 120,
          completion: completion.usage?.completion_tokens || 350,
          total: completion.usage?.total_tokens || 470,
        },
        isMocked: false,
      };
    } catch (error: any) {
      console.error('Groq SDK Call Failed:', error);
      throw new Error(`Groq API Error: ${error.message || 'Unknown provider error'}`);
    }
  }

  // High-fidelity fallback generation matching exact parameters when API key is not configured or in simulation mode
  await new Promise((r) => setTimeout(r, 750 + Math.random() * 400));
  const executionMs = Date.now() - startTime;
  const content = generateSimulatedGroqOutput(req.toolId, req.params, req.brandVoice);

  return {
    content,
    modelUsed: `${modelToUse} (Neural AI Engine)`,
    provider: 'groq',
    executionMs,
    tokensUsed: {
      prompt: 140,
      completion: 380,
      total: 520,
    },
    isMocked: true,
  };
}

/**
 * Generates realistic, domain-specific structured content matching the 16 tools
 */
function generateSimulatedGroqOutput(toolId: string, params: Record<string, any>, brandVoice?: any): string {
  const topic = params.topic || params.productService || params.offer || params.sourceContent || 'Modern Creator Strategy';
  const platform = params.platform || params.targetPlatform || 'Instagram';
  const tone = brandVoice?.tone || params.tone || 'Engaging';

  switch (toolId) {
    case 'caption_generator':
      return `### Option 1: Story-Driven & High Engagement
Stop scrolling if you've been feeling stuck on **${topic}**.

Most people think success in this area comes down to luck or endless grind. But after testing this for months, the reality is much simpler:

1. **Focus on high-leverage fundamentals first** — eliminate 80% of the noise.
2. **Standardize your daily execution** — momentum beats motivation every single time.
3. **Iterate in public** — your audience will tell you exactly what resonates.

The takeaway? Stop overcomplicating the blueprint. Consistency is your only real moat.

👇 **Question for you:** Which of these three is currently your biggest bottleneck? Drop a comment below!

#CreatorEconomy #ContentStrategy #GrowthMindset #DailyRoutine #ProductivityHacks

---

### Option 2: Punchy, Contrarian & Direct
Unpopular opinion: Everything you've been told about **${topic}** is outdated.

Here's what actually moves the needle in 2026:
• Less talking, more shipping.
• Data over emotional attachment.
• Clear systems over random bursts of energy.

Save this for your next planning session. 📌

#MindsetShift #SystemsThinking #Execution #FounderLife`;

    case 'hook_generator':
      return `### 5 Viral Hooks for "${topic}"

1. **The Contrarian Angle (High Curiosity)**
> *"95% of people are approaching ${topic} backwards. Here is the single shift that changed everything for me."*
*Why it works:* Directly challenges common wisdom and positions the viewer to avoid a shared mistake.

2. **The Relatable Pain Point**
> *"If you're exhausted from trying to figure out ${topic}, stop right now. Watch this 30-second breakdown before doing anything else."*
*Why it works:* Empathizes with fatigue and offers immediate relief.

3. **The Data / Numbered Proof**
> *"I tested 14 different methods for ${topic} so you don't have to. Only 2 actually delivered results."*
*Why it works:* Demonstrates extreme effort and compresses the learning curve into a bite-sized format.

4. **The Bold Warning / Stakes**
> *"Doing this one thing with ${topic} is costing you hours of lost progress every single week."*
*Why it works:* Leverages loss aversion and fear of missing out (FOMO).

5. **The Mystery Loop**
> *"There is a reason the top 1% never talk publicly about how they handle ${topic}..."*
*Why it works:* Opens an irresistible curiosity gap that viewer psychology compels them to close.`;

    case 'reel_script':
      return `### Reel Script: ${topic}
**Duration:** ${params.duration || '30 seconds'} | **Vibe:** ${tone}

| Timestamp | Camera & Visual Cue | Spoken Audio / Voiceover | On-Screen Text & SFX |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:03** | Close-up selfie camera, eye contact, slight lean into lens | *"If you're still doing this, you need to hear this right now."* | [TEXT: Stop doing this ❌] (Pop SFX) |
| **0:03 - 0:10** | Cut to fast screen-record demo / dynamic B-roll | *"Most people waste hours overthinking ${topic}. But here is the exact 3-step shortcut."* | [TEXT: The 3-Step Blueprint] |
| **0:10 - 0:20** | Split screen / rapid b-roll transition showing the solution | *"Step one: Audit your inputs. Step two: Automate the repeatable pieces. Step three: Review weekly."* | [TEXT: 1. Audit • 2. Automate • 3. Review] |
| **0:20 - 0:27** | Return to talking head, nod of encouragement | *"Do this for 7 days and watch your clarity multiply."* | [TEXT: Try for 7 days ✨] |
| **0:27 - 0:30** | Smile, point downwards to caption | *"I put the full breakdown and tools in the caption. Save this Reel before you forget!"* | [TEXT: Full breakdown in caption 📌] (Swoosh SFX) |`;

    case 'tiktok_script':
      return `### TikTok Viral Script: ${topic}
**Recommended Sound:** Low-fi trending acoustic background track (30% volume)

**[0:00 - 0:03] THE HOOK (Instant Visual Shock)**
*Visual:* Walk towards camera holding your phone with a surprised expression.
*Audio:* "Nobody is talking about what's actually happening with ${topic}, and honestly it's kind of wild."
*Text Sticker:* "Why is no one talking about this?! 🤯"

**[0:03 - 0:14] THE ESCALATION (Building Tension)**
*Visual:* Fast cuts showing the frustration / reality.
*Audio:* "For months, I kept hitting a wall thinking I was just doing it wrong. But then I looked at the actual numbers. Turns out, the common advice was missing the most important variable."

**[0:14 - 0:24] THE VALUE PAYOFF**
*Visual:* Pointing to green screen breakdown or handwritten notepad.
*Audio:* "Here's what you need to do instead: Cut out the secondary steps and double down on your core strength. When I made this one change, everything unlocked."

**[0:24 - 0:30] COMMENT-BAIT OUTRO**
*Audio:* "Has anyone else noticed this lately, or am I crazy? Let me know in the comments."`;

    case 'youtube_script':
      return `# Complete YouTube Video Script
## Title: How to Master ${topic} (The Blueprint Nobody Shares)
**Target Length:** ${params.videoLength || '8-12 minutes'}

---

### [0:00 - 0:45] SECTION 1: COLD OPEN & HOOK
*(Visual: High energy dynamic montage, fast cuts, punchy background synth)*
**Host (Voiceover):** "What if the biggest obstacle holding back your progress on ${topic} isn't your talent, your budget, or your work ethic... but one flawed assumption you've had from day one?"

*(Visual: Host seated in studio, cinematic shallow depth of field)*
**Host on Camera:** "In this video, I'm going to walk you through the exact end-to-end framework I used to solve this. No gatekeeping, no fluff. Let's get right into it."

---

### [0:45 - 3:00] CHAPTER 1: The Core Problem Nobody Acknowledges
**Key Points to deliver:**
- Why traditional approaches to ${topic} fail 90% of the time.
- The hidden tax of cognitive overload.
- [B-Roll Cue]: Animated graphic showing compound growth curve vs stagnation.

---

### [3:00 - 7:00] CHAPTER 2: The Step-by-Step Implementation Framework
1. **Foundation Phase:** Setting up the zero-friction environment.
2. **Execution Sprints:** Focusing strictly on measurable daily milestones.
3. **Feedback Loops:** How to measure progress without vanity metrics.

---

### [7:00 - 8:30] CHAPTER 3: Retention Re-Hook & Common Pitfalls
*(Visual: Graphic table highlighting DO's vs DONT's)*
**Host:** "Before you try this yourself, there's one critical mistake that ruins 80% of attempts in week two..."

---

### [8:30 - End] OUTRO & NEXT VIDEO CTA
"If this gave you value, smash the subscribe button. And if you want to see how to connect this with your workflow, watch this next video on screen right now."`;

    case 'youtube_title':
      return `### 10 YouTube Titles for "${topic}"

**Category: High Curiosity Gap (Top CTR)**
1. I Tried ${topic} for 30 Days (It Ruined My Routine)
2. The Truth About ${topic} Nobody Tells Beginners
3. Why 99% of People Fail at ${topic}

**Category: Search & SEO Optimized**
4. How to Master ${topic} in 2026 (Full Step-by-Step Guide)
5. ${topic} Explained Simply for Complete Beginners
6. The Only ${topic} Tutorial You Will Ever Need

**Category: Contrarian & Challenge**
7. Stop Doing ${topic} Like This (Do This Instead)
8. I Replaced My Entire Workflow with ${topic}
9. Is ${topic} Actually Worth Your Time in 2026?
10. The $0 vs $10,000 Approach to ${topic}`;

    case 'youtube_description':
      return `Everything you need to know about ${topic}. In this video, we break down the practical steps, tools, and strategies you need to know to get real results without wasting time.

👉 **Resources Mentioned in this Video:**
• Free Notion Template & Blueprint: https://example.com/resources
• Join our Creator Community Discord: https://discord.gg/example
• Follow along on Twitter/X: https://x.com/creatorstudio

⏰ **Timestamps & Chapters:**
0:00 - Why Most People Get ${topic} Wrong
1:18 - The Fundamental Shift
3:42 - My Exact Step-by-Step Process
6:15 - Avoiding the Costly Pitfalls
8:20 - Final Takeaways & Next Steps

#${topic.replace(/\s+/g, '')} #Productivity #CreatorEconomy #Tutorial2026`;

    case 'content_ideas':
      return `### 10 Content Angles & Weekly Brainstorm: "${topic}"

| # | Content Pillar | Angle / Hook Headline | Recommended Format |
| :- | :--- | :--- | :--- |
| **1** | Educational | "The 3 tools I use daily for ${topic} that save me 10 hours a week" | Carousel / PDF Guide |
| **2** | Contrarian | "Why following typical advice on ${topic} will hold you back" | X Thread / Short Video |
| **3** | Behind-the-Scenes | "How I set up my workflow for ${topic} from scratch" | Screen recording walkthrough |
| **4** | Case Study | "How one simple tweak to ${topic} resulted in a 3x boost" | LinkedIn Article / Long Post |
| **5** | Mistake Audit | "5 mistakes I made with ${topic} so you can skip the headache" | Multi-image carousel |
| **6** | Quick Tip | "A 60-second rule for ${topic} you can test today" | Instagram Reel / TikTok |
| **7** | Resource List | "My curated bookmarks for mastering ${topic} in 2026" | Twitter/X Listicle |
| **8** | Mindset | "The psychological barrier stopping you from starting on ${topic}" | Thought leadership essay |
| **9** | Q&A Breakdown | "Answering the top 3 questions I get asked about ${topic}" | Video response / AMA |
| **10** | Future Outlook | "Where ${topic} is heading over the next 18 months" | Deep dive newsletter |`;

    case 'hashtag_generator':
      return `### Tiered Hashtag Strategy for: "${topic}"

**Tier 1: High Reach / Broad Category (500k+ Posts)**
#ContentCreator #DigitalMarketing #Entrepreneurship #PersonalBrand #GrowthStrategy

**Tier 2: Targeted Niche (50k - 500k Posts)**
#SaaSMarketing #IndieHacker #ContentPlanning #SocialMediaTips #CopywritingTips #CreatorTools #BrandStrategy #FounderMindset #OnlineBusinessGrowth #WorkSmarter

**Tier 3: Micro & Community Specific (5k - 50k Posts)**
#CreatorStudio #SoloFounderLife #ContentRepurposing #AIToolsForCreators #ProductiveCreator #MarketingWorkflow #MicroSaaS #ModernMarketingTips #DirectResponse #NicheCreators

---
📋 **One-Click Copy (All 25 Tags):**
\`\`\`text
#ContentCreator #DigitalMarketing #Entrepreneurship #PersonalBrand #GrowthStrategy #SaaSMarketing #IndieHacker #ContentPlanning #SocialMediaTips #CopywritingTips #CreatorTools #BrandStrategy #FounderMindset #OnlineBusinessGrowth #WorkSmarter #CreatorStudio #SoloFounderLife #ContentRepurposing #AIToolsForCreators #ProductiveCreator #MarketingWorkflow #MicroSaaS #ModernMarketingTips #DirectResponse #NicheCreators
\`\`\``;

    case 'cta_generator':
      return `### 10 High-Converting Calls-To-Action

1. **Low Friction & Curiosity (Comments):**
   > *"Drop a 'READY' in the comments and I'll DM you the complete unreleased checklist for free."*

2. **Save for Future Action:**
   > *"Hit the save icon 📌 right now so you don't scramble to find this when you need it next week."*

3. **Community Validation / Question:**
   > *"What is your #1 take on this? Let's debate in the comments — I'm replying to everyone today."*

4. **Direct Bio Link:**
   > *"Click the link in my bio to get immediate access to the full template before it goes private."*

5. **Direct Message Trigger:**
   > *"Send me a DM with the word 'BLUEPRINT' and my team will send you the breakdown in 5 minutes."*

6. **Share with a Peer:**
   > *"Send this to a teammate who needs to hear this reminder before tomorrow morning."*

7. **Newsletter / Email Gate:**
   > *"I go 10x deeper on this in Thursday's private newsletter issue. Join 12,000+ creators at the link in bio."*

8. **Challenge Invitation:**
   > *"Try this for the next 48 hours and tag me in your results. You'll be amazed at the difference."*

9. **Action-Oriented B2B:**
   > *"Ready to scale your systems? Book a complimentary 15-minute audit through the link above."*

10. **Urgency & Exclusivity:**
    > *"We are closing access to the beta cohort this Friday. Claim your spot now while it's open."*`;

    case 'bio_generator':
      return `### 4 Profile Bios for "${topic}" (${platform})

**Option 1: Clean & Minimalist (High Authority)**
Building the future of ${topic} ⚡
Helping ambitious creators scale with systems, not burnout.
Featured in Forbes & TechCrunch.
👇 Grab the free toolkit:
[linkinbio.com/creator]
*(142 characters)*

---

**Option 2: Value & Credibility Focused**
Ex-Director turned Independent Creator.
Sharing tactical breakdowns on ${topic} every Tuesday & Friday.
120,000+ reads | $0 to $1M in lessons learned.
🚀 Get started here: [linkinbio.com/guide]
*(156 characters)*

---

**Option 3: Bulleted & Punchy**
• Practical advice on ${topic} 💡
• 10+ years scaling digital workflows 📈
• 15k+ readers on our weekly letter ✉️
👇 Join the free community:
[linkinbio.com/join]
*(138 characters)*

---

**Option 4: Conversational & Mission-Led**
On a mission to make ${topic} simple and stress-free for the next generation of builders.
Documenting the real behind-the-scenes journey.
Ready to level up? 👇
[linkinbio.com/start]
*(149 characters)*`;

    case 'carousel_generator':
      return `# Complete Carousel Outline: ${topic}
**Recommended Slides:** 7 Slides | **Format:** Square / Portrait (4:5)

---

### Slide 1: Cover Hook (Stop the Scroll)
- **Top Kicker:** THE 2026 BLUEPRINT
- **Headline (Large Bold):** Why Most People Fail at ${topic} (And How to Fix It)
- **Subheadline:** A 7-slide masterclass on avoiding the #1 mistake.
- **Design Cue:** Dark high-contrast background with glowing cyan accent marker. Swipe indicator arrow in bottom right.

---

### Slide 2: The Core Problem
- **Headline:** The Trap of Doing Too Much
- **Content:** When tackling ${topic}, beginner instinct is to add complexity. You sign up for 5 tools, build 10 spreadsheets, and burn out in 14 days.
- **Micro-Insight:** Subtraction is the true accelerator.

---

### Slide 3: Step 1 - Clarify the Single North Star
- **Headline:** 1. Focus on the Root Bottleneck
- **Content:** Identify the one variable that actually moves your metric. Strip away everything that doesn't feed directly into this milestone.

---

### Slide 4: Step 2 - Automate the Repetitive Pieces
- **Headline:** 2. Protect Your Creative Energy
- **Content:** Standardize templates, recurring tasks, and production schedules so your brain stays fresh for high-leverage execution.

---

### Slide 5: Step 3 - Measure Real Output Over Hours Spent
- **Headline:** 3. Track What Truly Matters
- **Content:** Hours worked is a vanity metric. Completed milestones shipped is the only truth that compounds over time.

---

### Slide 6: Summary & Quick Checklist
- **Headline:** Your 3-Point Action Plan:
  ✓ Audit your current bottlenecks
  ✓ Remove 2 non-essential steps today
  ✓ Execute your daily sprint before checking email

---

### Slide 7: Outro & Call To Action
- **Headline:** Found this breakdown helpful?
- **Action:**
  📌 Save this post for your next strategy session
  ↗️ Share with a friend who needs this reminder
  💬 Drop a comment with your biggest takeaway!`;

    case 'ad_copy_generator':
      return `### High-Converting Ad Copy Variations

#### Variation 1: The PAS Framework (Problem - Agitate - Solve)
**Primary Text:**
Are you tired of spending entire weekends struggling with ${topic}?

You know you should be focusing on growing your business and serving clients, but instead you're stuck putting out fires, fixing broken workflows, and guessing what works. It drains your time and stalls your revenue.

That's why we built the ultimate solution. With our streamlined system, you can cut manual overhead by 70% and get crystal-clear results starting on day one.

Join over 5,000+ operators who have transformed their workflow.

**Headline:** Stop Wasting Time on ${topic}
**Description:** Get real results in under 15 minutes a day.
**CTA Button:** Get Started Free

---

#### Variation 2: The AIDA Framework (Attention - Interest - Desire - Action)
**Primary Text:**
🔥 **Attention:** The game has changed for ${topic}.
Most businesses are still using 2022 tactics and wondering why their conversions dropped.

💡 **Interest:** Top performers have switched to an agile, automated engine that does the heavy lifting in seconds.

✨ **Desire:** Imagine having an entire week's worth of high-performing assets ready before your morning coffee cools down. No burnout. No guesswork. Just consistent growth.

👉 **Action:** Click below to claim your 14-day free trial — no credit card required.

**Headline:** The Smart Way to Handle ${topic}
**Description:** 14-Day Free Access • Instant Setup
**CTA Button:** Try It Free`;

    case 'product_description':
      return `# Product Description: ${params.productName || topic}

### The Headline
**The Ultimate Solution for Effortless, High-Performance Daily Results**

### The Narrative Hook
Let's be honest: life moves too fast to settle for products that break down, overpromise, or add unnecessary frustration to your day. Whether you're working from home or pushing your limits, you need gear designed with relentless intention and uncompromised quality.

### Why You'll Love It (Benefits Over Features)
- **Built for Uncompromising Durability:** Precision-crafted materials mean you purchase once and rely on it for years to come.
- **Ergonomic, Intuitive Comfort:** Designed around the natural rhythm of your daily routine, eliminating fatigue before it starts.
- **Effortless Aesthetics:** Sleek, modern lines that look gorgeous in any setting without drawing unwanted clutter.
- **Guaranteed Peace of Mind:** Backed by our 30-day risk-free guarantee and dedicated support.

### Technical Specifications
- **Materials:** High-grade aerospace-grade alloys and eco-certified finishes
- **Dimensions / Weight:** Lightweight, portable, and engineered to standard specs
- **Care Instructions:** Easy wipe-clean surface; water and scratch resistant

### The Guarantee
Try it for 30 days. If it doesn't noticeably upgrade your experience, send it back for a full, no-questions-asked refund.`;

    case 'storytelling_generator':
      return `### Narrative Arc: The Turning Point

Three years ago, I stared at my bank account on a rainy Tuesday morning and felt completely numb.

We had worked 80-hour weeks for six months straight. We sacrificed sleep, missed dinners with friends, and poured everything into ${topic}.

And the result? Almost total silence.

I remember calling a mentor, ready to surrender. I told him: *"I don't think I'm cut out for this. Maybe I should just take a safe job and walk away."*

He paused on the other end of the line, took a slow breath, and said something that permanently rewired my brain:

> *"You aren't failing because you lack effort. You're failing because you're fighting the wrong battle. Stop trying to prove you're smart. Start solving one painfully specific problem for five people."*

That afternoon, I deleted our 40-page deck. I reached out directly to 5 people who had the exact pain point we understood best. I didn't pitch them. I just listened.

Within 48 hours, 3 of them asked to pay us on the spot.

**The moral of the story?**
When you feel stuck, the answer is almost never "work harder on what's already failing." The answer is radical simplicity, honest listening, and courage to pivot before pride gets in the way.

If you're in the trenches right now: keep going. Your breakthrough is usually hiding right behind the assumption you're most afraid to drop.`;

    case 'content_repurposer':
      return `### Repurposed Content Package from Source Material

#### 1. LinkedIn Thought Leadership Post
${topic} isn't complicated when you break it down to first principles.

Here is the exact framework distilled from the source material:

→ **Phase 1: The Audit** — Strip away the non-essential steps that drain 80% of energy.
→ **Phase 2: The Core Lever** — Focus on the single variable that drives compounding momentum.
→ **Phase 3: The System** — Build a repeatable cadence you can sustain for 12 months, not 12 days.

What's the #1 lesson here? Stop optimizing the details before you've mastered the foundation.

Agree or disagree? Drop your thoughts below. 💬

---

#### 2. Viral X / Twitter 4-Post Thread
**1/4:** Most people overcomplicate ${topic}. Here is the 60-second masterclass distilled into 4 rules: 🧵👇

**2/4:** Rule #1: Momentum beats perfection every time. Ship before you feel 100% ready. Feedback from real humans is 10x more valuable than your private theories.

**3/4:** Rule #2: Standardize your daily inputs. If you have to make 20 micro-decisions before starting your work, your friction is too high. Automate the routine.

**4/4:** Rule #3: The best creators don't work 14 hours a day. They protect 3 hours of hyper-focused deep work and guard it ruthlessly. 

Bookmark this thread if you found it useful! 🔖

---

#### 3. 30-Second Short Video Voiceover
*(Fast-paced talking head + on-screen dynamic text)*
"If you only remember one thing about ${topic} this week, make it this: Stop waiting for motivation to strike. Build the system once, make execution effortless, and let consistency do the compounding for you. Save this for when you need a reset!"`;

    default:
      return `### Generated Content for: ${topic}
**Platform:** ${platform} | **Tone:** ${tone}

Here is your tailored content engineered for maximum engagement and clarity:

1. **Strategic Hook:** Crafting your narrative around ${topic} allows you to resonate deeply with your target audience.
2. **Core Insights:**
   - Eliminate friction points in your daily distribution.
   - Speak directly to the emotional and practical needs of your audience.
   - Maintain a cohesive, authentic voice across all touchpoints.
3. **Call To Action:** Join the conversation today and start applying these principles to your workflow!`;
  }
}
