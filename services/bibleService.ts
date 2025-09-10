
interface BibleApiResponse {
  reference: string;
  text: string;
  translation_name: string;
}

export const fetchVerse = async (reference: string): Promise<{ reference: string; text: string } | null> => {
  try {
    const encodedReference = encodeURIComponent(reference);
    const response = await fetch(`https://bible-api.com/${encodedReference}?translation=niv`);

    if (!response.ok) {
      console.error(`Bible API error for ${reference}: ${response.statusText}`);
      return null;
    }

    const data: BibleApiResponse = await response.json();
    // The API wraps text in newlines, so we trim it.
    const cleanText = data.text.replace(/\n/g, ' ').trim();

    return {
      reference: data.reference,
      text: cleanText,
    };
  } catch (error) {
    console.error('Failed to fetch from Bible API:', error);
    return null;
  }
};
