var templateCellArticle = () => {
    var s = `<article id="id-article-{{ t.id }}" class="article-cell">
    <div class="article-title">
        <a class="article-link" href="#detail/{{ t.id }}">{{ t.title }}</a>
    </div>
    <div class="article-info">
        <span><i class="fa fa-calendar-check-o fa-fw" aria-hidden="true"></i>{{ t.ct | formattime }}</span>
        <span><i class="fa fa-calendar fa-fw" aria-hidden="true"></i>{{ t.ut | formattime }}</span>
        <span><i class="fa fa-tags fa-fw" aria-hidden="true"></i><a href="#category/{{ t.category }}">{{ t.category }}</a></span>
    </div>
    <div class="article-overview">{{ t.overview }}</div>
    <div class="article-detail"><a href="#detail/{{ t.id }}">阅读全文</a></div>
</article>`
    return s
}

var nunjucksEnvironment = () => {
    // setup nunjucks
    var env = new nunjucks.Environment()
    env.addFilter('formattime', time => {
        var d = new Date(time * 1000)
        var year = d.getFullYear()
        var month = d.getMonth() + 1
        var date = d.getDate()
        return `${month}/${date}/${year}`
    })
    return env
}

// 自动获取数据并生成页面
var loadArticles = () => {
    const source = '/api/articles'
    api.get(source, body => {
        localStorage.articles = body
        var hash = location.hash.slice(1)
        changeArticle(hash)
    })
}

var loadArticlesByHash = (hash) => {
    var env = nunjucksEnvironment()
    var body = localStorage.articles
    var arr = ['javascript', 'python', 'mind']
    var d = JSON.parse(body)
    if (arr.includes(hash)) {
        d = d.filter(e => e.category === hash)
    }
    var container = _e('#id-articles-container')
    const template = templateCellArticle()
    const key = 't'
    let cells = []
    for (let i of d) {
        let data = i
        let args = {}
        args[key] = data
        let s = env.renderString(template, args)
        cells.push(s)
    }
    container.innerHTML = cells.join('')
}

var templateContainerArticles = () => {
    var s = `<div id="id-articles-container"
     class="fadeIn slideDown">
</div>`
    return s
}

var initEnvArticles = () => {
    var spa = _e('#id-spa')
    var s = templateContainerArticles()
    spa.insertAdjacentHTML('beforeend', s)
}

var initArticles = (hash) => {
    initSpa()
    initEnvArticles()
    loadArticlesByHash(hash)
}

var bindEventChangeArticles = () => {
    window.addEventListener('hashchange', (e) => {
        var [url, hash] = e.newURL.split('#')
        var flag = url.endsWith('/articles')
        if (flag) {
            changeArticle(hash)
        }

    })
}

var changeArticle = (hash) => {
    var [func, name] = hash !== undefined ? hash.split('/') : [undefined, undefined]
    var dic = {
        'category': initArticles,
        'detail': initArticle,
    }
    var f = dic[func] || initArticles
    f(name)
}

var __main = () => {
    loadArticles()
    bindEventChangeArticles()
}

__main()