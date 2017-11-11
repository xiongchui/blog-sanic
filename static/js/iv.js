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


// 封装绑定事件函数
const bindEvent = (element, eventName, callback) => {
    element.addEventListener(eventName, callback)
}

const bindEventDelegate = (element, eventName, callback, responseClass) => {
    element.addEventListener(eventName, event => {
        var self = event.target
        if (self.classList.contains(responseClass)) {
            callback(event)
        }
    })
}

const bindAll = (selector, eventName, callback, responseClass) => {
    var es = document.querySelectorAll(selector)
    var func = responseClass === undefined ? bindEvent : bindEventDelegate
    for (let e of es) {
        func(e, eventName, callback, responseClass)
    }
}


// 内部 api
const api = {}


api.ajax = request => {
    var req = {
        url: request.url,
        // data 传对象
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
            // POST
            r.send(req.data)
        }
    })
    return promise
}

//  封装 get Ajax 请求
api.get = function (url, callback) {
    var r = {
        method: 'GET',
        url: url,
        data: '',
    }
    api.ajax(r).then(callback, alert)
}

// 封装 post Ajax 请求
api.post = function (url, form, callback) {
    var r = {
        method: 'POST',
        url: url,
        contentType: 'application/json',
        data: JSON.stringify(form),
    }
    api.ajax(r).then(callback, alert)
}

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
            if (request.XCSRFToken !== undefined) {
                r.setRequestHeader('X-CSRFToken', request.XCSRFToken)
            }
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
        for (let callback of hs[eventType]) {
            callback.apply(this, rest)
        }
        return this
    }
}

class Component extends PubSub {
    constructor(props) {
        super()
        this._props = props
        this.model = props.model
        this.api = props.api
        this.wrapper = props.wrapper
        this.setup()
    }

    setup() {

    }

}