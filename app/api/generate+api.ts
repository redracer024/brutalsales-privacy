import OpenAI from 'openai';
import { showCreateInterstitial } from '@/utils/admob';
import { 
  ToneType, 
  isValidTone, 
  DEFAULT_TONE, 
  getToneInstruction,
  DeepSeekRequest,
  DeepSeekResponse,
  DeepSeekMessage
} from '@/utils/types';

// Initialize OpenAI client with DeepSeek configuration
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY,
});

interface GenerateRequest {
  make: string;
  model: string;
  tone?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as GenerateRequest;
    const { make, model, tone } = body;

    if (!make?.trim() || !model?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Make and model are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Show interstitial ad before generating response
    await showCreateInterstitial();

    // Get tone instruction using the helper function
    const toneInstruction = getToneInstruction(tone || DEFAULT_TONE);
    const validTone = isValidTone(tone) ? tone : DEFAULT_TONE;

    try {
      // Prepare messages for DeepSeek API
      const messages: DeepSeekMessage[] = [
        {
          role: 'system',
          content: `You are a professional copywriter specializing in writing compelling product descriptions for online marketplaces. ${toneInstruction}

IMPORTANT FORMATTING RULES:
- Always include the make and model in the title
- Use emojis strategically and appropriately for the tone
- Create clear sections and structure
- Keep descriptions concise but impactful
- Include a professional closing line
- Make it engaging and conversion-focused
- Ensure the tone is consistent throughout

Your goal is to create a persuasive and engaging product description that will help sell the item.`
        },
        {
          role: 'user',
          content: `Please write a compelling product description for a ${make} ${model} with a ${validTone} tone.

Requirements:
- Include the make and model in the title
- Use a ${validTone} tone throughout
- Use appropriate emojis and formatting
- Make it engaging and conversion-focused
- Keep it concise but impactful
- Add a professional closing line that matches the ${validTone} tone
- Ensure the description feels natural and authentic`
        }
      ];

      // Prepare DeepSeek API request
      const apiRequest: DeepSeekRequest = {
        model: 'deepseek-chat',
        messages,
        max_tokens: 1200,
        temperature: 0.8,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
        response_format: { type: 'text' },
        stream: false,
        stream_options: null,
        logprobs: false,
        top_logprobs: null
      };

      // DeepSeek API integration
      const completion = await openai.chat.completions.create(apiRequest);
      const response = completion as unknown as DeepSeekResponse;

      const generatedText = response.choices[0]?.message?.content;

      if (!generatedText) {
        throw new Error('No text generated from DeepSeek API');
      }

      return new Response(
        JSON.stringify({ 
          generatedText,
          make,
          model,
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
    console.error('Generate API error:', error);
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
  const { tone = 'professional' } = body;
  
  const toneExamples: Record<string, string> = {
    professional: `🔥 **${body?.make || 'Premium'} ${body?.model || 'Item'}** - ${body?.condition?.replace('_', ' ').toUpperCase() || 'EXCELLENT CONDITION'}

⚡ **Condition:** ${body?.condition?.replace('_', ' ') || 'Excellent'}

${body?.itemDetails ? `📋 **Details:** ${body.itemDetails}` : ''}

🛡️ **Why Choose This Item:**
• Premium quality and reliability
• Thoroughly tested and verified
• Fast shipping and secure packaging
• 30-day satisfaction guarantee

💫 **Perfect for:** Professional use, collectors, or anyone seeking quality and value.

🚀 **Ready to ship immediately!** Don't miss this opportunity to own this exceptional piece.

---
*Crafted with BrutalSales AI - Where legendary descriptions are forged.*`,

    friendly: `Hey there! 👋 **Amazing ${body?.make || 'Premium'} ${body?.model || 'Find'}** - ${body?.condition?.replace('_', ' ').toUpperCase() || 'GREAT CONDITION'}

😊 **What You're Getting:** ${body?.condition?.replace('_', ' ') || 'Excellent condition'}

${body?.itemDetails ? `💝 **Special Details:** ${body.itemDetails}` : ''}

🌟 **Why You'll Love It:**
• Treated with care and love
• Ready to bring joy to your life
• Fast and friendly shipping
• Happy to answer any questions!

💕 **Perfect for:** Anyone who appreciates quality and great finds!

🎉 **Ready to make someone happy!** This gem is waiting for its new home.

---
*Made with love by BrutalSales AI - Where great finds meet great people.*`,

    energetic: `🚀 **INCREDIBLE ${body?.make || 'PREMIUM'} ${body?.model || 'OPPORTUNITY'}** - ${body?.condition?.replace('_', ' ').toUpperCase() || 'AMAZING CONDITION'} 🚀

⚡ **CONDITION:** ${body?.condition?.replace('_', ' ') || 'EXCELLENT'} - READY TO ROCK!

${body?.itemDetails ? `🔥 **POWER DETAILS:** ${body.itemDetails}` : ''}

💥 **WHY THIS IS AWESOME:**
• UNBEATABLE quality and performance!
• LIGHTNING-FAST shipping!
• ROCK-SOLID guarantee!
• MAXIMUM value for your money!

🎯 **PERFECT FOR:** Anyone ready for EXCELLENCE!

⚡ **DON'T WAIT!** This AMAZING opportunity won't last long!

---
*POWERED by BrutalSales AI - Where ENERGY meets EXCELLENCE!*`,

    humor: `😄 **${body?.make || 'Awesome'} ${body?.model || 'Thing'}** - ${body?.condition?.replace('_', ' ').toUpperCase() || 'SURPRISINGLY GOOD'} (Better than my cooking!) 😄

🤔 **The Real Deal:** ${body?.condition?.replace('_', ' ') || 'Excellent'} (No, seriously!)

${body?.itemDetails ? `🎭 **Fun Facts:** ${body.itemDetails}` : ''}

😂 **Why This Rocks:**
• More reliable than my WiFi
• Ships faster than my excuses
• Guaranteed to make you smile
• Comes with my seal of approval!

🎪 **Perfect for:** People with excellent taste (like you!)

🎉 **Grab it before someone else does!** (And before I change my mind!)

---
*Brought to you by BrutalSales AI - Where humor meets great deals!*`
  };

  return new Response(
    JSON.stringify({ 
      description: toneExamples[tone as keyof typeof toneExamples] || toneExamples.professional,
      success: true,
      source: 'fallback'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
