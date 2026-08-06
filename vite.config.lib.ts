import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

function cssInject(): Plugin {
  return {
    name: 'css-inject',
    apply: 'build',
    enforce: 'post',
    generateBundle(_opts, bundle) {
      let cssCode = '';
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith('.css')) {
          cssCode += (chunk as { source: string }).source;
          delete bundle[fileName];
        }
      }
      if (!cssCode) return;

      const escaped = cssCode.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
      const injector = `(function(){if(typeof document==='undefined')return;var id='alloqui-styles';if(document.getElementById(id))return;var s=document.createElement('style');s.id=id;s.textContent=\`${escaped}\`;document.head.appendChild(s)})();\n`;

      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) {
          chunk.code = injector + chunk.code;
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (!env.VITE_ALLOQUI_API_URL) {
    throw new Error(
      'VITE_ALLOQUI_API_URL is not set. The library build bakes the default API endpoint ' +
        'into the bundle — set it in .env (see .env.example) or in the environment before building.',
    );
  }

  return {
    plugins: [
      react({ jsxRuntime: 'automatic' }),
      dts({
        tsconfigPath: './tsconfig.build.json',
        rollupTypes: false,
        outDir: './dist',
      }),
      cssInject(),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'AlloquiReact',
        formats: ['es', 'cjs'],
        fileName: (format) => `alloqui-react.${format === 'es' ? 'js' : 'cjs'}`,
        cssFileName: 'style',
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          '@twilio/voice-sdk',
          'plivo-browser-sdk',
          'lucide-react',
          'sonner',
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
      cssCodeSplit: false,
      sourcemap: true,
    },
  };
});
