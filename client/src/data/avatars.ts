export interface Avatar {
  id: string;
  name: string;
  emoji: string;
  accessory: string;
  gradient: string;
  textColor: string;
}

export const AVATARS: Avatar[] = [
  { id: 'kedi',    name: 'Kedi',    emoji: '🐱', accessory: '👓', gradient: 'linear-gradient(135deg,#A060C0,#7030A0)', textColor: '#E8C8FF' },
  { id: 'boga',    name: 'Boğa',    emoji: '🐂', accessory: '🎩', gradient: 'linear-gradient(135deg,#607080,#405060)', textColor: '#C8D8E8' },
  { id: 'zurafa',  name: 'Zürafa',  emoji: '🦒', accessory: '👓', gradient: 'linear-gradient(135deg,#D09030,#A06010)', textColor: '#FFF0A0' },
  { id: 'aslan',   name: 'Aslan',   emoji: '🦁', accessory: '🎀', gradient: 'linear-gradient(135deg,#C08030,#905010)', textColor: '#FFD890' },
  { id: 'panda',   name: 'Panda',   emoji: '🐼', accessory: '👒', gradient: 'linear-gradient(135deg,#484848,#282828)', textColor: '#E0E0E0' },
  { id: 'tavsan',  name: 'Tavşan',  emoji: '🐰', accessory: '🎀', gradient: 'linear-gradient(135deg,#D080A0,#A05070)', textColor: '#FFD0E8' },
  { id: 'tilki',   name: 'Tilki',   emoji: '🦊', accessory: '🧐', gradient: 'linear-gradient(135deg,#D07030,#A04010)', textColor: '#FFD0A0' },
  { id: 'ayi',     name: 'Ayı',     emoji: '🐻', accessory: '👓', gradient: 'linear-gradient(135deg,#805030,#583018)', textColor: '#FFD8A0' },
  { id: 'esek',    name: 'Eşek',    emoji: '🫏', accessory: '🎀', gradient: 'linear-gradient(135deg,#6080B0,#405880)', textColor: '#C0D8FF' },
  { id: 'baykus',  name: 'Baykuş',  emoji: '🦉', accessory: '🎩', gradient: 'linear-gradient(135deg,#806040,#504020)', textColor: '#FFE8A0' },
  { id: 'kedi2',   name: 'Tekir',   emoji: '😸', accessory: '🎀', gradient: 'linear-gradient(135deg,#708090,#485860)', textColor: '#D0E0F0' },
  { id: 'kurt',    name: 'Kurt',    emoji: '🐺', accessory: '🎀', gradient: 'linear-gradient(135deg,#909090,#606060)', textColor: '#F0F0F0' },
  { id: 'fil',     name: 'Fil',     emoji: '🐘', accessory: '🎩', gradient: 'linear-gradient(135deg,#8090A8,#506070)', textColor: '#D0E8FF' },
  { id: 'papagan', name: 'Papağan', emoji: '🦜', accessory: '👓', gradient: 'linear-gradient(135deg,#30A050,#107030)', textColor: '#A0FFB8' },
  { id: 'kaplan',  name: 'Kaplan',  emoji: '🐯', accessory: '🎩', gradient: 'linear-gradient(135deg,#C87020,#904010)', textColor: '#FFD890' },
  { id: 'koyun',   name: 'Koyun',   emoji: '🐑', accessory: '🧐', gradient: 'linear-gradient(135deg,#B0A890,#807860)', textColor: '#F8F0E0' },
];

export function getAvatar(id: string): Avatar {
  return AVATARS.find(a => a.id === id) ?? AVATARS[0]!;
}
