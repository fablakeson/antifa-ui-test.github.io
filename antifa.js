// the page form
const form = document.getElementById('form');
// instruction input
const instruction = document.getElementById('intruction');
// intruciton input datalist
const datalist = document.getElementById('patterns');
// instruction input label
const label = document.getElementById('label');
// the instructions data table
const table = document.getElementById('table');
// the add/edit action button
const action = document.getElementById('action');
// the download button
const download = document.getElementById('download');
// the test name input
const testName = document.getElementById('testName');
// the message
const message = document.getElementById('message');

// register of elements in page
const registered = {
    'page' : new Set(['browser'])
};

// register an element on page
function register(key, value) {
    console.log(key);
    if (!registered[key]) {
        registered[key] = new Set();
    }
    registered[key].add(value);
}

// unregister an element on page
function unregister(key, value) {
    if (!registered[key]) {
        return;
    }
    registered[key].delete(value);
}

// return registered elements list for this key
function getRegistered(key) {
    if (!registered[key]) {
        return [];
    }
    return [...registered[key]];
}

// return true if key is registered with some element
function hasRegistered(key) {
    return registered[key] && registered[key].size > 0;
}

// antifa object
const antifa = {
    "actions" : {
        "click" : {
            "pattern" : "Click on the {@element} {type}",
            "condition" : () => hasRegistered('@element'),
            "values" : {
                "type" : () => ["button", "image", "icon", "figure", "label", "tag", "header", "message"],
                "@element" : () => getRegistered('@element')
            }
        },
        "check" : {
            "pattern" : "Check the {@element} {type}",
            "condition" : () => hasRegistered('@element'),
            "values" : {
                "type" : () => ["checkbox", "opt-in", "radio", "option"],
                "@element" : () => getRegistered('@element')
            }
        },
        "uncheck" : {
            "pattern" : "Uncheck the {@element} {type}",
            "condition" : () => hasRegistered('@element'),
            "values" : {
                "type" : () => ["checkbox", "opt-in"],
                "@element" : () => getRegistered('@element')
            }
        },
        "upload" : {
            "pattern" : "Upload path \"{param:file}\" to the {@element} {type}",
            "condition" : () => hasRegistered('@element'),
            "values" : {
                "type" : () => ["file"]
            }
        },
        "hover" : {
            "pattern" : "Hover on {@element} {type}",
            "condition" : () => hasRegistered('@element'),
            "values" : {
                "@element" : () => getRegistered('@element'),
                "type" : () => ["image", "icon", "figure", "label", "tag", "header", "message"]
            }
        },
        "set" : {
            "pattern" : "Set {@element} {type} to \"{param:value}\"",
            "condition" : () => hasRegistered('@element'),
            "values" : {
                "@element" : () => getRegistered('@element'),
                "type" : () => ["range"]
            }
        },
        "write" : {
            "pattern" : "Write \"{param:text}\" to {@element} {type}",
            "condition" : () => hasRegistered('@element'),
            "values" : {
                "@element" : () => getRegistered('@element'),
                "type" : () => ["textbox", "input", "field", "display"]
            }
        },
        "read" : {
            "pattern" : "Read {param:text} on the {@element} {type}",
            "condition" : () => hasRegistered('@element'),
            "values" : {
                "@element" : () => getRegistered('@element'),
                "type" : () => ["textbox", "input", "field", "display", "label", "tag", "header", "message"]
            }
        },
        "declare" : {
            "pattern" : "Declare {@element} as \"{param:name}\" located by \"{param:locator}\"",
            "condition" : () => hasRegistered('page'),
            "events" : {
                "onCreate" : (context) => register('@element', context['@element']),
                "onDelete" : (context) => unregister('@element', context['@element'])
            }
        },
        "store" : {
            "pattern" : "Store {@element} {type} value on {$variable}",
            "condition" : () => hasRegistered('@element'),
            "values" : {
                "@element" : () => getRegistered('@element'),
                "type" : () => ["textbox", "input", "field", "display", "label", "tag", "header", "message", "range"]
            },
            "events" : {
                "onCreate" : (context) => register('$variable', context['$variable']),
                "onDelete" : (context) => unregister('$variable', context['$variable'])
            }
        },
        "assert" : {
            "pattern" : "Assert \"{param:value}\" equals to {variable}",
            "condition" : () => hasRegistered('variable'),
            "values" : {
                "variable" : () => getRegistered('variable')
            }
        },
        "open" : {
            "pattern" : "Open the {element} page on \"{param:url}\"",
            "condition" : () => false, // disable open action
            "events" : {
                "onCreate" : (context) => register('page', context['element']),
                "onDelete" : (context) => unregister('page', context['element'])
            }
        },
        "close" : {
            "pattern" : "Close the {element} page",
            "condition" : () => false, // disable close action
            "values" : {
                "element" : () => getRegistered('page')
            }
        },
        "scroll" : {
            "condition" : () => hasRegistered('page'),
            "pattern" : "Scroll {param:direction} the page",
            "values" : {
                "param:direction" : () => ["up", "down"]
            }
        }
    }
};

