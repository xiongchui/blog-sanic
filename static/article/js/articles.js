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
        var res = JSON.parse(body)
        if (res.success) {
            var body = JSON.stringify(res.data)
            localStorage.articles = body
            var hash = location.hash.slice(1)
            changeArticle(hash)
            alertify.success('load all articles successfully')
        } else {
            alertify.error(msgs.join(''))
        }
    })
}

var loadArticlesByHash = (subHash) => {
    var body = localStorage.articles
    var arr = ['javascript', 'python', 'mind']
    var d = JSON.parse(body)
    if (arr.includes(subHash)) {
        d = d.filter(e => e.category === subHash)
        if (d.length > 0) {
            alertify.success(`load category ${subHash} successfully`)
        } else {
            alertify.error(`${subHash} category has no articles`)
        }
    } else {
        if (subHash !== undefined && subHash !== 'all') {
            alertify.error(`no ${subHash} category and load all articles`)
        }
    }
    insertArticles(d)
}

var insertArticles = (articles) => {
    var env = nunjucksEnvironment()
    var container = _e('#id-articles-container')
    const template = templateCellArticle()
    const key = 't'
    let cells = []
    articles.forEach(m => {
        let args = {}
        args[key] = m
        let s = env.renderString(template, args)
        cells.push(s)
    })
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

var __main = () => {
    loadArticles()
    bindEventHashChange()
}

__main()