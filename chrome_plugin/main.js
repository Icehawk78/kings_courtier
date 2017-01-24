KC = {
    config: {
        kingdom_text: true,
        show_journey: true,
        show_repeat:  true,
        redraw_frequency: 5000
    },

    updated: {
        kingdom_text: false,
        show_journey: false,
        show_repeat:  false,
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

    initialize: function () {
        KC.angular_debug_check();
        KC.load_preferences();
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
            $('[type="kingdom"]>.mini-card-art').css('background-color', 'black').toArray().forEach(e => e.css('background-image', getMiniArtURL(angular.element(e).scope().pile.topCardName)));
            KC.updated.kingdom_text = false;
        }
    },

    display_journey_token: function () {
        if (KC.config.show_journey) {
            var journeyTokens = activeGame.state.tokens.filter(t => t.tokenName == TokenNames.JOURNEY);
            if (journeyTokens.length > 0) {
                var counters = $('.opponent-counters');
                counters.forEach(c => {
                    var scope = angular.element(c).scope();
                    var player = scope.hero || scope.opponent;
                    var token = journeyTokens.find(t => t.owner == player.index);
                });
            }
        } else if (KC.updated.show_journey) {
            // Remove token if config is not set to show
        }
    },

    set_kingdom_repeat: function() {
        if (publicTableService && activeGame.getSupply()) {
            var kingdom = activeGame.getSupply().landscapes.map(c => c.cardName).concat(activeGame.getSupply().piles.kingdom.map(p => p.pileName))
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