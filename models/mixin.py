class MixinMongo(object):
    @classmethod
    def mixin_create(cls, form):
        status, data, msgs = False, None, []
        m = cls.new(form)
        status = True
        data = m
        return status, data, msgs

    @classmethod
    def mixin_delete(cls, **kwargs):
        status, data, msgs = False, None, []
        ms = cls.find(**kwargs)
        for m in ms:
            m.delete()
        status = True
        data = [m.json() for m in ms]
        return status, data, msgs

    @classmethod
    def mixin_all(cls):
        status, data, msgs = False, None, []
        ms = cls.all()
        status = True
        data = [m.json() for m in ms]
        return status, data, msgs

    @classmethod
    def mixin_retrieve(cls, **kwargs):
        status, data, msgs = False, None, []
        m = cls.find_one(**kwargs)
        if m is not None:
            status = True
            data = m
        else:
            msgs.append('没有此项')
        return status, data, msgs

    @classmethod
    def mixin_update(cls, model_id, form):
        status, data, msgs = False, {}, []
        query = {
            'id': model_id,
        }
        m = cls.update(query, form)
        if m is not None:
            status = True
            data = m.json()
        else:
            msgs.append('更新失败')
        return status, data, msgs

    @classmethod
    def mixin_retrieve_all(cls, **kwargs):
        status, data, msgs = False, {}, []
        ms = cls.all()
        status = True
        data = [m.json() for m in ms]
        return status, data, msgs

    def __repr__(self):
        class_name = self.__class__.__name__
        properties = ('{} = {}'.format(k, v) for k, v in self.__dict__.items())
        return '<{}: \n  {}\n>'.format(class_name, '\n  '.join(properties))

    @classmethod
    def mixin_delete_logically(cls, query):
        status, data, msgs = False, {}, []
        ms = cls.delete_logically(query)
        status = True
        data = [m.json() for m in ms]
        return status, data, msgs

    @classmethod
    def mixin_delete_physically(cls, query):
        status, data, msgs = False, {}, []
        ms = cls.delete_physically(query)
        status = True
        data = [m.json() for m in ms]
        return status, data, msgs


def test():
    pass


if __name__ == '__main__':
    test()
