export const getDodoPaymentLink = (packId: string, currency: 'USD' | 'INR' = 'USD') => {
  const links: Record<string, Record<string, string>> = {
    USD: {
      starter: import.meta.env.VITE_DODO_LINK_STARTER || '#',
      pro: import.meta.env.VITE_DODO_LINK_PRO || '#',
      agency: import.meta.env.VITE_DODO_LINK_AGENCY || '#',
    },
    INR: {
      starter: import.meta.env.VITE_DODO_LINK_STARTER_INR || '#',
      pro: import.meta.env.VITE_DODO_LINK_PRO_INR || '#',
      agency: import.meta.env.VITE_DODO_LINK_AGENCY_INR || '#',
    }
  };
  const baseUrl = links[currency][packId];

  // Dynamically append the redirect URL so it works on Vercel/Production
  // We append payment_success=true because App.tsx listens for that specific param
  const returnUrl = `${window.location.origin}/?payment_success=true`;

  // Check if baseUrl already has params
  const separator = baseUrl.includes('?') ? '&' : '?';

  return `${baseUrl}${separator}redirect_url=${encodeURIComponent(returnUrl)}`;
};
