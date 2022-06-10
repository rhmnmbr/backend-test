import string
import random


def generate_random_password(length: int):
    characters = list(string.ascii_letters + string.digits + "!@#$%^&*")
    random.shuffle(characters)
    password = []

    for i in range(length):
        password.append(random.choice(characters))

    random.shuffle(password)

    return "".join(password)
