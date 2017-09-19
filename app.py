from sanic import Sanic
from sanic.exceptions import Forbidden
from sanic.response import json as jsonResponse, redirect

app = Sanic(__name__)

app.static('/static', './static')


def register_blueprint(app):
    from routes.api import bp as router_api
    from routes.article import bp as router_article
    from routes.user import bp as route_user
    from routes.category import bp as route_category
    app.blueprint(router_api)
    app.blueprint(router_article)
    app.blueprint(route_user)
    app.blueprint(route_category)


# todo, 首页暂时重定向
@app.route('/', methods=['GET'])
def index(request):
    return redirect('/articles')


@app.exception(Forbidden)
def ignore_403(request, exception):
    r = dict(
        sucess=False,
        msgs=['权限不足，请先登录']
    )
    return jsonResponse(r)


if __name__ == "__main__":
    conf = dict(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )
    app.run(**conf)


def configure_app():
    register_blueprint(app)


def configured_app():
    configure_app()
    return app
