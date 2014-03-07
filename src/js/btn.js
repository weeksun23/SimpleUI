(function($){
	"use strict";
	var btn = $.fn.btn = function(options){
		/*
			data : {
				isPressed : [boolean]
			}
			attribute : {
				data-group
			}
		*/
		return $(this).each(function(){
			var $this = $(this);
			var	opts = $.simple.getOptionsNotDefault($this,options);
			init($this,opts);
		});
	};
	var init = btn.init = function($this,opts){
		opts = $.extend({
			plain : false,
			disabled : false,
			iconCls : null,
			toggle : false,
			type : 'default',
			grp : null,
			text : ''
		},opts);
		var classList = ["btn"];
		classList.push(opts.plain ? "btn-default plain" : "btn-" + opts.type);
		opts.disabled && classList.push('disabled');
		var html = "",
			icon = opts.iconCls,
			txt = opts.text || $this.html();
		if(icon){
			html += "<i class='" + icon + "'></i>";
		}
		if(txt){
			html += "<span>" + txt + "</span>";
		}
		$this.html(html).addClass(classList.join(" "));
		var grp = opts.grp;
		if(grp){
			$this.attr("data-group",grp).on("click.toggle",function(){
				var $this = $(this);
				if($this.hasClass("disabled")) return;
				var	target;
				$("a,button").filter("[data-group='" + grp + "']").each(function(){
					var $el = $(this);
					if($el.data("isPressed")){
						toggleBtn($el);
						target = this;
						return false;
					}
				});
				if(this === target) return;
				toggleBtn($this);
			});
		}else if(opts.toggle){
			$this.on("click.toggle",function(){
				toggleBtn($(this));
			});
		}
	};
	function toggleBtn($this){
		if($this.hasClass("disabled")) return;
		var isPressed = $this.data("isPressed") || false;
		$this[isPressed ? "removeClass" : "addClass"]("active")
			.data("isPressed",!isPressed);
	}
})(jQuery);