const changeTitle = (article) => {
    const title = '半夜集 - ' + article.title
    document.title = title
}

const htmlFromMarkdown = (markdown) => {
    var s = md.render(markdown)
    return s
}

const templateArticle = (article) => {
    var m = article
    var s = `<header>
    <h1 id="id-article-title">
        {{ m.title }}
    </h1>
    <div class="detail-info flex">
    <span id="id-article-ct">
        <i class="fa fa-calendar-check-o fa-fw" aria-hidden="true"></i>
        发表于
        {{ m.ct | formattime }}
    </span>
        <span id="id-article-ut">
        <i class="fa fa-calendar fa-fw" aria-hidden="true"></i>
        更新于
        {{ m.ut | formattime }}
    </span>
        <span>
        <i class="fa fa-tags fa-fw" aria-hidden="true"></i>
        分类
        <a href="#category/{{ m.category }}">{{ m.category }}</a>
    </span>
    </div>
</header>
<div class="article-overview">
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

const insertArticle = (article) => {
    var r = article
    r.content = htmlFromMarkdown(r.content)
    var s = templateArticle(r)
    var container = _e('article')
    container.insertAdjacentHTML('afterbegin', s)
}

const loadArticleById = (id) => {
    var container = _e('#id-article-container')
    id = Number(id)
    var body = localStorage.articles
    var arr = JSON.parse(body)
    var article = arr.filter(e => e.id === id)[0]
    if (article !== undefined) {
        var r = article
        changeTitle(r)
        insertArticle(r)
        // insertCommentInput(id)
        // loadComment(r)
        // bindEventAddComment()
        alertify.success(`load current article succeeded`)
    } else {
        alertify.error('没有这篇文章 跳转至上一页')
        history.back()
    }
}

const templateContainerArticle = () => {
    var s = `<div id="id-article-container" class="fadeIn slideDown">
    <article>
    </article>
    <div id="id-comment-container">
    </div>
</div>`
    return s
}

api.addComment = (form, callback) => {
    var req = {
        data: form,
        url: '/api/comment/add'
    }
    api.ajax(req).then(body => {
        callback(body)
    })
}

const initEnvDetail = () => {
    var spa = _e('#id-spa')
    var s = templateContainerArticle()
    spa.insertAdjacentHTML('beforeend', s)
}

const initArticle = (hash) => {
    initSpa()
    initEnvDetail()
    loadArticleById(hash)
}

const initSpa = () => {
    var container = _e('#id-spa')
    container.innerHTML = ''
}

const changeArticle = (hash) => {
    var [func, subHash] = hash !== undefined ? hash.split('/') : [undefined, undefined]
    var dic = {
        'category': initArticles,
        'detail': initArticle,
    }
    var f = dic[func] || initArticles
    f(subHash)
}

const bindEventHashChange = () => {
    window.addEventListener('hashchange', (e) => {
        var [url, hash] = e.newURL.split('#')
        var flag = url.endsWith('/articles')
        if (flag) {
            changeArticle(hash)
        }
    })
}

const templateCellArticle = () => {
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

const nunjucksEnvironment = () => {
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
const loadArticles = () => {
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

const loadArticlesByHash = (subHash) => {
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
        var exs = [undefined, 'all']
        if (!exs.includes(subHash)) {
            alertify.error(`no ${subHash} category and load all articles`)
        }
    }
    insertArticles(d)
}

const insertArticles = (articles) => {
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

const templateContainerArticles = () => {
    var s = `<div id="id-articles-container"
     class="fadeIn slideDown">
</div>`
    return s
}

const initEnvArticles = () => {
    var spa = _e('#id-spa')
    var s = templateContainerArticles()
    spa.insertAdjacentHTML('beforeend', s)
}

const initArticles = (hash) => {
    initSpa()
    initEnvArticles()
    loadArticlesByHash(hash)
}

const __main = () => {
    loadArticles()
    bindEventHashChange()
}

__main()