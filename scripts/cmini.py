#!/bin/python
import gzip
from util import layout, memory, parser
from util import analyzer, authors, corpora, links
from util.consts import *
from util.returns import *
import asyncio

from core.keyboard import Layout, Position
from os import walk
import json, math, hashlib
from itertools import chain, repeat, count, islice
from collections import Counter

RESTRICTED = False

meme_layouts = ['for_viewing_corpus_stats', 'thumb']

def repeat_chain(values, counts):
    return chain.from_iterable(map(repeat, values, counts))

def unique_combinations_from_value_counts(values, counts, r):
    n = len(counts)
    indices = list(islice(repeat_chain(count(), counts), r))
    if len(indices) < r:
        return
    while True:
        yield tuple(values[i] for i in indices)
        for i, j in zip(reversed(range(r)), repeat_chain(reversed(range(n)), reversed(counts))):
            if indices[i] != j:
                break
        else:
            return
        j = indices[i] + 1
        for i, j in zip(range(i, r), repeat_chain(count(j), counts[j:])):
            indices[i] = j

def unique_combinations(iterable, r):
    values, counts = zip(*Counter(iterable).items())
    return unique_combinations_from_value_counts(values, counts, r)

def get_filenames(path):
    f = []
    for (dirpath, dirnames, filenames) in walk(path):
        f.extend(filenames)
        break
    return f

def get_hash(s):
    return hashlib.md5(s.encode("utf-8")).hexdigest()

def get_dirnames(path):
    f = []
    for (dirpath, dirnames, filenames) in walk(path):
        f.extend(dirnames)
        break
    return f

ngrams_cache = {}
def get_ngrams( name: str, typ:str):
    path = f'corpora/{name}/{typ}.json'
    if path in ngrams_cache:
        return ngrams_cache[path]
    handle = open(path, 'r')
    grams = json.load(handle)
    handle.close()
    ngrams_cache[path] = grams
    return grams

def format_number(n):
    return math.trunc(n * 100000) / 100000

def board_to_num(b):
    match b:
        case "ortho":
            return 2
        case "mini":
            return 1
        case _:
            return 0

def finger_to_hand_num(f):
    if f[0] == 'L':
        return 0
    if f[0] == 'R':
        return 1

def finger_to_num(f):
    match f:
        case "LT":
            return 0
        case "TB":
            return 0
        case "LI":
            return 1
        case "LM":
            return 2
        case "LR":
            return 3
        case "LP":
            return 4
        case "RT":
            return 5
        case "RI":
            return 6
        case "RM":
            return 7
        case "RR":
            return 8
        case "RP":
            return 9
        case _:
            print(f)
            return None

def keys_to_string(keys):
    output = ''
    lastRow = None
    for key, data in keys.items():
        ch = (hex(ord(key))[2:]).zfill(2)
        c = hex(data.col)[2:].zfill(2)
        delimiter = '-' if data.row != lastRow and lastRow != None else ''
        lastRow = data.row
        r = hex(data.row)[2:].zfill(2)
        f = finger_to_num(data.finger)
        line = f'{delimiter}{ch}{c}{r}{f}'
        output += line
    return output

def create_metric():
    return {
        "min": 100000,
        "max": 0
    }

def record_metric(metric, value):
    if value < metric["min"]:
        metric["min"] = value
    if value > metric["max"]:
        metric["max"] = value

