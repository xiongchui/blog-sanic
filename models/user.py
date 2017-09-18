import hashlib

from models import Mongua
from .mixin import MixinMongo
from conf import salt


class User(Mongua, MixinMongo):
    # 子类必须实现 _fields 类方法来定义字段
    @classmethod
    def _fields(cls):
        fields = [
            ('username', str, ''),
            ('password', str, ''),
            ('email', str, '')
        ]
        fields.extend(super()._fields())
        return fields

    def blacklist(self):
        b = [
            '_id',
            'deleted',
            'type',
            'mailbox',
        ]
        return b

    @staticmethod
    def _salted_password(password):
        def md5hex(ascii_str):
            return hashlib.md5(ascii_str.encode('ascii')).hexdigest()

        hash1 = md5hex(password)
        hash2 = md5hex(hash1 + salt)
        return hash2

    @classmethod
    def new(cls, form={}, **kwargs):
        form['password'] = cls._salted_password(form['password'])
        return super().new(form, **kwargs)

    @staticmethod
    def validate_login(form={}):
        username = form.get('username', '')
        password = form.get('password', '')
        pwd = User._salted_password(password)
        u = User.find_one(username=username)
        return u is not None and u.password == pwd

    @staticmethod
    def validate_register(form):
        valid_form = len(form['username']) > 2 and len(form['password']) > 2
        unique_user = User.find_one(username=form['username']) is None
        return valid_form and unique_user

    def validate_auth(self, form):
        cls = self.__class__
        username = form.get('username', '')
        password = form.get('password', '')
        pwd = cls._salted_password(password)
        username_equals = self.username == username
        password_equals = self.password == pwd
        return username_equals and password_equals

    @classmethod
    def register(cls, form={}):
        if (cls.validate_register(form)):
            u = cls.new(form)
            return u
        else:
            return None

    @classmethod
    def login(cls, form={}):
        username = form.get('username', '')
        u = cls.find_one(username=username)
        if u is not None and u.validate_auth(form):
            return u
        else:
            return None


def test_create_user():
    form = dict(
        username='xxx',
        password='xxx',
    )
    u = User.new(form)
    print(u)


def test():
    test_create_user()


if __name__ == '__main__':
    test()
