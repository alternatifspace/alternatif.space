// Cross-subdomain links. Identity and party pages live on partai (TRD §3).
import { dev } from '$app/environment';

export const PARTAI_URL = dev ? 'http://localhost:5173' : 'https://partai.alternatif.space';

export const partaiProfile = (userId: string) => `${PARTAI_URL}/profil/${userId}`;
export const partaiParty = (slug: string) => `${PARTAI_URL}/partai/${slug}`;
export const partaiGate = () => `${PARTAI_URL}/bergabung`;
