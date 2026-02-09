
// Note: In this environment, Firebase is simulated or used via provided patterns
// if real initialization is required. For this UI demo, we manage state locally
// or through a mock persistence layer to ensure functionality.

export const saveClaim = async (claim: any) => {
  const claims = JSON.parse(localStorage.getItem('claims') || '[]');
  claims.push({ ...claim, id: Date.now().toString() });
  localStorage.setItem('claims', JSON.stringify(claims));
  return true;
};

export const getClaims = () => {
  return JSON.parse(localStorage.getItem('claims') || '[]');
};

export const deleteClaim = (id: string) => {
  const claims = JSON.parse(localStorage.getItem('claims') || '[]');
  const filtered = claims.filter((c: any) => c.id !== id);
  localStorage.setItem('claims', JSON.stringify(filtered));
};
