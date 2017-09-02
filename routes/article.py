from . import template
from sanic import Blueprint
from models.article import Article as Model
from sanic.response import html as htmlResponse


bp = Blueprint('article', url_prefix='/articles')


@bp.route('/')
async def index(request):
    return htmlResponse(template('article/index.html'))


@bp.route('/<id:int>', methods=['GET'])
async def detail(request, id):
    m = Model.find_one(id=id)
    return htmlResponse(template('article/detail.html', m=m))


@bp.route('/new', methods=['GET'])
async def new(request):
    return htmlResponse(template('article/new.html'))
