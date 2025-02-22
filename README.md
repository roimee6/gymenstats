# gymenstats

[![license](https://img.shields.io/github/license/roimee6/gymenstats.svg)](LICENSE)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Active Development](https://img.shields.io/badge/status-active-brightgreen)](https://github.com/roimee6/gymenstats)
[![GitHub stars](https://img.shields.io/github/stars/roimee6/gymenstats?style=social)](https://github.com/roimee6/gymenstats/stargazers)

Source code of [gymenstats](https://www.gymenstats.com/), a statistics site dedicated to OGC Nice, inspired by Fotmob. Uses a custom [Fotmob API](https://github.com/roimee6/fotmob) library built in JS/TS.

Open-source for soccer enthusiasts: use for personal projects, but not commercially !

## Table of Contents

- [gymenstats](#gymenstats)
    - [Table of Contents](#table-of-contents)
    - [Explanations of the project](#project)
    - [Configuration](#configuration)
    - [Contributing](#contributing)

## Project

#### Goal Detection and Media Integration

At the heart of the project lies a powerful command-line interface that allows seamless video addition. Users can easily incorporate highlight videos from YouTube or Twitter using a simple command structure: `add <goalId> <ytb|tweet> [start] [end]`.

#### Content Management Strategy 

The platform leverages Discord as its primary media storage solution, creating a robust ecosystem for video hosting. An intelligent system automatically deploys videos, maintains link integrity, and replicates highlights to prevent content loss.

#### Technical Foundations
- Automated tracking of match moments
- Real-time statistic retrieval
- Seamless metadata synchronization
- Minimal manual intervention required

## Configuration

1. Rename [``config.example.js``](https://github.com/roimee6/gymenstats/blob/main/src/config.example.js) to ``config.js``
2. Fill in your personal configurations
3. Never commit config.js

Important clarifications:

1. The ``config.example.js`` file serves as a template with default or example parameters
2. The ``config.js`` file will contain your specific personal configurations
3. To avoid sharing sensitive information, add ``config.js`` to your ``.gitignore`` file

## Contributing

Feel free to [open an issue](https://github.com/roimee6/gymenstats/issues/new) or submit a pull request.
