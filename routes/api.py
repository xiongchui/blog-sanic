from sanic.response import json as jsonResponse
from sanic import Blueprint
from models.article import Article
from models.comment import Comment
from routes import login_required, current_user

bp = Blueprint('api', url_prefix='/api')


@bp.route('/')
async def bp_root(request):
    return jsonResponse({'my': 'blueprint'})


@bp.route('/articles', methods=['GET'])
async def all(request):
    articles = Article.all()
    return jsonResponse(articles)


@bp.route('/articles/<id:int>', methods=['GET'])
async def detail(request, id):
    m = Article.find_one(id=id)
    if m is None:
        r = dict(
        success = False,
        msgs = ['404 NOT FOUND'],
        )
    else:
        r = dict(
            success=True,
            data=m.json(),
        )
    return jsonResponse(r)


@bp.route('/articles/new', methods=['POST'])
@login_required
async def new(request):
    form = request.json
    article = Article.new(form)
    return jsonResponse(article.json())


@bp.route('/comment/add', methods=['POST'])
@login_required
async def new(request):
    form = request.json
    u = current_user(request)
    form['user_id'] = u.id
    article = Comment.new(form)
    r = dict(
        success=True,
        data=article.json()
    )
    return jsonResponse(r)
