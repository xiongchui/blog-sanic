from . import Mongua


class Article(Mongua):
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


