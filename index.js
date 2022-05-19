//Dear programmer:
//When I wrote this code, only god and
//I knew how it worked.
//Now, only god knows it!
//
//Therefore, if you are trying to optimize
//this routine and it fails (most surely),
//please increase this counter as a
//warning for the newxt person:
//
// total_hours_wasted_here = 254
//


//mező objektum, tárolja a háttér kép elérési útvonalát, a bejáratok irányát és, hogy hányszor van elforgatva
class Field{
    constructor(img, entrances, rotates){
        this.img = img;
        this.entrances = entrances;
        this.rotates = rotates;
    }
}

//játékos objektum, tárolja az x és y koordinátát, a kezdő koordinátáit valamint, a bábu képének az elérési útvonalát
class Player{
    constructor(xCoord, yCoord, img){
        this.xCoord = xCoord;
        this.yCoord = yCoord;
        this.img = img;
        this.startPositionX = xCoord;
        this.startPositionY = yCoord;
    }
}

//kincs objektum, tárolja az x és y koordinátáját és a kincs képének elérési útvonalát
class Treasure{
    constructor(x, y, img){
        this.x = x;
        this.y = y;
        this.img = img;
    }

}

const viewTable = document.querySelector('#gametable'); //nézet táblája
let gameTable = []; //játéktábla, ebben tároljuk mindig a tábla aktuális állapotát
const viewFieldToFill = document.querySelector('#field'); //nézet beilleszteni való mezője
const playerInput = document.querySelector('#players'); //játékosszám input mezője
const cardInput = document.querySelector('#cards');//kártyaszám input mezője
let fieldToFill = null; //Field objektum, a beillesztésre váró mezőre mutat
const openDescription = document.querySelector('#description'); // leírás megjelenítő gomb
const description = document.querySelector('#gameDescription');2 // maga a leírás
const cardsView = document.querySelector('#cardsView'); //kártyák megjelenítése
const infos = document.querySelector('#infos'); //aktuális játékos/győztem megjelenítője
const WIDTH = 7; // pálya szélessége
const HEIGHT = 7; //pálya magassága
const STRAIGHTS = 13; //egyenesek száma
const CURVE = 15; //kanyarok száma
const THREE_WAY_BRANCH = 6; //3-as elágazások száma
const CURVEIMAGEPATH = 'img/curve.png'; //kanyar kép elérési útvonala
const STRAIGHTIMAGEPATH = 'img/straight.png'; //egyenes kép elérési útvonala
const BRANCHIMAGEPATH = 'img/three_way_branch.png'; //3-as elágazás kép elérési útvonala
const REDPLAYERIMAGEPATH = 'img/red_player.png'; //piros játékos kép elérési útvonala
const BLUEPLAYERIMAGEPATH = 'img/blue_player.png'; //kék játékos kép elérési útvonala
const YELLOWPLAYERIMAGEPATH = 'img/yellow_player.png'; //sárga játékos kép elérési útvonala
const GREENPLAYERIMAGEPATH = 'img/green_player.png'; //zöld játékos kép elérési útvonala
const COINSIMAGEPATH = 'img/coins.png'; //kincs kép elérési útvonal
const CHESTIMAGEPATH = 'img/chest.png'; //kincs kép elérési útvonal
const EMERALDIMAGEPATH = 'img/emerald.png'; //kincs kép elérési útvonal
const MAPIMAGEPATH = 'img/map.png'; //kincs kép elérési útvonal
let GameStarted = false; //elkezdődőtt-e a játék
let GameOver = false; //vége van-e a játéknak
let PlayerMove = false; //játékos éppen lép-e
let Players = []; //játékosok tömbje
let Treasures = []; //kincsek tömbje
let playerCount = 0; //játékosok száma
let cardCount = 0; //kártyák száma játékosonként
let actualPlayer = 0; //akutális játékos indexe
let previousMove = null; //előző lépés iránya
let previousCellIndex = null; //előző lépés oszlop indexe
let previousRowIndex = null; //előző lépés sor indexe

//játék vége esemény
const GameOverEvent = new CustomEvent('GameOver');

//irány enum
const Direction ={
    Right: 0,
    Left: 1,
    Up: 2,
    Down: 4,
}

//inicializálás, beállítja a kezdő értékeket és megjeleníti a kezdő táblát
function init(){
    GameStarted = false;
    GameOver = false;
    Players = [];
    Treasures = [];
    gameTable = [];
    fieldToFill = null;
    PlayerMove = false;
    previousMove = null;
    previousCellIndex = null;
    previousRowIndex = null;
    infos.classList.toggle('hidden');
    InitializeViewTable();
    InitializeGameTable();
    RefreshViewTable();
}

//beillesztésre váró mező frissítése
function refreshFieldToFill(){
    if(fieldToFill){
        viewFieldToFill.style.backgroundImage = fieldToFill.img;
        if(viewFieldToFill.children.length === 1){
            let img = viewFieldToFill.children[0];
            if(fieldToFill.rotates < 4){
                img.style.transform = "rotate(-" + (fieldToFill.rotates * 90) + "deg)";
            }else{
                img.style.transform = "rotate(-" + ((fieldToFill.rotates % 4) * 90) + "deg)";
            }
        }
        if(fieldToFill.rotates < 4){
            viewFieldToFill.style.transform = "rotate(" + (fieldToFill.rotates * 90) + "deg)";
        }else{
            viewFieldToFill.style.transform = "rotate(" + ((fieldToFill.rotates % 4) * 90) + "deg)";
        }
    }
}

