from . import Mongua
from .comment import Comment
from .mixin import MixinMongo

class Article(Mongua, MixinMongo):
    # 子类必须实现 _fields 类方法来定义字段
    @classmethod
    def _fields(cls):
        fields = [
            ('user_id', int, 1),
            ('title', str, ''),
            ('overview', str, ''),
            ('content', str, ''),
            ('category', str, ''),
        ]
        fields.extend(super()._fields())
        return fields

    def blacklist(self):
        b = [
            '_id',
            'deleted',
            'type',
        ]
        return b

    def comments(self):
        ms = Comment.find(article_id=self.id)
        ms = [m.json() for m in ms]
        return ms

    def json(self):
        r = super().json()
        r.update({
            'comments': self.comments(),
        })
        return r

    @classmethod
    def delete_one(cls, query, **kwargs):
        m = super().delete_one(query, **kwargs)
        if m is not None:
            Comment.delete_many({'article_id': m.id})
        return m

    @classmethod
    def find_one(cls, **kwargs):
        m = super().find_one(**kwargs)
        return m and m.json()

    @classmethod
    def all(cls):
        ms = super().all()
        ms = [m.json() for m in ms]
        return ms
