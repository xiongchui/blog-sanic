from routes import jsonResponse
from sanic import Blueprint
from models.article import Article
from models.comment import Comment
from routes import login_required, current_user

bp = Blueprint('api', url_prefix='/api')


@bp.route('/articles', methods=['GET'])
async def all(request):
    status, data, msgs = Article.mixin_all()
    return jsonResponse(status, data, msgs)


@bp.route('/articles/<id:int>', methods=['GET'])
async def detail(request, id):
    status, data, msgs = Article.mixin_retrieve(id=id)
    return jsonResponse(status, data, msgs)


@bp.route('/articles/new', methods=['POST'])
@login_required
async def new(request):
    form = request.json
    status, data, msgs = Article.mixin_create(form)
    return jsonResponse(status, data, msgs)


@bp.route('/comment/add', methods=['POST'])
@login_required
async def new(request):
    form = request.json
    u = current_user(request)
    form['user_id'] = u.id
    status, data, msgs = Comment.mixin_create(form)
    print(status, data, msgs)
    return jsonResponse(status, data, msgs)
