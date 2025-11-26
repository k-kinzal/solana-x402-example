export type Rarity = 'common' | 'rare' | 'superRare';

export interface GatyaMessage {
  id: number;
  rarity: Rarity;
  message: string;
  emoji: string;
}

export const RARITY_CONFIG: Record<Rarity, {
  label: string;
  color: string;
  bgColor: string;
  glowColor: string;
  probability: number;
}> = {
  common: {
    label: 'Common',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    glowColor: 'rgba(156, 163, 175, 0.5)',
    probability: 80,
  },
  rare: {
    label: 'Rare',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    probability: 15,
  },
  superRare: {
    label: 'Super Rare',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    glowColor: 'rgba(245, 158, 11, 0.8)',
    probability: 5,
  },
};

// 80 Common messages
const commonMessages: Omit<GatyaMessage, 'id'>[] = [
  { rarity: 'common', message: 'Welcome to the world of Solana!', emoji: '👋' },
  { rarity: 'common', message: 'Have an amazing day ahead!', emoji: '☀️' },
  { rarity: 'common', message: 'Your blockchain journey begins now', emoji: '🚀' },
  { rarity: 'common', message: 'Web3 adventurer, march forward!', emoji: '⚔️' },
  { rarity: 'common', message: 'Sail the digital ocean', emoji: '⛵' },
  { rarity: 'common', message: 'Code is poetry, blockchain is music', emoji: '🎵' },
  { rarity: 'common', message: 'Chasing the dream of decentralization', emoji: '💫' },
  { rarity: 'common', message: 'Transaction successful!', emoji: '✅' },
  { rarity: 'common', message: 'Solana is fast, and so are you!', emoji: '⚡' },
  { rarity: 'common', message: 'Experience the 400ms miracle', emoji: '⏱️' },
  { rarity: 'common', message: 'Low gas fees are beautiful', emoji: '💰' },
  { rarity: 'common', message: 'Dive into the NFT world!', emoji: '🎨' },
  { rarity: 'common', message: 'First step to becoming a DeFi master', emoji: '📈' },
  { rarity: 'common', message: 'HODL with conviction', emoji: '💎' },
  { rarity: 'common', message: 'Stake and earn', emoji: '🥩' },
  { rarity: 'common', message: 'Thanks to validators!', emoji: '🙏' },
  { rarity: 'common', message: 'Consensus is beautiful', emoji: '🤝' },
  { rarity: 'common', message: 'The magic of smart contracts', emoji: '✨' },
  { rarity: 'common', message: 'Trust built with Rust', emoji: '🦀' },
  { rarity: 'common', message: 'On-chain truth', emoji: '📜' },
  { rarity: 'common', message: 'Guard your wallet', emoji: '👛' },
  { rarity: 'common', message: 'Keep your seed phrase secret', emoji: '🤫' },
  { rarity: 'common', message: 'Join a DAO today', emoji: '🏛️' },
  { rarity: 'common', message: 'Power of governance tokens', emoji: '🗳️' },
  { rarity: 'common', message: 'Yield farming in progress', emoji: '🌾' },
  { rarity: 'common', message: 'Provide liquidity', emoji: '💧' },
  { rarity: 'common', message: 'Understand how AMMs work', emoji: '🔄' },
  { rarity: 'common', message: 'Watch out for impermanent loss', emoji: '⚠️' },
  { rarity: 'common', message: 'Bridge your assets', emoji: '🌉' },
  { rarity: 'common', message: 'The era of multichain', emoji: '🔗' },
  { rarity: 'common', message: 'Solana: King of Layer 1', emoji: '👑' },
  { rarity: 'common', message: 'TPS makes the difference', emoji: '📊' },
  { rarity: 'common', message: 'Innovation of Proof of History', emoji: '📚' },
  { rarity: 'common', message: 'Security of Tower BFT', emoji: '🏰' },
  { rarity: 'common', message: 'Trust in the cluster', emoji: '🌐' },
  { rarity: 'common', message: 'Hoping for an airdrop', emoji: '🪂' },
  { rarity: 'common', message: 'First come, first mint', emoji: '🏃' },
  { rarity: 'common', message: 'Check the floor price', emoji: '📉' },
  { rarity: 'common', message: 'Seeking rarity', emoji: '🔍' },
  { rarity: 'common', message: 'Joy of a collector', emoji: '🖼️' },
  { rarity: 'common', message: 'Time to change your PFP', emoji: '🐵' },
  { rarity: 'common', message: 'See you in the metaverse', emoji: '🌌' },
  { rarity: 'common', message: 'The age of Play to Earn', emoji: '🎮' },
  { rarity: 'common', message: 'Move to Earn for health', emoji: '🏃‍♂️' },
  { rarity: 'common', message: 'Potential of Social-Fi', emoji: '👥' },
  { rarity: 'common', message: 'Long live the creator economy', emoji: '🎭' },
  { rarity: 'common', message: 'Earn your royalties', emoji: '💸' },
  { rarity: 'common', message: 'To the secondary market', emoji: '🏪' },
  { rarity: 'common', message: 'Win at auction', emoji: '🔨' },
  { rarity: 'common', message: 'Dutch auction starting!', emoji: '🇳🇱' },
  { rarity: 'common', message: 'Whitelist secured!', emoji: '📝' },
  { rarity: 'common', message: 'Earn the OG title', emoji: '🏅' },
  { rarity: 'common', message: 'Gather intel on Discord', emoji: '💬' },
  { rarity: 'common', message: 'Hunt alpha on Twitter', emoji: '🐦' },
  { rarity: 'common', message: 'Always DYOR', emoji: '🔬' },
  { rarity: 'common', message: 'NFA - Not Financial Advice', emoji: '📢' },
  { rarity: 'common', message: 'Beware of rug pulls', emoji: '🚨' },
  { rarity: 'common', message: 'Audits matter', emoji: '🔒' },
  { rarity: 'common', message: 'Hardware wallet recommended', emoji: '🔐' },
  { rarity: 'common', message: 'Watch out for phishing!', emoji: '🎣' },
  { rarity: 'common', message: 'Always verify the URL', emoji: '🔗' },
  { rarity: 'common', message: 'Practice on testnet', emoji: '🧪' },
  { rarity: 'common', message: 'Get devnet SOL', emoji: '🚰' },
  { rarity: 'common', message: 'Faucets are your friend', emoji: '💦' },
  { rarity: 'common', message: 'Support the builders', emoji: '👷' },
  { rarity: 'common', message: 'Power of open source', emoji: '📖' },
  { rarity: 'common', message: 'Star it on GitHub', emoji: '⭐' },
  { rarity: 'common', message: 'Start contributing', emoji: '🤲' },
  { rarity: 'common', message: 'Join a hackathon!', emoji: '💻' },
  { rarity: 'common', message: 'Win that grant', emoji: '🎁' },
  { rarity: 'common', message: 'Grow the ecosystem', emoji: '🌱' },
  { rarity: 'common', message: 'Power of community', emoji: '🤜🤛' },
  { rarity: 'common', message: 'Network at meetups', emoji: '🍻' },
  { rarity: 'common', message: 'Learn at conferences', emoji: '🎤' },
  { rarity: 'common', message: 'Join a workshop', emoji: '📝' },
  { rarity: 'common', message: 'Complete that tutorial', emoji: '🏁' },
  { rarity: 'common', message: 'Read the docs', emoji: '📄' },
  { rarity: 'common', message: 'Build with Anchor', emoji: '⚓' },
  { rarity: 'common', message: 'Write in TypeScript', emoji: '📘' },
  { rarity: 'common', message: 'Keep building!', emoji: '🔨' },
];

