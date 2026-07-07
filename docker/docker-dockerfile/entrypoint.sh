#!/bin/sh


echo "nge seed db dulu lah biar aman sentosa"
node seed/data.js


exec "$@"