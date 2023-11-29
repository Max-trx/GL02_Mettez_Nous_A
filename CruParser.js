// CruParser

var CruParser = function(sTokenize, sParsedSymb){
	// The list of sessions parsed from the input file.
	this.parsedSessions = [];
	this.symb = ["+UVUV","Seance","Page generee en"];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// Parser procedure

// tokenize : transform the data input into a list
// <eol> = CRLF
CruParser.prototype.tokenize = function(data){
	var separator = /(\r\n|\/{2}|\/\/)/;
	data = data.split(separator);
	data = data.filter((val, idx) => !val.match(separator));
	return data;
}

// parse : analyze data by calling the first non-terminal rule of the grammar
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
	console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
CruParser.prototype.next = function(input){
	var curS = input.shift();
	if(this.showParsedSymbols){
		console.log(curS);
	}
	return curS;
}

// accept : verify if the arg s is part of the language symbols.
CruParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbol "+s+" unknown", [" "]);
		return false;
	}

	return idx;
}

// check : check whether the arg elt is at the head of the list
CruParser.prototype.check = function(s, input){
	if(this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : expect the next symbol to be s.
CruParser.prototype.expect = function(s, input){
	if(s == this.next(input)){
		//console.log("Recognized! "+s)
		return true;
	}else{
		this.errMsg("symbol "+s+" doesn't match", input);
	}
	return false;
}

// Parser rules

// <cru> = *(<session>) "Page generee en" *
CruParser.prototype.cru = function(input){
	this.session(input);
	this.expect("Page generee en", input);
	if(input.length > 0){
		this.cru(input);
	}
}

// <session> = "+UVUV" <seance> *(<seance>)
CruParser.prototype.session = function(input){
	this.expect("+UVUV", input);
	this.seance(input);
	while(this.check("Seance", input)){
		this.seance(input);
	}
}

// <seance> = "Seance" <salle> *(<salle>) <horaire> *(<horaire>)
CruParser.prototype.seance = function(input){
	this.expect("Seance", input);
	var salle = this.salle(input);
	var horaire = this.horaire(input);
	while(this.check("H=", input)){
		this.next(input);
		horaire = this.horaire(input);
	}
	while(this.check("S=", input)){
		this.next(input);
		salle = this.salle(input);
	}
	this.parsedSessions.push({ salle: salle, horaire: horaire });
}

// <salle> = "S=" <digit>
CruParser.prototype.salle = function(input){
	this.expect("S=", input);
	var curS = this.next(input);
	if(matched = curS.match(/[A-Z]|d{3}|SPORT|EXT1|IUT1/)){
		return matched[0];
	}else{
		this.errMsg("Invalid salle", input);
	}
}

// <horaire> = "H=" <time>
CruParser.prototype.horaire = function(input){
	this.expect("H=", input);
	var curS = this.next(input);
	if(matched = curS.match(/(L|MA|ME|J|V) \d{1,2}:\d{2}-\d{1,2}:\d{2}/)){
		return matched[0];
	}else{
		this.errMsg("Invalid horaire", input);
	}
}



module.exports = CruParser;
