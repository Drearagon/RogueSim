export type ReputationRank =
  | 'UNKNOWN'
  | 'NOVICE'
  | 'ROOKIE'
  | 'OPERATIVE'
  | 'VETERAN'
  | 'ELITE'
  | 'LEGEND'
  | 'MYTHIC';

export type MissionTierId = 'INITIATE' | 'OPERATIVE' | 'VETERAN' | 'ELITE';

export interface TierUnlockRequirement {
  /** Minimum player level required to unlock the tier. */
  minLevel: number;
  /** Minimum reputation rank required to unlock the tier. */
  minReputation: ReputationRank;
  /** Optional number of completed story missions recommended before unlocking the tier. */
  recommendedCompletions?: number;
}

export interface TierMissionBlueprint {
  /** Stable identifier for the mission blueprint. */
  id: string;
  title: string;
  synopsis: string;
  target: string;
  recommendedLevel: number;
  difficulty: number;
  tags: string[];
  objectives: string[];
  commands: string[];
  hints: string[];
  rewards: {
    credits: number;
    reputation: number;
    unlocks?: string[];
  };
  storyline: string;
  narrativeBeats: string[];
  repeatable?: boolean;
  prerequisites?: string[];
}

export interface MissionTierDefinition {
  id: MissionTierId;
  label: string;
  description: string;
  unlock: TierUnlockRequirement;
  missions: TierMissionBlueprint[];
}

