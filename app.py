from sanic import Sanic
from routes.api import bp as router_api
from routes.article import bp as router_article
from routes.user import bp as route_user
from sanic.exceptions import Forbidden
from sanic.response import json as jsonResponse

app = Sanic(__name__)

app.static('/static', './static')

app.blueprint(router_api)
app.blueprint(router_article)
app.blueprint(route_user)


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
