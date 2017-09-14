const md = new Remarkable('full')

const mdConf = {
    html: false,
    xhtmlOut: false,
    breaks: false,
    langPrefix: 'hljs language-',
    linkify: true,
    linkTarget: '',
    typographer: false,
    quotes: '“”‘’',
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (err) {
            }
        }
        try {
            return hljs.highlightAuto(str).value;
        } catch (err) {
        }
        return ''
    }
}

md.set(mdConf)
