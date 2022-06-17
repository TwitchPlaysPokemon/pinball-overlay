from flask import Flask, jsonify
import random
import time
from functools import partial
import threading

tpp_app = Flask(__name__)
pinball_app = Flask(__name__)

EMU_PORT = 5337
SCORE = 0


@pinball_app.route('/WRAM/ReadU32LE/146A')
def pinball_score():
    return str(SCORE)


@pinball_app.after_request
def pinball_after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response


@tpp_app.after_request
def pinball_after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response


@tpp_app.route('/pinball/emu-api-port')
def pinball_emu_api_port():
    return str(EMU_PORT)


@tpp_app.route('/pinball/current-table')
def pinball_current_table():
    return 'red'


@tpp_app.route('/pinball/multipliers')
def pinball_multipliers():
    return jsonify({
        'red': 1_000_000,
        'blue': 1_000_000,
        'gold': 1_000_000,
        'siver': 1_000_000,
    })


def main():
    thread = threading.Thread(
        target=partial(tpp_app.run, port=5000),
        daemon=True)
    thread.start()
    thread = threading.Thread(
        target=partial(pinball_app.run, port=EMU_PORT),
        daemon=True)
    thread.start()
    global SCORE
    time.sleep(2)
    while True:
        time.sleep(random.random() * 5)
        if random.randrange(2) == 1:
            SCORE += 2000
        else:
            SCORE += 50


if __name__ == '__main__':
    main()