//nézet játéktábla frissítése
function RefreshViewTable(){
    for(let i = 0; i < HEIGHT; i++){
        for(let j = 0; j < WIDTH; j++){
            let cell = GetCell(i+1,j+1);
            cell.classList = "";
            cell.innerHTML = "";
            if(!(i % 2 === 0 && j % 2 === 0)){
                cell.style.backgroundImage = "url('" + gameTable[i][j].img + "')";
                cell.style.transform = "rotate(" + gameTable[i][j].rotates * 90 + "deg)";
                
            }
        }
    }
    viewFieldToFill.innerHTML = "";

    for(let i = 0; i < Treasures.length; i++){
        for(let j = 0; j < Treasures[i].length; j++){
            let img = getTreasure(Treasures[i][j].img);
            img.style.paddingLeft = img.style.paddingRight = img.style.paddingTop = img.style.paddingBottom = "18px";

            if(Treasures[i][j].x === -1 && Treasures[i][j].y === -1){
                if(fieldToFill.rotates < 4){
                    img.style.transform = "rotate(-" + fieldToFill.rotates * 90 + "deg)";
                }else{
                    img.style.transform = "rotate(-" + (fieldToFill.rotates % 4) * 90 + "deg)";
                }
                
                viewFieldToFill.appendChild(img);
            }else{
                let cell = GetCell(Treasures[i][j].x + 1, Treasures[i][j].y + 1);
                cell.innerHTML = "";

                if(gameTable[Treasures[i][j].x][Treasures[i][j].y].rotates < 4){
                    img.style.transform = "rotate(-" + (gameTable[Treasures[i][j].x][Treasures[i][j].y].rotates * 90) + "deg)";
                }else{
                    img.style.transform = "rotate(-" + ((gameTable[Treasures[i][j].x][Treasures[i][j].y].rotates % 4) * 90) + "deg)";
                }
                cell.appendChild(img);
            }
        }
    }

    for(let i = 0; i < Players.length; i++){
        let img = getPlayer(Players[i].img);

        let cell = GetCell(Players[i].xCoord + 1, Players[i].yCoord + 1);
        cell.innerHTML = "";
        if(gameTable[Players[i].xCoord][Players[i].yCoord].rotates < 4){
            img.style.transform = "rotate(-" + (gameTable[Players[i].xCoord][Players[i].yCoord].rotates * 90) + "deg)";
        }else{
            img.style.transform = "rotate(-" + ((gameTable[Players[i].xCoord][Players[i].yCoord].rotates % 4) * 90) + "deg)";
        }
        img.style.paddingLeft = img.style.paddingRight = img.style.paddingTop = img.style.paddingBottom = "18px";
        
        cell.appendChild(img);
    }
}

//játékosok kártyáinak nézetének a frissítése
function refreshCardsView(){
    for(let i = 0; i < playerCount; i++){
        let cell = getCardsCell(i);
        
        if(Treasures[i].length > 0){
            cell.children[1].src = Treasures[i][0].img;
            if(Treasures[i][0].x === -1 && Treasures[i][0].y === -1){
                cell.children[2].innerHTML = "A kincs a beillesztendő mezőn található!";
            }else{
                cell.children[2].innerHTML = 'A kincs a(z) ' + (Treasures[i][0].x + 1) + ". sor " + (Treasures[i][0].y + 1) + ". oszlopában található!";
            }
        }else{
            cell.children[1].src = 'img/tick.png';
            cell.children[2].innerHTML = "Az összes kincset összegyűjtotted! A feladatod, hogy vissza juss a kezdő pozíciódra! (" + (Players[i].startPositionX+1) + "," + (Players[i].startPositionY+1) + ")";
        }
        
        cell.children[3].innerHTML = 'x' + Treasures[i].length;
        
    }
}

//az adott játékos kártyájának a nézetét adja vissza
function getCardsCell(i){
    if(i < 2){
        return cardsView.rows[0].cells[i];
    }else{
        return cardsView.rows[1].cells[i % 2];
    }
}

//random mezők random forgatása és generálása
function InitializeGameTable(){
    
    let straightsGenerated = 0;
    let straightsToGenerate = 0; 
    let curvesToGenerate = 0;
    let branchToGenerate = 0;
    let curvesGenerated = 0;
    let branchGenerated = 0;
    let rnd = randomInRange(1,3);
    switch(rnd){
        case 1: straightsToGenerate = STRAIGHTS - 1;
                fieldToFill = new Field(STRAIGHTIMAGEPATH, [Direction.Up, Direction.Down], 0);
                curvesToGenerate = CURVE;
                branchToGenerate = THREE_WAY_BRANCH;
                break;
        case 2: straightsToGenerate = STRAIGHTS;
                curvesToGenerate = CURVE - 1;
                fieldToFill = new Field(CURVEIMAGEPATH, [Direction.Left, Direction.Down], 0);
                branchToGenerate = THREE_WAY_BRANCH;
                break;
        case 3: straightsToGenerate = STRAIGHTS;
                curvesToGenerate = CURVE;
                branchToGenerate = THREE_WAY_BRANCH - 1;
                fieldToFill = new Field(BRANCHIMAGEPATH, [Direction.Left, Direction.Right, Direction.Down], 0);
                break;
    }
    viewFieldToFill.style.backgroundImage = "url('" + fieldToFill.img + "')"; 

    for(let i = 0; i < HEIGHT; i++){
        gameTable.push([]);
        for(let j = 0; j < WIDTH; j++){
            gameTable[i].push(null);
        }
    }

    for(let i = 0; i < HEIGHT; i++){
        for(let j = 0; j < WIDTH; j++){
            if(i % 2 == 0 && j % 2 == 0){
                InitializeFixField(i,j);
            }
        }
    }

    let x, y = 0;
    while(straightsGenerated < straightsToGenerate){
        do{
            x = randomInRange(0,6);
            y = randomInRange(0,6);
        }while(gameTable[x][y] !== null)
        let randomRotate = randomInRange(1,8);
        let entrances = [Direction.Up, Direction.Down];
        gameTable[x][y] = new Field(STRAIGHTIMAGEPATH, shiftEntrances(entrances,randomRotate),randomRotate);
        straightsGenerated++;
    }

    while(curvesGenerated < curvesToGenerate){
        do{
            x = randomInRange(0,6);
            y = randomInRange(0,6);
        }while(gameTable[x][y] !== null)
        let randomRotate = randomInRange(1,8);
        let entrances = [Direction.Left, Direction.Down];
        gameTable[x][y] = new Field(CURVEIMAGEPATH, shiftEntrances(entrances,randomRotate),randomRotate);
        curvesGenerated++;
    }

    while(branchGenerated < branchToGenerate){
        do{
            x = randomInRange(0,6);
            y = randomInRange(0,6);
        }while(gameTable[x][y] !== null)
        let randomRotate = randomInRange(1,8);
        let entrances = [Direction.Left,Direction.Right, Direction.Down];
        gameTable[x][y] = new Field(BRANCHIMAGEPATH, shiftEntrances(entrances,randomRotate),randomRotate);
        branchGenerated++;
    }
    
    
}

