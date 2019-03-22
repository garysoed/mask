import { $pipe, $push, asImmutableMap } from 'gs-tools/export/collect';
import { Jsons } from 'gs-tools/export/data';
import { take } from 'rxjs/operators';
import { ConsoleDestination, logDestination } from 'santa/export';
import { Palette, start as startMask } from '../export';
import { $theme, _v } from '../src/app/app';
import { TextIconButton } from '../src/component/text-icon-button';
import { Breadcrumb } from '../src/display/breadcrumb';
import { CroppedLine } from '../src/display/cropped-line';
import { Icon } from '../src/display/icon';
import { IconWithText } from '../src/display/icon-with-text';
import { SvgConfig } from '../src/display/svg-config';
import { $svgConfig } from '../src/display/svg-service';
import { TextInput } from '../src/input/text-input';
import { Dialog } from '../src/section/dialog';
import { $dialogService } from '../src/section/dialog-service';
import { Drawer } from '../src/section/drawer';
import { Theme } from '../src/theme/theme';
import { DemoCtrl } from './demo-ctrl';

const theme = new Theme(Palette.ORANGE, Palette.GREEN);

window.addEventListener('load', () => {
  const {vine: maskVine} = startMask(
      [
        Breadcrumb,
        CroppedLine,
        DemoCtrl,
        Dialog,
        Drawer,
        Icon,
        IconWithText,
        TextIconButton,
        TextInput,
      ],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement);

  maskVine.getObservable($svgConfig)
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
        maskVine.setValue($svgConfig, newConfig);
      });

  maskVine.getObservable($theme).subscribe(theme => maskVine.setValue($theme, theme));
  maskVine.getObservable($dialogService).subscribe(service => {
    Jsons.setValue(window, 'demo.dialogService', service);
  });
});
