(function($){
	"use strict";
	/*
	data : {
		isPressed boolean : 是否处于按下状态
	}
	attribute : {
		data-group : 所属组
	}
	*/
	var btn = $.fn.btn = function(options){
		return $(this).each(function(){
			init($(this),options);
		});
	};
	btn.defaultOptions = {
		//是否透明背景
		plain : false,
		//是否禁用
		disabled : false,
		//图标css class
		iconCls : null,
		//是否toggle btn
		toggle : false,
		//图标颜色类型
		type : 'default',
		//所属按钮组
		grp : null,
		//按钮文字
		text : ''
	};
	var init = btn.init = function($this,opts){
		opts = $.base.getOptions(btn.defaultOptions,$this,opts);
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