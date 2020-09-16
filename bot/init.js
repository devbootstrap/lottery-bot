const watcher = require('./watcher')
const inquirer = require('inquirer');
require('dotenv').config()

var questions = [
  {
    type: 'input',
    name: 'to',
    message: "Enter contract address to watch:",
    default: function () {
      return process.env.WATCH_TO
    },
  },
  {
    type: 'input',
    name: 'from',
    message: "Enter address of contract owner:",
    default: function () {
      return process.env.WATCH_FROM
    },
  },
  {
    type: 'input',
    name: 'input',
    message: "Enter function signature hash to watch:",
    default: function () {
      return process.env.WATCH_INPUT
    },
  }
];

inquirer.prompt(questions).then(watcher.start);