// check if given token is a placeholder
function isPlaceholder(token) {
    return !!token && token.indexOf('{') >= 0;
}

// return the next completable token and its index
function nextCompletableToken(numTokens, patternTokens) {
    for (let i = numTokens; i < patternTokens.length; ++i) {
        if (isPlaceholder(patternTokens[i])) {
            return [patternTokens[i].replace('{','').replace('}',''), i];
        }
    }
    return [null, -1];
}

// conditions
function hasElement() {
    return registered['element'] && registered['element'].length > 0;
}

function hasVariable() {
    return registered['variable'] && registered['variable'].length > 0;
}

function hasOpen() {
    return registered['open'] && registered['open'].length > 0;
}

// set initial values of datalist
function initDatalist() {
    const initialPatterns = Object.keys(antifa.actions)
        .filter(action => antifa.actions[action].condition())
        .map(action => antifa.actions[action].pattern.split(' ')[0])
        .map(value => `<option value="${value} ">`)
        .join('\n');
    updateDatalist(initialPatterns);
}

// update the datalist with given options
function updateDatalist(newPatterns) {
    datalist.innerHTML = newPatterns;
}

// focus on instruction input
function focus() {
    instruction.focus();
}

// update label
function updateLabel(pattern = '') {
    if (instruction.value && instruction.value.length > 0) {
        label.innerHTML = pattern.replaceAll(' ', '&nbsp;');
        label.classList.add('force-visible');
    } else {
        label.innerHTML = 'Use down arrow to get options...';
    }
}

// count some char occourence
function count(string, char) {
    let count = 0;
    for (let i = 0; i < string.length; ++i) {
        if (string.charAt(i) === char) {
            ++count;
        }
    }
    return count;
}

// return true if n is even, false otherwise
function isEven(n) {
    return (n & 1) == 0;
}

