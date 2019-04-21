import { $pipe, $push, asImmutableMap } from '@gs-tools/collect';
import { take } from 'rxjs/operators';
import { Checkbox } from 'src/input/checkbox';
import { $svgConfig, Breadcrumb, Drawer, Icon, IconWithText, Palette, start as startMask, SvgConfig, TextIconButton, Theme } from '../export';
import { DemoCtrl } from './demo-ctrl';

const theme = new Theme(Palette.ORANGE, Palette.GREEN);

window.addEventListener('load', () => {
  const {vine} = startMask(
      'demo',
      [
        Breadcrumb,
        Checkbox,
        // CroppedLine,
        DemoCtrl,
        // Dialog,
        Drawer,
        Icon,
        IconWithText,
        // LayoutOverlay,
        // ListItem,
        TextIconButton,
        // TextInput,
      ],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement);

  const svgConfigSbj = $svgConfig.get(vine);
  svgConfigSbj
      .pipe(take(1))
      .subscribe(config => {
        const newConfig = $pipe(
            config,
            $push<[string, SvgConfig], string>(
                ['highlight', {type: 'remote' as 'remote', url: './asset/highlight.svg'}],
                ['logo', {type: 'remote' as 'remote', url: './asset/mask.svg'}],
                ['palette', {type: 'remote' as 'remote', url: './asset/palette.svg'}],
            ),
            asImmutableMap(),
        );
        svgConfigSbj.next(newConfig);
      });

  // vine.getObservable($dialogService).subscribe(service => {
  //   Jsons.setValue(window, 'demo.dialogService', service);
  // });
});
