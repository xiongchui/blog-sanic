var nunjucksEnvironment = () => {
    // setup nunjucks
    var env = new nunjucks.Environment()
    env.addFilter('formattime', function (time) {
        var d = new Date(time * 1000)
        return d.toLocaleString()
    })
    return env
}

var changeTitle = (res) => {
    var title = '半夜集 - ' + res.data.title
    document.title = title
}

var htmlFromMarkdown = (markdown) => {
    var s = md.render(markdown)
    return s
}

var template = (m) => {
    var s = `
    <h2 id="id-article-title">
        {{ m.title }}
    </h2>
    <span id="id-article-ct">
        {{ m.ct }}
    </span>
    <span>
        {{ m.category }}
    </span>
    <span id="id-article-ut">
        {{ m.ut }}
    </span>
    <div>
        {{ m.overview }}
    </div>
    <div id="id-article-content">
        {{ m.content | safe }}
    </div>
        `
    var env = nunjucksEnvironment()
    var r = env.renderString(s, {
        m,
    })
    return r
}

var insertHtml = (res) => {
    var r = res.data
    r.content = htmlFromMarkdown(r.content)
    var s = template(r)
    var container = _e('#id-article-container')
    container.insertAdjacentHTML('beforeend', s)
}

var loadArticle = () => {
    var container = _e('#id-article-container')
    var id = container.dataset.id
    var req = {
        url: `/api/articles/${id}`,
        method: 'GET',
    }
    api.ajax(req).then(body => {
        log('body', body)
        var r = JSON.parse(body)
        if (r.success) {
            changeTitle(r)
            insertHtml(r)
        } else {
            alert('failed')
        }
    })

}

var __main = () => {
    loadArticle()
}

__main()