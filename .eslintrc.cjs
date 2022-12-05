module.exports = {
    plugins: ['@typescript-eslint', 'react', 'import', 'jsx-a11y'],
    parser: '@typescript-eslint/parser',
    env: {
        browser: true,
        node: true,
        es6: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:jsx-a11y/recommended',
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
    rules: {
        // TypeScript does these checks via typechecking
        'import/named': 'off',
        'import/namespace': 'off',
        'import/default': 'off',
        'import/no-named-as-default-member': 'off',

        'no-param-reassign': ['error', { props: false }],

        'react/jsx-uses-vars': 'error',
        'react/jsx-no-undef': ['error', { allowGlobals: true }],

        '@typescript-eslint/no-unused-vars': 'error',
    },
};
