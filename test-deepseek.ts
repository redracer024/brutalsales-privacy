import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get API key from environment
const apiKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;

if (!apiKey) {
  console.error('❌ EXPO_PUBLIC_DEEPSEEK_API_KEY is not set in environment variables');
  process.exit(1);
}

// Print full API key for verification
console.log('Full API Key:', apiKey);

// Initialize OpenAI client with DeepSeek configuration
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: apiKey!,
});

// Simulate toggle state
const acceptOffers = true; // Toggle this to test different scenarios

async function testDeepSeekAPI() {
  try {
    console.log(`Testing DeepSeek API with product description generation (accept offers: ${acceptOffers})...`);
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a professional copywriter specializing in writing compelling product descriptions for online marketplaces.\n\nIMPORTANT FORMATTING RULES:\n- Always include the make and model in the title\n- Use emojis strategically and appropriately for the tone\n- Create clear sections and structure\n- Keep descriptions concise but impactful\n- Include a professional closing line\n- Make it engaging and conversion-focused\n- Ensure the tone is consistent throughout\n- If the user accepts offers, include a friendly line about being open to offers, matching the tone of the rest of the description\n- Use double spacing between sections for better readability\n- Ensure consistent spacing between bullet points\n\nYour goal is to create a persuasive and engaging product description that will help sell the item.`
      },
      {
        role: 'user',
        content: `Please write a compelling product description for a Toyota Camry 2020 with a professional tone.\n\nRequirements:\n- Include the make and model in the title\n- Use a professional tone throughout\n- Use appropriate emojis and formatting\n- Make it engaging and conversion-focused\n- Keep it concise but impactful\n- Add a professional closing line\n- Ensure the description feels natural and authentic\n- Use double spacing between sections for better readability\n- Ensure consistent spacing between bullet points\n${acceptOffers ? '- I always take offers, so include a friendly line about being open to offers, matching the tone of the rest of the description.' : ''}`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      max_tokens: 1200,
      temperature: 0.8,
      top_p: 0.9,
    });

    console.log('\n✅ Generated Description:\n');
    console.log(completion.choices[0]?.message?.content);
    
  } catch (error: any) {
    console.error('❌ DeepSeek API test failed:', {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code
    });
  }
}

testDeepSeekAPI(); 