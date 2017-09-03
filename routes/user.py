import json
from models.session import session
from sanic import Blueprint, Sanic
from models.user import User
from . import template, current_user, login_required
from sanic.response import json as jsonResponse
from sanic.response import html as htmlResponse
from sanic.response import redirect

app = Sanic(__name__)
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
            msgs=['注册失败'],
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
    return htmlResponse(template('user/index.html'))


@bp.route('/detail', methods=['GET'])
@login_required
async def detail(request):
    u = current_user(request)
    return htmlResponse(template('user/detail.html'))


@bp.route('/logout', methods=['GET'])
@login_required
async def detail(request):
    res = redirect('/articles')
    del res.cookies['sessionid']
    return res
