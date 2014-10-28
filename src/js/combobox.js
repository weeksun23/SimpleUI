/*
data : {
	data : 下拉区域数据
	items : 下拉区域jquery对象
	options : 配置对象
}
$(window).resize()
*/
(function($){
	"use strict";
	var tpl = 
		"<span class='combobox-content ball'>" + 
			"<input type='text' class='combobox-content-input'/>" +
		"</span>" +
		"<span class='combobox-down ball'><i class='combobox-down-arrow'></i></span>" + 
		"<input type='hidden'${name} class='combobox-value'/>";
	var itemsTpl = 
		"<div class='combobox-items ball' style='height:${height}px;display:none;${width}'>${html}</div>";
	var itemTpl = "<div class='combobox-item' data-value='${value}' data-text='${text}'>${text}</div>";
	var combobox = $.fn.combobox = function(options){
		var outerArg = arguments;
		var result = $(this);
		$(this).each(function(){
			if(typeof options == 'string'){
				var re = combobox.methods[options].apply(this,Array.prototype.slice.call(outerArg,1));
				if(re !== undefined){
					result = re;
					return false;
				}
			}else{
				var $this = $(this)
				var name = $this.attr("name");
				$this.addClass("combobox").html($.base.dealTpl(tpl,{
					name : name ? (" name='" + name + "'") : ''
				}));
				name && $this.removeAttr('name');
				options = $.base.getOptions(combobox.defaultOptions,$this,options);
				if(options.disabled){
					$this.addClass("combobox-disabled");
				}
				var $input = $this.find('input.combobox-content-input');
				if(options.width){
					$input.css('width',options.width);
				}
				if(options.multiple){
					onMultiple($this);
					options.editable = false;
				}
				if(!options.editable){
					onEditable($this,false);
				}
				var data = options.data;
				if(data && data.length > 0){
					var html = data2Html(data,options.valueField,options.textField);
				}
				var $items = $($.base.dealTpl(itemsTpl,{
					height : options.panelHeight,
					width : options.panelWidth ? (" width:" + options.panelWidth + "px") : '',
					html : html || ''
				})).appendTo($('body'));
				$items.on("click",">div.combobox-item",function(e){
					var sel = "combobox-item-selected";
					var $item = $(this);
					var $items = $item.parent();
					var $combobox = $items.data("combobox");
					if($combobox.data("options").multiple){
						//多选状态
						e.stopPropagation();
						var $multiple = $combobox.find("span.combobox-multiple");
						var value = $item.attr("data-value");
						if($item.hasClass(sel)){
							//取消选择
							$item.removeClass(sel);
							$multiple.children("span[data-value='" + value + "']").remove();
							onSelect($combobox,value,'onUnSelect');
							showMultipleMes($multiple);
						}else{
							//选择
							$item.addClass(sel);
							$multiple.append(getMultipleItemHtml($item))
								.children("span.combobox-multiple-mes").hide();
							onSelect($combobox,value);
						}
						setValuesAfterSel($combobox);
					}else{
						$items.children("div." + sel)
							.removeClass(sel);
						$item.addClass(sel);
						var value = $item.attr("data-value");
						$combobox.find("input.combobox-content-input").val($item.attr('data-text'))
							.end().find("input.combobox-value").val(value);
						onSelect($combobox,value);
					}
				});
				$this.data({
					items : $items.data("combobox",$this),
					options : options,
					data : data
				}).children("span.combobox-down").click(function(e){
					e.stopPropagation();
					var $combobox = $(this).parent();
					if($combobox.hasClass("combobox-disabled")) return;
					var $items = $combobox.data("items");
					//下拉前先隐藏所有其它的combobox items
					$("body").children("div.combobox-items").filter(function(){
						return this !== $items[0];
					}).hide();
					if($items.css("display") === 'none'){
						resizeItems($items,$combobox).show();
						$(document).one("click.combobox",function(e){
							$items.hide();
						});
					}else{
						$items.hide();
						$(document).off("click.combobox");
					}
				});

			}
		});
		return result;
	};
	combobox.defaultOptions = {
		/*
		disabled : undefined,
		width : undefined,
		data : undefined,
		onSelect : undefined,
		onUnSelect : undefined,
		*/
		panelHeight : 150,
		valueField : 'value',
		textField : "text",
		editable : false,
		//若multiple为true则editable必须为false
		multiple : false,
		data : []
	};
	combobox.methods = {
		getValue : function(){
			var $combobox = $(this);
			var options = $combobox.data("options");
			if(options.multiple){
				return getValues($combobox);
			}else{
				var val = $combobox.find("input.combobox-value").val();
				var target = getTarget($combobox,val,options);
				return target ? target[options.valueField] : null;
			}
		},
		setValue : function(value){
			var $this = $(this);
			var options = $this.data('options');
			if(options.multiple){
				doSetValues($this,getArrValue(value));
			}else{
				var $hidden = $this.find("input.combobox-value").val('');
				var $input = $this.find("input.combobox-content-input").val('');
				var $items = $this.data("items");
				$items.children("div.combobox-item-selected").removeClass('combobox-item-selected');
				if(value === null) return;
				var $target = $items.children("div.combobox-item[data-value='" + value + "']");
				if($target.length === 0) return;
				$target.addClass("combobox-item-selected");
				$input.val($target.attr("data-text"));
				$hidden.val(value);
			}
		},
		text : function(text){
			var $this = $(this);
			if($this.data('options').multiple){
				var result = [];
				$this.find("span.combobox-multiple-item").each(function(){
					result.push($(this).text());
				});
				return result;
			}else{
				var $input = $this.find("input.combobox-content-input");
				if(text === '' || text){
					$input.val(text);
				}else{
					return $input.val();
				}
			}
		},
		clear : function(){
			var $combobox = $(this);
			$combobox.find("input").val("").end().data('items')
				.children("div.combobox-item-selected").removeClass('combobox-item-selected');
			if($combobox.data('options').multiple){
				var $multiple = $combobox.find("span.combobox-multiple");
				$multiple.children("span.combobox-multiple-item").remove();
				$multiple.children("span.combobox-multiple-mes").show();
			}
		},
		select : function(value){
			var $this = $(this);
			if($this.data('options').multiple){
				doSetValues($this,getArrValue(value),true);
			}else{
				combobox.methods.setValue.call(this,value);
				value = String(value);
				onSelect($this,value);
			}
		},
		disabled : function(isDisabled){
			$(this)[isDisabled ? "addClass" : 'removeClass']("combobox-disabled")
				.find("input.combobox-content-input").attr("disabled",isDisabled);
		},
		loadData : function(data){
			data = data || [];
			combobox.methods.clear.call(this);
			var $this = $(this);
			var options = $this.data('options');
			var html = data2Html(data,options.valueField,options.textField);
			options.data = data;
			$this.data("data",data).data("items").html(html);
		},
		setFirstValue : function(isTriggerSel){
			var $this = $(this);
			var data = $this.data("data");
			if(data && data.length > 0){
				var options = $this.data("options");
				var firstVal = data[0][options.valueField];
				isTriggerSel ? combobox.methods.select.call(this,firstVal) 
					: combobox.methods.setValue.call(this,firstVal);
			}
		},
		updateOptions : function(options){
			var $this = $(this);
			var oldOptions = $this.data('options');
			for(var i in options){
				if(i === 'editable' && !oldOptions.multiple){
					onEditable($this,oldOptions.editable = options[i]);
				}
			}
		}
	};
	function getArrValue(value){
		if($.type(value) !== 'array'){
			return [value];
		}
		return value;
	}
	function doSetValues($combobox,values,isTriggerSel){
		var $items = $combobox.data("items");
		var html = [];
		for(var i=0,ii=values.length;i<ii;i++){
			var strValue = String(values[i]);
			var $item = $items.find("div.combobox-item[data-value='"+strValue+"']");
			if($item.length > 0 && !$item.hasClass("combobox-item-selected")){
				$item.addClass("combobox-item-selected");
				isTriggerSel && onSelect($combobox,strValue);
				html.push(getMultipleItemHtml($item));
			}
		}
		if(html.length > 0){
			$combobox.find("span.combobox-multiple").append(html.join(""))
				.find("span.combobox-multiple-mes").hide();
		}
	}
	function showMultipleMes($multiple){
		if($multiple.children("span.combobox-multiple-item").length === 0){
			$multiple.children("span.combobox-multiple-mes").show();
		}
	}
	function getMultipleItemHtml($item){
		return "<span class='combobox-multiple-item' data-value='" + $item.attr("data-value") + "'>" 
								+ $item.attr("data-text") + "</span>";
	}
	function getValues($combobox){
		var result = [];
		var options = $combobox.data("options");
		$combobox.find("span.combobox-multiple-item").each(function(){
			var target = getTarget($combobox,$(this).attr("data-value"),options);
			result.push(target[options.valueField]);
		});
		return result;
	}
	//遍历所选项 将值设置到input-value中
	function setValuesAfterSel($combobox){
		$combobox.find('input.combobox-value').val(getValues($combobox).join(","));
	}
	function onMultiple($combobox){
		var $outer = $combobox.children("span.combobox-content").addClass("combobox-readonly");
		var $input = $outer.children("input.combobox-content-input").hide();
		$outer.css({
			height : 20,
			width : $input.outerWidth()
		}).attr("tabindex",'-1').keyup(function(e){
			var code = e.keyCode;
			var $this = $(this);
			if(code === 37 || code === 39){
				var scrollLeft = $this.scrollLeft();
				scrollLeft += (code === 37 ? -20 : 20);
				$this.scrollLeft(scrollLeft);
			}
		});
		$outer.append("<span class='combobox-multiple'><span class='combobox-multiple-mes'>请选择</span></span>");
	}
	function onEditable($combobox,editable){
		var $outer = $combobox.children("span.combobox-content");
		var $input = $outer.children("input.combobox-content-input");
		if(editable){
			$input.removeAttr("readonly").removeClass("combobox-readonly");
			$outer.off('click');
		}else{
			//若不可编辑 则点击输入框也可触发下拉事件
			$input.attr("readonly",'readonly').addClass("combobox-readonly");
			$outer.on('click',function(e){
				e.stopPropagation();
				$(this).next().trigger('click');
			});
		}
	}
	function getTarget($combobox,value,options){
		var data = $combobox.data("data");
		for(var i=0,ii=data.length;i<ii;i++){
			if(String(data[i][options.valueField]) === value){
				return data[i];
			}
		}
	}
	function onSelect($combobox,value,method){
		method = method || 'onSelect';
		var options = $combobox.data("options");
		if(options[method]){
			options[method].call($combobox[0],getTarget($combobox,value,options));
		}
	}
	function data2Html(data,valueField,textField){
		var html = [];
		var dealTpl = $.base.dealTpl;
		for(var i=0,ii=data.length;i<ii;i++){
			var item = data[i];
			html.push(dealTpl(itemTpl,{
				value : item[valueField],
				text : item[textField]
			}));
		}
		return html.join('');
	}
	function resizeItems($items,$combobox){
		if(!$combobox){
			$combobox = $items.data("combobox");
		}
		var options = $combobox.data("options");
		var offset = $combobox.offset();
		var obj = {
			top : offset.top + $combobox.outerHeight(),
			left : offset.left
		}; 
		if(!options.panelWidth){
			obj.width = $combobox.outerWidth() - 2;
		}
		return $items.css(obj);
	}
	//
	$(window).resize(function(){
		var $items = $("body").children("div.combobox-items").filter(function(){
			return $(this).css("display") !== 'none';
		}).each(function(){
			resizeItems($(this));
		});
	});
})($);