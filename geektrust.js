const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Gender - Assume binary genders, 0 for male, 1 for female
// Names - Assume unique names in the family tree, no two family members can have the same name

// Set initial couple
const familyInitial = [{
        name: "Arthur",
        spouse: "Margret",
        gender: 0,
        father: undefined,
        mother: undefined
    },
    {
        name: "Margret",
        spouse: "Arthur",
        gender: 1,
        father: undefined,
        mother: undefined
    }
];

// Family set up
var family = [];

// Relationships
const relationships = [
    "paternal-uncle",
    "paternal-aunt",
    "maternal-uncle",
    "maternal-aunt",
    "mother",
    "father",
    "son",
    "daughter",
    "siblings",
	"brother",
	"sister",
    "brother-in-law",
    "sister-in-law"
];

// Command List
const resetFamily = function() {
	family = familyInitial.slice(0);
	runFile("./family-reset.txt");
};

const findPerson = function(keyName, keyValue) {
    for (var i = 0; i < family.length; i++) {
        if (family[i][keyName] === keyValue) {
            return family[i];
        }
    }
};

const findPeople = function(keyName, keyValue) {
    var people = [];
    for (var i = 0; i < family.length; i++) {		
        if (family[i][keyName] == keyValue) {
            people.push(family[i]);
        }
    }
    return (people.length===0)?undefined:people;
};

const filterGender = function(people, gender) {
	var results = [];
    for (var l = 0; l < people.length; l++) {		
        if (people[l].gender == gender) {
            results.push(people[l]);
        }
    }
    return (results.length===0)?undefined:results;
};

const excludeSelf = function(people, name) {
	var results = [];
    for (var m = 0; m < people.length; m++) {		
        if (people[m].name != name) {
            results.push(people[m]);
        }
    }
    return (results.length===0)?undefined:results;
}

const findChild = function(name, gender) {
	var getPerson = findPerson('name', name);
	var getChildren = findPeople(getPerson.gender?'mother':'father', name);
	return (gender!==undefined)?filterGender(getChildren, gender):getChildren;
};

const findParent = function(name, gender) {
	var getPerson = findPerson('name', name);
	return [findPerson('name', getPerson[gender?'mother':'father'])];
};

const findSibling = function(name, gender) {
	var getPerson = findPerson('name', name);
	var getSiblings = ((getPerson.mother!==undefined)&&(getPerson.father!==undefined))?excludeSelf(findChild(getPerson.mother, undefined), name):undefined;
	return (getSiblings!==undefined)?((gender!==undefined)?filterGender(getSiblings, gender):getSiblings):undefined;
};

const findSpouse = function(name) {
	var getPerson = findPerson('name', name);
	return [findPerson('name', getPerson.spouse)];
};

const getGender = function(gender) {
	return ['male', 'female'].indexOf(gender.toLowerCase());
};

const addChild = function(commandArr) {
	var childObject = {
		name: commandArr[2],
        spouse: undefined,
        gender: getGender(commandArr[3]),
        father: findPerson('spouse',commandArr[1])?findPerson('spouse',commandArr[1]).name:undefined,
        mother: commandArr[1]
	};
	family.push(childObject);
};
const addSpouse = function(commandArr) {
	findPerson('name', commandArr[1]).spouse = commandArr[2]; // Adds spouse to person
	// Create spouse object
	var spouseObject = {
		name: commandArr[2],
        spouse: commandArr[1],
        gender: getGender(commandArr[3]),
        father: undefined,
        mother: undefined
	};
	family.push(spouseObject);
};

