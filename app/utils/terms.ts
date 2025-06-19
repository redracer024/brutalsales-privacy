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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw new Error('Could not get session');
    if (!session?.user) return null; // Not logged in

    const { data: savedTerms, error: fetchError } = await supabase
      .from('user_terms')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') return null; // No terms found is not an error
      throw fetchError;
    }

    return savedTerms;
  } catch (error) {
    throw error;
  }
};

export const saveTerms = async (terms: TermsData): Promise<boolean> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw new Error('Could not get session');
    if (!session?.user) throw new Error('User not authenticated');

    const formattedTerms = formatTermsText(terms);

    const { data: existingTerms, error: checkError } = await supabase
      .from('user_terms')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    const termsData = {
      ...terms,
      user_id: session.user.id,
      terms_text: formattedTerms,
      updated_at: new Date().toISOString(),
    };

    if (existingTerms) {
      const { error: updateError } = await supabase
        .from('user_terms')
        .update(termsData)
        .eq('id', existingTerms.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('user_terms')
        .insert(termsData);
      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    throw error;
  }
};

export default {}; 