let guessedWords = 0
let score = 0
let timer = 0
let mistakes = 0
let playerName
const MAINAPP = function () {
  if (MAINAPP.instance) {
    return MAINAPP.instance
  }
  MAINAPP.instance = this

  this.routes = MAINAPP.routes
  this.currentRoute = null

  this.init()
}



const TYPER = function () {
  if (TYPER.instance_) {
    return TYPER.instance_
  }
  TYPER.instance_ = this

  this.WIDTH = window.innerWidth
  this.HEIGHT = window.innerHeight
  this.canvas = null
  this.ctx = null

  this.words = []
  this.word = null
  this.wordMinLength = 5
  this.guessedWords = 0

  this.score = 0
  this.mistakes = 0
  this.timer = 0


  this.init()
}

window.TYPER = TYPER

MAINAPP.routes = {
  'home-view': {
    'render': function () {
      console.log('>>>> Home')
    }
  },
  'app-view': {
    'render': function () {
      console.log('>>>> App')
      const typer = new TYPER()
      window.typer = typer
    }
  }
}

MAINAPP.prototype = {
  init: function () {
    console.log('Rakendus läks tööle')

    window.addEventListener('hashchange', this.routeChange.bind(this))

    if (!window.location.hash) {
      window.location.hash = 'home-view'
    } else {
      this.routeChange()
    }
  },

  routeChange: function (event) {
    this.currentRoute = location.hash.slice(1)
    if (this.routes[this.currentRoute]) {
      this.updateMenu()

      this.routes[this.currentRoute].render()
    } else {
      /// 404 - ei olnud
    }
  },

  updateMenu: function () {
    // http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript
    document.querySelector('.active-menu').className = document.querySelector('.active-menu').className.replace('active-menu', '')
    document.querySelector('.' + this.currentRoute).className += ' active-menu'
  }

}// Main

TYPER.prototype = { 
  init: function () {
    this.canvas = document.getElementsByTagName('canvas')[0]
    this.ctx = this.canvas.getContext('2d')

    this.canvas.style.width = this.WIDTH + 'px'
    this.canvas.style.height = this.HEIGHT + 'px'

    this.canvas.width = this.WIDTH * 2
    this.canvas.height = this.HEIGHT * 2

    this.loadWords()
  },

  loadWords: function () {
    const xmlhttp = new XMLHttpRequest()

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && (xmlhttp.status === 200 || xmlhttp.status === 0)) {
        const response = xmlhttp.responseText
        const wordsFromFile = response.split('\n')

        typer.words = structureArrayByWordLength(wordsFromFile)

        typer.start()
      }
    }

    xmlhttp.open('GET', './lemmad2013.txt', true)
    xmlhttp.send()
  },

  start: function () {
    this.generateWord()
    this.word.Draw()

    window.addEventListener('keypress', this.keyPressed.bind(this))
  },

  generateWord: function () {
    const generatedWordLength = this.wordMinLength + parseInt(this.guessedWords / 5)
    const randomIndex = (Math.random() * (this.words[generatedWordLength].length - 1)).toFixed()
    const wordFromArray = this.words[generatedWordLength][randomIndex]

    wordCounter = this.guessedWords
    score = this.score
    mistakes = this.mistakes
    this.word = new Word(wordFromArray, this.canvas, this.ctx)
  },

  keyPressed: function (event) {
    const letter = String.fromCharCode(event.which)

    if (letter === this.word.left.charAt(0)) {
      this.word.removeFirstLetter()
      this.score += 5
      console.log (this.score)

      if (this.word.left.length === 0) {
        this.guessedWords += 1
        //endTime = window.performance.now()
        //console.log(endTime)
        /*if (endTime - startTime < 1000) {
          this.playerScore += 45
        }
        if (endTime - startTime < 1500) {
          this.playerScore += 35
        }
        if (endTime -startTime < 2500) {
          this.playerScore += 15
        }
        else{
          this.playerScore -= 15
        }*/

        this.generateWord()
      }

      this.word.Draw()
    }
    else {
      this.mistakes += 1
      if (this.score >= 100){
        this.score -= 100
      }
      else{
        this.score = 0
      }
    }
  }
}

const Word = function (word, canvas, ctx) {
  this.word = word
  this.left = this.word
  this.canvas = canvas
  this.ctx = ctx
}

Word.prototype = {
  Draw: function () {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.textAlign = 'center'
    this.ctx.font = '140px Courier'
    this.ctx.fillText(this.left, this.canvas.width / 2, this.canvas.height / 2)

	  this.ctx.textAlign = 'left'
    this.ctx.font = '50px Courier'
    this.ctx.fillText("Guessed words: ", 30, 70)
    this.ctx.fillText(wordCounter, 450, 70)
    this.ctx.fillText("Score: ", 30, 100)
    this.ctx.fillText(score, 200, 100)
    this.ctx.fillText("mistakes: ", 30, 130)
    this.ctx.fillText(mistakes, 290, 130)
  },

  removeFirstLetter: function () {
    this.left = this.left.slice(1)
  }
}


function autosave () {
// after typing init autosave

  const doneTypingInterval = 2500

  if (timer) { clearTimeout(timer) }
  timer = window.setTimeout(function () {
    // TODO check if really changed
    saveLocal()
    console.log('autosave')
  }, doneTypingInterval)
}

function saveLocal () {
  console.log(window.app)
  localStorage.setItem('player', JSON.stringify(playerName))
}

function endGame () {
  console.log("game over!")


}

function structureArrayByWordLength (words) {
  let tempArray = []

  for (let i = 0; i < words.length; i++) {
    const wordLength = words[i].length
    if (tempArray[wordLength] === undefined)tempArray[wordLength] = []

    tempArray[wordLength].push(words[i])
  }
  

  return tempArray
}


// kui leht laetud käivitan app'i
window.onload = function () {
  const app = new MAINAPP()
  window.app = app
 
  document
    .querySelector('#play-game')
    .addEventListener('click', saveLocal)

    playerName = document.querySelector('#player-name')

  window.addEventListener('keypress', autosave)
}