// 15 Rare messages
const rareMessages: Omit<GatyaMessage, 'id'>[] = [
  { rarity: 'rare', message: 'Grateful for this rare encounter!', emoji: '💎' },
  { rarity: 'rare', message: 'You are the chosen one!', emoji: '⭐' },
  { rarity: 'rare', message: 'The gears of fate are turning', emoji: '⚙️' },
  { rarity: 'rare', message: 'Child of the blockchain', emoji: '👶' },
  { rarity: 'rare', message: 'You have the power to shape the future', emoji: '🔮' },
  { rarity: 'rare', message: 'Digital gold acquired', emoji: '🥇' },
  { rarity: 'rare', message: 'Path to becoming a whale unlocked', emoji: '🐋' },
  { rarity: 'rare', message: 'You have alpha hunter potential', emoji: '🎯' },
  { rarity: 'rare', message: 'Diamond hands confirmed', emoji: '💎🙌' },
  { rarity: 'rare', message: 'Find the next unicorn', emoji: '🦄' },
  { rarity: 'rare', message: 'Be a metaverse pioneer', emoji: '🌠' },
  { rarity: 'rare', message: 'Proof of Web3 native', emoji: '🎖️' },
  { rarity: 'rare', message: 'Tokenomics master', emoji: '📊' },
  { rarity: 'rare', message: 'On-chain explorer', emoji: '🗺️' },
  { rarity: 'rare', message: 'Protocol whisperer', emoji: '🧠' },
];

// 5 Super Rare messages
const superRareMessages: Omit<GatyaMessage, 'id'>[] = [
  { rarity: 'superRare', message: 'Legendary hero, time to awaken!', emoji: '🔥' },
  { rarity: 'superRare', message: 'The gods have blessed you!', emoji: '👑' },
  { rarity: 'superRare', message: 'Etch your name in blockchain mythology', emoji: '📜' },
  { rarity: 'superRare', message: 'Successor of Satoshi\'s will', emoji: '🌟' },
  { rarity: 'superRare', message: 'Ultimate decentralization, ultimate freedom', emoji: '🦅' },
];

// Combine all messages with IDs
export const GATYA_MESSAGES: GatyaMessage[] = [
  ...commonMessages.map((msg, i) => ({ ...msg, id: i + 1 })),
  ...rareMessages.map((msg, i) => ({ ...msg, id: i + 81 })),
  ...superRareMessages.map((msg, i) => ({ ...msg, id: i + 96 })),
];

export function drawGatya(): GatyaMessage {
  const rand = Math.random() * 100;

  let targetRarity: Rarity;
  if (rand < RARITY_CONFIG.superRare.probability) {
    targetRarity = 'superRare';
  } else if (rand < RARITY_CONFIG.superRare.probability + RARITY_CONFIG.rare.probability) {
    targetRarity = 'rare';
  } else {
    targetRarity = 'common';
  }

  const messages = GATYA_MESSAGES.filter(m => m.rarity === targetRarity);
  return messages[Math.floor(Math.random() * messages.length)];
}
