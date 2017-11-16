from . import template, login_required
from sanic import Blueprint

bp = Blueprint('article', url_prefix='/articles')


@bp.route('/')
async def index(request):
    return template('article/index.html')


@bp.route('/manage')
@login_required
async def index(request):
    return template('article/manage.html')
