from sanic import Sanic
from routes.api import bp as router_api
from routes.article import bp as router_article
from routes.user import bp as route_user

app = Sanic(__name__)

app.static('/static', './static')

app.blueprint(router_api)
app.blueprint(router_article)
app.blueprint(route_user)


if __name__ == "__main__":
    conf = dict(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )
    app.run(**conf)