def layout_to_keymap(ll):
    keymap_left = { 'gram': [], 'gram-horizontal': [], 'gram-vertical': [] }
    keymap_right = { 'gram': [], 'gram-horizontal': [], 'gram-vertical': [] }
    lh_all = []
    rh_all = []
    lh_grid = []
    rh_grid = []
    lh_width = 0
    rh_width = 0
    lt_width = 0
    rt_width = 0

    for key, data in ll.keys.items():
        finger_num = finger_to_num(data.finger)
        is_left_thumb = finger_num == 0
        is_right_thumb = finger_num == 5

        if finger_to_hand_num(data.finger) == 0:
            lh_all.append(key)
            diff = data.row + 1 - len(lh_grid)
            if diff > 0:
                for i in range(diff):
                    lh_grid.append([])
            ref = lh_grid[data.row]
            ref.append(key)
            if len(ref) > lh_width:
                lh_width = len(ref)
            if is_left_thumb and len(ref) > lt_width:
                lt_width = len(ref)
        else:
            rh_all.append(key)
            diff = data.row + 1 - len(rh_grid)
            if diff > 0:
                for i in range(diff):
                    rh_grid.append([])
            ref = rh_grid[data.row]
            ref.append(key)
            if len(ref) > rh_width:
                rh_width = len(ref)
            if is_right_thumb and len(ref) > rt_width:
                rt_width = len(ref)

    def get_hand_combinations_adjacent(key_grid, keymap):
        for i in range(0, len(key_grid)):
            row = key_grid[i]
            for j in range(0, len(row)):
                h_str = row[j]
                v_str = row[j]
                h_char_was_none = False
                v_char_was_none = False

                for k in range(1, 4):
                    if not h_char_was_none:
                        h_char = row[j + k] if j + k < len(row) else None
                        if h_char is not None:
                            h_str += h_char
                            keymap['gram-horizontal'].append(h_str)
                        else:
                            h_char_was_none = True
                    
                    if not v_char_was_none:
                        column = key_grid[i + k] if i + k < len(key_grid) else None
                        v_char = column[j] if column is not None and j < len(column) else None
                        if v_char is not None:
                            v_str += v_char
                            keymap['gram-vertical'].append(v_str)
                        else:
                            v_char_was_none = True
                    
                    if h_char_was_none and v_char_was_none:
                        break

    def get_hand_combinations(keys, keymap):
        if len(keys) == 0:
            return
        for i in range(1, 5):
            for tpl in unique_combinations(keys, i):
                combo = ''.join(tpl)
                if not combo in keymap['gram']:
                    keymap['gram'].append(combo)

    get_hand_combinations_adjacent(lh_grid, keymap_left)
    get_hand_combinations_adjacent(rh_grid, keymap_right)
    get_hand_combinations(lh_all, keymap_left)
    get_hand_combinations(rh_all, keymap_right)
    return keymap_left, keymap_right, lh_width, rh_width, lt_width, rt_width

