#!/usr/bin/env python
# encoding: utf-8

import argparse
import os
import markdown
import re
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
parser.add_argument('--image_dir', default='images', type=str)
parser.add_argument('--notes_file', default='notes.md', type=str)
parser.add_argument('--mode', default='datasets', choices=["datasets", "methods"],
                    help="folder structure", type=str)
parser.set_defaults(debug=False)
args = parser.parse_args()

app = Flask(__name__)
app.config['DATA_ROOT'] = os.path.abspath(args.data)

im_regexp = re.compile(r".*\.(png|jpg|jpeg)")

ROOT_KEY = "root"


def _viewer_data(e):
  epath = os.path.join(_experiment_path(e), args.image_dir)
  print "viewing experiment", epath

  data = {}
  metadata = {}
  if args.mode == "datasets":
    if os.path.exists(epath):
      dsets = os.listdir(epath)
      dsets = sorted([d for d in dsets if os.path.isdir(os.path.join(epath, d))])
      dsets.append(ROOT_KEY)
    else:
      dsets = []

    for d in dsets:
      if d == ROOT_KEY:
        images = os.listdir(epath)
      else:
        images = os.listdir(os.path.join(epath, d))
      if not images:
        continue
      images = [im for im in images if im_regexp.match(im)]
      data[d] = {}
      for im in sorted(images):
        data[d][im] = {"url": url_for('image_file', experiment=e, dataset=d, filename=im)}
    metadata["refresh_list"] = True
  elif args.mode == "methods":
    if os.path.exists(epath):
      methods = os.listdir(epath)
      methods = sorted([d for d in methods if os.path.isdir(os.path.join(epath, d))])
    else:
      methods = []

    if methods:
      images = os.listdir(os.path.join(epath, methods[0]))
      images = [im for im in images if im_regexp.match(im)]

      for im in images:
        data[im] = {}
        for m in methods:
          data[im][m] = {"url": url_for('image_file', experiment=e, dataset=m, filename=im)}
          path = os.path.join(epath, m, im)
          ipath = os.path.splitext(path)[0] + ".json"
          if os.path.exists(ipath):
            with open(ipath) as jfid:
              info = json.load(jfid)
              data[im][m]["info"] = info
    metadata["refresh_list"] = False
  else:
    raise NotImplemented

  data  = json.dumps(data)
  metadata  = json.dumps(metadata)
  return data, metadata


def _experiment_path(e):
  return os.path.join(app.config['DATA_ROOT'], e)


@app.route("/")
def index():
  path = app.config['DATA_ROOT']
  if os.path.exists(path):
    experiments = os.listdir(path)
  else:
    experiments = []
  mtimes = []
  for e in experiments:
    path = _experiment_path(e)
    mtimes.append(time.ctime(os.path.getctime(path)))
  return render_template('index.html', datadir=os.path.basename(app.config['DATA_ROOT']), experiments=zip(experiments, mtimes))


@app.route("/image_file/<experiment>/<dataset>/<filename>")
def image_file(filename=None, experiment=None, dataset=None):
  if dataset == ROOT_KEY:
    dataset = ""
  return send_from_directory(
      os.path.join(app.config['DATA_ROOT'], experiment, args.image_dir, dataset), filename)


@app.route("/experiment/<experiment_name>")
def experiment(experiment_name=None):
  path = _experiment_path(experiment_name)
  md = os.path.join(path, args.notes_file)
  notes = None
  if os.path.exists(md):
    with open(md, 'r') as fid:
      notes = Markup(markdown.markdown(fid.read()))
    print "Experiment", experiment_name, "has notes."
  else:
    print "Experiment", experiment_name, "has no", args.notes_file

  data, meta = _viewer_data(experiment_name)

  return render_template(
      'viewer.html', 
      experiment_name=experiment_name,
      notes=notes,
      data=data, meta=meta)

app.run(debug=args.debug, host='0.0.0.0', port=args.port)
