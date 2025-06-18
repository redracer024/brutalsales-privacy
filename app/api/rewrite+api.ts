import { OpenAI } from 'openai';
import { showRewriteInterstitial } from '@/utils/admob';
import { getToneInstruction, isValidTone } from '@/utils/types';

// Initialize OpenAI client with DeepSeek configuration
const openai = new OpenAI({
  baseURL: process.env.EXPO_PUBLIC_DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
  apiKey: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY,
});

interface RewriteRequest {
  originalText: string;
  tone?: string;
  acceptOffers?: boolean;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as RewriteRequest;
    
    if (!body.originalText?.trim()) {
      return new Response(JSON.stringify({ 
        error: 'Original text is required' 
      }), { status: 400 });
    }

    const tone = isValidTone(body.tone) ? body.tone : 'professional';
    const toneInstruction = getToneInstruction(tone);
    const acceptOffers = body.acceptOffers ?? true;

    const prompt = `Rewrite this product description in a ${tone} tone. Keep the key information but make it more engaging and compelling:

Original Text:
${body.originalText}

Instructions:
${toneInstruction}
${acceptOffers ? 'Include a line about welcoming offers that matches the tone.' : 'Do not mention anything about offers.'}
- Keep the description concise but compelling
- Maintain all important product details
- Use appropriate formatting and structure
- Add relevant emojis where appropriate
- Create clear sections if needed`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional product description writer. Your goal is to rewrite descriptions to be more compelling while maintaining accuracy and key information. IMPORTANT: If instructed to include an offers line, you MUST add it as a separate section at the end of the description, before any closing text. Use appropriate formatting, emojis, and structure to make the description engaging and easy to read. Do not include any introductory text like "Here is your rewritten description:" or concluding text like "Let me know if you need any changes". Just provide the rewritten description itself.'
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
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
      
      // Use the fallback generation if API fails
      const fallbackText = getFallbackRewrite(body.originalText, tone, acceptOffers);

      return new Response(JSON.stringify({
        generatedText: fallbackText,
        source: 'fallback',
        error: apiError.message
      }), { status: 200 });
    }

  } catch (error: any) {
    console.error('Rewrite error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to rewrite description' 
    }), { status: 500 });
  }
}

function getFallbackRewrite(originalText: string, tone: string, acceptOffers: boolean): string {
  // Add some basic formatting and structure to the original text
  const lines = originalText.split('\n').filter(line => line.trim());
  
  let formattedText = `✨ **PRODUCT DESCRIPTION** ✨\n\n`;
  
  // Add the main content with some basic formatting
  formattedText += lines.map(line => line.trim()).join('\n\n');
  
  // Add offers line if needed
  if (acceptOffers) {
    formattedText += '\n\n💫 Reasonable offers are welcome!';
  }
  
  return formattedText;
}