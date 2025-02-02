import { TranslationServiceClient } from '@google-cloud/translate';
import { config } from 'dotenv';

config();

// Create credentials from environment variables
const credentials = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY, // Fix newline formatting
  project_id: process.env.GOOGLE_PROJECT_ID
};

const translationClient = new TranslationServiceClient({
  credentials: credentials,
  projectId: credentials.project_id
});


async function translateText() {
  try {
    const request = {
      parent: `projects/${credentials.project_id}/locations/global`,
      contents: ["hello, how are you?"],
      mimeType: 'text/plain',
      sourceLanguageCode: 'en',
      targetLanguageCode: 'bn',
    };

    const [response] = await translationClient.translateText(request);
    console.log(response.translations[0].translatedText);
    
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Translation failed: ${error.message}`);
  }
}

// export default { translateText };

translateText();