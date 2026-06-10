import type { GovernanceConfig, MembershipModel } from './types';

// Archetype presets (P0-05 Step 1). UI-only founding tool: presets pre-fill
// the Step 2 form and are NEVER stored, returned by any API, or shown
// publicly (Q7) — only the resulting raw parameter values are persisted.
// The exact preset values are product-tunable; these encode the taglines:
// Vanguard "Ketua memutuskan", Republic "Ketua mengusulkan, anggota
// meratifikasi", Commune "Semua keputusan lewat suara".
export type Archetype = 'vanguard' | 'republic' | 'commune' | 'custom';

export const PRESETS: Record<Exclude<Archetype, 'custom'>, GovernanceConfig> = {
	vanguard: {
		recall_petition_threshold: 0.5,
		recall_vote_threshold: 0.75,
		manifesto_approval: 'leader_only',
		membership_model: 'application',
		member_removal_authority: 'leader',
		mufakat_voice: 'leader_only'
	},
	republic: {
		recall_petition_threshold: 0.2,
		recall_vote_threshold: 0.6,
		manifesto_approval: 'leader_proposes_members_ratify',
		membership_model: 'application',
		member_removal_authority: 'leader_with_contest_window',
		mufakat_voice: 'leader_only'
	},
	commune: {
		recall_petition_threshold: 0.1,
		recall_vote_threshold: 0.501,
		manifesto_approval: 'full_member_vote',
		membership_model: 'open',
		member_removal_authority: 'member_vote',
		mufakat_voice: 'ratified_internally'
	}
};

export const ARCHETYPE_COPY: Record<Archetype, { name: string; tagline: string }> = {
	vanguard: { name: 'Vanguard', tagline: 'Ketua memutuskan. Anggota menjalankan.' },
	republic: { name: 'Republic', tagline: 'Ketua mengusulkan. Anggota meratifikasi.' },
	commune: { name: 'Commune', tagline: 'Semua keputusan lewat suara.' },
	custom: { name: 'Custom', tagline: 'Atur sendiri semua parameternya.' }
};

// Valid ranges (P0-05 Step 2). Thresholds are stored as fractions.
export const RECALL_PETITION_RANGE = { min: 0.1, max: 0.5, step: 0.05 };
export const RECALL_VOTE_RANGE = { min: 0.501, max: 0.75, step: 0.01 };

export const OPTION_LABELS = {
	manifesto_approval: {
		leader_only: 'Hanya ketua',
		leader_proposes_members_ratify: 'Ketua mengusulkan, anggota meratifikasi',
		full_member_vote: 'Suara penuh seluruh anggota'
	},
	membership_model: {
		open: 'Terbuka',
		application: 'Lewat lamaran',
		invite_only: 'Hanya undangan'
	},
	member_removal_authority: {
		leader: 'Hanya ketua',
		leader_with_contest_window: 'Ketua, dengan masa sanggah',
		member_vote: 'Suara anggota'
	},
	mufakat_voice: {
		leader_only: 'Hanya ketua',
		ratified_internally: 'Diratifikasi internal dulu'
	}
} as const;

export const PARAM_LABELS: Record<keyof GovernanceConfig, string> = {
	recall_petition_threshold: 'Ambang petisi recall',
	recall_vote_threshold: 'Ambang suara recall',
	manifesto_approval: 'Persetujuan perubahan manifesto',
	membership_model: 'Model keanggotaan',
	member_removal_authority: 'Wewenang pemberhentian anggota',
	mufakat_voice: 'Suara resmi di mufakat'
};

export const MEMBERSHIP_MODEL_LABELS: Record<MembershipModel, string> = OPTION_LABELS.membership_model;

export function formatPercent(fraction: number): string {
	return `${Math.round(fraction * 1000) / 10}%`;
}

/** Human-readable value for any governance parameter (party profile, review step). */
export function formatParam(key: keyof GovernanceConfig, value: GovernanceConfig[typeof key]): string {
	if (key === 'recall_petition_threshold' || key === 'recall_vote_threshold') {
		return formatPercent(value as number);
	}
	const labels = OPTION_LABELS[key as keyof typeof OPTION_LABELS] as Record<string, string>;
	return labels[value as string] ?? String(value);
}

export function validateConfig(config: Partial<GovernanceConfig>): config is GovernanceConfig {
	return (
		typeof config.recall_petition_threshold === 'number' &&
		config.recall_petition_threshold >= RECALL_PETITION_RANGE.min &&
		config.recall_petition_threshold <= RECALL_PETITION_RANGE.max &&
		typeof config.recall_vote_threshold === 'number' &&
		config.recall_vote_threshold >= RECALL_VOTE_RANGE.min &&
		config.recall_vote_threshold <= RECALL_VOTE_RANGE.max &&
		config.manifesto_approval != null &&
		config.membership_model != null &&
		config.member_removal_authority != null &&
		config.mufakat_voice != null
	);
}
