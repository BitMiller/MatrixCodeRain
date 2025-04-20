
var e_a_screen = new Array(document.getElementById("id_screen_a"), document.getElementById("id_screen_b"));
e_a_screen[0].classList.add("cl_screenPage");
e_a_screen[1].classList.add("cl_screenPage");

var e_debugMask = document.getElementById("id_debugMask");
var showDebugMask = false;
if (!showDebugMask) e_debugMask.classList.add("cl_displayNone");

var a_screenSpace = new Array();
//var a_rainSpace = new Array();
var a_igniterDrops = new Array();
var a_extinguisherDrops = new Array();

var e_inputTextFrameLength = document.getElementById("id_input_text_frame_length");

var screenSpaceX = 60;
var screenSpaceY = 30;

e_a_screen[0].style.gridTemplateColumns = "repeat(" + screenSpaceX + ", 1.5ch)";
e_a_screen[1].style.gridTemplateColumns = "repeat(" + screenSpaceX + ", 1.5ch)";
e_debugMask.style.gridTemplateColumns = "repeat(" + screenSpaceX + ", 1.5ch)";

e_a_screen[0].style.gridTemplateRows = "repeat(" + screenSpaceY + ", 1.2em)";
e_a_screen[1].style.gridTemplateRows = "repeat(" + screenSpaceY + ", 1.2em)";
e_debugMask.style.gridTemplateRows = "repeat(" + screenSpaceY + ", 1.2em)";

const countPerDropType = 60;
const rainSpaceTopOverflow = 30;
const a_staticMask = new Array();
const maxBlindColumnHeight = 7;
const xGlitchProbability = 0.01;
const deathProbability = 0.01;
const fluctuationProbability = 0.01;

const timeStart = 0;
var timeFrameLength = 100;
e_inputTextFrameLength.value = timeFrameLength;

var frameCounter = 0;
var stopAtFrame_debug = -1;
var activePage = 1;
var visiblePage = 0;

const charNumNotMirrored = chars_numbers_notMirrored.length;
const charNumNotBold = chars_numbers_notMirrored.length + chars_numbers_mirrored.length + 2/*ç,Z*/;

const a_charray = chars_numbers_notMirrored.concat(
                chars_numbers_mirrored,
                chars_other,
                chars_full_katakana,
                chars_kanji);

/* Initialize screen space */

function createCharacterLocation(character = " ", static = false, blind = false, state = 4, a_element, debugElement) {
    return {
        "character":    character,
        "static":       static,
        "blind":        blind,
        "state":        state,
        "touched":      0,
        "a_element":    a_element,
        "debugElement": debugElement
    };
}

function initScreenSpace(l_a_screenSpace, l_e_a_screen, l_e_debugMask, l_screenSpaceX, l_screenSpaceY, l_a_charray, l_charNumNotMirrored, l_charNumNotBold) {
    for (let j = 0; j < l_screenSpaceY; j++) {
        l_a_screenSpace.push(new Array());
        let t_blind = false;

        for (let i = 0; i < l_screenSpaceX; i++) {
            let charIndex = Math.floor(Math.random() * l_a_charray.length);
            let t_character = charIndex;
            let t_static = Math.random() < 0.33 ? false : true;
            let t_state = 7;
            let t_a_element = new Array(document.createElement("span"), document.createElement("span"));
            let t_debugElement = document.createElement("span");

            t_a_element[0].innerHTML = l_a_charray[charIndex];
            t_a_element[1].innerHTML = l_a_charray[charIndex];
            t_debugElement.innerHTML = " ";

            if (charIndex >= l_charNumNotMirrored) {
                t_a_element[0].classList.add("cl_mirrorY");
                t_a_element[1].classList.add("cl_mirrorY");
            }
            if (charIndex >= l_charNumNotBold) {
                t_a_element[0].classList.add("cl_bold");
                t_a_element[1].classList.add("cl_bold");
            }
            t_a_element[0].classList.add("cl_state_0" + t_state);
            t_a_element[1].classList.add("cl_state_0" + t_state);

            l_e_a_screen[0].classList.add("cl_visiblePage");
            l_e_a_screen[1].classList.add("cl_activePage");
            l_e_a_screen[0].appendChild(t_a_element[0]);
            l_e_a_screen[1].appendChild(t_a_element[1]);
            l_e_debugMask.appendChild(t_debugElement);
            l_a_screenSpace[j].push(createCharacterLocation(t_character, t_static, t_blind, t_state, t_a_element, t_debugElement));
        }
    }
}

