from models import Mongua
from models.user import User


class Comment(Mongua):
    # 子类必须实现 _fields 类方法来定义字段
    @classmethod
    def _fields(cls):
        fields = [
            ('article_id', int, -1),
            ('user_id', int, -1),
            ('content', str, ''),
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

    def user(self):
        m = User.find_one(id=self.user_id)
        m = m.json()
        return m

    def json(self):
        r = super().json()
        r.update({
            "user": self.user(),
        })
        return r


def create_comment():
    form = dict(
        user_id=1,
        content='test',
        article_id=3,
    )
    c = Comment.new(form)
    print('c', c.json())
    return c


if __name__ == '__main__':
    create_comment()

