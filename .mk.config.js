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
  as: shell({
    bin: 'simpleserver',
    flags: [
      'demo/static.conf.json',
    ],
  }),
});

