module.exports = {
    plugins: ['@typescript-eslint', 'react', 'import'],
    parser: '@typescript-eslint/parser',
    env: {
        browser: true,
        node: true,
        es2020: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier',
    ],
    settings: {
        react: {
            version: 'detect',
        },
    },
    globals: {
        manywho: false,
        $: false,
        ga: false,
        module: false,
        jest: false,
        expect: false,
        test: false,
        beforeEach: false,
        describe: false,
    },
};