//randomRotate alkalommal elforgatja egyel a bejáratokat 90 fokkal
function shiftEntrances(entrances, randomRotate){
    let resultEntrances = [];
    if(randomRotate < 4){
        for(let i = 0; i < entrances.length; i++){
            for(let j = 0; j < randomRotate; j++){
                switch(entrances[i]){
                    case Direction.Down: entrances[i] = Direction.Left;
                        break;
                    case Direction.Left: entrances[i] = Direction.Up;
                        break;
                    case Direction.Up: entrances[i] = Direction.Right;
                        break;
                    case Direction.Right: entrances[i] = Direction.Down;
                        break;
                }
            }
            resultEntrances[i] = entrances[i];
        }
    }else{
        for(let i = 0; i < entrances.length; i++){
            for(let j = 0; j < randomRotate % 4; j++){
                switch(entrances[i]){
                    case Direction.Down: entrances[i] = Direction.Left;
                        break;
                    case Direction.Left: entrances[i] = Direction.Up;
                        break;
                    case Direction.Up: entrances[i] = Direction.Right;
                        break;
                    case Direction.Right: entrances[i] = Direction.Down;
                        break;
                }
            }
            resultEntrances[i] = entrances[i];
        }
    }

    return resultEntrances;
}

//random szám generálása a és b között
function randomInRange(start,end){
    return Math.floor(Math.random() * (end - start + 1) + start);
}

//fix mezők inicializálása
function InitializeFixField(i,j){
    let field = null;
    switch(i){
        case 0:
            switch(j){
                case 0:
                    field = new Field(CURVEIMAGEPATH, [Direction.Right, Direction.Down], 3);
                    gameTable[i][j] = field;
                    break;
                case 2:
                    field = new Field(BRANCHIMAGEPATH, [Direction.Left, Direction.Right, Direction.Down], 0);
                    gameTable[i][j] = field;
                    break;
                case 4:
                    field = new Field(BRANCHIMAGEPATH, [Direction.Left, Direction.Right, Direction.Down], 0);
                    gameTable[i][j] = field;
                    break;
                case 6:
                    field = new Field(CURVEIMAGEPATH, [Direction.Left, Direction.Down], 0);
                    gameTable[i][j] = field;
                    break;
            }
            break;
        case 2:
            switch(j){
                case 0:
                    field = new Field(BRANCHIMAGEPATH, [Direction.Up, Direction.Right, Direction.Down], 3);
                    gameTable[i][j] = field;
                    break;
                case 2:
                    field = new Field(BRANCHIMAGEPATH, [Direction.Up, Direction.Left, Direction.Right, Direction.Down], 3);
                    gameTable[i][j] = field;
                    break;
                case 4:
                    field = new Field(BRANCHIMAGEPATH, [Direction.Left, Direction.Right, Direction.Down], 0);
                    gameTable[i][j] = field;
                    break;
                case 6:
                    field = new Field(BRANCHIMAGEPATH, [Direction.Left, Direction.Up, Direction.Down], 1);
                    gameTable[i][j] = field;
                    break;
            }
            break;
        case 4:
            switch(j){
                case 0:
                    field = new Field(BRANCHIMAGEPATH, [Direction.Up, Direction.Right, Direction.Down], 3);
                    gameTable[i][j] = field;
                    break;
                case 2:
                    field = new Field(BRANCHIMAGEPATH, [Direction.Left, Direction.Up, Direction.Right], 2);
                    gameTable[i][j] = field;
                    break;
                case 4:
                    field = new Field(BRANCHIMAGEPATH, [Direction.Left, Direction.Up, Direction.Down], 1);
                    gameTable[i][j] = field;
                    break;
                case 6:
                    field = new Field(BRANCHIMAGEPATH, [Direction.Left, Direction.Up, Direction.Down], 1);
                    gameTable[i][j] = field;
                    break;
            }
            break;
        case 6:
            switch(j){
                case 0:
                    field = new Field(CURVEIMAGEPATH, [Direction.Up, Direction.Right], 2);
                    gameTable[i][j] = field;
                    break;
                case 2:
                    field = new Field(BRANCHIMAGEPATH, [Direction.Left, Direction.Up, Direction.Right], 2);
                    gameTable[i][j] = field;
                    break;
                case 4:
                    field = new Field(BRANCHIMAGEPATH, [Direction.Left, Direction.Up, Direction.Right], 2);
                    gameTable[i][j] = field;
                    break;
                case 6:
                    field = new Field(CURVEIMAGEPATH, [Direction.Left, Direction.Up], 1);
                    gameTable[i][j] = field;
                    break;
            }
            break;
        
    }
}

