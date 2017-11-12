class NunjucksEnv {
    constructor() {
        const env = new nunjucks.Environment()
        env.addFilter('formattime', time => {
            var d = new Date(time * 1000)
            var year = d.getFullYear()
            var month = d.getMonth() + 1
            var date = d.getDate()
            return `${month}/${date}/${year}`
        })
        return env
    }

    static single() {
        if (this._instance === undefined) {
            this._instance = new this()
        }
        return this._instance
    }
}

class ApiArticle extends Api {
    constructor() {
        super()
        this.path = '/api'
    }

    all(callback) {
        const url = this.path + '/articles'
        return this.get(url, callback)
    }

    allSync() {
        const url = this.path + '/articles'
        return this.getSync(url)
    }
}

class AppBlog {
    constructor() {
        this.href = location.href
        this.history = window.history
        this.render()
        this.bindEvent()
    }

    render() {
        const hash = location.hash
        const s = hash === '' ? 'category/all' : hash.slice(1)
        this.changeView(s)
    }

    bindEvent() {
        window.addEventListener('hashchange', (e) => {
            const [url, hash] = e.newURL.split('#')
            const flag = url.endsWith('/articles')
            if (flag) {
                log('hash', hash)
                this.changeView(hash)
            }
        })
    }

    changeView(hash) {
        var [view, _] = hash !== undefined ? hash.split('/') : ['category', undefined]
        var cls = {
            'category': ViewArticle,
            'detail': ViewDetail,
        }
        if (this.view !== undefined) {
            this.view.destroy()
        }
        this.view = this.initView(cls[view], hash)
        log('view', this.view)
    }

    initView(cls, hash) {
        const props = {
            model: Article.single(),
            api: ApiArticle.single(),
            wrapper: _e('#id-app-article')
        }
        return new cls(props, hash)
    }
}

class ViewArticle extends Component {
    constructor(props, hash) {
        super(props)
        this.hash = hash
        this.nunjucks = NunjucksEnv.single()
        this.initEnv()
        this.categories = ['javascript', 'python', 'mind']
        this.renderByCategory()
    }

    initEnv() {
        const s = `
    <div id="id-article-container" class="fadeIn slideDown">
        <article>
        </article>
        <div id="id-comment-container">
        </div>
    </div>`
        this.wrapper.innerHTML = s
    }

    category() {
        const [_, sub] = this.hash.split('/')
        return sub
    }

    _renderCells(records) {
        let arr = records
        if (this.categories.includes(this.category())) {
            arr = arr.filter(e => e.category === this.category())
            alertify.success(`load category ${this.category()} successfully`)
        }
        const env = this.nunjucks
        const template = this.templateCell()
        const key = 't'
        const cells = arr.map(m => {
            const args = {}
            args[key] = m
            const s = env.renderString(template, args)
            return s
        })
        const div = this.wrapper._e('#id-article-container')
        div.innerHTML = cells.join('\n')
    }

    renderByCategory() {
        let arr = this.model.all()
        this._renderCells(arr)
    }

    templateCell() {
        const s = `<article id="id-article-{{ t.id }}" class="article-cell">
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
}

class ViewDetail extends Component {
    constructor(props, hash) {
        super(props)
        this.hash = hash
        this.id = this.idByHash(hash)
        this.nunjucks = NunjucksEnv.single()
        this.initEnv()
        this.render()
    }

    idByHash(hash) {
        const [_, id] = hash.split('/')
        return parseInt(id)
    }

    initEnv() {
        const s = `<div id="id-article-container" class="fadeIn slideDown">
        <article>
        </article>
            <div id="id-comment-container">
            </div>
        </div>`
        this.wrapper.innerHTML = s
    }

    render() {
        const arr = this.model.all()
        this.renderArticle(arr)
    }

    renderArticle(articles) {
        const ms = articles
        const m = ms.find(e => e.id === this.id)
        if (m !== undefined) {
            this.changeTitle(m)
            this.insertArticle(m)
            alertify.success(`load current article succeeded`)
        } else {
            alertify.error('没有这篇文章 跳转至上一页')
            history.back()
        }
    }

    changeTitle(model) {
        const title = '半夜集 - ' + model.title
        document.title = title
    }

    insertArticle(model) {
        const m = model
        m.content = this.htmlFromMarkdown(m.content)
        const s = this.template(m)
        const div = this.wrapper._e('article')
        div.insertAdjacentHTML('afterbegin', s)
    }

    htmlFromMarkdown(markdown) {
        const s = md.render(markdown)
        return s
    }

    template(article) {
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
    </div>`
        var env = this.nunjucks
        var r = env.renderString(s, {
            m,
        })
        return r
    }
}

class Article extends Model {
    constructor() {
        super()
        this.api = ApiArticle.single()
    }

    all() {
        if (this.records === undefined) {
            const body = this.api.allSync()
            this.records = JSON.parse(body).data
        }
        return this.records
    }
}

const initApp = () => {
    const props = {
        model: Article.single(),
        api: ApiArticle.single(),
        wrapper: _e('#id-app-article')
    }
    new AppBlog(props)
}

const __main = () => {
    initApp()
}

__main()