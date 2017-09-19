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
                if (e.checked === true) {
                    form[e.name] = e.value
                }
            } else {
                form[e.name] = e.value
            }
        })
        api.ajax({
            url: '/api/articles/new',
            data: form,
        }).then(body => {
            var r = JSON.parse(body)
            if (r.success) {
                var m = r.data
                alertify.success('add article succeeded')
                location.href = `/articles/manage#detail/${m.id}`
            } else {
                alertify.error(r.msgs.join('\n'))
            }
        })
    })
}
