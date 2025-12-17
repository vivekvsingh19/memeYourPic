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
  return links[currency][packId];
};