//nézet táblájának kezdeti inicializálása
function InitializeViewTable(){
    //első sor inicializálása
    GetCell(0,0).classList.add('empty');
    GetCell(0,1).classList.add('empty');
    GetCell(0,2).classList.add('arrow-down'); if(GetCell(0,2).children.length === 0) {GetCell(0,2).appendChild(GetArrow());}
    GetCell(0,3).classList.add('empty');
    GetCell(0,4).classList.add('arrow-down'); if(GetCell(0,4).children.length === 0) {GetCell(0,4).appendChild(GetArrow());}
    GetCell(0,5).classList.add('empty');
    GetCell(0,6).classList.add('arrow-down'); if(GetCell(0,6).children.length === 0) {GetCell(0,6).appendChild(GetArrow());}
    GetCell(0,7).classList.add('empty');
    GetCell(0,8).classList.add('empty');

    //második sor inicializálása
    GetCell(1,0).classList.add('empty');
    GetCell(1,8).classList.add('empty');
    GetCell(1,1).style.backgroundImage = "url('img/curve.png')";
    GetCell(1,1).style.transform = "rotate(270deg)";
    GetCell(1,3).style.backgroundImage = "url('img/three_way_branch.png')";
    GetCell(1,5).style.backgroundImage = "url('img/three_way_branch.png')";
    GetCell(1,7).style.backgroundImage = "url('img/curve.png')";

    //harmadik sor inicializálása
    GetCell(2,0).classList.add('arrow-right'); if(GetCell(2,0).children.length === 0) {GetCell(2,0).appendChild(GetArrow());}
    GetCell(2,8).classList.add('arrow-left'); if(GetCell(2,8).children.length === 0) {GetCell(2,8).appendChild(GetArrow());}

    //negyedik sor inicializálása
    GetCell(3,0).classList.add('empty');
    GetCell(3,8).classList.add('empty');
    GetCell(3,1).style.backgroundImage = "url('img/three_way_branch.png')";
    GetCell(3,1).style.transform = "rotate(270deg)";
    GetCell(3,3).style.backgroundImage = "url('img/three_way_branch.png')";
    GetCell(3,3).style.transform = "rotate(270deg)";
    GetCell(3,5).style.backgroundImage = "url('img/three_way_branch.png')";
    GetCell(3,7).style.backgroundImage = "url('img/three_way_branch.png')";
    GetCell(3,7).style.transform = "rotate(90deg)";


    //ötödik sor inicializálása
    GetCell(4,0).classList.add('arrow-right'); if(GetCell(4,0).children.length === 0) {GetCell(4,0).appendChild(GetArrow());}
    GetCell(4,8).classList.add('arrow-left'); if(GetCell(4,8).children.length === 0) {GetCell(4,8).appendChild(GetArrow());}

    //hatodik sor inicializálása
    GetCell(5,0).classList.add('empty');
    GetCell(5,8).classList.add('empty');
    GetCell(5,1).style.backgroundImage = "url('img/three_way_branch.png')";
    GetCell(5,1).style.transform = "rotate(270deg)";
    GetCell(5,3).style.backgroundImage = "url('img/three_way_branch.png')";
    GetCell(5,3).style.transform = "rotate(180deg)";
    GetCell(5,5).style.backgroundImage = "url('img/three_way_branch.png')";
    GetCell(5,5).style.transform = "rotate(90deg)";
    GetCell(5,7).style.backgroundImage = "url('img/three_way_branch.png')";
    GetCell(5,7).style.transform = "rotate(90deg)";

    //hetedik sor inicializálása
    GetCell(6,0).classList.add('arrow-right'); if(GetCell(6,0).children.length === 0) {GetCell(6,0).appendChild(GetArrow());}
    GetCell(6,8).classList.add('arrow-left'); if(GetCell(6,8).children.length === 0) {GetCell(6,8).appendChild(GetArrow());}

    //nyolcadik sor inicializálása
    GetCell(7,0).classList.add('empty');
    GetCell(7,8).classList.add('empty');
    GetCell(7,1).style.backgroundImage = "url('img/curve.png')";
    GetCell(7,1).style.transform = "rotate(180deg)";
    GetCell(7,3).style.backgroundImage = "url('img/three_way_branch.png')";
    GetCell(7,3).style.transform = "rotate(180deg)";
    GetCell(7,5).style.backgroundImage = "url('img/three_way_branch.png')";
    GetCell(7,5).style.transform = "rotate(180deg)";
    GetCell(7,7).style.backgroundImage = "url('img/curve.png')";
    GetCell(7,7).style.transform = "rotate(90deg)";
    

    //kilencedik sor inicializálása
    GetCell(8,0).classList.add('empty');
    GetCell(8,1).classList.add('empty');
    GetCell(8,2).classList.add('arrow-up'); if(GetCell(8,2).children.length === 0) {GetCell(8,2).appendChild(GetArrow());}
    GetCell(8,3).classList.add('empty');
    GetCell(8,4).classList.add('arrow-up'); if(GetCell(8,4).children.length === 0) {GetCell(8,4).appendChild(GetArrow());}
    GetCell(8,5).classList.add('empty');
    GetCell(8,6).classList.add('arrow-up'); if(GetCell(8,6).children.length === 0) {GetCell(8,6).appendChild(GetArrow());}
    GetCell(8,7).classList.add('empty');
    GetCell(8,8).classList.add('empty');

    
}

//nézet táblájából kinyeri az adott indexű cellát
function GetCell(i,j){
    return viewTable.rows[i].cells[j];
}

