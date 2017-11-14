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

    addComment(form, callback) {
        const url = this.path + '/comment/add'
        return this.post(url, form, callback)
    }

    deleteArticle(articleId, callback) {
        const url = this.path + `/articles/delete/${articleId}`
        return this.get(url, callback)
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
            const flag = url.endsWith('/manage')
            if (flag) {
                log('hash', hash)
                this.changeView(hash)
            }
        })
    }

    changeView(hash) {
        const [view, _] = hash !== undefined ? hash.split('/') : ['category', undefined]
        const mapView = {
            'category': ViewArticle,
            'detail': ViewDetail,
        }
        if (this.view !== undefined) {
            this.view.destroy()
        }
        this.view = this.initView(mapView[view], hash)
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
        const hash = this.hash
        let [_, sub] = [undefined, 'all']
        if (hash !== undefined) {
            sub = hash.split('/')[1]
        }
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
        this.bindEvents()
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

    insertCommentInput(articleId) {
        const s = `<div>
            <input id="id-input-content" data-id="${articleId}" type="text" name="content">
            <button data-action="add-comment" type="submit">add comment</button>
        </div>
        <div id="id-comment-content">
        </div>`
        const div = this.wrapper._e('#id-comment-container')
        div.insertAdjacentHTML('afterbegin', s)
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
            this.insertCommentInput(this.id)
            this.renderComment(m)
            alertify.success(`load current article succeeded`)
        } else {
            alertify.error('没有这篇文章 跳转至上一页')
            history.back()
        }
    }

    renderComment(article) {
        const ms = article.comments
        var container = this.wrapper._e('#id-comment-content')
        ms.forEach(m => {
            var s = this.templateComment(m)
            container.insertAdjacentHTML('beforeend', s)
        })
    }

    changeTitle(model) {
        const title = '半夜集 - ' + model.title
        document.title = title
    }

    insertArticle(model) {
        const m = Object.create(model)
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
        <span id="id-article-ct" data-id="{{ m.id }}" data-action="delete-article">
            <i class="fa fa-calendar-check-o fa-fw" aria-hidden="true"></i>
            发表于
            {{ m.ct | formattime }}
        </span>
            <span id="id-article-ut">
            <i class="fa fa-calendar fa-fw" aria-hidden="true"></i>
            更新于
            <a href="#edit/{{ m.id }}">{{ m.ut | formattime }}</a>
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

    templateComment(article) {
        const m = article
        const s = `<div>
        {{ m.user.username }}
    </div>
    <div>
        {{ m.ct | formattime}}
    </div>
    <div>
        {{ m.content }}
    </div>`
        var env = NunjucksEnv.single()
        var r = env.renderString(s, {
            m,
        })
        return r
    }

    bindEvents() {
        this.bindEventClick()
    }

    bindEventClick() {
        const mapAction = {
            'add-comment': this.actionAddComment,
            'delete-article': this.actionDeleteArticle,
        }
        const div = this.wrapper._e('#id-article-container')
        div.on('click', (e) => {
            const self = e.target
            const action = self.dataset.action
            log('action', action)
            const fn = mapAction[action]
            if (fn !== undefined) {
                fn.call(this, e)
            }
        })
    }

    actionDeleteArticle(event) {
        const self = event.target
        const id = self.dataset.id
        const p = this.api.deleteArticle(id)
        p.then(body => {
            var r = JSON.parse(body)
            if (r.success) {
                alertify.success('this article has been deleted successfully')
                location.href = '/articles/manage'
            } else {
                alertify.error(r.msgs.join(''))
            }
        })
    }

    actionAddComment(event) {
        const self = event.target
        const input = self.parentElement._e('#id-input-content')
        const form = {
            content: input.value,
            article_id: input.dataset.id,
        }
        const p = this.api.addComment(form)
        p.then(body => {
            var r = JSON.parse(body)
            if (r.success) {
                var data = r.data
                this.insertComment(data)
                alertify.success('add comment succeeded')
            } else {
                alertify.error(r.msgs.join(''))
            }
        })
    }

    insertComment(article) {
        const s = this.templateComment(article)
        const div = this.wrapper._e('#id-comment-content')
        div.insertAdjacentHTML('beforeend', s)
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

const insertArticleUpdateInput = (id) => {
    var articles = JSON.parse(localStorage.articles)
    var m = articles.find(e => e.id === id)
    var s = `<div id="id-editor-container" class="full-height">
    <div>
        <div class="flex-box">
            <div class="flex-grow-1 flex-box center">
                <label for="id-input-title flex-grow-1">标题</label>
            </div>
            <input id="id-input-title" class="flex-grow-2 article-info" type="text" name="title" value="${m.title}">
        </div>
        <div class="flex-box">
            <div class="flex-grow-1 flex-box center">
                <label for="id-input-overview flex-grow-1">概览</label>
            </div>
            <textarea id="id-editor-overview" class="flex-grow-2 article-info" name="overview" rows="5">${m.overview}</textarea>
        </div>
        <div class="flex-box">
            <div class="flex-grow-1 flex-box center">
                标签
            </div>
            <div class="flex-grow-2 flex-box space-around">
                <label for="id-radio-python">
                    <input id="id-radio-python" class="article-info" name="category" type="radio" value="python">
                    python
                </label>
                <label for="id-radio-javascript">
                    <input id="id-radio-javascript" class="article-info" name="category" type="radio"
                           value="javascript">
                    javascript
                </label>
                <label for="id-radio-mind">
                    <input id="id-radio-mind" class="article-info" name="category" type="radio" value="mind">
                    mind
                </label>
            </div>
        </div>
    </div>
    <div>
        <button id="id-btn-update">update</button>
    </div>
    <div class="flex-box full-height">
        <textarea id="id-editor-content" class="source article-info flex-grow-1 half-width full-height" name="content">${m.content}</textarea>
        <div id="id-editor-show" class="flex-grow-1 half-width result-html full-height">${htmlFromMarkdown(m.content)}</div>
    </div>
</div>`
    var spa = _e('#id-spa')
    spa.insertAdjacentHTML('afterbegin', s)
}

const bindEventClickUpdate = (id) => {
    var btn = _e('#id-btn-update')
    btn.on('click', (e) => {
        var container = _e('#id-editor-container')
        var es = container._es('.article-info')
        var form = {}
        es.forEach(e => {
            if (e.type === 'radio') {
                if (e.checked === true) {
                    form[e.name] = e.value
                }
            } else {
                form[e.name] = e.value
            }
        })
        api.ajax({
            url: `/api/articles/update/${id}`,
            data: form,
        }).then(body => {
            var r = JSON.parse(body)
            if (r.success) {
                var m = r.data
                alertify.success('add article succeeded')
                loadArticles()
                location.hash = `#detail/${m.id}`
            } else {
                alertify.error(r.msgs.join('\n'))
            }
        })
    })
}

const bindEventsUpdate = (id) => {
    bindEventShow()
    bindEventClickUpdate(id)
}

const bindEventShow = () => {
    const d = _e('#id-editor-content')
    d.on('keyup', () => {
        var s = d.value
        var t = htmlFromMarkdown(s)
        _e('#id-editor-show').innerHTML = t
    })
}

const updateArticle = (subHash) => {
    var id = Number(subHash)
    insertArticleUpdateInput(id)
    bindEventsUpdate(id)
}

const changeArticle = (hash) => {
    var [func, subHash] = hash !== undefined ? hash.split('/') : [undefined, undefined]
    var dic = {
        'edit': updateArticle,
    }
    var f = dic[func] || initArticles
    f(subHash)
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