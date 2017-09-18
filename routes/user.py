from sanic import Blueprint
from sanic.response import json as jsonResponse
from sanic.response import redirect

from models.user import User
from models.session import session
from . import template, current_user, login_required

bp = Blueprint('user', url_prefix='/users')


@bp.route('/register', methods=['POST'])
async def register(request):
    d = request.json
    u = User.register(d)
    if u is not None:
        res = jsonResponse(dict(
            success=True,
            data=u.json(),
        ))
        res.cookies['sessionid'] = session.dict_to_cipher(u.json())
        res.cookies['sessionid']['httponly'] = True
    else:
        res = jsonResponse(dict(
            sucess=False,
            msgs=['用户已存在'],
        ))
    return res


@bp.route('/login', methods=['POST'])
async def login(request):
    d = request.json
    u = User.login(d)
    if u is not None:
        res = jsonResponse(dict(
            success=True,
            data=u.json(),
        ))
        res.cookies['sessionid'] = session.dict_to_cipher(u.json())
        res.cookies['sessionid']['httponly'] = True
    else:
        res = jsonResponse(dict(
            sucess=False,
            msgs=['登录失败'],
        ))
    return res


@bp.route('/', methods=['GET'])
async def index(request):
    return template('user/index.html')


@bp.route('/detail', methods=['GET'])
@login_required
async def detail(request):
    u = current_user(request)
    return template('user/detail.html', m=u)


@bp.route('/logout', methods=['GET'])
@login_required
async def detail(request):
    res = redirect('/articles')
    del res.cookies['sessionid']
    return res
