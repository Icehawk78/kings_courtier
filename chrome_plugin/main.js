KC = {
  config: {
    do_replace_kingdom_text: Boolean(window.localStorage['kc.config.do_replace_kingdom_text'] || true),
    replace_kingdom_text_frequency: Number(window.localStorage['kc.config.replace_kingdom_text_frequency'] || 5000)
  },
  
  angular_debug_check: function() {
    if (typeof angular.element(document.body).scope() == 'undefined') {
      angular.reloadWithDebugInfo();
      return false;
    } else {
      return true;
    }
  },

  initialize: function() {
	KC.angular_debug_check();
    KC.replace_kingdom_text();
  },

  replace_kingdom_text: function() {
    if (KC.config.do_replace_kingdom_text) {
	  //console.log('replace_kingdom_text');
      $('.modded-text-overlay').remove();

      $('[type="kingdom"]>.mini-card-art').css('background-color', 'white').css('background-image', '').toArray().forEach(e => {
        var a = $('<div class="modded-text-overlay" style="z-index: 100; position: absolute; left: 3%; top: 5%; min-width: 287px; text-align: center; min-height: 170px;">');
        a.append(LANGUAGE.getCardText[angular.element(e).scope().pile.topCardName]);
        $(e).append(a);
      });
      setTimeout(KC.replace_kingdom_text, KC.config.replace_kingdom_text_frequency);
    } else {
      $('[type="kingdom"]>.mini-card-art').css('background-color', 'black').toArray().forEach(e => {
        e.css('background-image', getMiniArtURL(angular.element(e).scope().pile.topCardName));
      });
    }
  }
};

KC.initialize();
//console.log(KingsCourtier);