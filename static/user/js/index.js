class ApiUser extends Api {
    constructor() {
        super()
        this.path = '/users'
    }

    login(form, callback) {
        const url = this.path + '/login'
        return this.post(url, form, callback)
    }

    register(form, callback) {
        const url = this.path + '/register'
        return this.post(url, form, callback)
    }
}

class AppUser extends Component {
    constructor(props) {
        super(props)
        this.render()
        this.bindEvents()
    }

    render() {
        const w = this.wrapper
        w.innerHTML = this.template()
    }

    template() {
        const s = `
        <div id="id-user-container"> 
            <div class="user-container">
                <label for="id-register-username">
                    用户名
                    <input id="id-register-username" class="user-info" type="text" name="username">
                </label>
                <label for="id-register-email">
                    邮箱
                    <input class="user-info" type="email" name="email">
                </label>
                <label for="id-register-password">
                    密码
                    <input id="id-register-password" class="user-info" type="password" name="password">
                </label>
                <button type="submit" data-action="user-register">register</button>
            </div>
            <div class="user-container">
                <label id="id-register-email" for="id-login-username">
                    用户名
                    <input class="user-info" type="text" name="username">
                </label>
                <label for="id-login-username">
                    密码
                    <input class="user-info" type="password" name="password">
                </label>
                <button type="submit" data-action="user-login">login</button>
            </div>
        </div>`
        return s
    }

    bindEvents() {
        const mapEvent = {
            'click': {
                'user-login': this.actionLogin,
                'user-register': this.actionRegister,
            },
        }
        const div = this.wrapper._e('#id-user-container')
        Object.keys(mapEvent).forEach(key => {
            div.on(key, (e) => {
                const self = e.target
                const action = self.dataset.action
                const fn = mapEvent[key][action]
                if (fn !== undefined) {
                    fn.call(this, e)
                }
            })
        })
    }

    formFromEvent(event) {
        const self = event.target
        const container = self.closest('.user-container')
        const inputs = container._es('.user-info')
        const form = {}
        inputs.forEach(e => {
            var key = e.name
            form[key] = e.value
        })
        log('form', form)
        return form
    }

    actionLogin(event) {
        const form = this.formFromEvent(event)
        const p = this.api.login(form)
        p.then(res => {
            this.callback(res)
        })
    }

    actionRegister(event) {
        const form = this.formFromEvent(event)
        const p = this.api.register(form)
        p.then(res => {
            this.callback(res)
        })
    }

    callback(response) {
        var r = JSON.parse(response)
        if (r.success) {
            location.href = `/users/detail`
        } else {
            alert(`${r.msgs.join('')}`)
        }
    }
}

const initApp = () => {
    const props = {
        wrapper: _e('#id-app-user'),
        api: ApiUser.single(),
    }
    new AppUser(props)
}

const __main = () => {
    initApp()
}

__main()
