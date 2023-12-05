// CruParser
var CRU = require('./CRU');

var CruParser = function(sTokenize, sParsedSymb){
	this.parsedCRU = [];
	this.symb = ["EDT.CRU","+","P=","H=","F","S=","//","$"];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// Parser procedure

// tokenize : transforme les données d'entrée en une liste
// <eol> = CRLF
CruParser.prototype.tokenize = function(data){
	var separator = /(\r\n|,P=|,H=| |:|-|,S=|,|\/\/)/;
	data = data.split(separator);
	data = data.filter((val, idx) => !val.match(separator)); 					
	return data;
}

// parse : analyse des données en appelant la première règle non terminale de la grammaire
CruParser.prototype.parse = function(data){
	var tData = this.tokenize(data);
	if(this.showTokenize){
		console.log(tData);
	}
	this.cru(tData);
}

// Parser operand

CruParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	console.log("Parsing Error ! on " + input + " -- msg : " + msg);
}

// Read and return a symbol from input
CruParser.prototype.next = function(input){
	var curS = input.shift();
	if (this.showParsedSymbols){
		console.log(curS);
	}
	return curS;
}

// accept : vérifie si l'argument s fait partie des symboles du langage.
CruParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if (idx === -1){
		this.errMsg("symbol " + s + " unknown", [" "]+ "input[0] = "+s);
		return false;
	}

	return idx;
}

// check : vérifie si l'élément arg est en tête de la liste
CruParser.prototype.check = function(s, input){
	if (this.accept(input[0].charAt(0)) == this.accept(s)){
		return true;	
	}
	return false;
}


// expect : attend que le prochain symbole soit s.
CruParser.prototype.expect = function(s, input){
	console.log("input[0] au début d'expect"+input[0]);
	if (s == input[0].charAt(0)){
		//this.next(input);
		return true;
	} else {
		this.errMsg("symbol " + s + " doesn't match", input);
	}
	return false;
}

// Parser rules

/*
// <Cours> = ‘+’ UE CRLF 1* Séance
CruParser.prototype.cru = function(input){
	this.expect("+", input);
	var ue = this.ue(input);
	this.next(input); // Ignore whitespace
	var seances = this.seanceList(input); // Modify this line
	this.parsedCRU.push({ ue: ue, seances: seances }); // Push the parsed course into parsedCRU
}

// Ajoutez une nouvelle méthode seanceList pour gérer la liste de séances
CruParser.prototype.seanceList = function(input) {
    var seances = [];
    while (this.check("1,", input)) {
        var seance = this.seance(input);
        seances.push(seance);
    }
    return seances;
}
*/

/*
CruParser.prototype.listCru = function(input){
	this.cru(input);
	this.expect("Page generee en : 1.1899800300598 sec", input);
}
*/
// <Cours> = ‘+’ UE CRLF 1* Séance
CruParser.prototype.cru = function(input){
    if (this.check("+", input)) {
        this.expect("+", input);
        var cours = this.cours(input);

        var args = {
            ue: cours.ue,
            type: cours.type,
            place: cours.place,
            jour: cours.jour,
            horaire: cours.horaire,
            frequency: cours.frequency,
            salle: cours.salle
        };

        var c = new CRU(args.ue, args.type, args.place, args.jour, args.horaire, args.frequency, args.salle);
        this.parsedCRU.push(c);
		if(input.length > 0){
			this.cru(input);
		}

		/*
        // Recursive call for additional courses
        this.cru(input);*/
        
        return true;
    } else {
        return false;
    }
}

/*
// <cru> = 1*Cours
CruParser.prototype.cru = function(input){
	while (this.check("+", input)){
		this.cours(input);
		var args = this.cours(input);
		var c = new CRU(args.ue, args.type, args.place, args.jour, args.horaire, args.frequency, args.salle);
		this.parsedCRU.push(c);
	}
}*/


// <Cours> = ‘+’ UE CRLF 1* Séance

CruParser.prototype.cours = function(input){
	var ue = this.ue(input);
	var seance = this.seance(input);
	return {ue: ue, type: seance.type, place: seance.place, jour: seance.caract.jour, horaire: seance.caract.horaire, frequency: seance.caract.frequency, salle: seance.caract.salle};
}


