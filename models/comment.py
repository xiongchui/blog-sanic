from . import Mongua

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

