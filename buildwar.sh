#!/bin/sh

# simple script to create a war file with the application just to facilitate
# deployment on tomcat or similar container.

mkdir -p dist
cd app && jar cf ../dist/odssplatim-ui.war *
