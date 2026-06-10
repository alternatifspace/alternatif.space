import { PRESETS, type Archetype } from '$lib/governance';
import type { GovernanceConfig } from '$lib/types';

// Wizard state (P0-05, TRD §11): a single local store holds everything until
// the final publish step — nothing touches the database before that.
export type DraftConfig = { [K in keyof GovernanceConfig]: GovernanceConfig[K] | null };

const EMPTY_CONFIG: DraftConfig = {
	recall_petition_threshold: null,
	recall_vote_threshold: null,
	manifesto_approval: null,
	membership_model: null,
	member_removal_authority: null,
	mufakat_voice: null
};

export interface SerializedDraft {
	step: number;
	archetype: Archetype | null;
	config: DraftConfig;
	name: string;
	tagline: string;
	manifesto: unknown | null;
	manifestoHtml: string;
	manifestoText: string;
	councilEnabled: boolean;
}

export class CreatePartyDraft {
	step = $state(1);
	// UI-only founding tool — pre-fills Step 2 and is never persisted (Q7).
	archetype = $state<Archetype | null>(null);
	config = $state<DraftConfig>({ ...EMPTY_CONFIG });
	name = $state('');
	tagline = $state('');
	logoBlob = $state<Blob | null>(null);
	logoPreview = $state<string | null>(null);
	manifesto = $state<unknown | null>(null); // TipTap JSON
	manifestoHtml = $state('');
	manifestoText = $state('');
	councilEnabled = $state(false);

	// Drives the Custom-path completion counter and the Step 2 CTA (P0-05).
	get unsetCount(): number {
		return Object.values(this.config).filter((v) => v === null).length;
	}

	get totalParams(): number {
		return Object.keys(this.config).length;
	}

	selectArchetype(archetype: Archetype) {
		this.archetype = archetype;
		this.config = archetype === 'custom' ? { ...EMPTY_CONFIG } : { ...PRESETS[archetype] };
		this.step = 2;
	}

	/** Auto-save payload (P0-06) — the logo blob is deliberately excluded. */
	serialize(): SerializedDraft {
		return {
			step: this.step,
			archetype: this.archetype,
			config: { ...this.config },
			name: this.name,
			tagline: this.tagline,
			manifesto: this.manifesto,
			manifestoHtml: this.manifestoHtml,
			manifestoText: this.manifestoText,
			councilEnabled: this.councilEnabled
		};
	}

	restore(saved: SerializedDraft) {
		this.step = saved.step;
		this.archetype = saved.archetype;
		this.config = { ...EMPTY_CONFIG, ...saved.config };
		this.name = saved.name;
		this.tagline = saved.tagline;
		this.manifesto = saved.manifesto;
		this.manifestoHtml = saved.manifestoHtml;
		this.manifestoText = saved.manifestoText;
		this.councilEnabled = saved.councilEnabled;
	}
}
