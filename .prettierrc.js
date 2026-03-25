// =====================================================
# OMNI-PERFECT ENTERPRISE PRETTIER CONFIGURATION
# Comprehensive formatting rules for maximum code consistency

export default {
  // =====================================================
  // BASIC CONFIGURATION
  // =====================================================
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  quoteProps: 'as-needed',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  embeddedLanguageFormatting: 'auto',
  insertPragma: false,
  requirePragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: false,
  jsxSingleQuote: true,
  jsxBracketSameLine: false,

  // =====================================================
  // OVERRIDES FOR SPECIFIC FILE TYPES
  // =====================================================
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.css',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.scss',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.html',
      options: {
        singleQuote: false,
        printWidth: 120,
      },
    },
    {
      files: '*.vue',
      options: {
        singleQuote: false,
        printWidth: 100,
      },
    },
    {
      files: '*.tsx',
      options: {
        jsxSingleQuote: true,
        jsxBracketSameLine: false,
      },
    },
    {
      files: '*.jsx',
      options: {
        jsxSingleQuote: true,
        jsxBracketSameLine: false,
      },
    },
    {
      files: '*.ts',
      options: {
        printWidth: 100,
      },
    },
    {
      files: '*.js',
      options: {
        printWidth: 100,
      },
    },
  ],

  // =====================================================
  // PLUGIN CONFIGURATION
  // =====================================================
  plugins: [
    'prettier-plugin-tailwindcss',
    'prettier-plugin-organize-imports',
    'prettier-plugin-packagejson',
  ],

  // =====================================================
  // TAILWINDCSS PLUGIN OPTIONS
  // =====================================================
  tailwindConfig: './tailwind.config.ts',
  tailwindFunctions: ['clsx', 'cn', 'cva'],

  // =====================================================
  // ORGANIZE IMPORTS PLUGIN OPTIONS
  // =====================================================
  organizeImportsSkipDestructiveCodeActions: true,

  // =====================================================
  // PACKAGEJSON PLUGIN OPTIONS
  // =====================================================
  packageJsonSortOrder: [
    'name',
    'version',
    'description',
    'keywords',
    'homepage',
    'bugs',
    'license',
    'author',
    'contributors',
    'files',
    'main',
    'module',
    'types',
    'exports',
    'imports',
    'browser',
    'bin',
    'man',
    'directories',
    'repository',
    'scripts',
    'config',
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'peerDependenciesMeta',
    'bundleDependencies',
    'optionalDependencies',
    'engines',
    'os',
    'cpu',
    'workspaces',
    'publishConfig',
  ],
};
