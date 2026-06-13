// Cross-subdomain links. Deliberation lives on mufakat (TRD §3).
import { dev } from '$app/environment';

export const MUFAKAT_URL = dev ? 'http://localhost:5174' : 'https://mufakat.alternatif.space';
