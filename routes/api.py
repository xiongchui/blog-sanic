from sanic.response import json as jsonResponse
from sanic import Blueprint
from models.article import Article
import json

bp = Blueprint('api', url_prefix='/api')


@bp.route('/')
async def bp_root(request):
    return jsonResponse({'my': 'blueprint'})


@bp.route('/articles', methods=['GET'])
async def newBlog(request):
    articles = Article.all()
    return jsonResponse(articles)


@bp.route('/articles/new', methods=['POST'])
async def newBlog(request):
    form = json.loads(request.json)
    article = Article.new(form)
    return jsonResponse(article.json())


