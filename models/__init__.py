import time

from pymongo import *

# mongo 数据库的名字
mongodb_name = 'blog'
client = MongoClient("mongodb://localhost:27017")
mongodb = client[mongodb_name]


def timestamp():
    return int(time.time())


def next_id(name):
    """
    用来给 mongo 的数据生成一个 自增的数字 id
    你就接受就好了， 以后再考虑实现细节
    """
    query = {
        'name': name,
    }
    update = {
        '$inc': {
            'seq': 1
        }
    }
    kwargs = {
        'query': query,
        'update': update,
        'upsert': True,
        'new': True,
    }
    # 存储数据的 id 是放在一个叫做 data_id 的表里面
    # upsert 设置为 True, 如果没有数据表，就创建该新表。
    doc = mongodb['data_id']
    # find_and_modify 是一个原子操作函数, 所以可以保证不会生成重复的 id
    new_id = doc.find_and_modify(**kwargs).get('seq')
    return new_id


class Mongua(object):
    @classmethod
    def _fields(cls):
        """
        _id 是 mongo 自带的, 忽略不用
        其余是固定属性
            id 是自增数字, 我们用来当 id
            type 是类名的小写， 有奇效（现在你还不知道）
            deleted 是逻辑删除标记
            另外两个是时间
            ct 是 created_time
            ut 是 updated_time
        """
        fields = [
            '_id',
            # (字段名, 类型, 值)
            ('id', int, -1),
            ('type', str, ''),
            ('deleted', bool, False),
            ('ct', int, 0),
            ('ut', int, 0),
        ]
        return fields

    @classmethod
    def has(cls, **kwargs):
        """
        检查一个元素是否在数据库中 用法如下
        User.has(id=1)
        """
        return cls.find_one(**kwargs) is not None

    def __repr__(self):
        class_name = self.__class__.__name__
        properties = ('{0} = {1}'.format(k, v) for k, v in self.__dict__.items())
        return '<{0}: \n  {1}\n>'.format(class_name, '\n  '.join(properties))

    @classmethod
    def new(cls, form=None, **kwargs):
        """
        new 是给外部使用的函数， 用于创建并保存新数据
        例如
        form = {
            'task': '吃饭',
        }
        t = Todo.new(form, user_id=1)

        new 是自动 save 的, 所以使用后不需要 save
        """
        name = cls.__name__
        # 创建一个空对象
        m = cls()
        # 把定义的数据写入空对象, 未定义的数据输出错误
        fields = cls._fields()
        # 去掉 _id 这个特殊的字段
        fields.remove('_id')
        if form is None:
            form = {}
        # 给属性赋值
        for f in fields:
            k, t, v = f
            if k in form:
                print('m', m, k, form[k])
                setattr(m, k, t(form[k]))
            else:
                # 设置默认值
                setattr(m, k, v)
        # 处理额外的参数 kwargs
        for k, v in kwargs.items():
            if hasattr(m, k):
                setattr(m, k, v)
            else:
                raise KeyError
        # 写入默认数据
        m.id = next_id(name)
        # 写入时间
        ts = int(time.time())
        m.ct = ts
        m.ut = ts
        # 写入 type
        m.type = name.lower()
        m.save()
        return m

    @classmethod
    def _new_with_bson(cls, bson):
        """
        这是给内部 all 这种函数使用的函数
        从 mongo 数据中恢复一个 model
        你不用关心
        """
        m = cls()
        fields = cls._fields()
        # 去掉 _id 这个特殊的字段
        fields.remove('_id')
        for f in fields:
            k, t, v = f
            if k in bson:
                setattr(m, k, bson[k])
            else:
                # 设置默认值
                setattr(m, k, v)
        # 这一句必不可少，否则 bson 生成一个新的_id
        setattr(m, '_id', bson['_id'])
        return m

    @classmethod
    def all(cls):
        # 按照 id 升序排序
        return cls.find()

    @classmethod
    def find(cls, **kwargs):
        """
        mongo 数据查询
        例如
        ts = Todo.find(user_id=1)
        返回的是 list
        找不到就是 []
        """
        name = cls.__name__
        # TODO 过滤掉被删除的元素
        # kwargs['deleted'] = False
        # TODO, 可以排序
        flag_sort = '__sort'
        sort = kwargs.pop(flag_sort, None)
        ds = mongodb[name].find(kwargs)
        if sort is not None:
            ds = ds.sort(sort)
        l = [cls._new_with_bson(d) for d in ds]
        return l

    @classmethod
    def get(cls, id):
        """
        很简单
        """
        return cls.find_one(id=id)

    @classmethod
    def find_one(cls, **kwargs):
        """
        和 find 一样， 但是只返回第一个元素
        找不到就返回 None
        """
        # TODO 过滤掉被删除的元素
        # kwargs['deleted'] = False
        l = cls.find(**kwargs)
        # print('find one debug', kwargs, l)
        if len(l) > 0:
            return l[0]
        else:
            return None

    def save(self):
        '''
        保存数据到 mongo
        '''
        name = self.__class__.__name__
        mongodb[name].save(self.__dict__)

    @classmethod
    def delete_one_logically(cls, query):
        '''
        删除数据，这里的数据是一种逻辑删除
        '''
        name = cls.__name__
        values = {
            'deleted': True
        }
        m = mongodb[name].find_one_and_update(query, values)
        return m and cls._new_with_bson(m)

    @classmethod
    def delete_one(cls, query, **kwargs):
        '''
        物理删除
        '''
        name = cls.__name__
        m = mongodb[name].find_one_and_delete(query, **kwargs)
        return m and cls._new_with_bson(m)

    @classmethod
    def update_one(cls, query, update, **kwargs):
        name = cls.__name__
        update['ut'] = timestamp()
        dic = {
            '$set': update,
        }
        m = mongodb[name].find_one_and_update(query, dic, return_document=ReturnDocument.AFTER, **kwargs)
        return m and cls._new_with_bson(m)

    @classmethod
    def delete_many(cls, query):
        ms = cls.find(**query)
        for m in ms:
            cls.delete_one({'id': m.id})
        return ms



    def json(self):
        """
        json 函数返回 model 的 json 字典
        子元素可以覆盖这个方法
        """
        _dict = self.__dict__
        d = {k: v for k, v in _dict.items() if k not in self.blacklist()}
        return d

    def blacklist(self):
        """
        这是给 json 函数用的
        因为返回 json 格式数据的时候
        我们有时候不希望所有字段都返回
        比如 _id 和 User.password
        """
        b = [
            '_id',
        ]
        return b
