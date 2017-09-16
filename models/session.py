import base64
import hashlib
import json
from conf import key
from Crypto import Random
from Crypto.Cipher import AES


class AESCipher(object):
    def __init__(self, key):
        self.bs = 32
        self.key = hashlib.sha256(AESCipher.str_to_bytes(key)).digest()

    @staticmethod
    def str_to_bytes(data):
        u_type = type(b''.decode('utf8'))
        if isinstance(data, u_type):
            return data.encode('utf8')
        return data

    def _pad(self, s):
        length = self.bs - len(s) % self.bs
        return s + length * AESCipher.str_to_bytes(chr(length))

    @staticmethod
    def _unpad(s):
        return s[:-ord(s[-1])]

    def encrypt(self, raw):
        raw = self._pad(AESCipher.str_to_bytes(raw))
        iv = Random.new().read(AES.block_size)
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        return base64.b64encode(iv + cipher.encrypt(raw)).decode('utf-8')

    def decrypt(self, enc):
        enc = base64.b64decode(enc)
        iv = enc[:AES.block_size]
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        return self._unpad(cipher.decrypt(enc[AES.block_size:])).decode('utf-8')

    def dict_to_cipher(self, form):
        s = json.dumps(form)
        r = self.encrypt(s)
        return r

    def cipher_to_dict(self, cipher):
        s = self.decrypt(cipher)
        r = json.loads(s)
        return r


session = AESCipher(key=key)


def test():
    pass


if __name__ == '__main__':
    test()
