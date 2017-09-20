var changeTitle = (article) => {
    var title = '半夜集 - ' + article.title
    document.title = title
}

var htmlFromMarkdown = (markdown) => {
    var s = md.render(markdown)
    return s
}

var templateArticle = (article) => {
    var m = article
    var s = `<header>
    <h1 id="id-article-title">
        {{ m.title }}
    </h1>
    <div class="detail-info flex">
    <span id="id-article-ct">
        <i class="fa fa-calendar-check-o fa-fw" aria-hidden="true"></i>
        发表于
        <a href="#delete/{{ m.id }}">{{ m.ct | formattime }}</a>
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
</div>
        `
    var env = nunjucksEnvironment()
    var r = env.renderString(s, {
        m,
    })
    return r
}

var insertCommentInput = (articleId) => {
    var s = `<div>
    <input id="id-input-content" data-id="${articleId}" type="text" name="content">
    <button id="id-btn-add" type="submit">add comment</button>
</div>
<div id="id-comment-content">
</div>`
    var container = _e('#id-comment-container')
    container.insertAdjacentHTML('afterbegin', s)
}

var insertArticle = (article) => {
    var r = article
    r.content = htmlFromMarkdown(r.content)
    var s = templateArticle(r)
    var container = _e('article')
    container.insertAdjacentHTML('afterbegin', s)
}

var loadComment = (r) => {
    ms = r.comments
    var container = _e('#id-comment-content')
    ms.forEach(m => {
        var s = templateComment(m)
        container.insertAdjacentHTML('beforeend', s)
    })
}

var loadArticleById = (id) => {
    var container = _e('#id-article-container')
    id = Number(id)
    var body = localStorage.articles
    var arr = JSON.parse(body)
    var article = arr.filter(e => e.id === id)[0]
    if (article !== undefined) {
        var r = article
        changeTitle(r)
        insertArticle(r)
        insertCommentInput(id)
        loadComment(r)
        bindEventAddComment()
        alertify.success(`load current article succeeded`)
    } else {
        alertify.error('没有这篇文章 跳转至上一页')
        history.back()
    }
}

var templateContainerArticle = () => {
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

var insertComment = (article) => {
    var s = templateComment(article)
    var container = _e('#id-comment-content')
    container.insertAdjacentHTML('beforeend', s)
}

var templateComment = (m) => {
    var s = `<div>
        {{ m.user.username }}
    </div>
    <div>
        {{ m.ct | formattime}}
    </div>
    <div>
        {{ m.content }}
    </div>`
    var env = nunjucksEnvironment()
    var r = env.renderString(s, {
        m,
    })
    return r
}

var bindEventAddComment = () => {
    var btn = _e('#id-btn-add')
    btn.addEventListener('click', event => {
        var input = _e('#id-input-content')
        var form = {
            content: input.value,
            article_id: input.dataset.id,
        }
        api.addComment(form, body => {
            var r = JSON.parse(body)
            if (r.success) {
                var data = r.data
                insertComment(data)
                alertify.success('add comment succeeded')
            } else {
                alertify.error(r.msgs.join(''))
            }
        })
    })
}

var initEnvDetail = () => {
    var spa = _e('#id-spa')
    var s = templateContainerArticle()
    spa.insertAdjacentHTML('beforeend', s)
}

var initArticle = (hash) => {
    initSpa()
    initEnvDetail()
    loadArticleById(hash)
}

var initSpa = () => {
    var container = _e('#id-spa')
    container.innerHTML = ''
}

var deleteArticle = (id) => {
    var req = {
        method: 'get',
        url: `/api/articles/delete/${id}`
    }
    api.ajax(req).then(body => {
        var r = JSON.parse(body)
        if (r.success) {
            alertify.success('this article has been deleted successfully')
            loadArticles()
            location.href = '#category/all'
        } else {
            alertify.error(r.msgs.join(''))
        }
    })
}

var insertArticleUpdateInput = (id) => {
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

var bindEventClickUpdate = (id) => {
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
    d = _e('#id-editor-content')
    d.on('keyup', () => {
        var s = d.value
        var t = htmlFromMarkdown(s)
        _e('#id-editor-show').innerHTML = t
    })
}


var updateArticle = (subHash) => {
    var id = Number(subHash)
    initSpa()
    insertArticleUpdateInput(id)
    bindEventsUpdate(id)
}


var changeArticle = (hash) => {
    var [func, subHash] = hash !== undefined ? hash.split('/') : [undefined, undefined]
    var dic = {
        'category': initArticles,
        'detail': initArticle,
        'delete': deleteArticle,
        'edit': updateArticle,
    }
    var f = dic[func] || initArticles
    f(subHash)
}

var bindEventHashChange = () => {
    window.addEventListener('hashchange', (e) => {
        var [url, hash] = e.newURL.split('#')
        var flag = url.endsWith('/manage')
        if (flag) {
            changeArticle(hash)
        }
    })
}