/* Generate blinds on blind mask */

function initBlindMask(l_a_screenSpace, l_screenSpaceX, l_screenSpaceY, l_maxBlindColumnHeight) {
    for (let j = -l_maxBlindColumnHeight; j < l_screenSpaceY; j++) {
        for (let i = 0; i < l_screenSpaceX; i++) {
            if (Math.random() < 0.03) {
                let columnLength = Math.floor((1 - Math.cos(Math.random() * 90 * Math.PI / 180)) * l_maxBlindColumnHeight + 1);
                //console.log("columnLength: " + columnLength);
                for (let k = 0; k < columnLength; k++) {
                    if (j+k >= 0 && j+k < l_screenSpaceY) {
                        l_a_screenSpace[j+k][i].blind = "1";
                        l_a_screenSpace[j+k][i].a_element[0].classList.add("cl_blind");
                        l_a_screenSpace[j+k][i].a_element[1].classList.add("cl_blind");
                        l_a_screenSpace[j+k][i].debugElement.classList.add("cl_debugBlind_bkg");
                    }
                }
            }
        }
    }
}

/* Initialize drops */

function generateDropInstance(l_screenSpaceX, l_screenSpaceY, l_rainSpaceTopOverflow) {
    return {
        "x": Math.floor(Math.random() * (l_screenSpaceX + 2)) - 1,
        "y": Math.floor(Math.random() * (l_screenSpaceY + l_rainSpaceTopOverflow)) - l_rainSpaceTopOverflow,
        "returnDirection": 0
    };
}

function initDropInstances(l_a_igniterDrops, l_a_extinguisherDrops, l_countPerDropType, l_screenSpaceX, l_screenSpaceY, l_rainSpaceTopOverflow) {
    for (let i = 0; i < l_countPerDropType; i++) {
        l_a_igniterDrops.push(generateDropInstance(l_screenSpaceX, l_screenSpaceY, l_rainSpaceTopOverflow));
        l_a_extinguisherDrops.push(generateDropInstance(l_screenSpaceX, l_screenSpaceY, l_rainSpaceTopOverflow));
    }
}

