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
    d = e('#id-editor-content')
    d.on('keyup', () => {
        var s = d.value
        var t = htmlFromMarkdown(s)
        e('#id-editor-show').innerHTML = t
    })
}

const bindEventClickSubmit = () => {
    e('#id-btn-submit').on('click', () => {
        var overview = e('#id-editor-overview').value
        var content = e('#id-editor-content').value
        var title = e('#id-input-title').value
        var tags = e('#id-input-tags').value.split(' ')
        var form = {
            overview: overview,
            content: content,
            title: title,
            tags: tags,
        }
        api.createArticle(form, res => {
            var d = JSON.parse(res)
            alert('success')
            location.href = `/articles/${d.id}`
        })
    })
}
