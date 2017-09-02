from models.user import User
from models.session import session
from jinja2 import Environment, PackageLoader


# jinjia2 config
env = Environment(
    loader=PackageLoader(__name__, '../templates'))


def template(tpl, **kwargs):
    template = env.get_template(tpl)
    return template.render(kwargs)


def current_user(request):
    s = request.cookies.get('sessionid', '')
    if s != '':
        r = session.cipher_to_dict(s)
        u = User.find_one(id=r['id'])
        return u
    else:
        return None