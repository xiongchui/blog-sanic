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

    addArticle(form, callback) {
        const url = this.path + '/articles/new'
        return this.post(url, form, callback)
    }
}

class AppNew extends Component {
    constructor(props) {
        super(props)
        this.initEnv()
        this.bindEvents()
    }

    initEnv() {
        const s = `
        <div id="id-editor-container" class="full-height">
        <div>
            <div class="flex-box">
                <div class="flex-grow-1 flex-box center">
                    <label for="id-input-title flex-grow-1">标题</label>
                </div>
                <input id="id-input-title" class="flex-grow-2 article-info" type="text" name="title">
            </div>
            <div class="flex-box">
                <div class="flex-grow-1 flex-box center">
                    <label for="id-input-overview flex-grow-1">概览</label>
                </div>
                <textarea id="id-editor-overview" class="flex-grow-2 article-info" name="overview" rows="5"></textarea>
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
                        <input id="id-radio-javascript" class="article-info" name="category" type="radio" value="javascript">
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
            <button id="id-btn-submit" data-action="add-article">submit</button>
        </div>
        <div class="flex-box full-height">
            <textarea id="id-editor-content" class="source article-info flex-grow-1 half-width full-height" name="content" data-action="show-content">输入内容</textarea>
            <div id="id-editor-show" class="flex-grow-1 half-width result-html full-height">输入内容</div>
        </div>
    </div>
        `
        this.wrapper.innerHTML = s
    }

    bindEvents() {
        const mapEvent = {
            'keyup': {
                'show-content': this.actionShowContent,
            },
            'click': {
                'add-article': this.actionAddArticle,
            },
        }
        const div = this.wrapper._e('#id-editor-container')
        Object.keys(mapEvent).forEach(key => {
            div.on(key, (e) => {
                const self = e.target
                const action = self.dataset.action
                const fn = mapEvent[key][action]
                if (fn !== undefined) {
                    fn.call(this, e)
                }
            })
        })
    }

    _htmlFromMarkdown(string) {
        var s = md.render(string)
        return s
    }

    actionShowContent(event) {
        const self = event.target
        const v = self.value
        const html = this._htmlFromMarkdown(v)
        this.wrapper._e('#id-editor-show').innerHTML = html
    }

    actionAddArticle(event) {
        const div = this.wrapper._e('#id-editor-container')
        const es = div._es('.article-info')
        log('es', es)
        const form = {}
        es.forEach(e => {
            if (e.type === 'radio') {
                if (e.checked) {
                    form[e.name] = e.value
                }
            } else {
                form[e.name] = e.value
            }
        })
        const p = this.api.addArticle(form)
        p.then(body => {
            var r = JSON.parse(body)
            if (r.success) {
                var m = r.data
                alertify.success('add article succeeded')
                location.href = `/articles/manage#detail/${m.id}`
            } else {
                alertify.error(r.msgs.join('\n'))
            }
        })
    }
}

const initApp = () => {
    const props = {
        api: ApiArticle.single(),
        model: Article.single(),
        wrapper: _e('#id-app-new'),
    }
    new AppNew(props)
}

const __main = () => {
    initApp()
}

__main()