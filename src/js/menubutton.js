(function($){
	"use strict";
	function showMenuByBtn($btn,$menu){
		var offset = $btn.offset();
		$menu.menu("show",{
			left : offset.left,
			top : offset.top + $btn.outerHeight()
		});
	}
	function onOneClick($btn,$menu){
		var $oldbtn = $menu.data("menubutton");
		if($oldbtn){
			$oldbtn.removeClass("active");
		}
		setTimeout(function(){
			$(document).off("click.menubutton").one("click.menubutton",function(){
				$btn.removeClass("active");
				$menu.hide();
			});
		});
	}
	$.fn.menubutton = function(options){
		return $(this).each(function(){
			var $this = $(this);
			var	opts = $.base.getOptions({
				isTriggerOnHover : false,
				effect : null,
				menu : null
			},$this,$.extend(options,{grp : null,toggle : false}));
			$.fn.btn.init($this,opts);
			$this.append("<span class='btn-arrow'></span>");
			var $menu = opts.menu;
			if($menu){
				if(typeof $menu == 'string'){
					$menu = $($menu);
				}
				if(!$menu.data("menu")){
					$menu.menu();
				}
			}
			$this.data("menu",$menu);
			if(opts.isTriggerOnHover){
				$this.on("mouseenter.menubutton",function(){
					var	$this = $(this),
						$menu = $this.addClass("active").data("menu");
					if(!$menu) return;
					showMenuByBtn($this,$menu);
					onOneClick($this,$menu);
					$menu.off("mouseleave.menubutton").on("mouseleave.menubutton",function(){
						$(this).hide().data("menubutton").removeClass("active");
					}).data("menubutton",$this);
				}).on("click.menubutton",function(e){
					e.stopPropagation();
				});
			}else{
				$this.on("click.menubutton",function(e){
					e.stopPropagation();
					var $this = $(this);
					if($this.hasClass("disabled")) return;
					var	$menu = $this.data("menu");
					if(!$menu) return;
					onOneClick($this,$menu);
					$menu.off("mouseleave.menubutton").data("menubutton",$this);
					if($this.hasClass("active")){
						$this.removeClass("active");
						$menu.hide();
					}else{
						showMenuByBtn($this.addClass("active"),$menu);
					}
				});
			}
		});
	};
})(jQuery);