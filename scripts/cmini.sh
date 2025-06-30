#!/bin/bash
#https://github.com/Apsu/cmini
cd ../cmini
git pull

cp ../cmini-api/scripts/cmini.py .
python cmini.py
mv ../cmini-api/layouts.tmp.csv ../cmini-api/layouts.csv
mv ../cmini-api/stats.tmp.csv ../cmini-api/stats.csv
mv ../cmini-api/names.tmp.csv ../cmini-api/names.csv
mv ../cmini-api/metrics.tmp.csv ../cmini-api/metrics.csv
mv ../cmini-api/heatmap.tmp.csv ../cmini-api/heatmap.csv
mv ../cmini-api/keymap.tmp.csv ../cmini-api/keymap.csv