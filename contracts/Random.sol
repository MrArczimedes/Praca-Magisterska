pragma solidity ^0.5.0;

contract Random {

    uint public gameID = 0;
    uint public finalNumber  = 0;
    //struct do gracza w Losowaniu
    struct Player{
     uint id;
     address payable adres;
     uint256 stawka;
    }
    // struct do losowania
    struct Losowanie {
     uint id;
     uint liczba_players;
     bool aktywna;
     uint playerNum;
     mapping (uint => Player) players;
     uint256 stawkaTotal;
     uint256 ostatniblok;
     uint stawka;
     bool rollAccept;
     address winner;
    }
    mapping (uint => Losowanie) public losowania;
    // Dodawanie gry
    function addGame (uint _liczba_players, uint _stawka) public {
        gameID ++;
        losowania[gameID] = Losowanie (gameID, _liczba_players, true, 0,0,0,_stawka,false,address(0));
    }
    // Dodawanie gracza
    function addPlayer (uint _gameID) public payable {
        // Sprawdzenie ilosci graczy
        require(losowania[_gameID].liczba_players > losowania[_gameID].playerNum, "Maksymalna liczba graczy");
        // Dodawanie gracza do gry
        Losowanie storage l = losowania[_gameID];
        for (uint i = 0; i<l.playerNum; i++)
        {
            require(l.players[i].adres!=msg.sender, "Dany gracz jest już zarejestrowany do rozgrywki");
        }
        require(msg.value>=l.stawka, "Za mała wartość obstawienia");
        uint _playerNum = l.playerNum++;
        if (l.playerNum==l.liczba_players){
            l.ostatniblok = block.number;
        }
        if (l.playerNum==l.liczba_players-1){
            l.rollAccept = true;
        }
        l.players[_playerNum] = Player (_playerNum, msg.sender, msg.value);
        l.stawkaTotal += msg.value;
    }
    // Losowanie zwycięzcy
    function roll (uint _gameID) public payable  {
        Losowanie storage l = losowania[_gameID];
        require(l.rollAccept==true, "Gra nie ma kompletu graczy");
        require(l.playerNum==l.liczba_players, "Brak kompletu graczy");
        bytes32 blockHash = blockhash(l.ostatniblok);
        uint blockUnhashed = uint(blockHash);
        finalNumber = blockUnhashed%l.playerNum;
        address payable winner = l.players[finalNumber].adres;
        winner.transfer(l.stawkaTotal);
        l.winner = winner;
        l.aktywna = false;
        }

}