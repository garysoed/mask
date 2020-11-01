import { StateService } from 'gs-tools/export/state';
import { source } from 'grapevine';

export const $stateService = source('StateService', () => new StateService());
