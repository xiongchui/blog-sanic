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

var changeTitle = (res) => {
    var title = '半夜集 - ' + res.data.title
    document.title = title
}

var htmlFromMarkdown = (markdown) => {
    var s = md.render(markdown)
    return s
}

var templateArticle = (m) => {
    var s = `<header>
    <h1 id="id-article-title">
        {{ m.title }}
    </h1>
    <div class="article-info flex">
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
        <a href="/category/{{ m.category }}">{{ m.category }}</a>
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

var insertCommentInput = () => {
    var s = `<div>
    <input id="id-input-content" data-id="{{ id }}" type="text" name="content">
    <button id="id-btn-add" type="submit">add comment</button>
</div>
<div id="id-comment-content">
</div>`
    var container = _e('#id-comment-container')
    container.insertAdjacentHTML('afterbegin', s)
}

var insertArticle = (res) => {
    var r = res.data
    r.content = htmlFromMarkdown(r.content)
    var s = templateArticle(r)
    var container = _e('article')
    container.insertAdjacentHTML('afterbegin', s)
}

var loadComment = (r) => {
    ms = r.data.comments
    var container = _e('#id-comment-content')
    ms.forEach(m => {
        var s = templateComment(m)
        container.insertAdjacentHTML('beforeend', s)
    })
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
            insertArticle(r)
            insertCommentInput()
            loadComment(r)
        } else {
            // todo, 使用 sweetalert 修改效果
            alert(`${r.msgs.join('')}`)
            location.href = '/articles'
        }
    })

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

var insertComment = string => {
    var container = _e('#id-comment-content')
    container.insertAdjacentHTML('beforeend', string)
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
                var t = templateComment(data)
                insertComment(t)
            } else {
                alert(`${r.msgs.join('')}`)
            }
        })
    })
}

var __main = () => {
    loadArticle()
    bindEventAddComment()
}

__main()