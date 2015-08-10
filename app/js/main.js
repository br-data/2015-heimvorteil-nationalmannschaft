var config = {

    defaultTeam: [['jj', 'kk'], ['ff', 'gg', 'hh', 'ii'], ['bb', 'cc', 'dd', 'ee'], ['aa']],
    defaultHash: ['jjkk', 'ffgghhii', 'bbccddee', 'aa'],
    positionOrder: ['tor', 'abwehr', 'mittelfeld', 'sturm']
};

var myTeam = (function (config, utils) {

    'use strict';

    var $ = utils.$;
    var $$ = utils.$$;
    var createElement = utils.createElement;

    var currentFormation;
    var currentLineup;
    var currentList;
    var currentPlayers;
    var currentPosition;

    // @TODO Use more semantic name
    var formationSelect = $('formation');
    var listSelect = $('list');
    var lineupSelect = $('lineup');
    var playerFilter = $('filter');
    var infoBox = $('info');
    
    function init() {

        utils.getJSON('data/players.json', function (data) {

            currentPlayers = data;

            // Check if a linup is predefined in the URL hash, eg #1112x
            if(location.hash) {

                currentLineup = convertLineup(location.hash.replace('#',''));
            } else {

                currentLineup = config.defaultTeam;
            }
           
            // Inital drawing
            getFormation(currentLineup);
            updateFormation();
            showLineup(currentLineup);
            showList(data);
            updateList();

            // Register the event handlers
            formationSelect.addEventListener('change', handleFormationChange);
            playerFilter.addEventListener('keydown', utils.preventEnter);
            playerFilter.addEventListener('keyup', handlePlayerSearch);
            playerFilter.addEventListener('search', handlePlayerSearch);
        });   
    }

    function showLineup(arr) {

        // Clear current team element
        // http://jsperf.com/innerhtml-vs-removechild/47
        while (lineupSelect.firstChild) {

            lineupSelect.removeChild(lineupSelect.firstChild);
        }

        for (var row in arr) {

            var section = createElement('section', null, ['className', 'row']);

            // Add players, line by line
            for (var player in arr[row]) {

                var playerWrapper, playerIcon, playerName;
                var playerInfo = getPlayer(arr[row][player]);

                playerWrapper = createElement('div', null, ['className', 'player']);
                playerWrapper.setAttribute('data-player', arr[row][player]);
                playerWrapper.addEventListener('click', handlePositionSelect);

                playerIcon = createElement('div', null, ['className', 'icon']);
                playerIcon.style.background = 'url(img/00.png) center no-repeat';
                playerIcon.style['background-size'] = 'contain';

                playerName = createElement('p', null, ['className', 'text'], ['textContent', playerInfo.name]);       

                playerWrapper.appendChild(playerIcon);
                playerWrapper.appendChild(playerName);
                section.appendChild(playerWrapper);
            }

            lineupSelect.appendChild(section);  
        }
    }

    // The input object is structured like a dictionary
    function showList(obj) {

        var positions = [];
        var elements = [];

        for (var player in obj) {

            var index, text, playerElement;
            
            // Players without position shouldn't appear in the list
            if (obj[player].pos === 'keine') { break; }

            // Check if the position wrapper already exists
            index = positions.indexOf(obj[player].pos);

            playerElement = createElement('li', null, ['textContent', obj[player].name]);
            playerElement.setAttribute("data-player", player);
            playerElement.addEventListener('click', handlePlayerChange);

            // If the position already exists, add the player ...
            if (index > -1) {

                elements[index].appendChild(playerElement);

            // ... else create a new position and add the player 
            } else {

                elements[index] = createElement('ul', null, ['className', obj[player].pos.toLowerCase()]);
                elements[index].appendChild(playerElement);

                // Add the position name to array
                positions.push(obj[player].pos);

                // Add the position wrapper element to array 
                elements.push(elements[index]);
            }
        }

        // Sort the position by the order defined in the config
        elements.sort(function (a, b) {

            return config.positionOrder.indexOf(a.className) - config.positionOrder.indexOf(b.className);
        });

        // Add all positions and players to the list
        for (var i = 0; i < elements.length; i++) {

            listSelect.appendChild(elements[i]);
        }

        currentList = listSelect.querySelectorAll('[data-player]');
    }

    function handlePositionSelect(e) {

        var target;

        if (e && e.target) {

            target = e.target;
        } else {

            // If no player is selected, select the first one
            target = $$('.player')[0];
        }

        target.className = 'player active';
        if (currentPosition) currentPosition.className = 'player';
        
        currentPosition = target;
    } 

    function handlePlayerChange(e) {

        // Check if a player is selected;
        if (!currentPosition) {

            handlePositionSelect();
        }

        var newPlayerId = e.target.getAttribute('data-player');

        if (!wasPicked(newPlayerId)) {

            // Update player position
            // @TODO Move to updatePosition()
            var oldPlayerId = currentPosition.getAttribute('data-player');
            var playerInfo = getPlayer(newPlayerId);
            var playerIcon = currentPosition.getElementsByTagName('div')[0];

            currentPosition.setAttribute('data-player', newPlayerId);
            currentPosition.getElementsByTagName('p')[0].textContent = playerInfo.name;

            playerIcon.style.background = 'url(img/01.png) center no-repeat';
            playerIcon.style['background-size'] = 'contain';

            // Update the player in the current team model
            // @TODO Move to updateModel()
            for (var i = 0; i < currentLineup.length; i++) {

                var j = currentLineup[i].indexOf(oldPlayerId);

                if (j > -1) {

                    currentLineup[i][j] = newPlayerId;
                }
            }

            // Update player in list
            // @TODO Move to updateList()
            e.target.className = 'picked';
            updateList(newPlayerId, oldPlayerId);
           

            updateInfo(playerInfo);
            updateFormation();
        }
    }

    function handleFormationChange() {

        updateFormation();
        showLineup(currentLineup);        
    }

    function handlePlayerSearch(e) {

        // Get a list of all players
        var playerList = listSelect.getElementsByTagName("li");
        var filter = playerFilter.value.toUpperCase();

        // Search for current query and hide mismatches
        for (var i = 0; i < playerList.length; i++) {

            if (filter === '') {

                playerList[i].style.display = 'list-item';
            } else {

                var text = playerList[i].textContent;

                if (utils.fuzzySearch(filter, text.toUpperCase())) {

                    playerList[i].style.display = 'list-item';
                } else {

                    playerList[i].style.display = 'none';
                }
            }
        }
    }

    // Check if a player is already part of the team
    function wasPicked(playerId) {

        for (var i = 0; i < currentLineup.length; i++) {

            if (currentLineup[i].indexOf(playerId) > -1) {

                return true;
            }
        }
    }

    function updateList(newPlayerId, oldPlayerId) {
        
        for (var k = 0; k < currentList.length; k++) {

            if (oldPlayerId && newPlayerId) {

                if (currentList[k].getAttribute('data-player') === newPlayerId) {

                    currentList[k].className = 'picked';
                }

                if (currentList[k].getAttribute('data-player') === oldPlayerId) {

                    currentList[k].className = '';
                }
            } else {

                for (var l = 0; l < currentLineup.length; l++) {

                    if (currentLineup[l].indexOf(currentList[k].getAttribute('data-player')) > -1) {

                        currentList[k].className = 'picked';
                    } else {

                        currentList[k].className = '';
                    }
                }
            }
        }
    }

    function updateFormation() {

        // Get the current formation
        var formation = formationSelect.value.split('-').reverse();
        var flatTeam = [];

        // Add the goalkeeper
        formation.push("1");
        currentFormation = formation;

        // Write class
        lineup.className = 'rows-' + currentFormation.length;

        // Flatten array 
        flatTeam = flatTeam.concat.apply(flatTeam, currentLineup);

        // Clear current team model;
        currentLineup = [];

        for (var i = 0;  i < formation.length; i++) {

            currentLineup.push(flatTeam.splice(0, +formation[i]));
        }

        location.hash = teamToHash(currentLineup);
    }

    function updateInfo(player) {

        while (infoBox.firstChild) {

            infoBox.removeChild(infoBox.firstChild);
        }

        createElement('h3', infoBox, ['textContent', player.name]);
        createElement('img', infoBox, ['src', 'img/vfb.png'], ['alt', player.team]);
        createElement('p', infoBox, ['textContent', player.team]);
        createElement('p', infoBox, ['textContent', 'TT.MM.JJJJ in ' + player.geb_ort + ', ' + player.reg_bezirk, infoBox]);
    }

    function getPlayer(playerId) {

        if (isNaN(parseInt(playerId))) {
            playerId = '00';
        }

        return currentPlayers[playerId];
    }

    function getFormation(arr) {

        var result = [];
        
        for (var i = 0;  i < arr.length; i++) {

            result.push(arr[i].length);
        }

        currentFormation = result;
        result.pop();
        formationSelect.value = result.reverse().join('-');
    }

    function convertLineup(str) {

        // Hash string to array
        var arr = str.split('x');

        // If the array is malformed, fall back to default
        if (arr.length < config.defaultTeam.length) {

            arr = config.defaultHash;
        }

        // Split the position arrays into arrays with individual players
        // Ex. [111213] becomes [11,12,13] 
        for (var i = 0;  i < arr.length; i++) {

            arr[i] = arr[i].match(/.{1,2}/g);
        }

        return arr;
    }

    // Converts an location hash string, ex. 1011x2021...
    function teamToHash(arr) {

        var result = [];

        for (var i = 0;  i < arr.length; i++) {
   
            result.push(arr[i].join(''));
        }

        return result.join('x');
    }

    return {

        init: init
    };
})(config, utils);

myTeam.init();
