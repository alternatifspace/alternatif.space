// Cross-subdomain targets (PRD W0-01). The landing never owns post-auth
// onboarding — partai does. Signed-in users land on partai's root, which
// routes to their party page or onboarding as appropriate.
export const PARTAI_URL = 'https://partai.alternatif.space';
export const ONBOARDING_URL = `${PARTAI_URL}/onboarding`;

export const SUBDOMAINS = {
	partai: PARTAI_URL,
	mufakat: 'https://mufakat.alternatif.space',
	simposium: 'https://simposium.alternatif.space',
	perpus: 'https://perpus.alternatif.space'
} as const;
