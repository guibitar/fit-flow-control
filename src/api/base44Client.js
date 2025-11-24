import { createClient } from '@base44/sdk';

// Create a client WITHOUT automatic auth requirement
// We'll handle authentication manually through our AuthContext
export const base44 = createClient({
  appId: "68f98ea88b195a3f3b5ce39f", 
  requiresAuth: false // We handle auth manually
});
