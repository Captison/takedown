import pluginJson from '@rollup/plugin-json';
import pluginNodeResolve from '@rollup/plugin-node-resolve'
import packson from './package.json' with { type: 'json' }


export default 
{
	  input: 'main.js',
	  
    output: 
    {
        name: packson.name,
		    file: packson.main,
		    format: 'esm'
	  },

    plugins:
    [
        pluginNodeResolve({ extensions: [ '.js', '.json' ], browser: true }),
        pluginJson()
    ]
}
