import { supabase } from '@/lib/supabase';

export interface TermsData {
  storeName: string;
  storeDescription: string;
  returnPolicy: string;
  shippingInfo: string;
  warrantyInfo: string;
  contactInfo: string;
  terms_text: string;
}

export const getDefaultTerms = (): TermsData => ({
  storeName: '',
  storeDescription: '',
  returnPolicy: 'All sales are final unless the item is defective or damaged upon arrival. Returns must be initiated within 14 days of receipt.',
  shippingInfo: 'Standard shipping within 2-5 business days. Express shipping available at checkout. International shipping available to select countries.',
  warrantyInfo: 'All items come with a 30-day limited warranty covering manufacturing defects. Extended warranty options available.',
  contactInfo: 'For support, please contact us via email or through our website.',
  terms_text: '',
});

export const formatTermsText = (terms: TermsData): string => {
  const sections = [];

  if (terms.storeName) {
    sections.push(`Seller: ${terms.storeName}`);
  }

  if (terms.storeDescription) {
    sections.push(terms.storeDescription);
  }

  if (terms.returnPolicy) {
    sections.push(`Returns: ${terms.returnPolicy}`);
  }

  if (terms.shippingInfo) {
    sections.push(`Shipping: ${terms.shippingInfo}`);
  }

  if (terms.warrantyInfo) {
    sections.push(`Warranty: ${terms.warrantyInfo}`);
  }

  if (terms.contactInfo) {
    sections.push(`Contact: ${terms.contactInfo}`);
  }

  return sections.join('\n\n');
};

export const loadSavedTerms = async (): Promise<TermsData | null> => {
  try {
    console.log('loadSavedTerms - checking auth...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session data:', session);
    console.log('Session error:', sessionError);
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return getDefaultTerms();
    }
    
    if (!session?.user) {
      console.log('❌ No session found - user not logged in!');
      return getDefaultTerms();
    }
    console.log('✅ User is logged in:', session.user.email);

    console.log('Loading terms for user:', session.user.id);
    const { data: savedTerms, error } = await supabase
      .from('user_terms')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Error loading terms:', error);
      return getDefaultTerms();
    }

    console.log('Loaded terms:', savedTerms);

    if (savedTerms) {
      return {
        storeName: savedTerms.store_name || '',
        storeDescription: savedTerms.store_description || '',
        returnPolicy: savedTerms.return_policy || '',
        shippingInfo: savedTerms.shipping_info || '',
        warrantyInfo: savedTerms.warranty_info || '',
        contactInfo: savedTerms.contact_info || '',
        terms_text: savedTerms.terms_text || '',
      };
    }

    return getDefaultTerms();
  } catch (error) {
    console.error('Error in loadSavedTerms:', error);
    return getDefaultTerms();
  }
};

export const saveTerms = async (terms: TermsData): Promise<boolean> => {
  try {
    console.log('saveTerms - checking auth...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session data:', session);
    console.log('Session error:', sessionError);
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return false;
    }
    if (!session?.user) {
      console.log('❌ No session found - user not logged in!');
      return false;
    }
    console.log('✅ User is logged in:', session.user.email);

    // Format the terms text before saving
    const formattedTerms = formatTermsText(terms);
    console.log('Formatted terms:', formattedTerms);

    // First check if terms exist
    const { data: existingTerms, error: checkError } = await supabase
      .from('user_terms')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
    
    console.log('Existing terms check:', { existingTerms, checkError });

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing terms:', checkError);
      return false;
    }

    const termsData = {
      user_id: session.user.id,
      store_name: terms.storeName,
      store_description: terms.storeDescription,
      return_policy: terms.returnPolicy,
      shipping_info: terms.shippingInfo,
      warranty_info: terms.warrantyInfo,
      contact_info: terms.contactInfo,
      terms_text: formattedTerms,
      updated_at: new Date().toISOString()
    };

    console.log('Preparing to save terms data:', termsData);

    // Use upsert instead of separate update/insert
    const { error } = await supabase
      .from('user_terms')
      .upsert(termsData, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving terms:', error);
      return false;
    }

    console.log('Terms saved successfully!');
    return true;
  } catch (error) {
    console.error('Error in saveTerms:', error);
    return false;
  }
};

export default {}; 