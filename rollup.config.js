import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/ha-room-card.js',
  output: {
    file: 'dist/ha-room-card.js',
    format: 'es',
  },
  plugins: [resolve(), terser()],
};
