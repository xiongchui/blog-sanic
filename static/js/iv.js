// log 函数
Date.prototype.format = function () {
    var add0 = function (m) {
        return m < 10 ? `0${m}` : m
    }
    var time = this
    var y = time.getFullYear()
    var m = time.getMonth() + 1
    var d = time.getDate()
    var h = time.getHours()
    var mm = time.getMinutes()
    var s = time.getSeconds()
    return `${y}-${add0(m)}-${add0(d)} ${add0(h)}:${add0(mm)}:${add0(s)}`
}

const log = console.log.bind(console, new Date().format())

// 简化常用函数
const _e = sel => document.querySelector(sel)

const _es = sel => document.querySelectorAll(sel)

Element.prototype._e = function (sel) {
    return this.querySelector(sel)
}

Element.prototype._es = function (sel) {
    return this.querySelectorAll(sel)
}

Element.prototype.on = Element.prototype.addEventListener

class Api {
    static single() {
        if (this._instance === undefined) {
            this._instance = new this()
        }
        return this._instance
    }

    _ajax(request) {
        var req = {
            url: request.url,
            data: JSON.stringify(request.data) || null,
            method: request.method || 'POST',
            header: request.header || {},
            contentType: request.contentType || 'application/json',
            callback: request.callback
        }
        var r = new XMLHttpRequest()
        var promise = new Promise((resolve, reject) => {
            r.open(req.method, req.url, true)
            r.setRequestHeader('Content-Type', req.contentType)
            // setHeader
            Object.keys(req.header).forEach(key => {
                r.setRequestHeader(key, req.header[key])
            })
            r.onreadystatechange = function () {
                if (r.readyState === 4) {
                    let res = r.response
                    // 回调函数
                    if (typeof req.callback === 'function') {
                        req.callback(res)
                    }
                    // Promise 成功
                    resolve(res)
                }
            }
            r.onerror = function (err) {
                reject(err)
            }
            if (req.method.toUpperCase() === 'GET') {
                r.send()
            } else {
                r.send(req.data)
            }
        })
        return promise
    }

    get(path, callback) {
        const req = {
            url: path,
            method: 'GET',
            callback: callback,
        }
        return this._ajax(req)
    }

    post(path, form, callback) {
        const req = {
            url: path,
            data: form,
            callback: callback,
        }
        return this._ajax(req)
    }

    _ajaxSync(request) {
        var req = {
            url: request.url,
            data: JSON.stringify(request.data) || null,
            method: request.method || 'POST',
            header: request.header || {},
            contentType: request.contentType || 'application/json',
        }
        var r = new XMLHttpRequest()
        if (request.contentType !== undefined) {
            r.setRequestHeader('Content-Type', request.contentType)
        }
        Object.keys(req.header).forEach(key => {
            r.setRequestHeader(key, req.header[key])
        })
        r.open(req.method, req.url, false)
        if (request.method === 'GET') {
            r.send()
        } else {
            r.send(request.data)
        }
        if (r.readyState === 4) {
            return r.response
        }
    }

    getSync(path) {
        const req = {
            url: path,
            method: 'GET',
        }
        return this._ajaxSync(req)
    }

    postSync(path, form) {
        const req = {
            url: path,
            data: form,
        }
        return this._ajaxSync(req)
    }
}

class PubSub {
    constructor() {
        this.handlers = {}
    }

    on(eventType, handler) {
        if (!(eventType in this.handlers)) {
            this.handlers[eventType] = []
        }
        this.handlers[eventType].push(handler)
        return this
    }

    emit(...args) {
        const hs = this.handlers
        const [eventType, ...rest] = args
        if (hs[eventType] !== undefined) {
            for (let callback of hs[eventType]) {
                callback.apply(this, rest)
            }
        }
        return this
    }
}

class Component extends PubSub {
    constructor(props) {
        super()
        this._props = props
        this.attrs = ['api', 'wrapper', 'model']
        for (let k of this.attrs) {
            this[k] = props[k]
        }
    }

    destroy() {
        this.wrapper.innerHTML = ''
        delete this
    }
}

class Model extends PubSub {
    constructor() {
        super()
    }

    static single() {
        if (this._instance === undefined) {
            this._instance = new this()
        }
        return this._instance
    }
}
