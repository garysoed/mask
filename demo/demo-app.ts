import { getOrRegisterApp as getOrRegisterVineApp } from 'grapevine/export/main';
import { getOrRegisterApp as getOrRegisterPersonaApp } from 'persona/export/main';

const vine = getOrRegisterVineApp('demo');
const persona = getOrRegisterPersonaApp('demo', vine);

export const demoApp = {
  persona,
  vine,
};
