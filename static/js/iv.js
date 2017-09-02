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
const e = sel => document.querySelector(sel)

const es = sel => document.querySelectorAll(sel)

Element.prototype.e = sel => document.querySelector(sel)

Element.prototype.es = sel => document.querySelectorAll(sel)

Element.prototype.on = Element.prototype.addEventListener


// 选择器函数 浏览器已经实现
const closestClass = (element, className) => {
    var e = element
    while (e !== null) {
        if (e.classList.contains(className)) {
            return e
        } else {
            e = e.parentElement
        }
    }
    return null
}

const closestId = (element, idName) => {
    var e = element
    while (e !== null) {
        if (e.id === idName) {
            return e
        } else {
            e = e.parentElement
        }
    }
    return null
}

const closestTag = (element, tagName) => {
    var e = element
    while (e !== null) {
        if (e.tagName === tagName.toUpperCase()) {
            return e
        } else {
            e = e.parentElement
        }
    }
    return null
}

const closest = (element, selector) => {
    var flag = selector[0]
    if (flag === '.') {
        let className = selector.slice(1)
        return closestClass(element, className)
    } else if (flag === '#') {
        let idName = selector.slice(1)
        return closestId(element, idName)
    } else {
        return closestId(element, selector)
    }
}


// 封装绑定事件函数
var bindEvent = (element, eventName, callback) => {
    element.addEventListener(eventName, callback)
}

var bindEventDelegate = (element, eventName, callback, responseClass) => {
    element.addEventListener(eventName, event => {
        var self = event.target
        if (self.classList.contains(responseClass)) {
            callback(event)
        }
    })
}

var bindAll = (selector, eventName, callback, responseClass) => {
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