// store the last used verb
var lastVerb = '';
// store the last size of instruction field
var lastSize = 0;
function onInput() {
    // restore label of content is clear
    if (!instruction.value || instruction.value.length === 0) {
        lastVerb = '';
        updateLabel();
        lastSize = 0;
        return;
    }
    // check if we can autocomplete the input, 
    // we cannot autocomplete if it is inserting string parameters
    const canUpdateValue = isEven(count(instruction.value, '"'));
    const instructionTokens = (canUpdateValue 
        ? instruction.value.trim()
        : instruction.value).match(/(?:[^\s"]+|"[^"]*")+/g);
    // get pattern for current verb, if it exists
    const verb = instructionTokens[0].toLowerCase();
    if (!antifa.actions[verb]) {
        // restore the possible verbs list
        initDatalist();
        // restore the label if verb is not the same
        if (!lastVerb.startsWith(instruction.value.toLowerCase())) {
            updateLabel();
        }
        lastSize = instruction.value.length;
        return;
    }
    lastVerb = verb;
    const pattern = antifa.actions[verb].pattern;
    const patternTokens = pattern.match(/(?:[^\s"]+|"[^"]*")+/g) ;

    // just update the pattern if we cannot update value
    if (!canUpdateValue) {
        lastSize = instruction.value.length;
        const lastQuoteIndex =  instruction.value.lastIndexOf('"');
        const instructionTokensCount = instruction.value.substring(0, lastQuoteIndex + 1).match(/(?:[^\s"]+|"[^"]*")+/g).length + 1;
        const updatedPattern = instruction.value 
            + ['"', ...patternTokens.slice(instructionTokensCount, patternTokens.length)].join(' ');
        updateLabel(updatedPattern);
        return;
    }

    // find the next completable token
    const [nextToken, nextTokenIndex] = nextCompletableToken(instructionTokens.length, patternTokens);
    // generate suggestion list for next token
    const possibleValues = (antifa.actions[verb].values?.[nextToken] || ((dummy) => []));
    const template = [...instructionTokens, ...patternTokens.slice(instructionTokens.length, nextTokenIndex + 1)]
                        .join(' ').replace('{', '').replace('}', '');
    const values = possibleValues().map(value => template.replace(nextToken, value));
    const newPatterns = values.map(value => `<option value="${value.replaceAll('"', '&quot;')} ">`).join('\n');
    // update current input with the pattern
    if (instruction.value.length > lastSize) {
        // user is inserting some word, so check if is space
        if (instruction.value.charAt(instruction.value.length - 1) === ' ') {
            // if last word was a placeholder or the action verb, then complete with template
            if (isPlaceholder(patternTokens[instructionTokens.length - 1])
                || instructionTokens.length === 1) {
                // then add template text to input
                instructionTokens.push(...patternTokens.slice(instructionTokens.length, nextTokenIndex));
                // replace field value
                instruction.value = instructionTokens.join(' ') + ' ';
            } else {
                // prevent add this space
                instruction.value = instruction.value.substring(0, instruction.value.length - 1);
            }
        }
    } else if (instruction.value.charAt(instruction.value.length - 1) !== ' ' 
            && !isPlaceholder(patternTokens[instructionTokens.length - 1])) {
        // user is deleting some word, so delete the current token
        while (instructionTokens.length > 0 && !isPlaceholder(patternTokens[instructionTokens.length - 1])) {
            instructionTokens.pop();
        }
        // replace field value
        instruction.value = instructionTokens.join(' ');
    }
    // update data list
    if (instruction.value.length === 0) {
        initDatalist();
    } else {
        updateDatalist(newPatterns);
    }
    // update the label with the pattern updated with current input
    const updatedPattern = [...instructionTokens, ...patternTokens.slice(instructionTokens.length, patternTokens.length)].join(' ');
    updateLabel(updatedPattern);
    // focus on input and put the cursor at the end
    focus();
    lastSize = instruction.value.length;
}

// transform HTML into DOM
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

// return a context object for intruction.
function getContext(instructionValue) {
    const isntructionTokens = instructionValue.match(/(?:[^\s"]+|"[^"]*")+/g);
    const verb = isntructionTokens[0].toLowerCase();
    const patternTokens = antifa.actions[verb].pattern.match(/(?:[^\s"]+|"[^"]*")+/g) ;
    const context = {};
    for (let i = 0; i < patternTokens.length; ++i) {
        if (isPlaceholder(patternTokens[i])) {
            context[patternTokens[i].match(/\{(.+?)\}/)[1]] = isntructionTokens[i];
        }
    }
    return context;
}

// add instruction to table
function addInstruction() {
    // check if instruction is a valid input
    if (!instruction.value.trim()) {
        message.MaterialSnackbar.showSnackbar({message: 'Error: Instruction must not be empty! 😅'});
        return;
    }

    // trigger the events for instruction verb
    const context = getContext(instruction.value);
    antifa.actions[lastVerb]?.events?.onCreate(context);

    // check if instruction has period
    const instructionValue = instruction.value.endsWith('.')
        ? instruction.value
        : instruction.value + '.';

    // new row component
    const newRow = htmlToElement(`<tr>
        <td class="mdl-data-table__cell--non-numeric instruction" contenteditable="false">${instructionValue}</td>
    </td>`);

    // delete action button
    const deleteButton = htmlToElement(`<button id="remove" class="mdl-button mdl-js-button mdl-button--icon">
    <i class="material-icons">delete</i>
    </button>`);
    deleteButton.onclick = () => removeInstruction(newRow);
    // edit action button
    const editButton = htmlToElement(`<button id="edit" class="mdl-button mdl-js-button mdl-button--icon">
    <i class="material-icons">edit</i>
    </button>
    <div class="edit" data-mdl-for="remove">Edit</div>`);
    editButton.onclick = () => editInstruction(newRow);
    
    // actions component
    const actions = document.createElement("td");
    // append buttons to actions
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    
    // append actions to new row
    newRow.appendChild(actions);
    // append new row to table body
    table.children[1].appendChild(newRow);
    // reset the instruction input
    form.reset();
    initDatalist();
    updateLabel();
    // message
    message.MaterialSnackbar.showSnackbar({message: 'Instruction added! ➕'});
}

// remove given instruction from table
function removeInstruction(element) {
    // get the element action verb
    const verb = element.innerText.match(/(?:[^\s"]+|"[^"]*")+/g)[0].toLowerCase();
    // trigger the events for deleting this verb
    const context = getContext(element.innerText);
    antifa.actions[verb]?.events?.onDelete(context);
    // remove element from dom
    element.remove();
    console.log(registered);
    // reset the instruction input
    form.reset();
    initDatalist();
    updateLabel();
    message.MaterialSnackbar.showSnackbar({message: 'Instruction removed! 🗑'});
}

function editInstruction(element) {
    // get the instruction td
    const instructionTd = element.querySelector(':nth-child(1)');
    const actionsTd = element.querySelector(':nth-child(2)');
    const editButton = actionsTd.querySelector(':nth-child(1)');
    // check the element state
    if (instructionTd.contentEditable === 'false') {
        // activate edit mode
        instructionTd.contentEditable = 'true';
        setTimeout(function() {
            instructionTd.focus();
        }, 0);
        editButton.innerHTML = '<i class="material-icons">done</i>';
    } else {
        // deactivate edit mode
        instructionTd.contentEditable = 'false';
        editButton.innerHTML = '<i class="material-icons">edit</i>';
    }
}

// generate the testing file from instructions on datatable
function generateFile() {
    // check if file name was set
    if (!testName.innerText.trim()) {
        message.MaterialSnackbar.showSnackbar({message: 'Error: Test must have a name! 😅'});
        return;
    }
    // generate message
    const openMessage = 
`## Test generated with Antifa Framework Test Creation Tool

## ${testName.innerText}
Open`;
    const output = [...document.getElementsByClassName('instruction')]
            .map(el => el.innerText).join('\n')
            .replace(/^Open/, openMessage);
    // enable download
    download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output));
    download.setAttribute('download', testName.innerText.trim()
            .toLowerCase().replaceAll(' ', '_') + '.txt');
    message.MaterialSnackbar.showSnackbar({message: 'File downloaded! 📥'});
}

// bind instruction input events
instruction.oninput = onInput;
// bind action add instruction events
action.onclick = addInstruction;
// bind download button events
download.onclick = generateFile;

// Add label initial text
updateLabel();
// init the datalist
initDatalist();