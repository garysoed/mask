import { Palette, start as startMask } from '../export';
import { Theme } from '../src/theme/theme';

const theme = new Theme(Palette.ORANGE, Palette.GREEN);

window.addEventListener('load', () => {
  const {vine} = startMask(
      'demo',
      [
        // Breadcrumb,
        // Checkbox,
        // CroppedLine,
        // DemoCtrl,
        // Dialog,
        // Drawer,
        // Icon,
        // IconWithText,
        // LayoutOverlay,
        // ListItem,
        // TextIconButton,
        // TextInput,
      ],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement);

  // vine.getObservable($svgConfig)
  //     .pipe(take(1))
  //     .subscribe(config => {
  //       const newConfig = $pipe(
  //           config,
  //           $push<[string, SvgConfig], string>(
  //               ['highlight', {type: 'remote' as 'remote', url: './asset/highlight.svg'}],
  //               ['logo', {type: 'remote' as 'remote', url: './asset/mask.svg'}],
  //               ['palette', {type: 'remote' as 'remote', url: './asset/palette.svg'}],
  //           ),
  //           asImmutableMap(),
  //       );
  //       vine.setValue($svgConfig, newConfig);
  //     });

  // vine.getObservable($dialogService).subscribe(service => {
  //   Jsons.setValue(window, 'demo.dialogService', service);
  // });
});
