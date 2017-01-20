KC = {
  config: {
    kingdom_text: true,
	show_journey: true,
    redraw_frequency: 5000
  },
  
  updated: {
	kingdom_text: false,
	show_journey: false,
	redraw_frequency: false
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
	KC.load_preferences();
	KC.redraw();
  },

  replace_kingdom_text: function() {
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
  
  display_journey_token: function() {
	if (KC.config.show_journey) {
	  // TODO: Render journey token
	} else if (KC.updated.show_journey) {
	  // Remove token if config is not set to show
	}
  },
  
  update_preference: function(name, new_value) {
	if (KC.config[name] != new_value) {
		KC.config[name] = new_value;
		KC.updated[name] = true;
		localStorage['kc.config'] = KC.config;
	}
  },
  
  load_preferences: function() {
	if (localStorage['kc.config']) {
	  KC.config = JSON.parse(localStorage['kc.config']);
	}
  },
  
  redraw: function() {
	KC.replace_kingdom_text();
	KC.display_journey_token();
	setTimeout(KC.redraw, KC.config.redraw_frequency);
  }
};

KC.initialize();