document.addEventListener("DOMContentLoaded", () => {
    __main()
}, false)

const __main = () => {
    bindEvents()
}

const bindEvents = () => {
    bindEventShow()
    bindEventClickSubmit()
}

const htmlFromMarkdown = (string) => {
    var s = md.render(string)
    return s
}

const bindEventShow = () => {
    d = _e('#id-editor-content')
    d.on('keyup', () => {
        var s = d.value
        var t = htmlFromMarkdown(s)
        _e('#id-editor-show').innerHTML = t
    })
}

const bindEventClickSubmit = () => {
    _e('#id-btn-submit').on('click', () => {
        var container = _e('#id-editor-container')
        var es = container._es('.article-info')
        var form = {}
        es.forEach(e => {
            if (e.type === 'radio') {
                if (e.check === true) {
                    form[e.name] = e.value
                }
            } else {
                form[e.name] = e.value
            }
        })
        api.ajax({
            url: '/api/articles/new',
            data: form,
        }).then(res => {
            var d = JSON.parse(res)
            // todo, success 逻辑未修改
            if (d.success) {
                location.href = `/articles#detail/${d.id}`
            } else {
                alert(d.msgs.join('\n'))
            }
        })
    })
}
