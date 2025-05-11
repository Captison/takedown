import path from 'node:path'
import pluginJson from '@rollup/plugin-json'
import pluginNodeResolve from '@rollup/plugin-node-resolve'
import pluginTerser from '@rollup/plugin-terser'
import pluginCopy from 'rollup-plugin-copy'
// import packson from './package.json' with { type: 'json' }


export default 
{
    input: 'main.js',

    output: 
    [
        { format: 'umd', file: 'dist/takedown.js', name: 'takedown' },
        { format: 'umd', file: 'dist/takedown.min.js', name: 'takedown', plugins: [ pluginTerser() ] }, 
        { format: 'esm', file: 'dist/takedown.esm.js' },
        { format: 'esm', file: 'dist/takedown.esm.min.js', plugins: [ pluginTerser() ] },
        // unbundled CJS
        { format: 'cjs', dir: 'dist/cjs', preserveModules: true, exports: 'named' } 
    ],  

    plugins:
    [
        pluginNodeResolve({ extensions: [ '.js', '.json' ], browser: true }),
        pluginJson(),
        pluginCopy(
        {
            targets:
            [
                { src: path.join('source', 'index.html'), dest: path.join('dist') },
                { src: path.join('source', 'index.d.ts'), dest: path.join('dist'), rename: 'takedown.d.ts' },
                { src: path.join('source', 'assets', '*.png'), dest: path.join('dist') }    
            ]
        })
    ]
}
