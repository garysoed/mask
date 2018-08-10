import { getOrRegisterApp as getOrRegisterGrapevineApp } from 'grapevine/export/main';
import { getOrRegisterApp as getOrRegisterPersonaApp } from 'persona/export/main';

export const vineApp_ = getOrRegisterGrapevineApp('maskBase');
export const persona_ = getOrRegisterPersonaApp('maskBase', vineApp_);