function dropStep() {
    for (let i = 0; i < countPerDropType; i++) {
        /* Deal with igniter drops: */
        /* Restore debug mask's background color */
        if (pointInRectangle(a_igniterDrops[i].x, a_igniterDrops[i].y, 0, 0, screenSpaceX-1, screenSpaceY-1)) {
            if (a_screenSpace[a_igniterDrops[i].y][a_igniterDrops[i].x].blind) {
                a_screenSpace[a_igniterDrops[i].y][a_igniterDrops[i].x].debugElement.className = "cl_debugBlind_bkg";
            }
            else {
                a_screenSpace[a_igniterDrops[i].y][a_igniterDrops[i].x].debugElement.className = "";
            }
        }
        /* Decide if the drop will die. */
        if (Math.random() < deathProbability) {
            a_igniterDrops[i] = generateDropInstance(screenSpaceX, screenSpaceY, rainSpaceTopOverflow);
        }
        /* Is the drop in a glitch state? If it is, return it to its original trail. */
        if (a_igniterDrops[i].returnDirection != 0) {
            a_igniterDrops[i].x += a_igniterDrops[i].returnDirection;
            a_igniterDrops[i].returnDirection = 0;
        }
        /* If not, decide if it will glitch. */
        else if (Math.random() < xGlitchProbability) {
            let glitch = Math.random() < 0.5 ? -1 : 1;
            a_igniterDrops[i].x += glitch;
            a_igniterDrops[i].returnDirection = -glitch;
        }
        /* Fall one unit. */
        a_igniterDrops[i].y++;
        /* If it passed the bottom of the screen it gets re-generated. */
        if (a_igniterDrops[i].y >= screenSpaceY) {
            a_igniterDrops[i] = generateDropInstance(screenSpaceX, screenSpaceY, rainSpaceTopOverflow);
        }
        /* If the drop is in screen space it touches the character location. */
        if (pointInRectangle(a_igniterDrops[i].x, a_igniterDrops[i].y, 0, 0, screenSpaceX-1, screenSpaceY-1)) {
            a_screenSpace[a_igniterDrops[i].y][a_igniterDrops[i].x].touched = 1;
            /* Show drop location on debug mask */
            if (a_screenSpace[a_igniterDrops[i].y][a_igniterDrops[i].x].blind) {
                a_screenSpace[a_igniterDrops[i].y][a_igniterDrops[i].x].debugElement.className = "cl_debugIgniterBlind_bkg";
            }
            else {
                a_screenSpace[a_igniterDrops[i].y][a_igniterDrops[i].x].debugElement.className = "cl_debugIgniter_bkg";
            }
        }


        /* The same goes for extinguisher drops: */
        /* Restore debug mask's background color */
        if (pointInRectangle(a_extinguisherDrops[i].x, a_extinguisherDrops[i].y, 0, 0, screenSpaceX-1, screenSpaceY-1)) {
            if (a_screenSpace[a_extinguisherDrops[i].y][a_extinguisherDrops[i].x].blind) {
                a_screenSpace[a_extinguisherDrops[i].y][a_extinguisherDrops[i].x].debugElement.className = "cl_debugBlind_bkg";
            }
            else {
                a_screenSpace[a_extinguisherDrops[i].y][a_extinguisherDrops[i].x].debugElement.className = "";
            }
        }
        /* Decide if the drop will die. */
        if (Math.random() < deathProbability) {
            a_extinguisherDrops[i] = generateDropInstance(screenSpaceX, screenSpaceY, rainSpaceTopOverflow);
        }
        /* Is the drop in a glitch state? If it is, return it to its original trail. */
        if (a_extinguisherDrops[i].returnDirection != 0) {
            a_extinguisherDrops[i].x += a_extinguisherDrops[i].returnDirection;
            a_extinguisherDrops[i].returnDirection = 0;
        }
        /* If not, decide if it will glitch. */
        else if (Math.random() < xGlitchProbability) {
            let glitch = Math.random() < 0.5 ? -1 : 1;
            a_extinguisherDrops[i].x += glitch;
            a_extinguisherDrops[i].returnDirection = -glitch;
        }
        /* Fall one unit. */
        a_extinguisherDrops[i].y++;
        /* If it passed the bottom of the screen it gets re-generated. */
        if (a_extinguisherDrops[i].y >= screenSpaceY) {
            a_extinguisherDrops[i] = generateDropInstance(screenSpaceX, screenSpaceY, rainSpaceTopOverflow);
        }
        /* If the drop is in screen space it touches the character location. */
        if (pointInRectangle(a_extinguisherDrops[i].x, a_extinguisherDrops[i].y, 0, 0, screenSpaceX-1, screenSpaceY-1)) {
            a_screenSpace[a_extinguisherDrops[i].y][a_extinguisherDrops[i].x].touched = -1;
            /* Show drop location on debug mask */
            if (a_screenSpace[a_extinguisherDrops[i].y][a_extinguisherDrops[i].x].blind) {
                a_screenSpace[a_extinguisherDrops[i].y][a_extinguisherDrops[i].x].debugElement.className = "cl_debugExtinguisherBlind_bkg";
            }
            else {
                a_screenSpace[a_extinguisherDrops[i].y][a_extinguisherDrops[i].x].debugElement.className = "cl_debugExtinguisher_bkg";
            }
        }
    }
}

