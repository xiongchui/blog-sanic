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
        var overview = _e('#id-editor-overview').value
        var content = _e('#id-editor-content').value
        var title = _e('#id-input-title').value
        var category = _e('#id-input-category').value
        var form = {
            overview: overview,
            content: content,
            title: title,
            category: category,
        }
        api.ajax({
            url: '/api/articles/new',
            data: form,
        }).then(res => {
            var d = JSON.parse(res)
            alert('success')
            location.href = `/articles/${d.id}`
        })
    })
}
