// Mock Dolibarr CRM integration for MVP
// In production, this would connect to real Dolibarr API

export interface DolibarrThirdparty {
  id: number;
  name: string;
  email: string;
  client: number;
  tags: string[];
}

export interface DolibarrConfig {
  url: string;
  apiKey: string;
}

const dolibarrConfig: DolibarrConfig = {
  url: import.meta.env.VITE_DOLIBARR_URL || 'https://demo.dolibarr.com',
  apiKey: import.meta.env.VITE_DOLIBARR_API_KEY || 'mock_api_key'
};

// Mock storage for Dolibarr data
let mockThirdparties: DolibarrThirdparty[] = [];

export const createThirdparty = async (
  email: string,
  firstName: string,
  _dateNaissance: string
): Promise<number> => {
  // Mock API call to Dolibarr
  const thirdparty: DolibarrThirdparty = {
    id: Date.now(),
    name: firstName,
    email: email,
    client: 1,
    tags: ['Lumira']
  };
  
  mockThirdparties.push(thirdparty);
  console.log('Created Dolibarr thirdparty:', thirdparty);
  console.log('Dolibarr config:', dolibarrConfig);
  
  return thirdparty.id;
};

export const addTag = async (contactId: number, tag: string): Promise<boolean> => {
  const thirdparty = mockThirdparties.find(t => t.id === contactId);
  if (!thirdparty) return false;
  
  if (!thirdparty.tags.includes(tag)) {
    thirdparty.tags.push(tag);
    console.log(`Added tag "${tag}" to contact ${contactId}`);
  }
  
  return true;
};

export const addLevelTag = async (contactId: number, level: number): Promise<boolean> => {
  return addTag(contactId, `Level-${level}`);
};

export const addUpsellTags = async (
  contactId: number,
  upsells: { mandala: boolean; audio: boolean; rituel: boolean; pack: boolean }
): Promise<boolean> => {
  const promises: Promise<boolean>[] = [];
  
  if (upsells.mandala) promises.push(addTag(contactId, 'Upsell-Mandala'));
  if (upsells.audio) promises.push(addTag(contactId, 'Upsell-Audio'));
  if (upsells.rituel) promises.push(addTag(contactId, 'Upsell-Rituel'));
  if (upsells.pack) promises.push(addTag(contactId, 'Upsell-Pack'));
  
  const results = await Promise.all(promises);
  return results.every(Boolean);
};

export const uploadDocument = async (
  file: File,
  contactId: number,
  type: 'pdf' | 'audio' | 'mandala'
): Promise<string> => {
  // Mock file upload - in production, this would upload to Dolibarr
  const fileName = `${type}_${contactId}_${Date.now()}.${file.name.split('.').pop()}`;
  const mockUrl = `https://files.oraclelumira.com/${fileName}`;
  
  console.log(`Uploaded ${type} for contact ${contactId}:`, mockUrl);
  return mockUrl;
};

export const updateThirdpartyField = async (
  contactId: number,
  field: string,
  value: string
): Promise<boolean> => {
  const thirdparty = mockThirdparties.find(t => t.id === contactId);
  if (!thirdparty) return false;
  
  // In a real implementation, this would update custom fields in Dolibarr
  console.log(`Updated field "${field}" = "${value}" for contact ${contactId}`);
  return true;
};

// Helper to get all mock data (for debugging)
export const getAllMockThirdparties = () => mockThirdparties;

// Reset mock data (for testing)
export const resetMockDolibarrData = () => {
  mockThirdparties = [];
  console.log('Mock Dolibarr data reset');
};