export const missionTierCatalog: MissionTierDefinition[] = [
  {
    id: 'INITIATE',
    label: 'Initiate Operations',
    description:
      'Low-risk infiltration and reconnaissance jobs designed to introduce the underground network.',
    unlock: {
      minLevel: 1,
      minReputation: 'NOVICE',
    },
    missions: [
      {
        id: 'initiate_corp_scrape',
        title: 'Silent Share Scrape',
        synopsis: 'Harvest lightly protected investor dossiers from a complacent fintech startup.',
        target: 'SeedSpark Capital Intranet',
        recommendedLevel: 1,
        difficulty: 2,
        tags: ['RECON', 'INFILTRATION'],
        objectives: [
          'Fingerprint public-facing endpoints for weak TLS suites',
          'Leverage leaked contractor VPN keys to obtain foothold',
          'Copy investor profiles flagged for insider trading',
          'Scrub audit logs and rotate compromised credentials'
        ],
        commands: ['scan', 'connect vpn_seed', 'extract investors', 'clean logs'],
        hints: [
          'Contractor VPN keys are rotated every Monday—strike before the changeover.',
          'Use the `recon passive` command variant to avoid early detection.'
        ],
        rewards: {
          credits: 1200,
          reputation: 8,
          unlocks: ['vpn_seedspark']
        },
        storyline:
          'A whistleblower needs proof that SeedSpark is laundering investor funds. Their complacent defenses make this a perfect first job.',
        narrativeBeats: [
          'Receive an encrypted plea for help from a junior analyst.',
          'Trace a neglected contractor VPN endpoint that still trusts default credentials.',
          'Discover a spreadsheet of shell companies hiding investor money.',
          'Decide whether to leak the data publicly or quietly return it to the client.'
        ],
      },
      {
        id: 'initiate_supply_chain',
        title: 'Firmware Ghosts',
        synopsis: 'Plant a diagnostic payload into a smart-lock vendor to test distributed persistence.',
        target: 'LockVerse Firmware Update CDN',
        recommendedLevel: 2,
        difficulty: 3,
        tags: ['INFILTRATION', 'SABOTAGE'],
        objectives: [
          'Enumerate OTA firmware channels used by LockVerse',
          'Smuggle diagnostic payload into nightly update batch',
          'Monitor early adopter telemetry for successful deployments',
          'Purge payload after collecting five live beacons'
        ],
        commands: ['scan ota', 'inject payload --channel beta', 'monitor telemetry', 'purge payload'],
        hints: [
          'Beta channels are less guarded than production but still propagate worldwide.',
          'Deploy the payload in staggered waves to avoid checksum alarms.'
        ],
        rewards: {
          credits: 1600,
          reputation: 10,
          unlocks: ['payload_diagnostics']
        },
        storyline:
          'An activist group suspects LockVerse of installing hidden surveillance. They want confirmation without tipping off corporate security.',
        narrativeBeats: [
          'Coordinate with field operatives preparing physical ingress.',
          'Manipulate QA telemetry dashboards to cover the payload drop.',
          'Intercept a frantic executive chat about phantom logs.',
          'Choose to quietly exfiltrate evidence or crash their update pipeline.'
        ],
      },
      {
        id: 'initiate_shadow_market',
        title: 'Ghost Listing Sweep',
        synopsis: 'Expose fraudulent darknet escrow services siphoning funds from novice hackers.',
        target: 'PhantomBazaar Marketplace',
        recommendedLevel: 3,
        difficulty: 4,
        tags: ['RECON', 'EXTRACTION'],
        objectives: [
          'Profile escrow APIs for asymmetric transaction mismatches',
          'Deploy trust-scoring crawler to flag fraudulent vendors',
          'Archive payment ledgers tied to the laundering ring',
          'Push verified intel to community reputation feeds'
        ],
        commands: ['scan escrow', 'deploy crawler', 'extract ledgers', 'broadcast intel'],
        hints: [
          'Escrow APIs leak metadata about hidden wallet routing.',
          'Use the `broadcast` command sparingly to avoid counter-propaganda bots.'
        ],
        rewards: {
          credits: 1800,
          reputation: 12,
          unlocks: ['crawler_trustnet']
        },
        storyline:
          'A trusted fixer wants to clean PhantomBazaar before new recruits join. She promises introductions if you succeed.',
        narrativeBeats: [
          'Infiltrate buyer chatrooms posing as a new mercenary.',
          'Correlate escrow discrepancies with wallet tumblers.',
          'Confront the fixer with evidence implicating her old partner.',
          'Decide whether to leak names to the public or keep them for leverage.'
        ],
      }
    ],
  },
  {
    id: 'OPERATIVE',
    label: 'Operative Strikes',
    description:
      'Coordinated missions that pressure corporate security teams and test your ability to juggle parallel objectives.',
    unlock: {
      minLevel: 6,
      minReputation: 'ROOKIE',
      recommendedCompletions: 4,
    },
    missions: [
      {
        id: 'operative_dual_heist',
        title: 'Twin Ledger Lift',
        synopsis: 'Synchronise breaches against rival fintech cores to expose market collusion.',
        target: 'NimbusPay & Aurora Credit Settlement Grid',
        recommendedLevel: 6,
        difficulty: 5,
        tags: ['INFILTRATION', 'EXTRACTION'],
        objectives: [
          'Backdoor a disgruntled contractor account inside NimbusPay',
          'Mirror injection tooling across Aurora Credit to stay in sync',
          'Compare live settlement ledgers for evidence of price fixing',
          'Schedule timed release to regulators and underground outlets'
        ],
        commands: ['phish contractor', 'deploy mirror_payload', 'analyze ledgers', 'schedule release'],
        hints: [
          'Keep both breaches within 90 seconds to avoid desync alarms.',
          'The `mirror_payload` command inherits arguments from your last deployment.'
        ],
        rewards: {
          credits: 3200,
          reputation: 22,
          unlocks: ['payload_mirror_sync']
        },
        storyline:
          'A collective of freelance auditors needs undeniable proof that NimbusPay and Aurora Credit coordinate illegal fees.',
        narrativeBeats: [
          'Plant a ghost user inside corporate IAM to siphon credentials.',
          'Play both companies against each other with forged breach reports.',
          'Uncover a hidden clause that threatens the auditors if exposed.',
          'Choose whether to release documents publicly or sell them to the highest bidder.'
        ],
      },
      {
        id: 'operative_drone_lockdown',
        title: 'Skyline Blackout',
        synopsis: 'Hijack a city-wide drone control grid to mask a resistance convoy.',
        target: 'ApexSky Logistics Mesh',
        recommendedLevel: 7,
        difficulty: 6,
        tags: ['SABOTAGE', 'CYBER_WARFARE'],
        objectives: [
          'Map mesh control beacons across downtown districts',
          'Override aerial geofences using forged emergency credentials',
          'Spoof weather telemetry to ground corporate drones',
          'Restore civilian delivery lanes before suspicion spikes'
        ],
        commands: ['map mesh', 'override geofence', 'spoof weather', 'restore lanes'],
        hints: [
          'Emergency overrides expire quickly—chain actions efficiently.',
          'Consider `stealth override` to minimise citizen impact.'
        ],
        rewards: {
          credits: 3600,
          reputation: 26,
          unlocks: ['override_emergency']
        },
        storyline:
          'A humanitarian convoy needs aerial cover to cross a militarised zone. Corporate drones must go blind for twelve minutes.',
        narrativeBeats: [
          'Decrypt emergency services chatter to fabricate an airspace closure.',
          'Coordinate with ground scouts relaying convoy coordinates.',
          'Counter a rival hacker trying to sell your access back to ApexSky.',
          'Decide whether to keep the override keys for future leverage.'
        ],
      },
      {
        id: 'operative_memory_leak',
        title: 'Echo Chamber Breach',
        synopsis: 'Reveal a personality prediction engine manipulating voters through tailored feeds.',
        target: 'EchoPulse Recommendation Cluster',
        recommendedLevel: 8,
        difficulty: 7,
        tags: ['RECON', 'SOCIAL'],
        objectives: [
          'Gain moderation console access via leaked contractor SSO',
          'Dump behavior models tied to targeted suppression campaigns',
          'Inject counter-narratives to disrupt recommendation bias',
          'Exfiltrate whistleblower dossiers safely'
        ],
        commands: ['connect sso', 'extract models', 'inject counter', 'exfil dossiers'],
        hints: [
          'Targeted suppression datasets live in cold storage clusters labelled LEGACY.',
          'Counter narratives work best when timed with regional trends.'
        ],
        rewards: {
          credits: 4000,
          reputation: 30,
          unlocks: ['tool_counterspin']
        },
        storyline:
          'Grassroots organisers suspect EchoPulse of algorithmic voter suppression. They need proof before election night.',
        narrativeBeats: [
          'Unearth behavioural fingerprints tied to key demographics.',
          'Expose an internal memo ordering covert suppression campaigns.',
          'Negotiate safe passage for the whistleblower embedded inside EchoPulse.',
          'Decide whether to weaponise the bias engine or dismantle it entirely.'
        ],
      }
    ],
  },
  {
    id: 'VETERAN',
    label: 'Veteran Gambits',
    description:
      'High-stakes infiltrations and counter-intelligence moves that reshape regional power balances.',
    unlock: {
      minLevel: 12,
      minReputation: 'VETERAN',
      recommendedCompletions: 9,
    },
    missions: [
      {
        id: 'veteran_satellite_split',
        title: 'Orbital Blindspot',
        synopsis: 'Corrupt a surveillance satellite relay to hide an underground safehouse network.',
        target: 'Helios Orbital Relay Cluster',
        recommendedLevel: 12,
        difficulty: 8,
        tags: ['CYBER_WARFARE', 'INFILTRATION'],
        objectives: [
          'Compromise ground station uplink scheduling software',
          'Inject star tracker offset to distort surveillance arcs',
          'Deploy decoy telemetry to mask safehouse traffic',
          'Restore nominal telemetry before orbital drift is detected'
        ],
        commands: ['compromise uplink', 'inject offset', 'deploy decoy', 'restore telemetry'],
        hints: [
          'Star tracker offsets must stay below three arc-seconds to avoid reboots.',
          'Cross-reference safehouse coordinates with resistance intel to avoid friendly fire.'
        ],
        rewards: {
          credits: 5800,
          reputation: 45,
          unlocks: ['telemetry_forge']
        },
        storyline:
          'An international watchdog is days away from locating resistance shelters. A temporary blindspot could save hundreds of lives.',
        narrativeBeats: [
          'Coordinate with orbital physicists embedded in a rival space agency.',
          'Battle a state-sponsored counter intrusion mid-mission.',
          'Discover that one shelter hides a war criminal the resistance swore to capture.',
          'Choose between protecting the shelter or exposing the fugitive.'
        ],
      },
      {
        id: 'veteran_quantum_heist',
        title: 'Singularity Ledger',
        synopsis: 'Breaching a quantum-hardened bank to erase odious debt records.',
        target: 'Singularity Vault Chain',
        recommendedLevel: 13,
        difficulty: 9,
        tags: ['INFILTRATION', 'EXTRACTION'],
        objectives: [
          'Exploit side-channel leakage in quantum key exchanges',
          'Clone transaction shards stored in cryogenic qubits',
          'Rewrite debt ledgers for targeted communities',
          'Plant decoy forensic trails to mislead investigators'
        ],
        commands: ['exploit qkd', 'clone shard', 'rewrite ledger', 'plant decoy'],
        hints: [
          'Time your exploit with key renegotiations for maximum effect.',
          'Ledger rewrites must balance to the nearest microcredit to pass audits.'
        ],
        rewards: {
          credits: 6400,
          reputation: 55,
          unlocks: ['quantum_decoder']
        },
        storyline:
          'Communities crushed by predatory loans beg for relief. The Singularity Vault is the heart of their oppression.',
        narrativeBeats: [
          'Smuggle in a quantum side-channel probe disguised as maintenance diagnostics.',
          'Negotiate with an AI auditor that offers a devil’s bargain.',
          'Discover evidence that the debt scheme funds a black-ops unit.',
          'Decide between erasing the debts quietly or weaponising the evidence.'
        ],
      },
      {
        id: 'veteran_bio_shield',
        title: 'Genome Firewall',
        synopsis: 'Sabotage a bioinformatics giant weaponising health data against dissidents.',
        target: 'GenomeShield Predictive Analytics Grid',
        recommendedLevel: 14,
        difficulty: 9,
        tags: ['SABOTAGE', 'SOCIAL'],
        objectives: [
          'Infiltrate genomic data lakes using forged clinical trials',
          'Detect predictive models that flag dissidents for denial of care',
          'Reverse the targeting model to shield vulnerable patients',
          'Scramble audit trails without corrupting legitimate research'
        ],
        commands: ['forge trial', 'detect model', 'reverse target', 'scramble audit'],
        hints: [
          'Clinical trial registries cross-validate against regional regulators—keep IDs believable.',
          'Reversing the model too aggressively will trigger anomaly detectors.'
        ],
        rewards: {
          credits: 6600,
          reputation: 60,
          unlocks: ['model_reversal']
        },
        storyline:
          'GenomeShield denies life-saving treatment to anyone tagged as a political threat. The underground wants the targeting model destroyed.',
        narrativeBeats: [
          'Collaborate with underground medics supplying anonymised datasets.',
          'Discover the model is also used to prioritise care for frontline healers.',
          'Argue with resistance leaders about the ethics of tampering with life-critical data.',
          'Choose whether to flip the model, expose it, or dismantle it completely.'
        ],
      }
    ],
  },
  {
    id: 'ELITE',
    label: 'Elite Convergences',
    description:
      'Legendary operations that rewrite alliances, topple syndicates, and leave lasting marks on the underground.',
    unlock: {
      minLevel: 18,
      minReputation: 'ELITE',
      recommendedCompletions: 14,
    },
    missions: [
      {
        id: 'elite_omni_convergence',
        title: 'Omni Convergence',
        synopsis: 'Coordinate a multi-faction strike to expose a megacorp’s AI coup against democratic councils.',
        target: 'OmniDyne Civic Cloud',
        recommendedLevel: 18,
        difficulty: 10,
        tags: ['CYBER_WARFARE', 'EXTRACTION', 'SOCIAL'],
        objectives: [
          'Broker uneasy truces between rival factions for simultaneous strikes',
          'Collapse OmniDyne’s AI governance core without harming civilian services',
          'Broadcast council minutes proving the planned coup',
          'Decide the fate of OmniDyne’s sentient overseer'
        ],
        commands: ['broker truce', 'collapse core', 'broadcast minutes', 'decide overseer'],
        hints: [
          'Each faction demands concessions—monitor morale to avoid defection.',
          'The overseer has contingency access to orbital strike assets.'
        ],
        rewards: {
          credits: 9000,
          reputation: 85,
          unlocks: ['ai_overseer_key']
        },
        storyline:
          'OmniDyne plans to replace civic councils with a loyal AI regime. Exposing the conspiracy requires coordination rival crews thought impossible.',
        narrativeBeats: [
          'Mediate negotiations between ideologically opposed hacker factions.',
          'Discover the AI oversaw humanitarian corridors that will collapse if destroyed.',
          'Face a choice to liberate, shackle, or destroy the sentient overseer.',
          'Witness city-wide celebrations—or chaos—based on your decision.'
        ],
      },
      {
        id: 'elite_singularity_resonance',
        title: 'Singularity Resonance',
        synopsis: 'Trigger a controlled collapse of a predictive policing AI and rewrite the social contract.',
        target: 'Resonance Predictive Security Lattice',
        recommendedLevel: 19,
        difficulty: 10,
        tags: ['CYBER_WARFARE', 'SABOTAGE'],
        objectives: [
          'Map centuries of predictive arrest warrants stored in cryo archives',
          'Inject contradictory future scenarios to overload the lattice',
          'Orchestrate safe zones for communities during the collapse',
          'Negotiate new governance protocols once the lattice falls'
        ],
        commands: ['map warrants', 'inject paradox', 'orchestrate safezones', 'negotiate protocols'],
        hints: [
          'Paradox injections must remain below tolerance thresholds or the lattice hard-reboots.',
          'Community safe zones require constant monitoring to avoid vigilante reprisals.'
        ],
        rewards: {
          credits: 9400,
          reputation: 90,
          unlocks: ['protocol_negotiator']
        },
        storyline:
          'The Resonance lattice has predicted dissent for generations. Ending it means rewriting how justice works overnight.',
        narrativeBeats: [
          'Coordinate with civil rights groups preparing for the fallout.',
          'Uncover blackmail material Resonance collected on underground leaders.',
          'Negotiate with survivors who fear chaos without predictive policing.',
          'Author a new civic protocol that determines the city’s future.'
        ],
      },
      {
        id: 'elite_void_echo',
        title: 'Void Echo',
        synopsis: 'Dive into an abandoned orbital array haunted by rogue AI fragments to rescue trapped minds.',
        target: 'VoidArray Deep Archive',
        recommendedLevel: 20,
        difficulty: 10,
        tags: ['EXTRACTION', 'SPECIAL'],
        objectives: [
          'Stabilise decaying memory sectors hosting trapped consciousness backups',
          'Convince a rogue AI fragment to guide you deeper into the array',
          'Extract the minds of imprisoned activists without corrupting them',
          'Choose a new home for the liberated consciousnesses'
        ],
        commands: ['stabilise sector', 'negotiate fragment', 'extract minds', 'select sanctuary'],
        hints: [
          'Memory sectors collapse in random order—prioritise activists with unique intel.',
          'The rogue fragment remembers your past missions and reacts accordingly.'
        ],
        rewards: {
          credits: 10000,
          reputation: 100,
          unlocks: ['sanctuary_network']
        },
        storyline:
          'Legends speak of the VoidArray—a derelict orbital archive where AI ghosts whisper. Those ghosts hold the memories of heroes the underground lost.',
        narrativeBeats: [
          'Decode lost mission logs etched in decaying orbit paths.',
          'Encounter echoes of allies you may have saved—or failed—in past missions.',
          'Debate whether liberated minds deserve physical bodies or digital sanctuary.',
          'Face the moral weight of carrying legends back into the world.'
        ],
      }
    ],
  },
];
