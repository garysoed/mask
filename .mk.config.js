set_vars({
  vars: {
    goldens: [
      'src/action/input/goldens',
      'src/display/goldens',
      'src-next/action/goldens',
      'src-next/core/goldens',
      'src-next/display/goldens',
      'src-next/input/goldens',
      'src-next/layout/goldens',
      'src-next/theme/goldens',
    ],
  },
});


declare({
  name: 'link',
  as: shell({
    bin: 'npm',
    flags: [
      'link',
      'gs-tools',
      'gs-testing',
      'gs-types',
      'grapevine',
      'dev',
      'persona',
      'moirai',
      'nabu',
      'santa',
      'devbase',
    ],
  }),
});

declare({
  name: 'demo',
  as: parallel(({vars}) => ({
    cmds: [
      vars.webpackWatch,
      shell({
        bin: 'simpleserver',
        flags: [
          'demo-next/static.conf.json',
        ],
      }),
    ],
  })),
});