// <UE> = 2*7 ALPHA *2 DIGIT *1 ALPHA *1 Supplément
CruParser.prototype.ue = function(input){
	console.log("input[0] au début de UE"+input[0]);
	var ue = input[0];
	if (matched = ue.match(/[+][A-Z]{2}[0-9]{2}/)){
		console.log("Nouvelle UE :"+matched[0]);
		this.next(input);
		return matched[0];
	} else {
		this.errMsg("Invalid UE", [ue]);
	}
	
}

// <Supplément> = ‘A’/’T1’/’F’/’R’
CruParser.prototype.supplement = function(input){
	var supplement = this.next(input);
	if (supplement.match(/A|T1|F|R/)){
		return supplement;
	} else {
		this.errMsg("Invalid Supplement", [supplement]);
	}
}

// <Séance> = ‘1,’ Type ‘,P=’ 1*3 DIGIT ‘,’ Caractéristique ‘/’ CRLF
CruParser.prototype.seance = function(input){
	this.expect("1", input);
	this.next(input);
	var type = this.type(input);
	console.log("Nouveau type :"+type);
	var place = input[0];
	console.log("Nouveau place :"+place);
	this.next(input);
	var caract = this.caracteristique(input);
	console.log("Nouveau caract :"+caract);
	this.next(input);
	return{type:type, place:place, caract:caract};
}

// <Type> = (‘C’/’D’/’T’) (‘1’/’2’/’3’/’4’/’5’/’6’/’7’/’8’/’9’/’10’/’11’/’12’/’13’/’14’/’15’)
CruParser.prototype.type = function(input){
	var type = input[0];
	if (type.match(/C|D|T[1-9]|T10|T11|T12|T13|T14|T15/)){
		this.next(input);
		return type;
	} else {
		this.errMsg("Invalid Type", [type]);
	}
	
}

// <Caractéristique> = ‘H=’ <Jour> WSP <Horaire> ‘,F=’ (‘ ‘/’1’/’2’/’A’/’B’) ‘,S=’ <Salle>
CruParser.prototype.caracteristique = function(input){
	var jour = this.jour(input);
	console.log("Nouveau jour: "+jour);
	var horaire = this.horaire(input);
	var frequency = input[0]; 
	console.log("Nouveau frequency: "+frequency);
	this.next(input);
	var salle = this.salle(input);
	console.log("Nouveau salle: "+salle);	

	return { jour: jour, horaire: horaire, frequency: frequency, salle: salle };
}

// <Jour> = ‘L’/’MA’/’ME’/’J’/’V’/’S’
CruParser.prototype.jour = function(input){
	var jour = input[0];
	if (jour.match(/L|MA|ME|J|V|S/)){
		this.next(input);
		return jour;
	} else {
		this.errMsg("Invalid Jour", [jour]);
	}
}

// <Horaire> = *1 Heure ‘:’ Minute ‘-‘ Heure ‘:’ Minute
CruParser.prototype.horaire = function(input){
	var hours = this.heure(input);
	console.log("Nouvelle heure :"+hours);
	var minutes = this.minute(input);
	console.log("Nouvelle minute :"+minutes);
	var hoursEnd = this.heure(input);
	console.log("Nouvelle heureEnd :"+hoursEnd);
	var minutesEnd = this.minute(input);
	console.log("Nouvelle mintuesEnd :"+minutesEnd);

	return {
		start: hours + ":" + minutes,
		end: hoursEnd + ":" + minutesEnd
	};
}

// <Heure> = 1*2 DIGIT
CruParser.prototype.heure = function(input){
	var hours = input[0];
	if (hours && (matched = hours.match(/[0-9]{2}/))){
		this.next(input);
		return matched[0];
	} else {
		this.errMsg("Invalid Heure", [hours]);
	}
}

// <Minute> = ‘00’/’30’
CruParser.prototype.minute = function(input){
	var minutes = input[0];
	if (minutes.match(/00|30/)){
		this.next(input);
		return minutes;
	} else {
		this.errMsg("Invalid Minute", [minutes]);
	}
}

// <Salle> = *1 (1 ALPHA 3 DIGIT / ‘SPOR’/’EXT1’/’IUT1’)
CruParser.prototype.salle = function(input) {
    var salle = input[0];
    if (salle && (matched = salle.match(/[A-Z]{1}[0-9]{3}|SPOR|EXT1|IUT1/))) {
		this.next(input);
        return matched[0];
    } else {
        this.errMsg("Invalid Salle", [salle]);
    }
}
module.exports = CruParser;