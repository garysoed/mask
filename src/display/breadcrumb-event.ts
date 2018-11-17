export const BREADCRUMB_CLICK_EVENT = 'mk-breadcrumb-click-event';

export class BreadcrumbClickEvent extends Event {
  constructor(readonly crumbKey: string) {
    super(BREADCRUMB_CLICK_EVENT);
  }
}
