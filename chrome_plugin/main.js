KC = {
    styles: {
        'journey-token-down-container': [
            'min-width: 130px',
            'min-height: 130px',
            'float: left',
            'border-radius: 130px'
        ]
    },

    config: {
        kingdom_text: true,
        show_journey: true,
        show_repeat:  true,
        sticky_table_rules: true,
        previous_rules: {},
        redraw_frequency: 5000
    },

    updated: {
        kingdom_text: false,
        show_journey: false,
        show_repeat:  false,
        sticky_table_rules: false,
        redraw_frequency: false
    },

    angular_debug_check: function () {
        if (typeof angular.element(document.body).scope() == 'undefined') {
            angular.reloadWithDebugInfo();
            return false;
        } else {
            return true;
        }
    },

    add_styles: function () {
        $('<style>').prop('type', 'text/css').html(
            Object.keys(KC.styles).map(k => '.' + k + " {\n" + KC.styles[k].join(";\n") + '}').join("\n")
        ).appendTo('head');
    },

    initialize: function () {
        KC.angular_debug_check();
        KC.load_preferences();
        KC.add_styles();
        KC.redraw();
    },

    replace_kingdom_text: function () {
        if (KC.config.kingdom_text) {
            $('.modded-text-overlay').remove();

            $('[type="kingdom"]>.mini-card-art').css('background-color', 'white').css('background-image', '').toArray().forEach(e => {
                var a = $('<div class="modded-text-overlay" style="z-index: 100; position: absolute; left: 3%; top: 5%; min-width: 287px; text-align: center; min-height: 170px;">');
                a.append(LANGUAGE.getCardText[angular.element(e).scope().pile.topCardName]);
                $(e).append(a);
            });
        } else if (KC.updated.kingdom_text) {
            $('[type="kingdom"]>.mini-card-art').css('background-color', 'black').toArray().forEach(e => $(e).css('background-image', getMiniArtURL(angular.element(e).scope().pile.topCardName)));
            KC.updated.kingdom_text = false;
        }
    },

    display_journey_token: function () {
        if (KC.config.show_journey) {
            $('.custom-token').remove();
            var journeyTokens = activeGame.state.tokens.filter(t => t.tokenName == TokenNames.JOURNEY);
            var minusCoinTokens = activeGame.state.tokens.filter(t => t.tokenName == TokenNames.MINUS_COIN);
            if (journeyTokens.length > 0 || minusCoinTokens.length > 0) {
                var counters = $('.opponent-counters').toArray().forEach(c => {
                    var scope = angular.element(c).scope();
                    var element = $(c);
                    var player = scope.hero || scope.opponent;
                    var jToken = journeyTokens.find(t => t.owner == player.index);
                    var cToken = minusCoinTokens.find(t => t.owner == player.index);
                    if (jToken) {
                        var tokenDiv = $('<div class="journey-token-container custom-token" style="background-color: ' + getByOrdinal(PlayerColors, player.index).toString() + '"></div>');
                        element.append(tokenDiv);
                        tokenDiv.css('border-radius', tokenDiv.css('min-height'));
                        if (jToken.isFlipped) {
                            tokenDiv.toggleClass('journey-token-container').toggleClass('journey-token-down-container')
                        }
                    }
                    if (cToken && activeGame.state.zones[cToken.zone].zoneName != ZoneNames.TOKEN_LIMBO) {
                        var tokenDiv = $('<div class="minus-coin-token custom-token"><div class="minus-coin-token-text">-1</div></div>');
                        element.append(tokenDiv);
                    }
                });
            }
        } else if (KC.updated.show_journey) {
            // Remove token if config is not set to show
        }
    },

    set_kingdom_repeat: function() {
        if (publicTableService && activeGame.getSupply()) {
            var kingdom = activeGame.getSupply().landscapes.map(c => c.cardName).concat(activeGame.getSupply().piles.kingdom.map(p => p.pileName));
            publicTableService.changeRule(new TableRule(TableRuleIds.REQUIRED_CARDS, -1, kingdom));
        }
    },

    display_repeat_button: function() {
        if (KC.config.show_repeat) {
            if ($('score-table-buttons').length > 0) {
                var repeat_button = $('<button class="lobby-button kc-repeat-kingdom" onclick="KC.set_kingdom_repeat()">Repeat Kingdom</button>');
                $('.kc-repeat-kingdom').remove();
                $('score-table-buttons .table-buttons').append(repeat_button);
            }
        }
    },

    set_table_rules: function() {
        if (KC.sticky_table_rules && publicTableService.heroIsHost()) {

        }
    },

    update_preference: function (name, new_value) {
        if (KC.config[name] != new_value) {
            KC.config[name] = new_value;
            KC.updated[name] = true;
            localStorage['kc.config'] = JSON.stringify(KC.config);
        }
    },

    load_preferences: function () {
        if (localStorage['kc.config']) {
            KC.config = Object.assign(KC.config, JSON.parse(localStorage['kc.config']));
            localStorage['kc.config'] = JSON.stringify(KC.config);
        }
    },

    redraw: function () {
        if (activeGame._isActive) {
            KC.replace_kingdom_text();
            KC.display_journey_token();
        } else if (publicTableService && publicTableService.heroIsHost()) {
            KC.display_repeat_button();
        }
        setTimeout(KC.redraw, KC.config.redraw_frequency);
    }
};

KC.initialize();