const getRelationship = function(commandArr) {
	var basePerson = commandArr[1],
		relationship = commandArr[2];
	
	switch(relationship.toLowerCase()) {
		case "paternal-uncle":
			return (findParent(basePerson, 0) && findParent(basePerson, 0)[0].mother && findParent(basePerson, 0)[0].father)?findSibling(findParent(basePerson, 0)[0].name, 0):undefined;
		break;
		case "paternal-aunt":
			return (findParent(basePerson, 0) && findParent(basePerson, 0)[0].mother && findParent(basePerson, 0)[0].father)?findSibling(findParent(basePerson, 0)[0].name, 1):undefined;
		break;
		case "maternal-uncle":
			return (findParent(basePerson, 1) && findParent(basePerson, 1)[0].mother && findParent(basePerson, 1)[0].father)?findSibling(findParent(basePerson, 1)[0].name, 0):undefined;
		break;
		case "maternal-aunt":
			return (findParent(basePerson, 1) && findParent(basePerson, 1)[0].mother && findParent(basePerson, 1)[0].father)?findSibling(findParent(basePerson, 1)[0].name, 1):undefined;
		break;
		case "mother":
			return findParent(basePerson, 1);
		break;
		case "father":
			return findParent(basePerson, 0);
		break;
		case "son":
			return findChild(basePerson, 0);
		break;
		case "daughter":
			return findChild(basePerson, 1);
		break;
		case "siblings":
			return findSibling(basePerson, undefined);
		break;
		case "brother-in-law":
			var bilBySpouse = (findSpouse(basePerson)[0] !== undefined) ? 
				findSibling(findSpouse(basePerson)[0].name, 0) : 
				undefined;
			var bilBySibs = (findPerson('name', basePerson).mother && 
				findPerson('name', basePerson).father && 
				findSibling(basePerson, 1)) ?
					(findSibling(basePerson, 1).map(function(person) {
						return findSpouse(person.name)[0];
					})) : 
					undefined;
			var silBySpouseSibs = (findSpouse(basePerson)[0] !== undefined) ? 
				findSibling(findSpouse(basePerson)[0].name, 1) : 
				undefined;
			var bilBySilSpouses = [];
			if (silBySpouseSibs !== undefined) {
				silBySpouseSibs.forEach(function(person) {
					(findSpouse(person.name)[0]!==undefined) && bilBySilSpouses.push(findSpouse(person.name)[0]);
				});
			}
			bilList = (bilBySpouse || []).concat(bilBySibs || []).concat(bilBySilSpouses || []) || [];
			return bilList;		
		break;
		case "sister-in-law":
			var silBySpouse = (findSpouse(basePerson)[0] !== undefined) ? 
				findSibling(findSpouse(basePerson)[0].name, 1) : 
				undefined;
			var silBySibs = (findPerson('name', basePerson).mother && 
				findPerson('name', basePerson).father && 
				findSibling(basePerson, 0)) ?
					(findSibling(basePerson, 0).map(function(person) {
						return findSpouse(person.name)[0];
					})) : 
					undefined;
			var bilBySpouseSibs = (findSpouse(basePerson)[0] !== undefined) ? 
				findSibling(findSpouse(basePerson)[0].name, 0) : 
				undefined;
			var silByBilSpouses = [];
			if (bilBySpouseSibs !== undefined) {
				bilBySpouseSibs.forEach(function(person) {
					(findSpouse(person.name)[0]!==undefined) && silByBilSpouses.push(findSpouse(person.name)[0]);
				});
			}
			silList = (silBySpouse || []).concat(silBySibs || []).concat(silByBilSpouses || []) || [];
			return silList;		
		break;
	};
};

const runFile = function(filename) {
    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
            return console.log("ERR ", err);
        }
        parseFile(data);
    });
};

// Error Messages
const childAddFail = function() {
	console.log("CHILD_ADDITION_FAILED");
};

const spouseAddFail = function() {
	console.log("SPOUSE_ADDITION_FAILED");
};

