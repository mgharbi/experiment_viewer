#!/usr/bin/env python
# encoding: utf-8

import argparse
import os
import markdown
import time
import json

from flask import Flask
from flask import Blueprint
from flask import render_template
from flask import send_from_directory
from flask import url_for
from flask import Markup

parser = argparse.ArgumentParser()
parser.add_argument('--data', default='data')
parser.add_argument('--debug', dest='debug', action='store_true')
parser.add_argument('--port', default=5000, type=int)
parser.set_defaults(debug=False)
args = parser.parse_args()

app = Flask(__name__)
app.config['DATA_ROOT'] = os.path.abspath(args.data)

VIEWER_PATH = "viewer"


def _viewer_data(e):
  epath = os.path.join(_experiment_path(e), VIEWER_PATH)
  print epath
  if os.path.exists(epath):
    dsets = os.listdir(epath)
    dsets = sorted(dsets)
    # dsets = [d for d in dsets if os.path.isdir(os.path.join(epath, d))]
  else:
    dsets = []
  if dsets:
    images = set(os.listdir(os.path.join(epath, dsets[0])))
  else:
    images = []
  for d in dsets:
    images2 = set(os.listdir(os.path.join(epath, d)))
    images = images.intersection(images2)
  images = list(images)
  images = sorted(images)
  urls = {}
  for d in dsets:
    urls[d] = {}
    for im in images:
      urls[d][im] = url_for('image_file', experiment=e, dataset=d, filename=im)

  dsets = json.dumps(dsets)
  images = json.dumps(images)
  urls = json.dumps(urls)
  return dsets, images, urls


def _experiment_path(e):
  return os.path.join(app.config['DATA_ROOT'], e)


@app.route("/")
def index():
  path = app.config['DATA_ROOT']
  print path
  if os.path.exists(path):
    experiments = os.listdir(path)
  else:
    experiments = []
  counts = []
  mtimes = []
  for e in experiments:
    path = _experiment_path(e)
    mtimes.append(time.ctime(os.path.getctime(path)))
    counts.append(len(os.listdir(path)))
  return render_template('index.html', datadir=os.path.basename(app.config['DATA_ROOT']), experiments=zip(experiments, counts, mtimes))


@app.route("/image_file/<experiment>/<dataset>/<filename>")
def image_file(filename=None, experiment=None, dataset=None):
  return send_from_directory(
      os.path.join(app.config['DATA_ROOT'], experiment, VIEWER_PATH, dataset), filename)


@app.route("/experiment/<experiment_name>")
def experiment(experiment_name=None):
  path = _experiment_path(experiment_name)
  md = os.path.join(path, 'notes.md')
  notes = None
  if os.path.exists(md):
    with open(md, 'r') as fid:
      notes = Markup(markdown.markdown(fid.read()))

  dsets, images, urls = _viewer_data(experiment_name)

  return render_template(
      'viewer.html', 
      experiment_name=experiment_name,
      notes=notes,
      datasets=dsets,
      images=images,
      urls=urls)

app.run(debug=args.debug, host='0.0.0.0', port=args.port)
