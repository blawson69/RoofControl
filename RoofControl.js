/*
RoofControl
A roof lifting system for Roll20

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l

Like this script? Become a patron:
    https://www.patreon.com/benscripts
*/

var RoofControl = RoofControl || (function () {
    'use strict';

    var version = '2.0',
    debugMode = false,
    RoofParts = {},
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 6px 8px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 6px 0; color: ##591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        buttonWrapper: 'text-align: center; margin: 10px 0; clear: both;',
        result: 'font-size: 1.125em; font-weight: bold; cursor: pointer; font-family: "Lucida Console", Monaco, monospace;',
        code: 'font-family: "Courier New", Courier, monospace; padding-bottom: 6px;'
    },

    logReadiness = function (msg) {
        var firstTime = false;
        if (!_.has(state, 'RoofControl')) {
            state['RoofControl'] = state['RoofControl'] || {};
            firstTime = true;
        }
        if (typeof state['RoofControl'].anchorColor == 'undefined') state['RoofControl'].anchorColor = '#CC0000';
        if (typeof state['RoofControl'].useAura2 == 'undefined') state['RoofControl'].useAura2 = false;
        if (typeof state['RoofControl'].lockPos == 'undefined') state['RoofControl'].lockPos = true;
        if (typeof state['RoofControl'].gmOnly == 'undefined') state['RoofControl'].gmOnly = true;
        if (typeof state['RoofControl'].lockedTokens == 'undefined') state['RoofControl'].lockedTokens = [];

        // Migrate relevant settings from SimpleRoofControl
        if (_.has(state, 'SIMPLEROOFCONTROL') && firstTime) {
            state['RoofControl'].anchorColor = state['SIMPLEROOFCONTROL'].anchorColor;
            state['RoofControl'].useAura2 = state['SIMPLEROOFCONTROL'].useAura2;
            state['RoofControl'].lockPos = state['SIMPLEROOFCONTROL'].lockPos;
            state['RoofControl'].gmOnly = state['SIMPLEROOFCONTROL'].gmOnly;
            state['RoofControl'].lockedTokens = _.uniq(state['SIMPLEROOFCONTROL'].lockedTokens);
        }
        _.each(state['RoofControl'].lockedTokens, function (id) {
            var token = getObj('graphic', id);
            if (!token) state['RoofControl'].lockedTokens = _.reject(state['RoofControl'].lockedTokens, function (x) { return x == id; });
        });

        if (firstTime) {
            var message = 'Thank you for using RoofControl!';
            if (_.has(state, 'SIMPLEROOFCONTROL')) message += ' All of your SimpleRoofControl settings have been migrated.<br><div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + '" href="!roof config">Open Config</a></div>';
            showDialog('Welcome', message);
        }

        log('--> RoofControl v' + version + ' <-- Initialized. Let\'s raise the roof!');

        if (debugMode) {
            var d = new Date();
            showDialog('Debug Mode', 'RoofControl v' + version + ' loaded at ' + d.toLocaleTimeString() + '<br><div style=\'' + styles.buttonWrapper + '\'><a style=\'' + styles.button + '\' href="!roof config">Show Config</a></div>');
        }
    },

    handleInput = function (msg) {
		if (msg.type !== "api") {
			return;
		}

		switch (msg.content.split(/\s+/).shift()) {
            case "!roof":
                var parms = msg.content.split(/\s+/);
                if (parms[1] && playerIsGM(msg.playerid)) {
                    switch (parms[1]) {
                        case "config":
                            showConfig(msg.content);
                            break;
                        case "link":
                            commandLink(msg);
                            break;
                        case "flip":
                            commandFlip(msg);
                            break;
                        case "help":
                            showHelp();
                            break;
                        case "unlock":
                            unlockRoofTokens(msg.selected);
                            break;
                        case "lock":
                            lockRoofTokens(msg.selected);
                            break;
                    }
                }
                break;

			case "!ShowHideRoof":
                if (!playerIsGM(msg.playerid) && state['RoofControl'].gmOnly) {
                    showDialog('', 'You do not have permission to use that command.', msg.who);
                    return;
                }

                var anchorTokens = [],
                    msgparts = msg.content.split(/\s+/),
                    regex = /on|off|toggle/i;

                if (msg.selected) anchorTokens = msg.selected.map(s => getObj(s._type, s._id));
                if (_.last(msgparts).startsWith('-')) {
                    anchorTokens = []; //ignore selected tokens
                    var anchorIDs = msg.content.replace(/!ShowHideRoof\s*(?:on|off|toggle)?\s+/i, '').split(/\s*,\s*/);
                    _.each(anchorIDs, function (id) {
                        var token = getObj('graphic', id);
                        if (token) anchorTokens.push(token);
                    });
                }

                if (_.size(anchorTokens) > 0) {
                    _.each(anchorTokens, function (anchor) {
                        if (typeof anchor !== 'undefined' && typeof anchor.get !== 'undefined') {
                            var roofID = (state['SIMPLEROOFCONTROL'].allowLabels) ? anchor.get('bar1_value') : anchor.get('name'),
                                oRoof = getObj('graphic', roofID);
                            if (oRoof) {
                                var dest = (state['SIMPLEROOFCONTROL'].allowLabels) ? oRoof.get('bar1_max').toLowerCase() : oRoof.get('bar1_value').toLowerCase();
                                if (dest !== 'map') dest = 'objects';
                                oRoof.set({layer: ((oRoof.get('layer') !== 'walls') ? 'walls' : dest)});
                                if (oRoof.get('layer') === 'objects') toFront(oRoof);

                                if (regex.test(msgparts[1])) {
                                    msgparts[1] = msgparts[1].toLowerCase();
                                    var oPage = getObj("page", anchor.get('pageid'));
                                    if (msgparts[1] === 'toggle') {
                                        oPage.set({showlighting: (oPage.get('showlighting') === false ? true : false) });
                                        if (state['RoofControl'].useFoW) oPage.set({showdarkness: (oPage.get('adv_fow_enabled') === false ? true : false) });
                                    } else {
                                        oPage.set({showlighting: (msgparts[1] === 'on' ? true : false) });
                                        if (state['RoofControl'].useFoW) oPage.set({showdarkness: (msgparts[1] === 'on' ? true : false) });
                                    }
                                }
                            } else {
                                showDialog('Error', 'Missing Roof token for ' + (state['SIMPLEROOFCONTROL'].allowLabels ? '"' + anchor.get('name') + '"' : 'ID ' + anchor.get('id')) + '!');
                            }
                        } else showDialog('Error', 'Invalid token!');
                    });
                } else {
                    showDialog('Error', 'No tokens selected!');
                }
		} // End switch
    },

    commandLink = function (msg) {
        if (!playerIsGM(msg.playerid)) {
            return;
        }
        if (_.size(msg.selected) < 2) {
            showDialog('Link Error', 'You have not selected enough tokens! Please select a "RoofAnchor" token and at least one "Roof" token.');
            return;
        }
        var roofs = [], anchor;
        _.each(msg.selected, function (obj) {
            var token = getObj(obj._type, obj._id);
            if (token) {
                var nameVal = token.get("bar1_value") ;
                if (nameVal === 'Roof') roofs.push(token);
                if (nameVal === 'RoofAnchor') anchor = token;
            }
        });

        if (typeof anchor != 'undefined' && _.size(roofs) > 0) {
            var roof_ids = [];
            var roofAnchorParms = state['RoofControl'].useAura2 ?
            {aura2_radius: '0.1', aura2_color: state['RoofControl'].anchorColor, showplayers_aura2: false} :
            {aura1_radius: '0.1', aura1_color: state['RoofControl'].anchorColor, showplayers_aura1: false};

            _.each(roofs, function (roof) {
                roof_ids.push(roof.get('id'));
                if (state['RoofControl'].lockPos) {
                    state['RoofControl'].lockedTokens.push(roof.get('id'));
                }
            });
            state['RoofControl'].lockedTokens = _.uniq(state['RoofControl'].lockedTokens);

            anchor.set(roofAnchorParms);
            anchor.set({bar2_value: roof_ids.join()});

            showDialog('Success', (_.size(roof_ids) == 1 ? '1 Roof' : _.size(roof_ids) + ' Roofs') + ' and Anchor linked!');
        } else {
            var err = "Couldn't find a required piece:<ul>"
                + (typeof anchor == 'undefined' ? '<li>A token with "RoofAnchor" in the first Bar 1 box.</li>' : '')
                + (_.size(roofs) == 0 ? '<li>One or more tokens with "Roof" in the first Bar 1 box.</li>' : '')
                + '</ul>';
            showDialog('Link Error', err);
        }
    },

    commandFlip = function (msg) {
        if (!playerIsGM(msg.playerid) && state['RoofControl'].gmOnly) {
            showDialog('', 'You do not have permission to use that command.', msg.who);
            return;
        }

        var anchor_tokens = [];
        if (msg.selected) anchor_tokens = msg.selected.map(s => getObj(s._type, s._id));
        if (_.last(msg.content.split(/\s+/g)).startsWith('-')) {
            anchor_tokens = []; //ignore selected tokens
            var anchor_ids = msg.content.replace(/(!roof|flip|dl\-|fow\-|on|off|toggle)/gi, '').trim().split(/\s*,\s*/);
            _.each(anchor_ids, function (id) {
                var token = getObj('graphic', id);
                if (token && token.get('bar1_value') === 'RoofAnchor') anchor_tokens.push(token);
            });
        }

        if (_.size(anchor_tokens) > 0) {
            if (msg.content.match(/(dl|fow)\-(on|off|toggle)/i) !== null) {
                var page = getObj("page", anchor_tokens[0].get('pageid'));
                var msgparts = msg.content.toLowerCase().split(/\s+/), dl_opt, fow_opt;
                _.each(msgparts, function (cmd) {
                    if (cmd.startsWith('dl-')) dl_opt = (cmd == 'dl-on' ? true : (cmd == 'dl-off' ? false : !page.get('showlighting')));
                    if (cmd.startsWith('fow-')) fow_opt = (cmd == 'fow-on' ? true : (cmd == 'fow-off' ? false : !page.get('adv_fow_enabled')));
                });
                if (typeof dl_opt != 'undefined') page.set({showlighting: dl_opt });
                if (typeof fow_opt != 'undefined') page.set({showdarkness: fow_opt });
            }

            _.each(anchor_tokens, function (anchor) {
                var roof_ids = anchor.get('bar2_value').split(',');
                _.each(roof_ids, function (roof_id) {
                    var roof = getObj('graphic', roof_id);
                    if (roof) {
                        var dest = roof.get('bar1_max').toLowerCase();
                        if (dest !== 'map') dest = 'objects';
                        roof.set({layer: ((roof.get('layer') !== 'walls') ? 'walls' : dest)});
                        toFront(roof);
                    }
                });

                // Show contents of RoofAnchor GM Notes
                var roofEffect = processGMNotes(anchor.get('gmnotes'));
                if (roofEffect != '') {
                    var diceExp, effect = _.clone(roofEffect);
                    if (roofEffect.startsWith('&{template') && anchor.get('bar3_max') !== 'shown') sendChat('Effect', effect);
                    else {
                        // Check for die roll expressions
                        while (effect.search('@') != -1) {
                            diceExp = effect.replace(/.*\@(.+)\@.*/i, '$1');
                            effect = effect.replace('@' + diceExp + '@', '<span style=\'' + styles.result + '\' title="Rolling ' + diceExp + '">' + rollDice(diceExp) + '</span>');
                        }
                        if (anchor.get('bar3_max') !== 'shown') showEffect(anchor.get('bar1_max'), effect);
                    }
                    anchor.set({bar3_max: (anchor.get('bar3_max') == 'shown' ? '' : 'shown')});
                }
            });
        } else {
            showDialog('Error', 'No anchor tokens selected!');
        }
    },

    showConfig = function (msg) {
        var message = '', parms = msg.replace('!roof config ', '').split(/\s*\-\-/i), color_err = false;
        _.each(parms, function (x) {
            var parts = x.trim().split(/\s*\|\s*/i);
            if (parts[0] == 'aura-toggle') state['RoofControl'].useAura2 = !state['RoofControl'].useAura2;
            if (parts[0] == 'pos-toggle') state['RoofControl'].lockPos = !state['RoofControl'].lockPos;
            if (parts[0] == 'fow-toggle') state['RoofControl'].useFoW = !state['RoofControl'].useFoW;
            if (parts[0] == 'gm-toggle') state['RoofControl'].gmOnly = !state['RoofControl'].gmOnly;
            if (parts[0] == 'color' && parts[1] != '') {
                if (parts[1].match(/^([0-9a-fA-F]{3}){1,2}$/i) !== null) state['RoofControl'].anchorColor = '#' + parts[1];
                else color_err = true;
            }
        });

        message += '<h4>Anchor Color</h4>The button below is your Roof Anchor color: <i>#' + state['RoofControl'].anchorColor.substr(1)
        + '</i>. To change, use the button to enter a hexadecimal color value without the hash (#).<br>';
        message += '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + '; background-color: ' + state['RoofControl'].anchorColor + '; color: ' + getContrastColor(state['RoofControl'].anchorColor) + '" href="!roof config --color|&#63;&#123;New Color&#124;' + state['RoofControl'].anchorColor.substr(1) + '&#125;" title="Change the aura color">Change 🎨</a></div>';
        if (color_err) {
            message += '<div align="center" style="align: center; color: #C00; font-weight: bold; margin: 0 4px;">You must enter a valid 3- or 6-digit hexadecimal color code. Try again.</div>';
        }

        message += '<br><h4>Aura: Aura ' + (state['RoofControl'].useAura2 ? '2' : '1') + ' <a style="' + styles.textButton + '" href="!roof config --aura-toggle" title="Toggle the aura use setting">change</a></h4>';
        message += 'The Anchor Color (above) indicates a Roof Anchor token, and the script can use either aura in case one is already in use.<br><br>';

        message += '<h4>Position Locking: ' + (state['RoofControl'].lockPos ? 'On' : 'Off') + ' <a style="' + styles.textButton + '" href="!roof config --pos-toggle" title="Toggle position locking">change</a></h4>';
        message += 'You can lock your roof tokens to prevent repositioning or resizing. If you change this, it <b>does not</b> affect previously created roof tokens.<br><br>';

        message += '<h4>GM Only: ' + (state['RoofControl'].gmOnly ? 'On' : 'Off') + ' <a style="' + styles.textButton + '" href="!roof config --gm-toggle" title="Toggle GM only">change</a></h4>';
        message += 'If you wish to allow players to use the <span style=\'' + styles.code + '\'>!roof flip</span> command, turn this setting off.';

        message += '<hr>See the <a style="' + styles.textButton + '" href="https://github.com/blawson69/RoofControl">documentation</a> for complete instructions.<br>';
        message += '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + '" href="!roof help">Help Menu</a></div>';
        showDialog('Config Menu', message);
    },

    showHelp = function () {
        var message;
        message = 'To prepare a Roof for use with the script follow the directions below:<ol>';
        message += '<li>Verify you\'re on the <i>Objects & Tokens Layer</i>.</li>';
        message += '<li>Place all "Roof" graphics and size/position them to your needs.' + (state['RoofControl'].lockPos ? ' Once linked, your Roof tokens will be locked to prevent accidental repositioning or resizing.' : ' If you wish to lock Roof token positions, you must enable it in the config menu <i>before</i> linking your tokens.') + '</li>';
        message += '<li>Enter **"Roof"** (capitalization counts!) into the first Bar 1 field regardless of the layer you wish to show it on.</li>';
        message += '<li>If the "Roof" graphic is to be revealed on the map layer, enter **"map"** into the second Bar 1 field.</li>';
        message += '<li>Place a token somewhere near the roof/building where it will remain unobstructed by other tokens.</li>';
        message += '<li>Enter **"RoofAnchor"** (yes the R and A need to be capitalized) into the first Bar 1 field.</li>';
        message += '<li>With all tokens from above selected, type <span style=\'' + styles.code + '\'>!roof link</span> in chat to link the tokens. The RoofAnchor token will be given a GM-only aura to distinguish it as your roof anchor.';
        message += '<li>If necessary, name your Roof and RoofAnchor tokens however you wish.</li>';
        message += '</ol>Do this for each "roof" needed.<br><br>Send <span style=\'' + styles.code + '\'>!roof flip</span> in chat with the RoofAnchor selected to show/hide the Roof token(s).<br><br>';
        message += 'Use <span style=\'' + styles.code + '\'>!roof flip [dl|fow]-[on|off|toggle]</span> to affect Dynamic Lighting and Advanced Fog of War.';
        message += '<hr>See the <a style="' + styles.textButton + '" href="https://github.com/blawson69/RoofControl">documentation</a> for complete instructions.<br>';
        message += '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + '" href="!roof config">Config Menu</a></div>';
        showDialog('Help Menu', message);
    },

    showDialog = function (title, content, whisperTo = 'GM') {
        // Outputs a pretty box in chat with a title and content
        var gm = /\(GM\)/i;
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        if (whisperTo.length > 0) {
            whisperTo = '/w ' + (gm.test(whisperTo) ? 'GM' : '"' + whisperTo + '"') + ' ';
            sendChat('RoofControl', whisperTo + body, null, {noarchive:true});
        } else  {
            sendChat('RoofControl', body);
        }
    },

    showEffect = function (title, content) {
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        sendChat('Effect', body);
    },

    unlockRoofTokens = function (selected) {
        if (selected && _.size(selected) > 0) {
            var anchor = getObj('graphic', selected[0]._id);
            if (anchor && anchor.get('bar1_value') == 'RoofAnchor') {
                var size = _.size(anchor.get('bar2_value').split(','));
                state['RoofControl'].lockedTokens = _.difference(state['RoofControl'].lockedTokens, anchor.get('bar2_value').split(','));
                showDialog('Unlocked', (size == 1 ? '1 Roof token has' : size + ' Roof tokens have') + ' been unlocked.');
            } else showDialog('Unlock Error', 'Not a valid RoofAnchor token.');
        } else showDialog('Unlock Error', 'No tokens were selected.');
    },

    lockRoofTokens = function (selected) {
        if (selected && _.size(selected) > 0) {
            var anchor = getObj('graphic', selected[0]._id);
            if (anchor && anchor.get('bar1_value') == 'RoofAnchor') {
                var roofs = anchor.get('bar2_value').split(',');
                _.each(roofs, function (roof_id) { state['RoofControl'].lockedTokens.push(roof_id) });
                showDialog('Locked', (_.size(roofs) == 1 ? '1 Roof token has' : _.size(roofs) + ' Roof tokens have') + ' been unlocked.');
            } else showDialog('Locked Error', 'Not a valid RoofAnchor token.');
        } else showDialog('Locked Error', 'No tokens were selected.');
    },

    getContrastColor = function (color) {
        if (color.slice(0, 1) === '#') color = color.slice(1);
        if (color.length === 3) {
            color = color.split('').map(function (hex) {
                return hex + hex;
            }).join('');
        }
        var r = parseInt(color.substr(0, 2), 16);
        var g = parseInt(color.substr(2, 2), 16);
        var b = parseInt(color.substr(4, 2), 16);
        var ratio = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (ratio >= 128) ? 'black' : 'white';
    },

    processGMNotes = function (notes) {
        var retval, text = unescape(notes).trim();
        if (text.search('{template:') != -1) {
            text = removeFormatting(text);
            text = text.replace('&amp;{template', '&{template');
        }
        return text;
    },

    removeFormatting = function (html) {
        html = html.replace(/<p[^>]*>/gi, '<p>').replace(/\n(<p>)?/gi, '</p><p>').replace(/<br>/gi, '</p><p>').replace(/<\/?(span|div|pre|img|code|a|b|i|h1|h2|h3|h4|h5|hr)[^>]*>/gi, '');
        if (html != '' && /<p>.*?<\/p>/g.test(html)) {
            html = html.match(/<p>.*?<\/p>/g).map( l => l.replace(/^<p>(.*?)<\/p>$/,'$1'));
            html = html.join(/\n/);
        }
        return html;
    },

    rollDice = function (exp) {
        exp = exp.split(/\D/gi);
        var roll, num = (exp[0]) ? parseInt(exp[0]) : 1,
        die = (exp[1]) ? parseInt(exp[1]) : 6,
        plus = (exp[2]) ? parseInt(exp[2]) : 0;
        roll = (num == 1) ? randomInteger(die) : randomInteger(die * num - (num - 1)) + (num - 1);
        return roll + plus;
    },

    handleMove = function(obj, prev) {
        // Enforces locks on roof tokens
        if (_.find(state['RoofControl'].lockedTokens, function (id) { return id == obj.get('id'); })) {
            obj.set({left: prev.left, top: prev.top, rotation: prev.rotation, width: prev.width, height: prev.height});
        }
    },

    registerEventHandlers = function () {
        on('chat:message', handleInput);
        on('change:graphic', handleMove);
    };

    return {
        logReadiness: logReadiness,
        RegisterEventHandlers: registerEventHandlers
    };

}());

on("ready",function(){
    'use strict';
    RoofControl.logReadiness();
    RoofControl.RegisterEventHandlers();
});
