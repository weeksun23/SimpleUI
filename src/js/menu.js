(function($){
	"use strict";
	function initMenuItem($this){
		var opts = $.simple.getOptions({
			iconCls : null,
			disabled : false,
			isClickOnHide : true,
			text : null
		},$this.addClass("menu-item"));
		var tpl = "<i$cls></i><span class='menu-text'>$txt</span>",
			iconCls = opts.iconCls,
			text = opts.text,
			html = tpl.replace("$cls",iconCls ? (" class='" + iconCls + "'") : ""),
			$span = $this.children("span");
		if(!text){
			text = $span.length > 0 ? $span.text() : $this.text();
		}
		if(opts.disabled){
			$this.addClass("disabled");
		}
		if(opts.isClickOnHide){
			var me = this;
			$this.on("click.menu",function(e){
				e.stopPropagation();
				var $this = $(this);
				if($this.hasClass("disabled")) return;
				var $me = $(me);
				$me.hide();
				var $btn = $me.data("menubutton");
				if($btn){
					//如果绑定了按钮
					$btn.removeClass("active");
				}
			});
		}
		html = html.replace("$txt",text);
		var $subMenu = $this.children("div");
		if($subMenu.length > 0){
			$span.remove();
			$this.prepend(html + "<span class='menu-arrow'></span>");
			initMenu.call(this,$subMenu);
		}else{
			$this.html(html);
		}
	}
	function initMenu($menu,options){
		var me = this;
		var	opts = $.simple.getOptions({
			width : null
		},$menu,options);
		$menu.hide().addClass("menu").children("div").each(function(){
			initMenuItem.call(me,$(this));
		}).end().append("<div class='menu-line'></div>");
		if(opts.width){
			$menu.css("width",opts.width + "px").data("resized",true);
		}else{
			$menu.data("resized",false);
		}
	}
	function resizeMenu($menu){
		if($menu.data("resized")) return;
		var arr = [];
		$menu.children("div.menu-item").each(function(){
			arr.push($(this).children("span.menu-text").outerWidth() + $(this).children("i").outerWidth());
		}).end().css("width",(Math.max.apply(Math,arr)) + "px").data("resized",true);
	}
	function bindHover($this){
		$this.find("div.menu-item:has(div.menu)").hover(function(){
			if($(this).hasClass("disabled")) return;
			var $menu = $(this).children("div.menu").show();
			if(!$menu.data("resized")){
				resizeMenu($menu);
			}
		},function(){
			if($(this).hasClass("disabled")) return;
			$(this).children("div.menu").hide();
		});
	}
	$.fn.menu = function(options){
		var outerArguments = arguments;
		return $(this).each(function(){
			var $this = $(this);
			if(typeof options == 'string'){
				methods[options].apply(this,Array.prototype.slice.call(outerArguments,1));
			}else{
				initMenu.call(this,$this,options);
				bindHover($this.mouseleave(function(){
					//如果该menu绑定了btn，则鼠标移走menu也不隐藏
					if($(this).data("menubutton")) return;
					$(this).hide();
				}).data("menu",true));
			}
		});
	};
	var methods = $.fn.menu.methods = {
		show : function(pos){
			resizeMenu($(this).css(pos).show());
		},
		setItemText : function($item,text){
			var $menu = $item.children("span.menu-text").text(text)
				.parent().parent().data("resized",false);
			if(!$menu.is(":hidden")) resizeMenu($menu);
		},
		removeMenu : function($menu){
			if(this === $menu.get(0)){
				$(this).remove();
				return;
			}
			$menu.parent().off("mouseenter").off("mouseleave").children("span.menu-arrow").remove();
			$menu.remove();
		}
	};
})(jQuery);