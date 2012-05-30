/*
 * jQuery Klear
 */

;(function($) {
	
	/*
	 * setting / getting $.klear Namespace
	 */
	
	$.klear = $.klear || {};
	
	var __namespace__ = 'klear.navigation';
	
	$.klear.checkDeps = function(dependencies,callback) {
		
		if (typeof callback._numberOfTries == 'undefined') {
			callback._numberOfTries = 0;
		} else {
			callback._numberOfTries++;
		}
		
		if (!dependencies.length) {
			throw "Dependecies parameter type.";
		}
		
		if (callback._numberOfTries > 50) {
			throw "JS Dependecy Timeout.";
		}
		var depLength = dependencies.length;
		for(var i=0;i<depLength;i++) {
			
			var segments = dependencies[i].split('.');
			var prev = window;
			for(var j=0; j<segments.length;j++) {
				if (typeof prev[segments[j]] == 'undefined') {
					setTimeout(function() {callback($);},100);
					return false;
				} else {
					prev = prev[segments[j]];
				}
			}
		}
		return true;
	};
	
	/*
	 * Checking open in background Event:
	 * control | middle click
	 */
	
	$.klear.checkNoFocusEvent = function(e, $el, $link) {
		
		if(e.ctrlKey) {
			$el.data('noFocus', true);
			return;
		}
		if (typeof $link == 'undefined') return;
		if (e.which == null) {
				if (!e.button) return;
		       /* IE case */
		       var button= (e.button < 2) ? "LEFT" :
		                 ((event.button == 4) ? "MIDDLE" : "RIGHT");
		} else {
		       /* All others */
		       var button= (e.which < 2) ? "LEFT" :
		                 ((e.which == 2) ? "MIDDLE" : "RIGHT");
		}
		
		if (button == 'MIDDLE') {
			
			e.stopPropagation();
			e.preventDefault();
		
			var prevHref = $link.attr("href");
			$link.removeAttr("href");
			var $_link = $link;
			setTimeout(function() {
				$_link.attr("href",prevHref);
			},100);
			$el.data('noFocus', true);

		}
		
		
	};

	
	$.klear.klearDialog = function (msg, options) {
		$.extend(options, {
			icon: options.icon || 'ui-icon-info',
            state: options.state || 'default',
            text: msg || '',
		});
		var dialogSettings = {
            title: '<span class="ui-icon inline dialogTitle '+options.icon+' "></span>'+options.titleText + "",
            modal: true,
            resizable: false,
            close: function(ui) {
                $(this).remove();
            }
        };
		$.extend(dialogSettings, options);
        var dialogTemplate = dialogSettings.template || 
        	'<div class="ui-widget"><div class="ui-state-${state} ui-corner-all inlineMessage"><p><span class="ui-icon ${icon} inlineMessage-icon"></span>{{html text}}</p></div></div>';
        var $parsedHtml = $.tmpl(dialogTemplate, dialogSettings);
        $parsedHtml.dialog(dialogSettings);
    };
	
	$.klear.klearMessage = function (msg, opts) {
        var options = {
    		type: 'msg',
            icon: 'ui-icon-comment',
            titleText: 'Klear Message Window'
        };
        var opts = opts || {};
        $.extend(options, opts);
        $.klear.klearDialog(msg, options);
    };
    
    $.klear.klearWarn = function(msg, opts) {
        var options = {
            type: 'warn',
            icon: 'ui-icon-info',
            titleText: 'Klear Warning Window'
        };
        var opts = opts || {};
        $.extend(options, opts);
        $.klear.klearDialog(msg, options);
    };
    
    $.klear.klearError = function(msg, opts) {
        var options = {
            type: 'error',
            icon: 'ui-icon-alert',
            state: 'highlight',
            titleText: 'Klear Error Window'
        };
        var opts = opts || {}
        $.extend(options, opts);
        $.klear.klearDialog(msg, options);
    };
	

	
	/*
	 * Hello Klear Server
	 */
	
	$.klear.hello = function(option){
		
		var options = {
				controller: 'index',
				action: 'hello'
		};
		
		switch(option) {
			case 'setCallback':
				this.callback = arguments[1];
				return;
			break;
			case 'options':
				// completamos las opciones de klear.request con las enviadas como segundo parámetro
				$.extend(options,arguments[1]);
			break;
		}
		
		var self = this;
		$.klear._doHelloSuccess = function(response) {
		
			if (response.success && response.success === true) {
				if (self.callback) {
					self.callback();
					self.callback = null;
				} else {
					$.klear.menu();
				}

			}
		};
		
		$.klear._doHelloError = function(response) {
			console.log(response);
		};
		
		$.klear.request(options,
						$.klear._doHelloSuccess,
						$.klear._doHelloError,
						this
		);
	};

	$.klear.menu = function(force, options) {
		
		var options = options || {};
		
		if (this.loaded && typeof force == 'undefined') {
			return;
		}
		
		var $sidebar = $('#sidebar');
		$sidebar.empty();
		$sidebar.accordion("destroy");
		//$sidebar.resizable("destroy");
		var $headerbar = $('#headerbar');
		$headerbar.empty();
		var $footerbar = $('#footerbar');
		$footerbar.empty();
		
		var self = this;
		
		
		
		$.klear._doMenuSuccess = function(response) {
			
			var navMenus = response.data.navMenus;
			
			$.tmpl('klearSidebarMenu', navMenus.sidebar).appendTo($sidebar);
			
			$.tmpl('klearHeaderbarMenu', navMenus.headerbar).appendTo($headerbar);
			
			$.tmpl('klearFooterbarMenu', navMenus.footerbar).appendTo($footerbar);

			$sidebar.fadeIn();
			
			$headerbar.fadeIn();
			
			$footerbar.fadeIn();
			
			/*
			 * Cargar 
			 */
			
			$.klear.request(
				{
					controller: 'error',
					action:'list'
				},
				function(response) {
					$.klear.addErrors(response.data);					
				},
				function() {
					console.error("No se ha creado errors.yaml")
				}
			);

			/*
			 * JQ Decorartors 
			 */

			$sidebar.accordion({
				icons : {
						header: "ui-icon-circle-arrow-e",
						headerSelected: "ui-icon-circle-arrow-s"
				},
				active: false,
				collapsible: true,
				autoHeight: false
			});
			
			$("li", $sidebar).on("mouseenter",function() {
				$(this).addClass("ui-state-highlight");
			}).on("mouseleave",function() {
				$(this).removeClass("ui-state-highlight");
			});
			
			self.loaded = true;
			
			/*
			 * 
			 */
			
			
			$toolsBar = $( "#headerToolsbar" ),
			$langBar = $( "#headerLanguagebar" ),
			$langSelector = $( ".langSelector" );
			
			$langSelector.buttonset();
			$toolsBar.buttonset();

			$( "label", $toolsBar ).tooltip();
			
			$( "input",  $langSelector).off('change').on('change', function(){
				$.klear.language = $(this).val();
				$.klear.restart({'language': $(this).val()});
			});
			
			$( "input#logout", $toolsBar ).off('change').on('change', function(){
				var $self = $(this);
				$.getJSON($self.data('url'),{json:true}, function(){
					$sidebar.fadeOut();
					$.klear.restart({}, true);
				});
			});
			
			$( "input#tabsPersist", $toolsBar ).off('change').on('change', function(){
				var $self = $(this);
				if ($.klear.tabPersist.enabled()) {
					$.klear.tabPersist.disable();
				} else {
					$.klear.tabPersist.enable();
				}
				$self.trigger('update-icon');
			});
			$( "input#tabsPersist", $toolsBar ).off('update-icon').on('update-icon', function(){
				var $self = $(this).next('label');
				var $icon = $('.ui-icon', $self);
				if ($.klear.tabPersist.enabled()) {
					$icon.removeClass('ui-icon-unlocked').addClass('ui-icon-locked');
					$self.addClass('ui-state-active');
				} else {
					$icon.removeClass('ui-icon-locked').addClass('ui-icon-unlocked');
				}
			});

			$langBar.show();
			$toolsBar.show();
			
			if ($.klear.tabPersist.enabled()) {
				$.klear.tabPersist.launch();
				$("#tabsPersist").trigger('update-icon');
			}
			
		};
		
		$.klear._doMenuError = function(response) {
			console.log(response);
		};
		
		var settings = $.extend({
			controller: 'menu',
			action: 'index'
		},options);
		
		$.klear.request(
			settings,
			$.klear._doMenuSuccess,
			$.klear._doMenuSuccess,
			this
		);
		
		$.klear.tabPersist = {
			tabs: [],
			add : function( iden ) {
				for (var i in this.tabs ) {
					if (this.tabs[i] == iden) return;
				}
				this.tabs.push(iden);
				this.save();
			},
			remove : function( iden ) {
				var tabs = [];
				for (var i in this.tabs ) {
					if (this.tabs[i] != iden) {
						tabs.push(this.tabs[i]);
					}
				}
				this.tabs = tabs;
				this.save();
			},
			save : function() {
				var jsTabs = JSON.stringify(this.tabs);
				localStorage.setItem('tabPersist', jsTabs);
			},
			loadData : function(){
				var tabs = JSON.parse(localStorage.getItem('tabPersist'));
				for (var i in tabs ) {
					this.tabs.push(tabs[i]);
				}
			},
			launch : function() {
				this.loadData();
				for (var i in this.tabs ) {
					var menuButton = this.tabs[i].replace(/#tabs-/, '#target-');
					$(menuButton).trigger('mouseup');
				}
				if ($(menuButton).length>0) {
					$(menuButton).parents('.ui-accordion-content').prev('h2').click();
				}
			},
			enable : function(){
				localStorage.setItem('tabPersistEnabled', '1');
			}, 
			disable : function(){
				localStorage.setItem('tabPersistEnabled', '0');
			},
			enabled : function() {
				return localStorage.getItem('tabPersistEnabled') == '1';
			}
		};
		
		$sidebar.add($headerbar).add($footerbar).on("mouseup","a.subsection", function(e) {
			e.preventDefault();
			e.stopPropagation();
			
			var iden = $(this).attr("id").replace(/^target-/,'');
			
			$.klear.checkNoFocusEvent(e, $.klear.canvas, $(this));
			
			if ($("#tabs-"+iden).length > 0) {
				$.klear.canvas.tabs('select', '#tabs-'+iden);
				return;
			}
			var idContent = "#tabs-" + iden;
			var title = $(this).text()!=""? $(this).text():$(this).parent().attr('title');
			
			$.klear.canvas.tabs( "add", idContent, title);
			
			$.klear.tabPersist.add(idContent);
			
			
		}).on("click",function(e) {
			e.preventDefault();
			e.stopPropagation();
		});
	};
	
	
	$.klear.login = function(option){

		switch(option) {
			case 'close':
				if (this.$loginForm) {
				
					this.$loginForm.fadeOut(function() {
						$(this).dialog("destroy").remove();
					});
				}
				return;
			break;
		}
		
		
		var self = this;
		
		$.klear._doLoginSuccess = function(response) {
				
			self.$loginForm = $.tmpl('klearForm', response.data);
			
			self.$loginForm.appendTo("#canvas").dialog({
				resizable: false,
				modal: true,
				draggable: false,
				stack: true,
				width:'40%',
				minHeigth:'350px',
				dialogClass: 'loginDialog',
				closeOnEscape: false,
				open : function(event, ui) {
					$("p.submit input",self.$loginForm).button();
					$("input:eq(0)",self.$loginForm).trigger("focusin").select();
				}
			});
			
			$("input",self.$loginForm).removeAttr("disabled");
			$("input[submit]",self.$loginForm).button();
			$("input[text]:eq(0)").trigger("focusin").select();
			
			if ($("div.loginError",self.$loginForm).length > 0) {
	
				self.$loginForm.effect("shake",{times: 3},60);
			}
			
			$("form",self.$loginForm.parent()).on('submit',function(e) {
				
				e.preventDefault();
				e.stopPropagation();
				$.klear.hello('options',{
							post: $(this).serialize(),
							isLogin: true
				});
				
				$("input",self.$loginForm).attr("disabled","disabled");
			});
			
			
		};
		
		$.klear._doLoginError = function(response) {
			console.log(response);
		};
		
		$.klear.request(
			{
				controller: 'login',
				action: 'index'
			},
			$.klear._doLoginSuccess,
			$.klear._doLoginSuccess,
			this
		);
		
		return this;
		
	};

	$.klear.loadCanvas = function(){
		/*
		 * TABS
		 */
		
		var tabTemplate = "<li title='#{label}'><span class='ui-silk'></span>"+
			"<span class='ui-icon ui-icon-close'></span><a href='#{href}'>#{label}</a></li>";
		
		$.klear.canvas.tabs({
			tabTemplate: tabTemplate,
			scrollable: true,
			add : function( event, ui ) {
				if ($(ui.tab).parents('ul').css('display') == 'none') {
					$(ui.tab).parents('ul').fadeIn();
				}
				var backgroundTab = false;
				if ($(this).data('noFocus')===true) {
					$(this).data('noFocus', false)
					backgroundTab = true;
				}
				
				if (backgroundTab !== true) {
					$.klear.canvas.tabs('select', ui.index);	
				}
				
				
				var $tabLi = $(ui.tab).parent("li");
				
				$tabLi.klearModule({
					ui: ui,
					container : $.klear.canvas
				}).tooltip();

				// Se invoca custom event para actualizar objeto klear.module (si fuera necesario);
				$.klear.canvas.trigger("tabspostadd",ui);
								
				$tabLi.klearModule("dispatch");
				
				if (backgroundTab !== true) {
					//$tabLi.klearModule("highlightOn");
				}
				
				$("li",$.klear.canvas).each(function(idx,elem) {
	                $(elem).klearModule("option","tabIndex",idx);
	            });
				
				
			},
			select : function(event, ui) {
				
				$("#tabsList li").each(function(idx,elem) {
					$(elem).klearModule("highlightOff");
				});
				
				var $tabLi = $(ui.tab).parent("li");
				
				$tabLi
					.klearModule("selectCounter")
					.klearModule("updateLoader");
					//.klearModule("highlightOn");
			},
			remove: function(event, ui) {
				
				$.klear.tabPersist.remove($(ui.tab).attr('href'));
				
				$("li",$.klear.canvas).each(function(idx,elem) {
	                $(elem).klearModule("option","tabIndex",idx);
	            });
				
				$.klear.canvas.tabs('select', $.klear.canvas.tabs('option', 'selected'));
			}
		});
		/*
		 * CLOSE
		 */
		$( "#tabsList").on("click","span.ui-icon-close", function() {
			var $tab = $(this).parent("li");
			$tab.klearModule("close");
		});
		
		$(document).on("keydown",function(e) {
			if(e.shiftKey && e.ctrlKey && e.which==87) {
				e.preventDefault();
				var selectedTab = parseInt($.klear.canvas.tabs('option', 'selected'));
				$.klear.canvas.tabs('remove', selectedTab);
			}
			if(e.shiftKey && e.ctrlKey && e.which==34) {
				e.preventDefault();
				var selectedTab = parseInt($.klear.canvas.tabs('option', 'selected'));
				selectedTab++;
				selectedTab = selectedTab<$("#tabsList li").length ? selectedTab : 0;
				$.klear.canvas.tabs('select', selectedTab);
			}
			if(e.shiftKey && e.ctrlKey && e.which==33) {
				e.preventDefault();
				var selectedTab = parseInt($.klear.canvas.tabs('option', 'selected'));
				selectedTab--;
				selectedTab = selectedTab<0 ? $("#tabsList li").length-1 : selectedTab ;
				$.klear.canvas.tabs('select', selectedTab);
			}
		});
		
		
	};
	
	$.klear.restart = function(opts, removetabs) {
		var removetabs = removetabs || false;
		if (removetabs == true) {
			$.klear.canvas.tabs('destroy');
			$.klear.loadCanvas();
		}
		$.klear.requestSearchTranslations();
		$.klear.menu(true, opts);
		$.klear.requestReloadTranslations();
	};
	
	$.klear.start = function() {
		/*
		 * Setting klear.baseurl value
		 */
		$.klear.baseurl = $.klear.baseurl || $("base").attr("href");
		$.klear.language = $('html').attr('lang');
		/*
		 * Setting klear canvas MAIN container.
		 */
		$.klear.canvas = $("#canvas");
		/*
		 * Loading and binding main container
		 */
		$.klear.loadCanvas();
		/*
		 * Saying hello to server.
		 * 
		 * - check user
		 * 
		 */
		$.klear.hello();
		/*
		 * Global Bindings 
		 */
	};

	
})(jQuery);


/*
 * document ready Klear Launch 
 */

;(function($) {
	
	$(document).ready(function() {
		
		$.klear.start();

	});

})(jQuery);
