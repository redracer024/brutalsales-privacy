import OpenAI from 'openai';
import { showRewriteInterstitial } from '@/utils/admob';
import { ToneType, ToneInstructions, TONE_TYPES, isValidTone } from '@/utils/types';

// Initialize OpenAI client with DeepSeek configuration
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY,
});

interface RewriteRequest {
  originalText: string;
  tone?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as RewriteRequest;
    const { originalText, tone = 'professional' } = body;

    if (!originalText?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Original text is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Show interstitial ad before generating response
    await showRewriteInterstitial();

    const toneInstructions: ToneInstructions = {
      professional: 'Rewrite in a professional, business-appropriate tone. Use formal language, focus on quality and reliability, maintain credibility, and emphasize value proposition. Include trust signals and professional guarantees.',
      friendly: 'Rewrite in a warm, friendly, and approachable tone. Use conversational language, create a personal connection with the reader, and make it feel like a recommendation from a trusted friend.',
      energetic: 'Rewrite with high energy and excitement. Use dynamic language, action words, create enthusiasm about the product, and include urgency. Use caps strategically and power words.',
      humor: 'Rewrite with appropriate humor and wit. Keep it light-hearted while still being informative and engaging. Use clever wordplay and funny comparisons, but maintain respect for the product.'
    };

    // Ensure tone is a valid ToneType
    const validTone = isValidTone(tone) ? tone : 'professional';

    try {
      // DeepSeek API integration
      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a professional copywriter specializing in rewriting product descriptions for online marketplaces. ${toneInstructions[validTone]}

IMPORTANT FORMATTING RULES:
- Always maintain the core product information
- Use emojis strategically and appropriately for the tone
- Create clear sections and structure
- Keep the same approximate length or make it slightly longer
- Include a professional closing line
- Make it more engaging and conversion-focused than the original
- Ensure the tone is consistent throughout

Your goal is to transform the writing style while preserving all important details.`
          },
          {
            role: 'user',
            content: `Please rewrite the following product description with a ${validTone} tone:

Original text:
"${originalText}"

Requirements:
- Maintain all important product information
- Transform the tone to be ${validTone}
- Use appropriate emojis and formatting
- Make it more engaging and conversion-focused
- Keep the same approximate length or make it slightly longer
- Add a professional closing line that matches the ${validTone} tone
- Ensure the rewrite feels natural and authentic`
          }
        ],
        max_tokens: 1200,
        temperature: 0.8,
        top_p: 0.9,
      });

      const rewrittenText = completion.choices[0]?.message?.content;

      if (!rewrittenText) {
        throw new Error('No rewritten text generated from DeepSeek API');
      }

      return new Response(
        JSON.stringify({ 
          rewrittenText,
          originalText,
          tone: validTone,
          success: true,
          source: 'deepseek'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );

    } catch (apiError: any) {
      console.error('DeepSeek API error:', apiError);
      return new Response(
        JSON.stringify({ 
          error: 'API error',
          message: apiError.message 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error: any) {
    console.error('Rewrite API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function getFallbackResponse(body: any) {
  const toneExamples = {
    professional: `🌟 **PROFESSIONALLY ENHANCED DESCRIPTION** 🌟

📝 **Original Content:** ${body?.originalText?.substring(0, 100)}${body?.originalText?.length > 100 ? '...' : ''}

✨ **Professional Rewrite:**

This exceptional item represents outstanding value and quality in today's marketplace. Meticulously maintained and ready for immediate deployment, it offers the perfect synthesis of functionality and reliability.

🏆 **Professional Standards:**
• Rigorous quality assurance protocols
• Comprehensive documentation included  
• Industry-standard compliance verified
• Expert handling and care throughout

**Investment Highlights:** This piece has been carefully evaluated and meets our stringent quality benchmarks. With comprehensive testing and verification completed, it stands as a testament to excellence in its category.

**Immediate Availability:** Ready for prompt shipment with full documentation and support materials included.

---
*Professionally enhanced by BrutalSales AI - Where excellence meets opportunity.*`,

    friendly: `Hey there! 👋 **FRIENDLY TRANSFORMATION COMPLETE** 

📝 **Your Original:** ${body?.originalText?.substring(0, 100)}${body?.originalText?.length > 100 ? '...' : ''}

😊 **Friendly Rewrite:**

You're going to absolutely love this amazing find! I've taken such great care of this beauty, and it's ready to bring joy to its next home. It's been my trusted companion, and now it's time to share the love!

💝 **Why You'll Adore It:**
• Treated with tender loving care
• Ready to make you smile every day
• Comes with all the good vibes included
• Perfect for someone special (that's you!)

**Personal Touch:** I genuinely believe this will make someone very happy. It's been wonderful to me, and I know it'll be just as wonderful for you!

**Ready to Go:** Packed with care and ready to start its new adventure with you!

---
*Crafted with love by BrutalSales AI - Where friendships begin with great finds.*`,

    energetic: `🚀 **ENERGY TRANSFORMATION ACTIVATED!** ⚡

📝 **Original Power:** ${body?.originalText?.substring(0, 100)}${body?.originalText?.length > 100 ? '...' : ''}

⚡ **HIGH-ENERGY REWRITE:**

🔥 INCREDIBLE OPPORTUNITY ALERT! 🔥 This AMAZING piece is ready to TRANSFORM your experience! Don't let this SPECTACULAR deal slip away - it's packed with POWER and ready to DELIVER beyond your wildest expectations!

💥 **EXPLOSIVE BENEFITS:**
• INSTANT satisfaction guaranteed!
• DYNAMIC performance ready to go!
• UNSTOPPABLE quality that won't quit!
• MAXIMUM value that'll blow your mind!

**URGENT ACTION REQUIRED:** This level of AWESOME doesn't last long! Get ready to experience something EXTRAORDINARY that'll leave you saying "WOW!" every single day!

**LIGHTNING-FAST SHIPPING:** Ready to ROCKET to your door immediately!

---
*SUPERCHARGED by BrutalSales AI - Where ENERGY meets EXCELLENCE!*`,

    humor: `😂 **HUMOR TRANSFORMATION COMPLETE!** 🎭

📝 **Original (Boring) Version:** ${body?.originalText?.substring(0, 100)}${body?.originalText?.length > 100 ? '...' : ''}

🤣 **COMEDY GOLD REWRITE:**

⚠️ **WARNING: DANGEROUSLY AWESOME ITEM AHEAD!** ⚠️

This little beauty is so good, it should come with a warning label! Side effects may include: uncontrollable happiness, sudden urges to show it off to friends, and chronic satisfaction syndrome.

🎪 **Why This Item is Comedy Gold:**
• More reliable than your WiFi connection
• Shinier than your future (and that's saying something!)
• So good, even your mother-in-law would approve
• Comes with a 100% guarantee to make you the coolest person in the room*

**The Fine Print:** *Results may vary. Coolness not guaranteed in all social situations. May cause excessive smiling. 😉

**Shipping Comedy:** We'll get this to you faster than you can say "Why didn't I buy this sooner?"

---
*Hilariously enhanced by BrutalSales AI - Where laughter meets legendary deals!*`
  };

  return new Response(
    JSON.stringify({ 
      rewrittenText: toneExamples[body?.tone] || toneExamples.professional,
      originalText: body?.originalText,
      tone: body?.tone,
      success: true,
      source: 'fallback'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}