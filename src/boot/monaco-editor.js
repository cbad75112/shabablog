import { boot } from 'quasar/wrappers';
import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor';

export default boot(({ app }) => {
  app.use(VueMonacoEditorPlugin, {
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs',
    },
  });
});
