import { $pipe, $push, asImmutableMap } from '@gs-tools/collect';
import { Jsons } from '@gs-tools/data';
import { take } from '@rxjs/operators';
import { $dialogService, $svgConfig, Breadcrumb, Checkbox, CroppedLine, Dialog, Drawer, Icon, IconWithText, LayoutOverlay, ListItem, Palette, start as startMask, SvgConfig, TextIconButton, TextInput, Theme } from '../export';
import { DemoCtrl } from './demo-ctrl';

const theme = new Theme(Palette.ORANGE, Palette.GREEN);

window.addEventListener('load', () => {
  const {vine} = startMask(
      'demo',
      [
        Breadcrumb,
        Checkbox,
        CroppedLine,
        DemoCtrl,
        Dialog,
        Drawer,
        Icon,
        IconWithText,
        LayoutOverlay,
        ListItem,
        TextIconButton,
        TextInput,
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

  $dialogService.get(vine).subscribe(service => {
    Jsons.setValue(window, 'demo.dialogService', service);
  });
});
