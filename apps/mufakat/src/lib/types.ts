// Mirrors the TRD §6 mufakat schema and the mufakat_comments_public view.
import type { ThreadStatus } from '@alternatif/ui';

export type CommentState = 'visible' | 'deleted' | 'hidden' | 'moved';

export interface PartyRef {
	slug: string;
	name: string;
	logo_url: string | null;
}

export interface Thread {
	id: string;
	slug: string;
	title: string;
	body_html: string | null;
	op_id: string | null;
	op_party_id: string | null;
	community_raised: boolean;
	status: ThreadStatus;
	origin: 'user' | 'split' | 'spinoff';
	parent_thread_id: string | null;
	redirect_to: string | null;
	closing_summary: unknown | null;
	created_at: string;
	closed_at: string | null;
	hidden: boolean;
}

export interface ThreadListItem {
	id: string;
	slug: string;
	title: string;
	status: ThreadStatus;
	community_raised: boolean;
	created_at: string;
	op_party: PartyRef | null;
	participant_count: number;
}

/** Row from mufakat_comments_public — content withheld by state (TRD §7). */
export interface CommentRow {
	id: string;
	thread_id: string;
	author_id: string;
	author_party_id: string | null;
	parent_id: string | null;
	depth: number;
	content: unknown | null;
	html: string | null;
	moved_excerpt: string | null;
	state: CommentState;
	moved_to_thread_id: string | null;
	edited_at: string | null;
	created_at: string;
}

export interface CommentNodeData extends CommentRow {
	author_name: string;
	author_party: PartyRef | null;
	replies: CommentNodeData[];
	reactions: { setuju: number; pertanyaan_bagus: number };
	myReactions: { setuju: boolean; pertanyaan_bagus: boolean };
	/** For moved scars: live target status + reaction count at split (M0-10). */
	movedTo: { slug: string; status: ThreadStatus; reaction_count: number } | null;
}

export interface MarkerData {
	id: string;
	after_comment_id: string | null;
	kind: 'spinoff' | 'dedup_reference';
	label: string | null;
	/** Live read from the target thread (TRD §9.4) — never stored in the parent. */
	target: {
		slug: string;
		title: string;
		status: ThreadStatus;
		closing_summary_html: string | null;
	} | null;
}
