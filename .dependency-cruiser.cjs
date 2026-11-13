/** Starter boundaries for feature modules and their lower-level dependencies. */
module.exports = {
  forbidden: [
    { name: 'no-cycles', severity: 'error', from: {}, to: { circular: true } },
    {
      name: 'shared-does-not-import-features',
      severity: 'error',
      from: { path: '^src/shared/' },
      to: { path: '^src/features/' },
    },
    {
      name: 'design-system-does-not-import-features',
      severity: 'error',
      from: { path: '^src/design-system/' },
      to: { path: '^src/features/' },
    },
    {
      name: 'types-have-no-app-dependencies',
      severity: 'error',
      from: { path: '^src/types/' },
      to: { path: '^src/', pathNot: '^src/types/' },
    },
    {
      name: 'features-do-not-import-peer-internals',
      severity: 'error',
      from: { path: '^src/features/([^/]+)/' },
      to: { path: '^src/features/', pathNot: '^src/features/$1/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.(test|spec|stories)\\.[tj]sx?$|^src/test(-utils)?/' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: { extensions: ['.ts', '.tsx', '.js', '.json'] },
  },
};
