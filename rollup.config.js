import fs            from 'fs';
import path          from 'path';

import { babel }     from '@rollup/plugin-babel';        // Babel is used for private class fields for browser usage.
import resolve       from '@rollup/plugin-node-resolve';
import sourcemaps    from 'rollup-plugin-sourcemaps';
import { terser }    from 'rollup-plugin-terser';        // Terser is used for minification / mangling

// Import config files for Terser and Postcss; refer to respective documentation for more information.
import terserConfig  from './terser.config';

// Add local typedefs.js file to the end of the bundles as a footer.
const footer = fs.readFileSync('./src/typedef.js', 'utf-8');

// The deploy path for the distribution for browser & Node.
const s_DIST_PATH_BROWSER = './dist/browser';

// Produce sourcemaps or not.
const s_SOURCEMAP = true;

// Adds Terser to the output plugins for server bundle if true.
const s_MINIFY = typeof process.env.ROLLUP_MINIFY === 'string' ? process.env.ROLLUP_MINIFY === 'true' : true;

export default () =>
{
   // Defines potential output plugins to use conditionally if the .env file indicates the bundles should be
   // minified / mangled.
   const outputPlugins = [];
   if (s_MINIFY)
   {
      outputPlugins.push(terser(terserConfig));
   }

   return [{     // This bundle is for the browser distribution.
         input: ['src/WSClientRPC.js'],
         output: [{
            file: `${s_DIST_PATH_BROWSER}${path.sep}WSClientRPC.js`,
            footer,
            format: 'es',
            plugins: outputPlugins,
            preferConst: true,
            sourcemap: s_SOURCEMAP
         }],
         plugins: [
            resolve({ browser: true }),
            sourcemaps(),
            babel({
               babelHelpers: 'bundled',
               inputSourceMap: false,
               presets: [
                  ['@babel/preset-env', {
                     bugfixes: true,
                     shippedProposals: true,
                     targets: { esmodules: true }
                  }]
               ]
            })
         ]
      }
   ];
};
