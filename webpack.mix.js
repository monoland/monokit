const mix = require('laravel-mix');

mix.webpackConfig({
    resolve: {
        alias: {
            '@components': __dirname + '/resources/apps/components',
            '@modules': __dirname + '/resources/apps/modules',
            '@pages': __dirname + '/resources/apps/pages',
            '@mixins': __dirname + '/resources/apps/mixins',
            '@plugins': __dirname + '/resources/apps/plugins'
        }
    }
});

mix.setPublicPath('frontend/');

mix.js('resources/apps/monoland.js', 'scripts')
    .vue()
    .sourceMaps()
    .css('node_modules/vuetify/dist/vuetify.min.css', 'styles')
    .sass('resources/styles/monoland.scss', 'styles')
    .extract([
        'axios', 'debounce', 'pdfjs-dist', 'vue', 'vue-router', 'vuetify', 'vuex'
    ]);