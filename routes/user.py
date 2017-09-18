from sanic import Blueprint
from sanic.response import redirect

from models.user import User
from models.session import session
from . import template, current_user, login_required, jsonResponse

bp = Blueprint('user', url_prefix='/users')


@bp.route('/register', methods=['POST'])
async def register(request):
    d = request.json
    status, data, msgs = User.register(d)
    res = jsonResponse(
        status=status,
        data=data,
        msgs=msgs
    )
    if status:
        res.cookies['sessionid'] = session.dict_to_cipher(data.json())
        res.cookies['sessionid']['httponly'] = True
    return res


@bp.route('/login', methods=['POST'])
async def login(request):
    d = request.json
    status, data, msgs = User.login(d)
    res = jsonResponse(
        status=status,
        data=data,
        msgs=msgs
    )
    if status:
        res.cookies['sessionid'] = session.dict_to_cipher(data.json())
        res.cookies['sessionid']['httponly'] = True
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