function stepCharacterLocations() {
    for (let j = 0; j < screenSpaceY; j++) {
        for (let i = 0; i < screenSpaceX; i++) {
            if (!a_screenSpace[j][i].blind) {
                a_screenSpace[j][i].a_element[activePage].innerHTML = a_screenSpace[j][i].a_element[visiblePage].innerHTML;
                a_screenSpace[j][i].a_element[activePage].className = a_screenSpace[j][i].a_element[visiblePage].className;
                /* Update dynamic characters */
                if (!a_screenSpace[j][i].blind && !a_screenSpace[j][i].static) {
                    changeCharacter(a_screenSpace[j][i].a_element[activePage]);
                }
                /* Check if the location got touched by drops */
                if (a_screenSpace[j][i].touched != 0) {
                    /* Ignited */
                    if (a_screenSpace[j][i].touched == 1 && a_screenSpace[j][i].state >= 5 && a_screenSpace[j][i].state <= 7) {
                        a_screenSpace[j][i].state = 1;
                    }
                    /* Extinguished */
                    else if (a_screenSpace[j][i].touched == -1 && a_screenSpace[j][i].state >= 1 && a_screenSpace[j][i].state <= 4) {
                        a_screenSpace[j][i].state = 5;
                    }
                    a_screenSpace[j][i].a_element[activePage].classList = "cl_state_0" + a_screenSpace[j][i].state;
                    a_screenSpace[j][i].touched = 0;
                }
                else if (a_screenSpace[j][i].state >= 1 && a_screenSpace[j][i].state < 7 && a_screenSpace[j][i].state != 4) {
                    a_screenSpace[j][i].state++;
                    a_screenSpace[j][i].a_element[activePage].classList = "cl_state_0" + a_screenSpace[j][i].state;
                }
            }
        }
    }
}
/*
function refreshActiveFromVisible() {
    for (let j = 0; j < screenSpaceY; j++) {
        for (let i = 0; i < screenSpaceX; i++) {
            e_a_screen[j][i].a_element[activePage].innerHTML = e_a_screen[j][i].a_element[visiblePage].innerHTML;
        }
    }
}
*/
function generateFluctuator() {
    return {
        "x": Math.floor(Math.random() * l_screenSpaceX),
        "y": Math.floor(Math.random() * l_screenSpaceX),
        "type": (Math.random() < 0.5 ? -1 : 1)
    };
}

function dropFluctuation() {
    /* Decide if it will happen or not in the actual frame. */
    if (Math.random() < fluctuationProbability) {
        let particleCount = Math.random() < 0.2 ? 2 : 1;

    }
}

function pointInRectangle(pointX, pointY, x1, y1, x2, y2) {
    return pointX >= x1 && pointX <= x2 && pointY >= y1 && pointY <= y2;
}

function step() {
    /* First start the CSS flip animation */
    flipPages();
    frameCounter++;
//    console.log("frameCounter: " + frameCounter);
//    console.log("activePage: " + activePage);

    /* Then spend time with the calculation */
    dropStep();
    dropFluctuation();
    stepCharacterLocations();

    if (frameCounter == stopAtFrame_debug) {
        clearInterval(animation);
        console.log("Interval cleared!");
    }
}

function changeCharacter(chr) {
    chr.innerHTML = a_charray[Math.floor(Math.random() * a_charray.length)];
}

function flipPages() {
    e_a_screen[activePage].classList.remove("cl_activePage");
    e_a_screen[visiblePage].classList.remove("cl_visiblePage");
    activePage = 1 - activePage;
    visiblePage = 1 - activePage;
    e_a_screen[activePage].classList.add("cl_activePage");
    e_a_screen[visiblePage].classList.add("cl_visiblePage");
}

function startAnimation() {
    clearInterval(animation);
    animation = setInterval(() => step(), timeFrameLength);
}

function stopAnimation() {
    clearInterval(animation);
}

function debugStop() {
    debugger;
}

function toggleDebugMask() {
    showDebugMask = !showDebugMask;
    if (showDebugMask) e_debugMask.classList.remove("cl_displayNone");
    else e_debugMask.classList.add("cl_displayNone");
}

function setTimeFrameLength() {
    let val = e_inputTextFrameLength.value;

    if (true) {
        timeFrameLength = val;
        stopAnimation();
        startAnimation();
    }
    else {
        alert("");
    }
}

initScreenSpace(a_screenSpace, e_a_screen, e_debugMask, screenSpaceX, screenSpaceY, a_charray, charNumNotMirrored, charNumNotBold);
initBlindMask(a_screenSpace, screenSpaceX, screenSpaceY, maxBlindColumnHeight);
initDropInstances(a_igniterDrops, a_extinguisherDrops, countPerDropType, screenSpaceX, screenSpaceY, rainSpaceTopOverflow);

var animation = setInterval(() => step(), timeFrameLength);


