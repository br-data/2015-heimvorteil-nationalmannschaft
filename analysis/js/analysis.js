(function () {
  'use strict';

  var key = '1Flk6E-hy1aHmIno3nkp9n8f2eFBYu4E4Q1tRKCNBheI';
  var worksheet = '1';

  var playerData;

  var result = document.getElementById('result');

  document.getElementById('get-data').onclick = init;

  function init() {

    // Get live data
    getSpreadsheet(analyseData);

    // Get test data
    //getJSON('data/testdata.json', analyseData);
  }

  function analyseData(data) {

    var formations = countFormations(data);
    var players = countPlayers(data);
    var positions = countPositions(data);
    var rows = countRows(data);
    var lineups = countLineups(data);

    getJSON('data/players.json', render);

    function render(data) {

      playerData = data;

      addElement(formations, 3, 'Beliebtestes Spielsystem');
      addElement(players, 3, 'Beliebteste Spieler', getName);
      addElement(positions.strikers, 3, 'Beliebteste Stürmer', getName);
      addElement(positions.midfielders, 3, 'Beliebteste Mittelfeldspieler', getName);
      addElement(positions.defenders, 3, 'Beliebteste Verteidiger', getName);
      addElement(positions.goalkeepers, 3, 'Beliebteste Torhüter', getName);
      addElement(rows[2], 3, 'Beliebteste Zweiter-Formation', getAllNames);
      addElement(rows[3], 3, 'Beliebteste Dreier-Formation', getAllNames);
      addElement(rows[4], 3, 'Beliebteste Vierer-Formation', getAllNames);
      addElement(lineups, 3, 'Beliebteste Mannschaft', getAllNames);
    }
  }

  function addElement(arr, limit, title, filter) {

    var list = document.createElement('ol');

    limit = limit || arr.length;

    for (var i = 0; i < limit; i++) {

      var item = document.createElement('li');
      var count = document.createElement('em');

      var itemText;
      var countText;

      if (filter) {

        itemText = document.createTextNode(
          (filter(arr[i][0]).split(',').join(', ')) + ': ');
        countText = document.createTextNode(arr[i][1]);
      } else {

        itemText = document.createTextNode(arr[i][0] + ': ');
        countText = document.createTextNode(arr[i][1]);
      }

      count.appendChild(countText);
      item.appendChild(itemText);
      item.appendChild(count);
      list.appendChild(item);
    }

    if (title) {

      var headline = document.createElement('h3');
      var headlineText = document.createTextNode(title);
      headline.appendChild(headlineText);
      result.appendChild(headline);
    }

    var button = document.createElement('div');
    button.classList.add('download');

    button.addEventListener('click', function() {

      if (filter) {
        for (var j = 0; j < arr.length; j++) {

          arr[j][0] = filter(arr[j][0]);
        }
      }

      saveCSV(arr, title || 'data');
    });


    result.appendChild(button);
    result.appendChild(list);
  }

  function getSpreadsheet(callback) {

    var ds = new Miso.Dataset({

      importer: Miso.Dataset.Importers.GoogleSpreadsheet,
      parser: Miso.Dataset.Parsers.GoogleSpreadsheet,
      key: key,
      worksheet: worksheet
    });

    ds.fetch({

      success : function() {

        callback(convertData(ds.toJSON()));
      },
      error : function() {

        outputData('<p>Daten konnten nicht geladen werden. Vielleicht sind Sie nicht mit dem Internet verbunden oder das Spreadsheet wurde nicht veröffentlicht.</p>');
      }
    });
  }

  function getJSON(path, callback) {

    var httpRequest = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

    httpRequest.onreadystatechange = function () {

      if (httpRequest.readyState === 4 || httpRequest.readyState === 0) {

        if (httpRequest.status === 200) {

          var data = JSON.parse(httpRequest.responseText);

          if (callback) {

            callback(data);
          }
        }
      }
    };

    httpRequest.open('GET', path);
    httpRequest.send();
  }

  function convertData(data) {

    for (var entry = 0; entry < data.length; entry++) {

      var hash = data[entry].Lineup;
      var timestamp = new Date(data[entry].Timestamp['_d']);
      var lineup = data[entry].Lineup.split('-');

      for (var row = 0; row < lineup.length; row++) {

        lineup[row] = lineup[row].match(/.{1,2}/g);
      }

      data[entry] = {

        hash: hash,
        timestamp: timestamp,
        lineup: lineup
      };
    }

    return data;
  }

  function countFormations(data) {

    var formations = [];

    for (var entry = 0; entry < data.length; entry++) {

      var formation = [];

      var lineup = data[entry].lineup;

      lineup.reverse();

      // Start at 1 to remove the goalkeeper
      for (var row = 1; row < lineup.length; row++) {

        formation.push(lineup[row].length);
      }

      formations.push(formation.join('-'));
    }

    formations = count(formations);
    formations = toArray(formations);

    return formations;
  }

  function countPlayers(data) {

    var players = [];

    for (var entry = 0; entry < data.length; entry++) {

      players.push(flatten(data[entry].lineup));
    }

    return getCount(players);
  }

  function countPositions(data) {

    var strikers = [];
    var midfielders = [];
    var defenders = [];
    var goalkeepers = [];

    for (var entry = 0; entry < data.length; entry++) {

      var lineup = data[entry].lineup;

      if (lineup.length === 4) {

        strikers.push(lineup[3]);
        midfielders.push(lineup[2]);
        defenders.push(lineup[1]);
        goalkeepers.push(lineup[0]);
      } else if (lineup.length === 5) {

        strikers.push(lineup[4]);
        midfielders.push(lineup[3]);
        midfielders.push(lineup[2]);
        defenders.push(lineup[1]);
        goalkeepers.push(lineup[0]);
      } else {

        console.log('Weird linup detected:', lineup);
      }
    }

    return {

      strikers: getCount(strikers),
      midfielders: getCount(midfielders),
      defenders: getCount(defenders),
      goalkeepers: getCount(goalkeepers)
    };
  }

  function countLineups(data) {

    var lineups = [];

    for (var entry = 0; entry < data.length; entry++) {

      lineups.push(data[entry].hash);
      //lineups.push(flatten(data[entry].lineup).sort().join());
    }

    return getCount(lineups);
  }

  function countRows(data) {

    var rows2 = [];
    var rows3 = [];
    var rows4 = [];

    for (var entry = 0; entry < data.length; entry++) {

      var lineup = data[entry].lineup;

      for (var row = 0; row < lineup.length; row++) {

        if (lineup[row].length === 2) {

          rows2.push(lineup[row].sort().join(''));
        } else if (lineup[row].length === 3) {

          rows3.push(lineup[row].sort().join(''));
        } else if (lineup[row].length === 4) {

          rows4.push(lineup[row].sort().join(''));
        }
      }
    }

    return {

      2: getCount(rows2),
      3: getCount(rows3),
      4: getCount(rows4),
    };
  }

  function getCount(players) {

    players = flatten(players);
    players = count(players);
    players = clean(players);
    players = toArray(players);
    players = sort(players).reverse();

    return players;
  }

  function getName(playerId) {

    return playerData.filter(function (obj) {

      return obj.id === playerId;
    })[0].name || false;
  }

  function getAllNames(playerStr) {

    var players = [];

    players = playerStr.match(/[a-zA-Z]{1,2}||-/g);

    for (var i = 0; i < players.length; i++) {

      if (players[i]) {

        players[i] = playerData.filter(function (obj) {

          return obj.id === players[i];
        })[0];

        players[i] = players[i] ? players[i].name + ',' : 'unbekannt';
      }
    }

    players = players.join('');
    return players.substring(0, players.length - 1);
  }

  function flatten(arr) {

    var flat = [];

    return flat.concat.apply(flat, arr);
  }

  function count(arr) {

    var counts = {};

    arr.forEach( function(n) {

      counts[n] = (counts[n] || 0) + 1;
    });

    return counts;
  }

  function toArray(obj) {

    var arr = [];

    for (var key in obj) {

      arr.push([key, obj[key]]);
    }

    return arr;
  }

  function sort(arr) {

    return arr.sort(

      function(a, b) {

        return a[1] - b[1];
      });
  }

  function clean(obj) {

    for (var key in obj) {

      if (!key.indexOf('z')) {

        delete obj[key];
      }
    }

    return obj;
  }

  function outputData(string) {

    var element = document.createElement('p');
    var text =  document.createTextNode(string);

    element.appendChild(text);
    result.appendChild(element);

  }

  function toCSV(objArray) {

    var arr = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < arr.length; i++) {

      var line = '';

      for (var key in arr[i]) {

        if (line !== '') {

          line += ',';
        }

        line += arr[i][key];
      }

      str += line + '\r\n';
    }

    return str;
  }

  function saveCSV(str, name) {

    if (str && name) {

      str = toCSV(str);

      var blob = new Blob([str], {type: 'text/csv;charset=utf-8'});

      saveAs(blob, name);
    }
  }
}());
