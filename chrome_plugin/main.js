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
                a.append(KC.card_text(angular.element(e).scope().pile.topCardName));
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
        if (KC.config.sticky_table_rules && publicTableService.heroIsHost()) {
            // var table = publicTableService.getTable();
            Object.keys(KC.config.previous_rules).forEach(r_id => {
                publicTableService.changeRule(new TableRule(TableRuleIds[r_id], KC.config.previous_rules[r_id]));
            });
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
            KC.set_table_rules();
            KC.display_repeat_button();
        }
        setTimeout(KC.redraw, KC.config.redraw_frequency);
    },

    card_lists: function() {
        return activeGame.model.players.map(p => {
            return {
                name: p.name,
                cards: _.chain(activeGame.state.zones)
                    .filter(z => z.owner == p.index)
                    .flatMap(z => z.cards)
                    .map(id => activeGame.getCardNameById(id))
                    .sortBy(c => c.name)
                    .groupBy(c => c.name)
                    .value()
            }
        });
    },

    card_text: function(card) {
        var t = LANGUAGE.getCardText[card.cardName];
        if (!(t.indexOf('"card-text"') > -1)) {
            var n = getNumberOfLines(t);
            t = setTopOffset(t, getDefaultTopOffset(n))
        }
        return t;
    }
};

KC.initialize();

function card_display(card, amount, position) {
    return '<div class="KC-card-display full-card unselectable" style="z-index: 1000; left: ' + position.left + 'px; top: ' + position.top + 'px; transform: scale(' + position.scale +');">' +
        '<div class="ng-scope">' +
            '<div class="full-card-template" style="background-image: url(' + card.fullView.templateURL + ')" />' +
            '<div class="full-card-art" style="background-image: url(' + card.fullView.artURL + '); top: ' + card.fullView.artTopOffsetInPercent + '%;" />' +
            coin_production(card) +
            '<div class="card-name-container" style="top: ' + card.fullView.titleTopOffset + 'px;">' +
                '<div class="card-name unselectable" style="font-size: ' + card.fullView.titleFontSize + 'em;">' + card.cardName.name + '</div>' +
            '</div>' +
            '<div class="card-text-container">' +
                card_text(card.cardName) +
            '</div>' +
            '<div class="bottom-bar-full" style="width: ' + card.fullView.bottomBarWidthPercentage + '%; bottom: ' + card.fullView.bottomBarBottomOffset + 'px;">' +
                '<div class="cost-container-full">' +
                    cost_text(card) +
                '</div>' +
                '<div class="bottom-right-container-full">' +
                    vp_text(card) +
                '</div>' +
                '<div class="types-text-full unselectable" style="font-size: ' + card.fullView.typesFontSize + 'em; top: ' + card.fullView.typesTopOffset + 'px;">' + card.typeString + '</div>' +
            '</div>' +
        '</div>' +
        '<div class="full-card-border" />' +
        '<div class="new-card-counter-container" style="top:0px; left:0px;">' +
            '<div class="new-card-counter-text-container" style="top: 50%">' +
                '<div class="new-card-counter-text" style="left: -50%">' + amount + '</div>'
            '</div>' +
        '</div>';
}

function coin_production(card) {
    var res = '';
    if (card.cardName.isTreasure()) {
        res = '<div class="' + coin_potion_class(card) + '-production-container">' +
            '<div class="' + coin_potion_class(card) + '-production-container">' +
                '<div class="' + coin_potion_class(card) + '-production-left"  style="top:' + card.fullView.coinTopOffset + 'px;">' +
                    coin_prod_text(card) +
                '</div>' +
                '<div class="' + coin_potion_class(card) + '-production-right" style="top:' + card.fullView.coinTopOffset + 'px;">' +
                    coin_prod_text(card) +
                '</div>' +
            '</div>' +
        '</div>';
    }
    return res;
}

function cost_text(card) {
    var res = '';
    if (card.cardName.cost.shouldShowCoinCost()) {
        res += '<div class="coin-cost-full">' +
                '<div class="coin-cost-full-text" style="top:12px;">' + card.cardName.cost.effectiveCoinCost +'</div>' +
            '</div>';
    }
    if (card.cardName.cost.shouldShowPotionCost()) {
        res += '<div class="potion-cost-full" />';
    }
    if (card.cardName.cost.shouldShowDebtCost()) {
        res += '<div class="debt-cost-full">' +
                '<div class="debt-cost-full-text" style="top:12px;">' + card.cardName.cost.debt + '</div>' +
            '</div>';
    }
    return res;
}

function vp_text(card) {
    var res = '';
    if (card.cardName.isBasicVictory()) {
        res = '<div class="vp-amount-bottom-full">' +
                '<div class="vp-icon-botton-full"></div>' +
                '<div class="vp-text-bottom-full unselectable">' + card.cardName.vp + '</div>' +
            '</div>'
    } else {
        res = '<div class="expansion-icon-bottom-full" style="background-image: url(' + card.fullView.expansionIconURL + ');"/>'
    }
    return res;
}

function card_text(card) {
    var t = LANGUAGE.getCardText[card.cardName];
    if (!(t.indexOf('"card-text"') > -1)) {
        var n = getNumberOfLines(t);
        t = setTopOffset(t, getDefaultTopOffset(n))
    }
    return t;
}

function coin_potion_class(card) {
    return card.cardName.coinProduction.potion < 1 ? 'treasure' : 'potion';
}

function coin_prod_text(card) {
    var res = '';
    if (card.cardName.coinProduction.potion < 1) {
        res = '<div class="coin-production-text-container">' +
            '<div class="coin-production-text" style="top:12px;">' + card.cardName.coinProduction.coin + '</div>' +
            '</div>';
    }
    return res;
}
