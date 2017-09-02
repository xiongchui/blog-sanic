document.addEventListener("DOMContentLoaded", () => {
    __main()
}, false)

var __main = () => {
    loadArticles()
}

var templateCellArticle = () => {
    var s = `
        <div id="id-article-{{ t.id }}" class="article-cell">
            <a href="articles/{{ t.id }}">{{ t.title }}</a>
            <div>{{ t.ct | formattime }}</div>
            <div>{{ t.overview }}</div>
        </div>`
    return s
}

var nunjucksEnvironment = () => {
    // setup nunjucks
    var env = new nunjucks.Environment()
    env.addFilter('formattime', function (time) {
        var d = new Date(time * 1000)
        return d.toLocaleString()
    })
    return env
}

// 自动获取数据并生成页面
var loadArticles = () => {
    var env = nunjucksEnvironment()
    var self = e('#id-articles-container')
    log(self)
    const source = self.dataset.source
    const template = eval(self.dataset.template)()
    log('debug template', template)
    const key = self.dataset.templateKey
    log('info source template key', source, template, key)
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
