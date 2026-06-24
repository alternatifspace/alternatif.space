// Shared types for lomba-balap-logo (TRD §4).

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface Submission {
	id: string;
	user_id: string;
	image_key: string;
	title: string;
	caption: string | null;
	status: SubmissionStatus;
	rejection_reason: string | null;
	like_count: number;
	created_at: string;
	approved_at: string | null;
}

/** A feed row: an approved submission joined with author + the viewer's like state. */
export interface FeedItem {
	id: string;
	image_key: string;
	title: string;
	caption: string | null;
	like_count: number;
	created_at: string;
	approved_at: string | null;
	author_name: string | null;
	author_id: string;
	liked_by_me: boolean;
}

export type FeedSort = 'populer' | 'terbaru';

export interface ContestConfig {
	close_at: string;
	is_open: boolean;
	submissions_open: boolean;
}