// Command Validation
const validateCommand = function(commandArr) {
    var isValid = true;
    switch (commandArr[0].toUpperCase()) {
        case "ADD_CHILD":
            if (commandArr.length != 4) {
				childAddFail();
                isValid = false;
            } else {
                if (getGender(commandArr[3]) == -1) {
					childAddFail();
                    isValid = false;
                } else {
                    if (!findPerson('name',commandArr[1])) {
                        console.log("PERSON_NOT_FOUND");
                        isValid = false;
                    } else {
                        if (findPerson(commandArr[1])) {
                            if (findPerson('name',commandArr[1]).gender === 0) {
								childAddFail();
                                isValid = false;
                            } else {
                                if (findPerson('name',commandArr[2])) {
                                	childAddFail();
									isValid = false;
                                }
                            }
                        }
                    }
                }
            }
        break;
        case "ADD_SPOUSE":
            if (commandArr.length != 4) {
   				spouseAddFail();
                isValid = false;
            } else {
                if (['male', 'female'].indexOf(commandArr[3].toLowerCase()) == -1) {
					spouseAddFail();
                    isValid = false;
                } else {
                    if (!findPerson('name',commandArr[1])) {
                        console.log("PERSON_NOT_FOUND");
                        isValid = false;
                    } else {
                        if (findPerson('name',commandArr[1])) {
                            if (findPerson('name',commandArr[1]).spouse !== undefined) {
								spouseAddFail();
                                isValid = false;
                            } else {
                                if (findPerson('name',commandArr[2])) {
									spouseAddFail();
                                    isValid = false;
                                }
                            }
                        }
                    }
                }
            }
        break;
        case "GET_RELATIONSHIP":
            if (commandArr.length != 3) {
                console.log("INVALID_COMMAND");
                isValid = false;
            } else {
                if (relationships.indexOf(commandArr[2].toLowerCase()) == -1) {
                    console.log("INVALID_COMMAND");
                    isValid = false;
                } else {
                    if (!findPerson('name',commandArr[1])) {
                        console.log("PERSON_NOT_FOUND");
                        isValid = false;
                    }
                }
            }
        break;
    }
    return isValid;
};

// Parse the file being read
const parseFile = function(data) {
    var commandList = data.split("\r\n");
    for (var j = 0; j < commandList.length; j++) {
        doCommand(commandList[j].split(" "), true);
    }
};

// Perform the command
const doCommand = function(commandArr, runfile) {
	if(commandArr[0] !== "") {
		switch (commandArr[0].toUpperCase()) {
			case "HELP":
				if (!runfile) {
					console.log("**** HELP ****");
					console.log("HELP - Shows this screen");
					console.log("EXIT - Exits program");
					console.log("RESET - Loads Lengaburu family tree (Replaces current changes)");
					console.log("ADD_CHILD <mother> <child> <gender>");
					console.log("ADD_SPOUSE <person> <spouse> <gender>");
					console.log("GET_RELATIONSHIP <person> <relationship>");
					console.log("<relationship> can be any of the following:");
					console.log("paternal-uncle, paternal-aunt,");
					console.log("maternal-uncle, maternal-aunt,");
					console.log("mother, father, son, daughter, siblings");
					console.log("brother-in-law, sister-in-law,");
					console.log("RUN_FILE <filename>");
				}
			break;
			case "RESET":
				resetFamily();
			break;
			case "ADD_CHILD":
				if (validateCommand(commandArr)) {
					addChild(commandArr);
					console.log("CHILD_ADDITION_SUCCEEDED");
				}
			break;
			case "ADD_SPOUSE":
				if (validateCommand(commandArr)) {
					addSpouse(commandArr);
					console.log("SPOUSE_ADDITION_SUCCEEDED");
				}
			break;
			case "GET_RELATIONSHIP":
				if (validateCommand(commandArr)) {
					var results = getRelationship(commandArr);
					if(results !== undefined) {
						results = results.filter(function(item) {
							return item!==undefined;
						});
					}
					if((results === undefined) || (results.length === 0)){
						console.log('NONE');
					} else {
						var nameList = [];
						for(var k = 0; k < results.length; k++) {
							nameList.push(results[k].name);
						}
						console.log(nameList.join(" "));
					}
				}
			break;
			case "RUN_FILE":
				if (!runfile) {
					runFile(commandArr[1]);
				}
			break;
			default:
				console.log("UNKNOWN_COMMAND");
			break;
		}
	}
};

// user input loop
const waitForUserInput = function() {
    rl.question("", function(answer) {
        var commandArr = answer.split(" ");
        if (commandArr[0].toUpperCase() == "EXIT") {
            rl.close();
            process.exit(0);
        } else {
            doCommand(commandArr, false);
            waitForUserInput();
        }
    });
};

// Initialization
resetFamily();
waitForUserInput();