//ennyi ms-t várjon a program
async function delay(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

//nyil img getter
function GetArrow(){
    img = new Image(40,40);
    img.src='img/arrow.png';
    img.classList.add('arrow')
    return img;
}

//játékos img getter (elérési út alapján)
function getPlayer(path){
    img = new Image(40,40);
    img.src = path;
    return img;
}

//kincs img getter (elérési út alapján)
function getTreasure(path){
    img = new Image(40,40);
    img.src = path;
    return img;
}

//mező beillesztése, ellenőrzi, hogy vissza nem csinálhatjuk az előző játékos lépését, és megvárja míg az animáció befejeződik,
//majd kijelöli a mezőket ahova tudunk lépni
async function PushField(event){
    if(!(event.target.matches(".arrow-right img") || event.target.matches(".arrow-left img") ||
    event.target.matches(".arrow-up img") || event.target.matches(".arrow-down img"))){
        return;
    }
    
    if(PlayerMove){
        return;
    }

    if(GameOver){
        return;
    }

    let rowIndex = event.target.parentNode.parentNode.rowIndex;
    let cellIndex = event.target.parentNode.cellIndex;

    if(event.target.matches('.arrow-down img') && previousMove === Direction.Up && cellIndex === previousCellIndex){
        alert('Nem vonhatod vissza az előző játékos lépését!');
        return;
    }else if(event.target.matches('.arrow-left img') && previousMove === Direction.Right && rowIndex === previousRowIndex){
        alert('Nem vonhatod vissza az előző játékos lépését!');
        return;
    }else if(event.target.matches('.arrow-right img') && previousMove === Direction.Left && rowIndex === previousRowIndex){
        alert('Nem vonhatod vissza az előző játékos lépését!');
        return;
    }else if(event.target.matches('.arrow-up img') && previousMove === Direction.Down && cellIndex === previousCellIndex){
        alert('Nem vonhatod vissza az előző játékos lépését!');
        return;
    }

    PlayerMove = true;

    if(event.target.matches("table#gametable tr td.arrow-down img")){
        await move(Direction.Down, rowIndex, cellIndex );
        previousMove = Direction.Down; previousRowIndex = rowIndex; previousCellIndex = cellIndex;
    }else if(event.target.matches("table#gametable tr td.arrow-left img")){
        await move(Direction.Left, rowIndex, cellIndex);
        previousMove = Direction.Left; previousRowIndex = rowIndex; previousCellIndex = cellIndex;
    }else if(event.target.matches(".arrow-right img")){
        await move(Direction.Right, rowIndex, cellIndex);
        previousMove = Direction.Right; previousRowIndex = rowIndex; previousCellIndex = cellIndex;
    }else if(event.target.matches(".arrow-up img")){
        await move(Direction.Up, rowIndex, cellIndex);
        previousMove = Direction.Up; previousRowIndex = rowIndex; previousCellIndex = cellIndex;
    }
    
    //játékos lép
    let playerOn = gameTable[Players[actualPlayer].xCoord][Players[actualPlayer].yCoord];
    let left = null;
    let right = null;
    let up = null;
    let down = null;
    try{
        left = gameTable[Players[actualPlayer].xCoord][Players[actualPlayer].yCoord-1];
    }catch{
        left = undefined;
    }
    try{
        right = gameTable[Players[actualPlayer].xCoord][Players[actualPlayer].yCoord+1];
    }catch{
        right = undefined;
    }
    try{
        up = gameTable[Players[actualPlayer].xCoord-1][Players[actualPlayer].yCoord];
    }catch{
        up = undefined;
    }
    try{
        down = gameTable[Players[actualPlayer].xCoord+1][Players[actualPlayer].yCoord];
    }catch{
        down = undefined;
    }

    if(left !== undefined && left.entrances.includes(Opposite(Direction.Left)) && playerOn.entrances.includes(Direction.Left)){
        GetCell(Players[actualPlayer].xCoord+1, Players[actualPlayer].yCoord).classList.add('availableField');
    }
    if(right !== undefined && right.entrances.includes(Opposite(Direction.Right)) && playerOn.entrances.includes(Direction.Right)){
        GetCell(Players[actualPlayer].xCoord+1, Players[actualPlayer].yCoord+2).classList.add('availableField');
    }
    if(up !== undefined && up.entrances.includes(Opposite(Direction.Up)) && playerOn.entrances.includes(Direction.Up)){
        GetCell(Players[actualPlayer].xCoord, Players[actualPlayer].yCoord+1).classList.add('availableField');
    }
    if(down !== undefined && down.entrances.includes(Opposite(Direction.Down)) && playerOn.entrances.includes(Direction.Down)){
        GetCell(Players[actualPlayer].xCoord+2, Players[actualPlayer].yCoord+1).classList.add('availableField');
    }

    //saját cellára is léphet
    GetCell(Players[actualPlayer].xCoord+1, Players[actualPlayer].yCoord+1).classList.add('availableField');

    //várjunk a játékos lépésére
    refreshCardsView();
}

//visszaadja az adott iránnyal mi van szemben
function Opposite(direction){
    switch(direction){
        case Direction.Down: return Direction.Up;
        case Direction.Up: return Direction.Down;
        case Direction.Left: return Direction.Right;
        case Direction.Right: return Direction.Left;
    }
}

//játékos lépése event, majd ellenőrzi, hogy azon a kincses mezőn áll-e amit össze kell gyűjtenie
function moveWithPlayer(event){
    if(GameOver){
        return;
    }
    
    if(!event.target.matches(".availableField") && !event.target.matches(".availableField img")){
            return;
        }
    
    let cell = null;

    if(event.target.matches(".availableField")){
        cell = event.target;
    }else{
        cell = event.target.parentNode;
    }
    
    let y = cell.cellIndex;
    let x = cell.parentNode.rowIndex;

    Players[actualPlayer].xCoord = x-1;
    Players[actualPlayer].yCoord = y-1;

    if(Treasures[actualPlayer].length !== 0 && Players[actualPlayer].xCoord === Treasures[actualPlayer][0].x &&
         Players[actualPlayer].yCoord === Treasures[actualPlayer][0].y){
        Treasures[actualPlayer].reverse().pop();
        Treasures[actualPlayer].reverse();
    }

    RefreshViewTable();
    checkGameOver();
    PlayerMove = false;

    refreshCardsView();
    if(!GameOver){
        actualPlayer++;
        if(actualPlayer === Players.length){
            actualPlayer = 0;
        }
        refreshInfos();
    }
}

//aktulis játékos kiírása
function refreshInfos(){
    infos.innerHTML = "";
    let tmpString = "";
    let img = null;
    switch(actualPlayer){
        case 0:
            tmpString = "piros";
            img = getPlayer(REDPLAYERIMAGEPATH);
            break;
        case 1:
            tmpString = "kék";
            img = getPlayer(BLUEPLAYERIMAGEPATH);
            break;
        case 2:
            tmpString = "sárga";
            img = getPlayer(YELLOWPLAYERIMAGEPATH);
            break;
        case 3:
            tmpString = "zöld";
            img = getPlayer(GREENPLAYERIMAGEPATH);
            break;
    }
    infos.appendChild(img);
    infos.innerHTML += "A " + tmpString + " (" + (actualPlayer+1) + ".) játékos következik!";
}

//beillesztésre váró mező forgatása
function rotateFieldToFill(event){
    if(GameOver){
        return;
    }
    
    if(!GameStarted){
        return;
    }

    if(PlayerMove){
        return;
    }
    event.preventDefault();
    fieldToFill.rotates += 1;
    fieldToFill.entrances = shiftEntrances(fieldToFill.entrances, 1);
    refreshFieldToFill();
}

//játékosok legenerálása, kezdőpozíciók megadásával
function generatePlayers(){

    Players = [];
    switch(playerCount){
        case 2:
            Players.push(new Player(0,0, REDPLAYERIMAGEPATH));
            Players.push(new Player(0,6,BLUEPLAYERIMAGEPATH));
        break;
        case 3:
            Players.push(new Player(0,0, REDPLAYERIMAGEPATH));
            Players.push(new Player(0,6,BLUEPLAYERIMAGEPATH));
            Players.push(new Player(6,0,YELLOWPLAYERIMAGEPATH));
        break;
        case 4:
            Players.push(new Player(0,0, REDPLAYERIMAGEPATH));
            Players.push(new Player(0,6,BLUEPLAYERIMAGEPATH));
            Players.push(new Player(6,0,YELLOWPLAYERIMAGEPATH));
            Players.push(new Player(6,6,GREENPLAYERIMAGEPATH));
        break;
    }
    actualPlayer = 0;
}

//kincsek random generálása, széleket kivéve
function generateTreasures(){
    Treasures = [];
    for(let i = 0; i < Players.length; i++){
        Treasures.push([]);
    }

    for(let i = 0; i < Treasures.length; i++){
        for(let j = 0; j < cardCount; j++){
            let xCoord = null;
            let yCoord = null;
            let obj = null;
            do{
                xCoord = randomInRange(0,6);
                yCoord = randomInRange(0,6);

                obj = {
                    x: xCoord,
                    y: yCoord
                };
            }while(containsCoord(obj,Treasures) || (obj.x === 0 && obj.y === 0) || (obj.x === 0 && obj.y === 6) || (obj.x === 6 && obj.y === 0) || (obj.x === 6 && obj.y === 6))

            let randomTreasure = randomInRange(1,4);
            switch(randomTreasure){
                case 1:
                    Treasures[i][j] = new Treasure(xCoord, yCoord, EMERALDIMAGEPATH);
                    break;
                case 2:
                    Treasures[i][j] = new Treasure(xCoord, yCoord, MAPIMAGEPATH);
                    break;
                case 3:
                    Treasures[i][j] = new Treasure(xCoord, yCoord, COINSIMAGEPATH);
                    break;
                case 4:
                    Treasures[i][j] = new Treasure(xCoord, yCoord, CHESTIMAGEPATH);
                    break;
            }
        }
    }

}

//megnézi, hogy a kincs koordinátája már tartalmaz-e kincset vagy sem
function containsCoord(coord, array){
    let i = 0;
    for(let j = 0; j < array.length; j++){
        i = 0;
        while(i < array[j].length && !(array[j][i].x === coord.x && array[j][i].y === coord.y)){
            i++;
        }
        if(i < array[j].length){
            return true;
        }
    }
    return false;
    
}

//mezpk mozgatása animálva, majd frissítése a memóriában (megvárja a függvény míg az animáció befejeződik)
async function move(direction, rowIndex, colIndex){
    let i = 0;
    let timerId = null;
    let tmpField = null;
    switch(direction){
        case Direction.Left:
            i = 1;
            timerId = setInterval(moveLeft, 1);
            await delay(1000);
            for(let j = 1; j < WIDTH + 1; j++){
                viewTable.rows[rowIndex].cells[j].classList.remove('moveLeft');
            }
            tmpField = gameTable[rowIndex-1][0];
            for(let j = 0; j < WIDTH - 1; j++){
                gameTable[rowIndex-1][j] = gameTable[rowIndex-1][j+1];
            }
            for(let i = 0; i < Players.length; i++){
                if(Players[i].xCoord === rowIndex-1){
                    if(Players[i].yCoord === 0){
                        Players[i].yCoord = WIDTH-1;
                    }else{
                        Players[i].yCoord -= 1;
                    }
                }
            }
            for(let i = 0; i < Treasures.length; i++){
                for(let j = 0; j < Treasures[i].length; j++){
                    if(Treasures[i][j].x === -1 && Treasures[i][j].y === -1){
                        Treasures[i][j].x = rowIndex-1;
                        Treasures[i][j].y = colIndex-2;
                    }else{
                        if(Treasures[i][j].x === rowIndex - 1){
                            if(Treasures[i][j].y === 0){
                                Treasures[i][j].x = -1;
                                Treasures[i][j].y = -1;
                            }else{
                                Treasures[i][j].y -= 1;
                            }
                        }
                    }
                    
                }
            }
            gameTable[rowIndex-1][WIDTH-1] = fieldToFill;
            fieldToFill = tmpField;
            viewFieldToFill.style.backgroundImage = "url('" + fieldToFill.img + "')";
            viewFieldToFill.style.transform = "rotate(" + fieldToFill.rotates * 90 + "deg)";
            RefreshViewTable();
            break;
        case Direction.Right:
            i = WIDTH;
            timerId = setInterval(moveRight, 1);
            await delay(1000);
            for(let j = 1; j < WIDTH + 1; j++){
                
                viewTable.rows[rowIndex].cells[j].classList.remove('moveRight');
            }
            tmpField = gameTable[rowIndex-1][WIDTH-1];
            for(let j = WIDTH - 1; j > 0; j--){
                gameTable[rowIndex-1][j] = gameTable[rowIndex-1][j-1];
            }
            for(let i = 0; i < Players.length; i++){
                if(Players[i].xCoord === rowIndex-1){
                    if(Players[i].yCoord === WIDTH-1){
                        Players[i].yCoord = 0;
                    }else{
                        Players[i].yCoord += 1;
                    }
                }
            }
            for(let i = 0; i < Treasures.length; i++){
                for(let j = 0; j < Treasures[i].length; j++){
                    if(Treasures[i][j].x === -1 && Treasures[i][j].y === -1){
                        Treasures[i][j].x = rowIndex-1;
                        Treasures[i][j].y = colIndex;
                    }else{
                        if(Treasures[i][j].x === rowIndex - 1){
                            if(Treasures[i][j].y === WIDTH-1){
                                Treasures[i][j].x = -1;
                                Treasures[i][j].y = -1;
                            }else{
                                Treasures[i][j].y += 1;
                            }
                        }
                    }
                }
            }
            gameTable[rowIndex-1][0] = fieldToFill;
            fieldToFill = tmpField;
            viewFieldToFill.style.backgroundImage = "url('" + fieldToFill.img + "')";
            viewFieldToFill.style.transform = "rotate(" + fieldToFill.rotates * 90 + "deg)";
            RefreshViewTable();
            break;
        case Direction.Up:
            i = HEIGHT;
            timerId = setInterval(moveUp, 1);
            await delay(1000);
            for(let j = 1; j < HEIGHT + 1; j++){
                viewTable.rows[j].cells[colIndex].classList.remove('moveUp');
            }
            tmpField = gameTable[0][colIndex-1];
            for(let j = 0; j < HEIGHT - 1; j++){
                gameTable[j][colIndex-1] = gameTable[j+1][colIndex-1];
            }
            for(let i = 0; i < Players.length; i++){
                if(Players[i].yCoord === colIndex-1){
                    if(Players[i].xCoord === 0){
                        Players[i].xCoord = HEIGHT-1;
                    }else{
                        Players[i].xCoord -= 1;
                    }
                }
            }
            for(let i = 0; i < Treasures.length; i++){
                for(let j = 0; j < Treasures[i].length; j++){
                    if(Treasures[i][j].x === -1 && Treasures[i][j].y === -1){
                        Treasures[i][j].x = rowIndex-2;
                        Treasures[i][j].y = colIndex-1;
                    }else{
                        if(Treasures[i][j].y === colIndex - 1){
                            if(Treasures[i][j].x === 0){
                                Treasures[i][j].x = -1;
                                Treasures[i][j].y = -1;
                            }else{
                                Treasures[i][j].x -= 1;
                            }
                        }
                    }
                    
                    
                }
            }
            gameTable[HEIGHT-1][colIndex-1] = fieldToFill;
            fieldToFill = tmpField;
            viewFieldToFill.style.backgroundImage = "url('" + fieldToFill.img + "')";
            viewFieldToFill.style.transform = "rotate(" + fieldToFill.rotates * 90 + "deg)";
            RefreshViewTable();
            break;
        case Direction.Down:
            i = 1;
            timerId = setInterval(moveDown, 1);
            await delay(1000);
            for(let j = 1; j < HEIGHT + 1; j++){
                viewTable.rows[j].cells[colIndex].classList.remove('moveDown');
            }
            tmpField = gameTable[HEIGHT-1][colIndex-1];
            for(let j = HEIGHT-1; j > 0; j--){
                gameTable[j][colIndex-1] = gameTable[j-1][colIndex-1];
            }
            for(let i = 0; i < Players.length; i++){
                if(Players[i].yCoord === colIndex-1){
                    if(Players[i].xCoord === HEIGHT-1){
                        Players[i].xCoord = 0;
                    }else{
                        Players[i].xCoord += 1;
                    }
                }
            }
            for(let i = 0; i < Treasures.length; i++){
                for(let j = 0; j < Treasures[i].length; j++){
                    if(Treasures[i][j].x === -1 && Treasures[i][j].y === -1){
                        Treasures[i][j].x = rowIndex;
                        Treasures[i][j].y = colIndex-1;
                    }else{
                        if(Treasures[i][j].y === colIndex - 1){
                            if(Treasures[i][j].x === HEIGHT-1){
                                Treasures[i][j].x = -1;
                                Treasures[i][j].y = -1;
                            }else{
                                Treasures[i][j].x += 1;
                            }
                        }
                    }
                    
                }
            }
            gameTable[0][colIndex-1] = fieldToFill;
            fieldToFill = tmpField;
            viewFieldToFill.style.backgroundImage = "url('" + fieldToFill.img + "')";
            viewFieldToFill.style.transform = "rotate(" + fieldToFill.rotates * 90 + "deg)";
            RefreshViewTable();
            break;

    }

    function moveLeft(){
        viewTable.rows[rowIndex].cells[i].classList.add('moveLeft');
        i++;
        if(i === WIDTH + 1){
            clearInterval(timerId);
        }
    }

    function moveRight(){
        viewTable.rows[rowIndex].cells[i].classList.add('moveRight');
        i--;
        if(i === 0){
            clearInterval(timerId);
        }
    }

    function moveUp(){
        viewTable.rows[i].cells[colIndex].classList.add('moveUp');
        i--;
        if(i === 0){
            clearInterval(timerId);
        }
    }

    function moveDown(){
        viewTable.rows[i].cells[colIndex].classList.add('moveDown');
        i++;
        if(i === HEIGHT + 1){
            clearInterval(timerId);
        }
    }
    
}

//leírás megjelenítése/elrejtése
function OpenDescription(){
    
    description.classList.toggle('hidden');
    if(description.classList.length === 0){
        openDescription.value = "Leírás elrejtése";
    }else{
        openDescription.value = "Leírás megtekintése";
    }
}

//megnézi, hogy vége van-e a játéknak, ha igen kiváltja az eseményt
function checkGameOver(){
    if(Players[actualPlayer].xCoord === Players[actualPlayer].startPositionX &&
        Players[actualPlayer].yCoord === Players[actualPlayer].startPositionY &&
        Treasures[actualPlayer].length === 0){
            document.dispatchEvent(GameOverEvent);
        }
}

//játék vége eseménykezelője, beállítja a megfelelő értékeket is kiírja a győztest
function gameOver(e){
    GameOver = true;
    infos.innerHTML = "";
    let tmpString = "";
    let img = null;
    switch(actualPlayer){
        case 0:
            tmpString = "piros";
            img = getPlayer(REDPLAYERIMAGEPATH);
            break;
        case 1:
            tmpString = "kék";
            img = getPlayer(BLUEPLAYERIMAGEPATH);
            break;
        case 2:
            tmpString = "sárga";
            img = getPlayer(YELLOWPLAYERIMAGEPATH);
            break;
        case 3:
            tmpString = "zöld";
            img = getPlayer(GREENPLAYERIMAGEPATH);
            break;
    }

    infos.appendChild(img);
    infos.innerHTML += "Gratulálok! A " + tmpString + " (" + (actualPlayer + 1) + ".) játékos nyert!"; 
}

//a játékosok száma alapján legenerálja a táblázat cellákat és megjeleníti, hogy melyik az aktuális kincs és, hogy még mennyi van hátra
function initializeCardsView(){
    cardsView.innerHTML = "<tr></tr><tr></tr>";
    
    for(let i = 0; i < playerCount; i++){
        let row = null;
        let imagePath = null;
        if(i < 2){
            row = cardsView.rows[0];
        }else{
            row = cardsView.rows[1];
        }
        switch(i){
            case 0:
                imagePath = REDPLAYERIMAGEPATH;
                break;
            case 1:
                imagePath = BLUEPLAYERIMAGEPATH;
                break;
            case 2:
                imagePath = YELLOWPLAYERIMAGEPATH;
                break;
            case 3:
                imagePath = GREENPLAYERIMAGEPATH;
                break;
        }
        let td = document.createElement('td');
        row.appendChild(td);
        td.appendChild(getPlayer(imagePath));
        td.appendChild(getTreasure(Treasures[i][0].img));
        let p = document.createElement('p');
        p.innerHTML = 'A kincs a(z) ' + (Treasures[i][0].x + 1) + ". sor " + (Treasures[i][0].y + 1) + ". oszlopában található!";
        p.style.color = "orange";
        td.appendChild(p);
        p = document.createElement('p');
        p.innerHTML = "x" + Treasures[i].length;
        p.style.fontSize = '25px';
        p.style.color = "red";
        td.appendChild(p);
    }
}

//játék kezdése gomb
const startButton = document.querySelector('#button');

//játék kezdése eseménykezelője
startButton.addEventListener('click', function(){
    playerCount = parseInt(playerInput.value);
    if(playerCount < 2 || playerCount > 4){
        alert('A játékosok száma nem lehet kisebb mint 1 és nagyobb mint 4!');
        return;
    }
    cardCount = parseInt(cardInput.value);
    if(cardCount < 1 || cardCount > parseInt(24/playerCount)){
        alert('A kártyák száma játékosonként 1 és 24/játékosok száma közé kell essen!');
        return;
    }

    generatePlayers();
    generateTreasures();

    RefreshViewTable();
    
    initializeCardsView();

    GameStarted = true;
    viewTable.style.display = "table";
    viewFieldToFill.style.display = "block";
    cardsView.style.display = "table";

    infos.classList.toggle('hidden');

    refreshInfos();

    this.disabled = true;
    restartButton.disabled = false;
});
 
//az alkalmazás további eseménykezelőinek összekapcsolása
const restartButton = document.querySelector('#restart');
restartButton.disabled = true;

restartButton.addEventListener('click', function(){
    startButton.disabled = false;
    this.disabled = true;
    init();
    viewTable.style.display = "none";
    viewFieldToFill.style.display = "none";
    cardsView.style.display = "none";
});

viewTable.addEventListener('click',PushField);
viewTable.addEventListener('click', moveWithPlayer);
openDescription.addEventListener('click',OpenDescription);

document.addEventListener('contextmenu', rotateFieldToFill);
document.addEventListener('GameOver', gameOver);

window.addEventListener('load', init);