from . import template
from sanic import Blueprint
from models.article import Article

bp = Blueprint('category', url_prefix='/categories')


@bp.route('/about', methods=['GET'])
async def about(request):
    return template('article/detail.html', id=1)


