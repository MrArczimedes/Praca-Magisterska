App = {
    contracts: {},
  
    load: async () => {
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContract()
      await App.render()
      await App.newGame()
      await App.joinGame()
    },
  
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {
      App.account = web3.eth.accounts[0]
    },
  
    loadContract: async () => {
      const random = await $.getJSON('Random.json')
      App.contracts.Random = TruffleContract(random)
      App.contracts.Random.setProvider(App.web3Provider)
      App.random = await App.contracts.Random.deployed()
      console.log(random)
    },

    render: async () => {
      $('#account').html('Bieżący adres: ' + App.account)
      await App.list()
    },

    list: async() => {
    const gamesCount = await App.random.gameID()
    const $gamesTemplate = $('.gamesTemplate')
    for (var i = 1; i <= gamesCount; i++) {
      const losowania = await App.random.losowania(i)
      const gameId = losowania[0].toNumber()
      const liczbaPlayers = losowania[1].toNumber()
      const aktywna = losowania[2]
      const playerNum = losowania[3].toNumber()
      const stawkaTotal = losowania[4].toNumber()
      const ostatniBlok = losowania[5].toNumber()
      const stawka = losowania[6].toNumber()
      const czywinner = losowania[7]
      const winner = losowania[8]
      console.log(gameId)
      console.log(liczbaPlayers)
      console.log(aktywna)  
      console.log(playerNum)
      console.log(stawkaTotal)
      console.log(ostatniBlok)
      console.log(stawka)
      console.log(czywinner)
      // Create the html for the task
      const $newgamesTemplate = $gamesTemplate.clone()
      $newgamesTemplate.find('.listContent').html('ID gry: '+ gameId + '<br />' + 'maksymalna liczba graczy: ' 
      + liczbaPlayers + '<br />' + 'aktualna liczba graczy: ' +playerNum + '<br />' 
      + 'ostatni blok zakładu: ' + ostatniBlok + '<br />' + 'stawka wejścia: ' + stawka + ' ether' 
      + '<br/>' + 'zwycięzca: ' + winner)                 
      console.log($newgamesTemplate)
      if (aktywna==false) {
        $('#completedGames').append($newgamesTemplate)
      } else {
        $('#gamesList').append($newgamesTemplate)
      }
      $newgamesTemplate.show()
    }
    },
  
    newGame: async () => {
      $("#newGameButton").click(function() {
        const req=($("#newGame").val())
        const stawka = ($("#stawka").val())
        console.log(req)
        App.random.addGame(req, stawka) 
        window.location.reload()  
       });
    },

    joinGame: async () => {
      $("#joinGameButton").click(async() => {
        const id_game=($("#joinGame").val());
        const toJoin = await App.random.losowania(id_game)
        const stawkaToJoin = toJoin[6].toNumber()
        console.log('stawka: ' + stawkaToJoin + ' ether')
        App.random.addPlayer.sendTransaction(id_game , {value:web3.toWei(stawkaToJoin,'ether')})
        if(toJoin[7]==true)
        {
          await App.random.roll(id_game)
        }
        window.location.reload();
      })
    }
  }
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })
  