#!/bin/bash

build_dir=build/
frontend_dir=frontend
public_dir=../backend/public
backend_dir=backend

echo 'Running Build Script'
cd $backend_dir
yarn install
cd ../$frontend_dir
yarn install
yarn build
cp -r $build_dir $public_dir