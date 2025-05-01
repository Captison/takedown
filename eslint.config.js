import path from 'path';


export default
[
    {
        name: 'Takedown Code Linter',

        // eslint does not have support for absolute paths
        files: [ path.join('source', '**', '*.js') ],

        // languageOptions: 
        // {
        //     globals: 
        //     {
        //         MutationObserver: 'readonly'
        //     }
        // },    

        rules:
        {
            // use 'off', 'warn', or 'error'
            'array-callback-return': [ 'off', { checkForEach: true, allowVoid: true } ],
            'getter-return': [ 'error' ],
            'no-await-in-loop': [ 'error' ],
            'no-cond-assign': [ 'off', 'except-parens' ],
            'no-const-assign': [ 'error' ],
            'no-constant-binary-expression': [ 'error' ],
            'no-constant-condition': [ 'error' ],
            'no-control-regex': [ 'warn' ],
            'no-dupe-args': [ 'error' ],
            'no-dupe-else-if': [ 'error' ],
            'no-dupe-keys': [ 'error' ],
            'no-duplicate-case': [ 'error' ],
            'no-duplicate-imports': [ 'off' ],
            'no-empty-character-class': [ 'error' ],
            'no-empty-pattern': [ 'error', { allowObjectPatternsAsParameters: false } ],
            'no-fallthrough': [ 'warn',  { allowEmptyCase: true } ],
            'no-func-assign': [ 'error' ],
            'no-import-assign': [ 'error' ],
            'no-irregular-whitespace': [ 'error' ],
            'no-loss-of-precision': [ 'error' ],
            'no-misleading-character-class': [ 'error' ],
            'no-new-native-nonconstructor': [ 'error' ],
            'no-obj-calls': [ 'error' ],
            'no-prototype-builtins': [ 'error' ],
            'no-self-assign': [ 'error', { props: true } ],
            'no-self-compare': [ 'error' ],
            'no-setter-return': [ 'error' ],
            'no-sparse-arrays': [ 'error' ],
            'no-undef': [ 'error', { typeof: false } ],
            'no-unexpected-multiline': [ 'error' ],
            'no-unmodified-loop-condition': [ 'error' ],
            'no-unreachable': [ 'error' ],
            'no-unsafe-finally': [ 'error' ],
            'no-unsafe-negation': [ 'error', { enforceForOrderingRelations: true } ],
            'no-unsafe-optional-chaining': [ 'error', { disallowArithmeticOperators: true } ],
            'no-unused-vars': [ 'error', 'all' ],
            'no-useless-assignment': [ 'error' ],
            'no-useless-backreference': [ 'error' ],
            'use-isnan': [ 'error', { enforceForSwitchCase: true, enforceForIndexOf: true } ],
            'valid-typeof': [ 'error' ]
        }
    }
]
