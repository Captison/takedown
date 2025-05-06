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
                { src: '*.png', dest: path.join('dist') }    
            ]
        })
    ]
}
