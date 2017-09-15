from . import template
from sanic import Blueprint

bp = Blueprint('interest', url_prefix='/interests')


@bp.route('/about', methods=['GET'])
async def new(request):
    return template('about.html')


@bp.route('/category/<category:str>', methods=['GET'])
async def new(request, category):
    return template('article/new.html')
