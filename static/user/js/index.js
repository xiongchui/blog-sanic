api.login = form => {
    var req = {
        url: '/users/login',
        data: form,
    }
    api.ajax(req).then(body => {
        var r = JSON.parse(body)
        if (r.success) {
            location.href = `/users/detail`
        } else {
            alert(`${r.msgs.join('')}`)
        }
    })
}

api.register = form => {
    var req = {
        url: '/users/register',
        data: form,
    }
    api.ajax(req).then(body => {
        var r = JSON.parse(body)
        if (r.success) {
            location.href = `/users/detail`
        } else {
            alert(`${r.msgs.join('')}`)
        }
    })
}

var formFromEvent = event => {
    var self = event.target
    var container = self.closest('.user-container')
    var inputs = container._es('.input-info')
    var form = {}
    inputs.forEach(e => {
        var key = e.name
        form[key] = e.value
    })
    return form
}

var actionLogin = event => {
    var form = formFromEvent(event)
    api.login(form)
}

var actionRegister = event => {
    var form = formFromEvent(event)
    api.register(form)
}

const bindEventsClick = () => {
    var actions = {
        login: actionLogin,
        register: actionRegister,
    }
    var container = _e('#id-action-container')
    container.addEventListener('click', event => {
        var self = event.target
        var actionName = self.dataset.action
        var action = actions[actionName]
        if (action !== undefined) {
            action(event)
        }
    })
}

const __main = () => {
    bindEventsClick()
}

__main()
