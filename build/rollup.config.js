import {terser} from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.min.js',
    format: 'es',
    plugins: [terser()]
  },
  external: ['vue']
};
