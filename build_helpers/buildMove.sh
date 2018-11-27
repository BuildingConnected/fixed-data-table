#!/bin/bash

client='../client/node_modules/@buildingconnected/fixed-data-table'

rm -rf $client/internal
cp -r internal $client
