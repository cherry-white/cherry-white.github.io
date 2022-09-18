const { createProxyMiddleware } = require('http-proxy-middleware');

const apiProxy = createProxyMiddleware('/githubAgent', {
    target: 'https://github.com/',
    changeOrigin: true,
    pathRewrite: {
        '^/githubAgent/': '/', // rewrite path 将链接中的 /githubAgent/ 替换为 '/'
    },
});

hexo.extend.filter.register('server_middleware', function(app){
    // 表示以 agent 开头的请求将被转发
    app.use('/githubAgent', apiProxy);
});
