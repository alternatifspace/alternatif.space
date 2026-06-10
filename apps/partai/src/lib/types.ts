// Mirrors the TRD §6 schema. governance_config is locked at publish.

export type ManifestoApproval = 'leader_only' | 'leader_proposes_members_ratify' | 'full_member_vote';
export type MembershipModel = 'open' | 'application' | 'invite_only';
export type MemberRemovalAuthority = 'leader' | 'leader_with_contest_window' | 'member_vote';
export type MufakatVoice = 'leader_only' | 'ratified_internally';
export type PartyStatus = 'pending_review' | 'active' | 'dormant' | 'dissolved';

export interface GovernanceConfig {
	recall_petition_threshold: number; // 0.10–0.50
	recall_vote_threshold: number; // 0.501–0.75
	manifesto_approval: ManifestoApproval;
	membership_model: MembershipModel;
	member_removal_authority: MemberRemovalAuthority;
	mufakat_voice: MufakatVoice;
}

export interface Party {
	id: string;
	slug: string;
	name: string;
	tagline: string | null;
	logo_url: string | null;
	share_card_url: string | null;
	manifesto_html: string | null;
	current_stance: string | null;
	status: PartyStatus;
	governance_config: GovernanceConfig;
	council_enabled: boolean;
	honeymoon_ends_at: string;
	leader_id: string;
	leader_last_active_at: string;
	created_at: string;
}

export interface PartyCardData {
	id: string;
	slug: string;
	name: string;
	tagline: string | null;
	logo_url: string | null;
	status: PartyStatus;
	governance_config: Pick<GovernanceConfig, 'membership_model'>;
	leader_last_active_at: string;
	member_count: number;
}

export interface UserRow {
	id: string;
	display_name: string;
	bio: string | null;
	last_active_at: string | null;
}

export interface CurrentMembership {
	party_id: string;
	status: 'active' | 'muted' | 'suspended' | 'removed';
	role: 'leader' | 'member';
	party: {
		id: string;
		slug: string;
		name: string;
		logo_url: string | null;
		status: PartyStatus;
	};
}