def layout_to_string(ll, corpora_dirname, likes_data, metrics):
    author = authors.get_name(ll.user)

    monogram = get_ngrams(corpora_dirname, "monograms")
    bigram = get_ngrams(corpora_dirname, "bigrams")
    trigram = get_ngrams(corpora_dirname, "trigrams")

    stats = analyzer.trigrams(ll, trigram)
    sfb = analyzer.sfb_bigram(ll, bigram)
    use = analyzer.use(ll, monogram)
    po = analyzer.pinky_off(ll, monogram)
    fsb, hsb = analyzer.scissors(ll, bigram)

    stats["sfb"] = sfb
    stats["fsb"] = fsb
    stats["hsb"] = hsb
    stats["pinky-off"] = po

    if ll.name in likes_data:
        likes = len(likes_data[ll.name])
    else:
        likes = 0

    has_stats = not (stats.get("alternate", 0) == 0 or stats.get("sfb", 0) == 0 or stats.get("redirect", 0) == 0 or stats.get("roll-in") == 0)
    external_link = links.get_link(ll.name.lower())
    print(ll.name + ', ' + corpora_dirname)
    keys_string = keys_to_string(ll.keys)
    board_num = board_to_num(ll.board)
    layout_hash = get_hash(keys_string)
    board_hash = get_hash(keys_string + str(board_num))
    author_hash = get_hash(keys_string + str(board_num) + str(ll.user))

    names_string = f'{ll.name}|{layout_hash}|{board_hash}|{author_hash}|{author}|{ll.user}|{likes}|{external_link}',
    layout_string = f'{layout_hash}|{board_hash}|{board_num}|{keys_string}',
    
    alternate = format_number(stats.get("alternate", 0) * 100)
    roll_in = format_number(stats.get("roll-in", 0) * 100)
    roll_out = format_number(stats.get("roll-out", 0) * 100)
    oneh_in = format_number(stats.get("oneh-in", 0) * 100)
    oneh_out = format_number(stats.get("oneh-out", 0) * 100)
    redirect = format_number(stats.get("redirect", 0) * 100)
    bad_redirect = format_number(stats.get("bad-redirect", 0) * 100)
    format_number(stats.get("sfb", 0) * 100)
    dsfb_red = format_number(stats.get("dsfb-red", 0) * 100)
    dsfb_alt = format_number(stats.get("dsfb-alt", 0) * 100)
    fsb = format_number(stats.get("fsb", 0) * 10)
    hsb = format_number(stats.get("hsb", 0) * 100)
    pinky_off = format_number(stats.get("pinky-off", 0) * 100)
    rr = format_number(use.get("RR", 0) * 100)
    lm = format_number(use.get("LM", 0) * 100)
    rm = format_number(use.get("RM", 0) * 100)
    lp = format_number(use.get("LP", 0) * 100)
    rp = format_number(use.get("RP", 0) * 100)
    li = format_number(use.get("LI", 0) * 100)
    ri = format_number(use.get("RI", 0) * 100)
    lr = format_number(use.get("LR", 0) * 100)
    lh = format_number(use.get("LH", 0) * 100)
    rh = format_number(use.get("RH", 0) * 100)
    lt = format_number(use.get("LT", 0) * 100)
    rt = format_number(use.get("RT", 0) * 100)

    stats_string = (
        f'{layout_hash}|',
        f'{board_hash}|',
        f'{corpora_dirname}|',
        f'{alternate}|',
        f'{roll_in}|',
        f'{roll_out}|',
        f'{oneh_in}|',
        f'{oneh_out}|',
        f'{redirect}|',
        f'{bad_redirect}|',
        f'{sfb}|',
        f'{dsfb_red}|',
        f'{dsfb_alt}|',
        f'{fsb}|',
        f'{hsb}|',
        f'{pinky_off}|',
        f'{rr}|',
        f'{lm}|',
        f'{rm}|',
        f'{lp}|',
        f'{rp}|',
        f'{li}|',
        f'{ri}|',
        f'{lr}|',
        f'{lh}|',
        f'{rh}|',
        f'{lt}|',
        f'{rt}',
    )

    record_metric(metrics["alternate"], alternate)
    record_metric(metrics["roll-in"], roll_in)
    record_metric(metrics["roll-out"], roll_out)
    record_metric(metrics["oneh-in"], oneh_in)
    record_metric(metrics["oneh-out"], oneh_out)
    record_metric(metrics["redirect"], redirect)
    record_metric(metrics["bad-redirect"], bad_redirect)
    record_metric(metrics["sfb"], sfb)
    record_metric(metrics["dsfb-red"], dsfb_red)
    record_metric(metrics["dsfb-alt"], dsfb_alt)
    record_metric(metrics["fsb"], fsb)
    record_metric(metrics["hsb"], hsb)
    record_metric(metrics["pinky-off"], pinky_off)
    record_metric(metrics["RR"], rr)
    record_metric(metrics["LM"], lm)
    record_metric(metrics["RM"], rm)
    record_metric(metrics["LP"], lp)
    record_metric(metrics["RP"], rp)
    record_metric(metrics["LI"], li)
    record_metric(metrics["RI"], ri)
    record_metric(metrics["LR"], lr)
    record_metric(metrics["LH"], lh)
    record_metric(metrics["RH"], rh)
    record_metric(metrics["LT"], lt)
    record_metric(metrics["RT"], rt)
   
    # stats_string = (
    #     f'name {ll.name}\n',
    #     f'layout_hash {layout_hash}\n',
    #     f'board_hash {board_hash}\n',
    #     f'corpora_dirname {corpora_dirname}\n',
    #     f'alternate {format_number(stats.get("alternate", 0))}\n',
    #     f'rollin {format_number(stats.get("roll-in", 0))}\n',
    #     f'rollout {format_number(stats.get("roll-out", 0))}\n',
    #     f'onehin {format_number(stats.get("oneh-in", 0))}\n',
    #     f'onehout {format_number(stats.get("oneh-out", 0))}\n',
    #     f'redirect {format_number(stats.get("redirect", 0))}\n',
    #     f'badredirect {format_number(stats.get("bad-redirect", 0))}\n',
    #     f'sfb {format_number(stats.get("sfb", 0))}\n',
    #     f'dsfb-red {format_number(stats.get("dsfb-red", 0))}\n',
    #     f'dsfb-alt {format_number(stats.get("dsfb-alt", 0))}\n',
    #     f'fsb {format_number(stats.get("fsb", 0))}\n',
    #     f'hsb {format_number(stats.get("hsb", 0))}\n',
    #     f'pinky-off {format_number(stats.get("pinky-off", 0))}\n',
    #     f'rr {format_number(use.get("RR", 0))}\n',
    #     f'lm {format_number(use.get("LM", 0))}\n',
    #     f'rm {format_number(use.get("RM", 0))}\n',
    #     f'lp {format_number(use.get("LP", 0))}\n',
    #     f'rp {format_number(use.get("RP", 0))}\n',
    #     f'li {format_number(use.get("LI", 0))}\n',
    #     f'ri {format_number(use.get("RI", 0))}\n',
    #     f'lr {format_number(use.get("LR", 0))}\n',
    #     f'lh {format_number(use.get("LH", 0))}\n',
    #     f'rh {format_number(use.get("RH", 0))}\n',
    #     f'lt {format_number(use.get("LT", 0))}\n',
    #     f'rt {format_number(use.get("RT", 0))}\n',
    # )

    return (layout_hash, board_hash, author_hash, ''.join(names_string), ''.join(layout_string), ''.join(stats_string), has_stats)

