document.addEventListener("DOMContentLoaded", () => {
    __main()
}, false)

var __main = () => {
    loadArticles()
}

var templateCellArticle = () => {
    var s = `<article id="id-article-{{ t.id }}" class="article-cell">
    <div class="article-title">
        <a class="article-link" href="articles/{{ t.id }}">{{ t.title }}</a>
    </div>
    <div class="article-info">
        <span><i class="fa fa-calendar-check-o fa-fw" aria-hidden="true"></i>{{ t.ct | formattime }}</span>
        <span><i class="fa fa-calendar fa-fw" aria-hidden="true"></i>{{ t.ut | formattime }}</span>
        <span><i class="fa fa-tags fa-fw" aria-hidden="true"></i><a href="/articles/categories/{{ t.category }}">{{ t.category }}</a></span>
    </div>
    <div class="article-overview">{{ t.overview }}</div>
    <div class="article-detail"><a href="articles/{{ t.id }}">阅读全文</a></div>
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
    var env = nunjucksEnvironment()
    var self = _e('#id-articles-container')
    log(self)
    const source = self.dataset.source
    const template = eval(self.dataset.template)()
    log('debug templateArticle', template)
    const key = self.dataset.templateKey
    log('info source templateArticle key', source, template, key)
    api.get(source, function (r) {
        var d = JSON.parse(r)
        let cells = []
        for (i of d) {
            let data = i
            let args = {}
            args[key] = data
            let s = env.renderString(template, args)
            cells.push(s)
        }
        var str = cells.join('')
        log(str)
        self.innerHTML = str
        log('finish')
    })
}
