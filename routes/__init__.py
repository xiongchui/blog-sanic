from models.user import User
from models.session import session
from jinja2 import Environment, PackageLoader
from functools import wraps
from sanic.exceptions import abort
from sanic.response import html, json

# jinjia2 config
env = Environment(
    loader=PackageLoader(__name__, '../templates'))


def template(path, **kwargs):
    t = env.get_template(path)
    r = t.render(kwargs)
    return html(r)


def current_user(request):
    s = request.cookies.get('sessionid', '')
    if s != '':
        r = session.cipher_to_dict(s)
        u = User.find_one(id=r['id'])
        if u is not None and u.password == r['password']:
            return u
    return None


def login_required(router_func):
    @wraps(router_func)
    async def wrapped_func(request, *args, **kwargs):
        u = current_user(request)
        if u is None:
            abort(403)
        else:
            res = await router_func(request, *args, **kwargs)
            return res

    return wrapped_func


def jsonResponse(status=True, data={}, msgs=[]):
    body = dict(
        success=status,
        data=data,
        msgs=msgs,
    )
    return json(body)