layouts_db = open('../cmini-api/layouts.tmp.csv', 'w')
stats_db = open('../cmini-api/stats.tmp.csv', 'w')
names_db = open('../cmini-api/names.tmp.csv', 'w')
metrics_db = open('../cmini-api/metrics.tmp.csv', 'w')
heatmap_db = open('../cmini-api/heatmap.tmp.csv', 'w')
keymap_db = open('../cmini-api/keymap.tmp.csv', 'w')

likes_data = open('likes.json', 'r')
likes = json.load(likes_data)
global_keymap = {}
metrics = {
    "alternate": create_metric(),
    "roll-in": create_metric(),
    "roll-out": create_metric(),
    "oneh-in": create_metric(),
    "oneh-out": create_metric(),
    "redirect": create_metric(),
    "bad-redirect": create_metric(),
    "sfb": create_metric(),
    "dsfb-red": create_metric(),
    "dsfb-alt": create_metric(),
    "fsb": create_metric(),
    "hsb": create_metric(),
    "pinky-off": create_metric(),
    "RR": create_metric(),
    "LM": create_metric(),
    "RM": create_metric(),
    "LP": create_metric(),
    "RP": create_metric(),
    "LI": create_metric(),
    "RI": create_metric(),
    "LR": create_metric(),
    "LH": create_metric(),
    "RH": create_metric(),
    "LT": create_metric(),
    "RT": create_metric()
}

corporae = get_dirnames('corpora')

valid_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRTSUVWXYZ1234567890!@#$%^&*()-=_+;':\",.<>/?`~"
for corpora_dirname in corporae:
    monograms = get_ngrams(corpora_dirname, "monograms")
    max = 0
    min = 10000000
    for char, frequency in monograms.items():
        if not char in valid_chars:
            continue
        if frequency < min:
            min = frequency
        if frequency > max:
            max = frequency

    line = f'{corpora_dirname}|'
    for char, frequency in monograms.items():
        if not char in valid_chars:
            continue
        char_code = ord(char)
        value = (frequency - min) / (max - min)
        line += f'{char_code},{format_number(value)}|'

    heatmap_db.write(f'{line}\n')

for layout_filename in get_filenames('layouts'):
    file = f'layouts/{layout_filename}'
    with open(file, 'r') as f:
        layout_data = json.load(f)
    items = layout_data["keys"].items()
    keys = {
        k: Position(
            row=v["row"],
            col=v["col"],
            finger=v["finger"]
        ) for k, v in items
    }
    is_alpha = len(items) >= 26
    if not is_alpha:
        continue

    ll = Layout(
        name=layout_data["name"],
        user=layout_data["user"],
        board=layout_data["board"],
        keys=keys,
    )

    if ll.name in meme_layouts:
        continue

    processed = []
    has_stats = False
    stats = []
    layouts1 = None

    for corpora_dirname in corporae:
        if corpora_dirname != 'monkeyracer':
            continue
        layout_hash, board_hash, author_hash, names_string, layout_string, stats_string, next_has_stats = layout_to_string(ll, corpora_dirname, likes, metrics)
        if next_has_stats:
            has_stats = True
        if board_hash in processed or not has_stats:
            break
        stats.append(stats_string)

    if not has_stats:
        continue

    if not layout_hash in processed:
        left_keymap, right_keymap, lh_width, rh_width, lt_width, rt_width = layout_to_keymap(ll)

        if lh_width > 7 or rh_width > 7 or lt_width > 5 or rt_width > 5:
            continue

        for hand in range(0, 2):
            is_left_hand = hand == 0
            keymap = left_keymap if is_left_hand else right_keymap

            for gram_type, keys in keymap.items():
                for key_combo in keys:
                    index = ''
                    if gram_type == 'gram':
                        index = f'{key_combo}|' if is_left_hand else f'|{key_combo}'

                        if not index in global_keymap:
                            global_keymap[index] = []
                        global_keymap[index].append(layout_hash)
                    else:
                        if gram_type == 'gram-horizontal':
                            index = f'h–{key_combo}'
                        elif gram_type == 'gram-vertical':
                            index = f'v–{key_combo}'

                        index = f'{index}|' if is_left_hand else f'|{index}'
                        if not index in global_keymap:
                            global_keymap[index] = []
                        global_keymap[index].append(layout_hash)

    names_db.write(f'{names_string}\n')
    if not layout_hash in processed:
        layouts_db.write(f'{layout_string}\n')
    if not board_hash in processed:
        for s in stats:
            stats_db.write(f'{s}\n')

    processed.append(board_hash)
    processed.append(layout_hash)

for key, metric in metrics.items():
    line = f'{key}|{metric["min"]}|{metric["max"]}\n'
    metrics_db.write(line)

for index, hashes in global_keymap.items():
    line = f'{index}¶{','.join(hashes)}\n'
    keymap_db.write(line)