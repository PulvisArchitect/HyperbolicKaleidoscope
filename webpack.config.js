const path = require('path');

const SRC_DIR = path.resolve('./src');
const DST_DIR = path.resolve('./docs')
module.exports = () => ({
    entry: [`${SRC_DIR}/main.js`],
    output: {
        path: DST_DIR,
        filename: 'bundle.js',
    },
    mode: 'development',

    module: {
        rules: [
            {
                test: /\.(glsl|vert|frag)$/,
                exclude: /\.(njk|nunjucks)\.(glsl|vert|frag)$/,
                use: [
                    {
                        loader: 'shader-loader',
                    }
                ]
            }
        ]
    },

    devtool: (process.env.NODE_ENV === 'production') ? false : 'inline-source-map',

    resolve: {
        extensions: ['.js'],
    },

    devServer: {
        static: {
            directory: 'public',
        },
        port: 9193
    }
});
