import { OpenAI } from 'openai';
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
  baseURL: process.env.EXPO_PUBLIC_DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
  apiKey: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY,
});

interface GenerateRequest {
  make: string;
  model: string;
  condition?: string;
  itemDetails?: string;
  tone?: string;
  acceptOffers?: boolean;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as GenerateRequest;
    
    if (!body.make || !body.model) {
      return new Response(JSON.stringify({ 
        error: 'Make and model are required' 
      }), { status: 400 });
    }

    const tone = isValidTone(body.tone) ? body.tone : DEFAULT_TONE;
    const toneInstruction = getToneInstruction(tone);
    const acceptOffers = body.acceptOffers ?? true;

    const prompt = `Create a professional product description for a ${body.condition || ''} ${body.make} ${body.model}.
${body.itemDetails ? `Additional details: ${body.itemDetails}\n` : ''}
${toneInstruction}
${acceptOffers ? 'Include a brief line about welcoming offers that matches the tone of the description.' : 'Do not mention anything about offers.'}
Keep the description concise but compelling.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional product description writer. Create compelling, accurate descriptions that highlight key features and benefits. IMPORTANT: If instructed to include an offers line, make it brief and match the tone of the description. Do not mention corporate or bulk deals unless specifically requested. Do not include any introductory text like "Here is a professional description:" or concluding text like "Let me know if you need any changes". Just provide the description itself.'
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const generatedText = completion.choices[0]?.message?.content?.trim();
      
      if (!generatedText) {
        throw new Error('No description generated');
      }

      return new Response(JSON.stringify({
        generatedText,
        source: 'deepseek'
      }), { status: 200 });

    } catch (apiError: any) {
      console.error('DeepSeek API error:', apiError);
      
      // Fallback to a basic description if API fails
      const fallbackDescription = `${body.condition || ''} ${body.make} ${body.model} for sale.
${body.itemDetails || ''}
${acceptOffers ? '\nOffers welcome.' : ''}`;

      return new Response(JSON.stringify({
        generatedText: fallbackDescription,
        source: 'fallback',
        error: apiError.message
      }), { status: 200 });
    }

  } catch (error: any) {
    console.error('Generation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate description' 
    }), { status: 500 });
  }
}

function getFallbackResponse(body: GenerateRequest) {
  const toneExamples = {
    professional: `🌟 **${body.make.toUpperCase()} ${body.model.toUpperCase()}** 🌟

✨ **PROFESSIONAL DESCRIPTION:**

This exceptional ${body.make} ${body.model} represents outstanding value and quality in today's marketplace. Meticulously maintained and ready for immediate deployment, it offers the perfect synthesis of functionality and reliability.

🏆 **Key Features:**
• Premium quality and reliability
• Thoroughly tested and verified
• Comprehensive documentation included
• Expert handling and care throughout

**Investment Highlights:** This piece has been carefully evaluated and meets our stringent quality benchmarks. With comprehensive testing and verification completed, it stands as a testament to excellence in its category.

**Immediate Availability:** Ready for prompt shipment with full documentation and support materials included.${body.acceptOffers ? '\n\n**Open to Offers:** We welcome reasonable offers and are committed to finding the right buyer for this exceptional item.' : ''}

---
*Professionally crafted by BrutalSales AI - Where excellence meets opportunity.*`,

    friendly: `Hey there! 👋 **${body.make} ${body.model}** 

😊 **FRIENDLY DESCRIPTION:**

You're going to absolutely love this amazing ${body.make} ${body.model}! I've taken such great care of this beauty, and it's ready to bring joy to its next home. It's been my trusted companion, and now it's time to share the love!

💝 **Why You'll Adore It:**
• Treated with tender loving care
• Ready to make you smile every day
• Comes with all the good vibes included
• Perfect for someone special (that's you!)

**Personal Touch:** I genuinely believe this will make someone very happy. It's been wonderful to me, and I know it'll be just as wonderful for you!

**Ready to Go:** Packed with care and ready to start its new adventure with you!${body.acceptOffers ? '\n\n**Open to Offers:** Feel free to send me a message if you\'d like to chat about the price - I\'m always happy to work something out!' : ''}

---
*Crafted with love by BrutalSales AI - Where friendships begin with great finds.*`,

    energetic: `🚀 **${body.make.toUpperCase()} ${body.model.toUpperCase()}** ⚡

⚡ **HIGH-ENERGY DESCRIPTION:**

🔥 INCREDIBLE OPPORTUNITY ALERT! 🔥 This AMAZING ${body.make} ${body.model} is ready to TRANSFORM your experience! Don't let this SPECTACULAR deal slip away - it's packed with POWER and ready to DELIVER beyond your wildest expectations!

💥 **EXPLOSIVE BENEFITS:**
• INSTANT satisfaction guaranteed!
• DYNAMIC performance ready to go!
• UNSTOPPABLE quality that won't quit!
• MAXIMUM value that'll blow your mind!

**URGENT ACTION REQUIRED:** This level of AWESOME doesn't last long! Get ready to experience something EXTRAORDINARY that'll leave you saying "WOW!" every single day!

**LIGHTNING-FAST SHIPPING:** Ready to ROCKET to your door immediately!${body.acceptOffers ? '\n\n**OFFERS WELCOME!** 💪 Don\'t be shy - send me your BEST offer and let\'s make a deal that\'ll make us both happy!' : ''}

---
*SUPERCHARGED by BrutalSales AI - Where ENERGY meets EXCELLENCE!*`,

    humor: `🎭 **${body.make} ${body.model}** 🎪

🎪 **COMEDY DESCRIPTION:**

Well, well, well... look what we have here! This little ${body.make} ${body.model} has been sitting in my collection, just waiting for its moment to shine. And boy, is it ready to put on a show! 🎭

🎪 **Why This Item is a Star:**
• It's got more personality than a stand-up comedian
• Cleaner than my jokes (and that's saying something!)
• Ready to steal the spotlight in your collection
• Comes with a lifetime supply of good vibes

**The Plot Twist:** This isn't your average item - it's the main character in your next success story! And trust me, this story has a happy ending! 😉

**The Grand Finale:** Packed and ready for its next big performance!${body.acceptOffers ? '\n\n**The Negotiation Scene:** I\'m open to offers that\'ll make us both laugh all the way to the bank! 😄' : ''}

---
*Directed by BrutalSales AI - Where every description is a comedy hit!*`
  };

  return toneExamples[body.tone as keyof typeof toneExamples] || toneExamples.professional;
}
