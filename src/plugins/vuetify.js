import { createVuetify } from 'vuetify';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import colors from 'vuetify/util/colors';
import * as components from 'vuetify/components';

export default createVuetify({
  components, // Registers all Vuetify components automatically
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: colors.indigo.lighten5,
          secondary: colors.indigo.lighten2,
        },
      },
    },
  },
});
