import {source} from 'grapevine';
import {StateService} from 'gs-tools/export/state';

export const $stateService = source('StateService', () => new StateService());
